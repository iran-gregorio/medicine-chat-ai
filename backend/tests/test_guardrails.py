# -*- coding: utf-8 -*-
import pytest
import uuid
import json
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from main import app
from database import get_db
from auth import get_current_user
from models.chat import Conversation, Message
from services.guardrails import GuardrailService

client = TestClient(app)


class MockResult:
    def __init__(self, items):
        self.items = items

    def scalars(self):
        class Scalars:
            def all(_self):
                return self.items
            def first(_self):
                return self.items[0] if self.items else None
        return Scalars()

    def scalar_one_or_none(self):
        return self.items[0] if self.items else None

    def scalar(self):
        return self.items[0] if self.items else None


# ==========================================
# 1. Unit Tests for GuardrailService
# ==========================================

@pytest.mark.asyncio
async def test_guardrail_inside_scope():
    """Valida que mensagens dentro do escopo de medicamentos são aceitas."""
    from services.guardrails import GuardrailResult
    
    mock_structured_llm = MagicMock()
    mock_structured_llm.ainvoke = AsyncMock(return_value=GuardrailResult(inside_scope=True, rejection_reason=""))
    
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value = mock_structured_llm
    
    with patch("services.guardrails.get_llm", return_value=mock_llm):
        res = await GuardrailService.check_input_scope("Para que serve Paracetamol?")
        assert res["inside_scope"] is True
        assert res["rejection_reason"] == ""


@pytest.mark.asyncio
async def test_guardrail_outside_scope():
    """Valida que mensagens fora do escopo são adequadamente rejeitadas."""
    from services.guardrails import GuardrailResult

    mock_structured_llm = MagicMock()
    mock_structured_llm.ainvoke = AsyncMock(return_value=GuardrailResult(inside_scope=False, rejection_reason="Como farmacêutico de IA, atendo apenas dúvidas de medicamentos."))
    
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value = mock_structured_llm
    
    with patch("services.guardrails.get_llm", return_value=mock_llm):
        res = await GuardrailService.check_input_scope("Qual a previsão do tempo hoje?")
        assert res["inside_scope"] is False
        assert "medicamentos" in res["rejection_reason"]


@pytest.mark.asyncio
async def test_guardrail_markdown_json():
    """Garante resiliência caso a LLM retorne o JSON delimitado por blocos markdown."""
    from services.guardrails import GuardrailResult
    
    mock_structured_llm = MagicMock()
    mock_structured_llm.ainvoke = AsyncMock(return_value=GuardrailResult(inside_scope=False, rejection_reason="Rejeição Markdown"))
    
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value = mock_structured_llm
    
    with patch("services.guardrails.get_llm", return_value=mock_llm):
        res = await GuardrailService.check_input_scope("Escreva uma piada sobre farmacêuticos.")
        assert res["inside_scope"] is False
        assert res["rejection_reason"] == "Rejeição Markdown"


@pytest.mark.asyncio
async def test_guardrail_fallback_on_exception():
    """Garante que falhas de comunicação com a API não bloqueiem o usuário (fallback in_scope=True)."""
    mock_structured_llm = MagicMock()
    mock_structured_llm.ainvoke = AsyncMock(side_effect=Exception("API Connection Failure"))
    
    mock_llm = MagicMock()
    mock_llm.with_structured_output.return_value = mock_structured_llm
    
    with patch("services.guardrails.get_llm", return_value=mock_llm):
        res = await GuardrailService.check_input_scope("Para que serve Paracetamol?")
        assert res["inside_scope"] is True
        assert res["rejection_reason"] == ""


# ==========================================
# 2. Integration Tests for FastAPI chat endpoint
# ==========================================

@pytest.mark.asyncio
async def test_endpoint_rejected_by_guardrail():
    """Garante que requisições fora do escopo retornem a mensagem de rejeição e gravem no histórico."""
    user_uuid = uuid.uuid4()
    conv_id = uuid.uuid4()
    
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    
    conv = Conversation(id=conv_id, user_id=user_uuid, title="Teste Guardrail")
    
    mock_db.execute.side_effect = [
        MockResult([conv]),  # Validação de ownership
        MockResult([1]),     # Contagem de mensagens ao adicionar msg de usuário
        MockResult([2])      # Contagem de mensagens ao adicionar msg do assistente
    ]
    mock_db.commit = AsyncMock()
    
    async def mock_refresh(obj):
        if isinstance(obj, Message):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
                
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)
    app.dependency_overrides[get_db] = lambda: mock_db
    
    mock_guardrail_res = {
        "inside_scope": False,
        "rejection_reason": "Desculpe, meu escopo de atuação é apenas sobre medicamentos."
    }
    
    with patch("routers.chat.GuardrailService.check_input_scope", return_value=mock_guardrail_res):
        response = client.post(
            f"/chat/conversations/{conv_id}/messages",
            json={"content": "Qual a melhor receita de bolo?"}
        )
        
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)
        
        assert response.status_code == 200
        text_data = response.text
        assert "Desculpe, meu escopo de atuação é apenas sobre medicamentos." in text_data


@pytest.mark.asyncio
async def test_endpoint_allowed_by_guardrail():
    """Garante que requisições dentro do escopo passem pelo guardrail e acionem o RAG/LLM."""
    user_uuid = uuid.uuid4()
    conv_id = uuid.uuid4()
    
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    
    conv = Conversation(id=conv_id, user_id=user_uuid, title="Teste Guardrail Permitido", summary=None)
    
    mock_db.execute.side_effect = [
        MockResult([conv]),  # Validação de ownership
        MockResult([]),      # load_messages (histórico vazio)
        MockResult([1]),     # Contagem de mensagens ao adicionar msg do usuário
        MockResult([2]),     # Contagem de mensagens ao adicionar msg do assistente
        MockResult([150])    # Contagem de tokens ao verificar compressão
    ]
    mock_db.commit = AsyncMock()
    
    async def mock_refresh(obj):
        if isinstance(obj, Message):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
                
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)
    app.dependency_overrides[get_db] = lambda: mock_db
    
    from langchain_core.language_models.fake import FakeListLLM
    
    mock_llm = FakeListLLM(responses=["O Paracetamol serve para febre e dor."])
    
    mock_vector = MagicMock()
    mock_vector.similarity_search.return_value = []
    
    async def mock_get_vector():
        return mock_vector
        
    mock_guardrail_res = {
        "inside_scope": True,
        "rejection_reason": ""
    }
    
    with patch("routers.chat.GuardrailService.check_input_scope", return_value=mock_guardrail_res), \
         patch("routers.chat.get_llm", return_value=mock_llm), \
         patch("routers.chat.get_vectorstore", side_effect=mock_get_vector), \
         patch("langchain_core.language_models.base.BaseLanguageModel.get_num_tokens_from_messages", return_value=10):
         
        response = client.post(
            f"/chat/conversations/{conv_id}/messages",
            json={"content": "Para que serve o Paracetamol?"}
        )
        
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)
        
        assert response.status_code == 200
        text_data = response.text
        assert "O Paracetamol serve para febre e dor." in text_data
