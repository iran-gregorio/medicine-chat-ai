import pytest
import uuid
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from main import app, scheduler
from database import get_db
from auth import get_current_user
from models.chat import Conversation, Message
from services.chat_history import PostgresChatHistory
from services.chat_purge import purge_old_messages

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
# 1. Unit Tests for PostgresChatHistory
# ==========================================

@pytest.mark.asyncio
async def test_token_estimation():
    mock_session = AsyncMock()
    history = PostgresChatHistory(mock_session)
    
    assert history.estimate_tokens("") == 0
    assert history.estimate_tokens("Hello") == 1  # 1 * 1.3 = 1.3 -> 1
    assert history.estimate_tokens("Hello world this is a test") == 7  # 6 * 1.3 = 7.8 -> 7


@pytest.mark.asyncio
async def test_get_or_create_conversation_existing():
    mock_session = AsyncMock()
    user_id = uuid.uuid4()
    conv_id = uuid.uuid4()
    
    existing_conv = Conversation(id=conv_id, user_id=user_id, title="Test Conversation")
    mock_session.execute.return_value = MockResult([existing_conv])
    
    history = PostgresChatHistory(mock_session)
    res = await history.get_or_create_conversation(user_id=user_id, conversation_id=conv_id)
    
    assert res.id == conv_id
    assert res.user_id == user_id
    assert res.title == "Test Conversation"


@pytest.mark.asyncio
async def test_get_or_create_conversation_new():
    mock_session = AsyncMock()
    user_id = uuid.uuid4()
    
    mock_session.execute.return_value = MockResult([])
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()
    
    history = PostgresChatHistory(mock_session)
    res = await history.get_or_create_conversation(user_id=user_id)
    
    assert isinstance(res.id, uuid.UUID)
    assert res.user_id == user_id
    assert res.title == "Nova Conversa"
    mock_session.add.assert_called_once()
    mock_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_load_messages():
    mock_session = AsyncMock()
    conv_id = uuid.uuid4()
    
    m1 = Message(id=uuid.uuid4(), conversation_id=conv_id, role="user", content="Hi", created_at=datetime.now())
    m2 = Message(id=uuid.uuid4(), conversation_id=conv_id, role="assistant", content="Hello", created_at=datetime.now())
    
    # Simulates Postgres returning in descending order
    mock_session.execute.return_value = MockResult([m2, m1])
    
    history = PostgresChatHistory(mock_session)
    messages = await history.load_messages(conv_id)
    
    # verify load_messages reverses it back to chronological order (m1 first, then m2)
    assert messages == [m1, m2]


@pytest.mark.asyncio
async def test_add_message_first_user_updates_title():
    mock_session = AsyncMock()
    conv_id = uuid.uuid4()
    
    # Message count is 0
    mock_session.execute.side_effect = [
        MockResult([0]),  # msg_count query
        MockResult([Conversation(id=conv_id, title="Nova Conversa")])  # conversation query
    ]
    
    mock_session.add = MagicMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()
    
    history = PostgresChatHistory(mock_session)
    msg = await history.add_message(
        conversation_id=conv_id,
        role="user",
        content="Este é um texto longo que deve ser resumido a 50 caracteres no título."
    )
    
    assert msg.role == "user"
    assert msg.tokens == int(len(msg.content.split()) * 1.3)
    mock_session.commit.assert_called_once()


@pytest.mark.asyncio
async def test_summarize_if_needed_not_exceeding_threshold():
    mock_session = AsyncMock()
    conv_id = uuid.uuid4()
    
    # Total tokens sum is low
    mock_session.execute.return_value = MockResult([150])
    
    history = PostgresChatHistory(mock_session)
    res = await history.summarize_if_needed(conv_id)
    
    assert res is None


@pytest.mark.asyncio
async def test_summarize_if_needed_exceeding_threshold():
    mock_session = AsyncMock()
    conv_id = uuid.uuid4()
    
    # 1. Total tokens sum > threshold (e.g. 2500)
    # 2. Return 6 messages (since > 5 messages are needed to trigger)
    m_list = [
        Message(role="user", content="Hello"),
        Message(role="assistant", content="Hi"),
        Message(role="user", content="How are you?"),
        Message(role="assistant", content="Good"),
        Message(role="user", content="Can you help?"),
        Message(role="assistant", content="Sure"),
    ]
    conv = Conversation(id=conv_id, summary=None)
    
    mock_session.execute.side_effect = [
        MockResult([2500]),  # func.sum
        MockResult(m_list),  # select(Message)
        MockResult([conv])   # select(Conversation)
    ]
    
    mock_session.commit = AsyncMock()
    
    # Mock get_llm
    mock_llm = MagicMock()
    mock_response = MagicMock()
    mock_response.content = "Resumo médico consolidado"
    mock_llm.invoke.return_value = mock_response
    
    with patch("services.chat_history.get_llm", return_value=mock_llm):
        history = PostgresChatHistory(mock_session)
        res = await history.summarize_if_needed(conv_id)
        
        assert res == "Resumo médico consolidado"
        assert conv.summary == "Resumo médico consolidado"
        mock_session.commit.assert_called_once()


# ==========================================
# 2. Unit Tests for purge_old_messages()
# ==========================================

@pytest.mark.asyncio
async def test_purge_old_messages():
    mock_session = AsyncMock()
    
    # Mocking counts of expired messages and empty conversations
    # Mocking 4 execute calls to avoid StopAsyncIteration
    mock_session.execute.side_effect = [
        MockResult([1, 2, 3]),  # 1. query_expired_count
        MockResult([]),         # 2. stmt_del_msg
        MockResult([4, 5]),     # 3. query_empty_conv
        MockResult([])          # 4. stmt_del_conv
    ]
    mock_session.commit = AsyncMock()
    
    stats = await purge_old_messages(mock_session)
    
    assert stats["purged_messages"] == 3
    assert stats["purged_conversations"] == 2
    mock_session.commit.assert_called_once()


# ==========================================
# 3. Integration Tests for REST Endpoints
# ==========================================

def test_list_conversations_unauthorized():
    response = client.get("/chat/conversations")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_create_conversation_endpoint():
    user_uuid = uuid.uuid4()
    conv_id = uuid.uuid4()
    
    # Overriding auth
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.execute.return_value = MockResult([])
    mock_db.commit = AsyncMock()
    
    # Mock db.refresh to set required non-null fields to avoid Pydantic ValidationError
    async def mock_refresh(obj):
        if isinstance(obj, Conversation):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
            if not obj.updated_at:
                obj.updated_at = datetime.now(timezone.utc)
        elif isinstance(obj, Message):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
                
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.post(
        "/chat/conversations",
        json={"title": "Fisioterapia de Joelho"}
    )
    
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Fisioterapia de Joelho"
    assert "id" in data


@pytest.mark.asyncio
async def test_list_conversations_endpoint():
    user_uuid = uuid.uuid4()
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    conversations = [
        Conversation(id=uuid.uuid4(), user_id=user_uuid, title="Conv 1", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)),
        Conversation(id=uuid.uuid4(), user_id=user_uuid, title="Conv 2", created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    ]
    mock_db.execute.return_value = MockResult(conversations)
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.get("/chat/conversations")
    
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["title"] == "Conv 1"
    assert data[1]["title"] == "Conv 2"


@pytest.mark.asyncio
async def test_list_messages_invalid_ownership():
    user_uuid = uuid.uuid4()
    other_conv_id = uuid.uuid4()
    
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    # Returns no conversation since user_uuid does not own other_conv_id
    mock_db.execute.return_value = MockResult([])
    app.dependency_overrides[get_db] = lambda: mock_db
    
    response = client.get(f"/chat/conversations/{other_conv_id}/messages")
    
    app.dependency_overrides.pop(get_current_user, None)
    app.dependency_overrides.pop(get_db, None)
    
    # Ownership verification triggers 404
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_send_message_full_rag_llm():
    user_uuid = uuid.uuid4()
    conv_id = uuid.uuid4()
    
    app.dependency_overrides[get_current_user] = lambda: str(user_uuid)
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    conv = Conversation(id=conv_id, user_id=user_uuid, title="Fisioterapia", summary="summary")
    
    mock_db.execute.side_effect = [
        MockResult([conv]),  # Validating ownership
        MockResult([]),      # load_messages (history)
        MockResult([1]),     # func.count inside add_message (user)
        MockResult([2]),     # func.count inside add_message (assistant)
        MockResult([150])    # func.sum inside summarize_if_needed
     ]
    mock_db.commit = AsyncMock()
    
    # Mock db.refresh to set required non-null fields to avoid Pydantic ValidationError
    async def mock_refresh(obj):
        if isinstance(obj, Conversation):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
            if not obj.updated_at:
                obj.updated_at = datetime.now(timezone.utc)
        elif isinstance(obj, Message):
            if not obj.id:
                obj.id = uuid.uuid4()
            if not obj.created_at:
                obj.created_at = datetime.now(timezone.utc)
                
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)
    
    app.dependency_overrides[get_db] = lambda: mock_db
    
    # Mock get_llm
    mock_llm = MagicMock()
    mock_response = MagicMock()
    mock_response.content = "Esta é uma resposta de teste."
    mock_llm.invoke.return_value = mock_response
    
    # Mock pgvector RAG
    mock_vector = MagicMock()
    mock_doc = MagicMock()
    mock_doc.page_content = "Fatos da Anvisa sobre remedios"
    mock_vector.similarity_search.return_value = [mock_doc]
    
    async def mock_get_vector():
        return mock_vector
        
    with patch("routers.chat.get_llm", return_value=mock_llm), \
         patch("routers.chat.get_vectorstore", side_effect=mock_get_vector):
        
        response = client.post(
            f"/chat/conversations/{conv_id}/messages",
            json={"content": "Para que serve Paracetamol?"}
        )
        
        app.dependency_overrides.pop(get_current_user, None)
        app.dependency_overrides.pop(get_db, None)
        
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "Esta é uma resposta de teste."
        assert data["role"] == "assistant"


# ==========================================
# 4. Observability Test (/health)
# ==========================================

def test_health_endpoint_scheduler_status():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "scheduler" in data
    assert "running" in data["scheduler"]
    assert "next_purge_run" in data["scheduler"]
