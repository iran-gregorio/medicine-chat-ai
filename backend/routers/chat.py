import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from auth import get_current_user
from models.chat import Conversation
from schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    ConversationUpdate,
    MessageCreate,
    MessageResponse,
)
from services.chat_history import PostgresChatHistory
from llm_config import get_llm, get_vectorstore
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from config.agent_prompt import SYSTEM_PROMPT
from services.guardrails import GuardrailService


router = APIRouter(prefix="/chat", tags=["Chat"])



@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    request: ConversationCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Cria uma nova sessão de conversa para o usuário autenticado."""
    user_uuid = uuid.UUID(current_user)
    history_service = PostgresChatHistory(db)
    conversation = await history_service.get_or_create_conversation(
        user_id=user_uuid,
        title=request.title,
    )
    return conversation


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    archived: bool = False,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista todas as conversas do usuário autenticado ordenadas por atualização recente."""
    user_uuid = uuid.UUID(current_user)
    query = (
        select(Conversation)
        .where(Conversation.user_id == user_uuid, Conversation.is_archived == archived)
        .order_by(Conversation.updated_at.desc())
    )
    result = await db.execute(query)
    conversations = result.scalars().all()
    return conversations


@router.patch("/conversations/{id}", response_model=ConversationResponse)
async def update_conversation(
    id: uuid.UUID,
    request: ConversationUpdate,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualiza metadados (como título ou status de arquivamento) de uma conversa."""
    user_uuid = uuid.UUID(current_user)
    
    query = select(Conversation).where(
        Conversation.id == id, Conversation.user_id == user_uuid
    )
    result = await db.execute(query)
    conversation = result.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou acesso não autorizado.",
        )
        
    if request.title is not None:
        conversation.title = request.title
    if request.is_archived is not None:
        conversation.is_archived = request.is_archived
        
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.get("/conversations/{id}/messages", response_model=List[MessageResponse])
async def list_messages(
    id: uuid.UUID,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna as mensagens de uma conversa específica, validando a propriedade da conversa."""
    user_uuid = uuid.UUID(current_user)
    
    # Validar ownership da conversa
    query_conv = select(Conversation).where(
        Conversation.id == id, Conversation.user_id == user_uuid
    )
    res_conv = await db.execute(query_conv)
    conversation = res_conv.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou acesso não autorizado.",
        )

    history_service = PostgresChatHistory(db)
    # Carrega todo o histórico desta conversa
    messages = await history_service.load_messages(conversation_id=id, limit=100)
    return messages


@router.post("/conversations/{id}/messages", response_model=MessageResponse)
async def send_message(
    id: uuid.UUID,
    request: MessageCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Envia uma mensagem no chat, executa a busca vetorial (RAG) no pgvector,
    carrega histórico de mensagens recentes como contexto, aciona o LLM e persiste ambos no banco de dados.
    """
    user_uuid = uuid.UUID(current_user)

    # 1. Validar propriedade da conversa
    query_conv = select(Conversation).where(
        Conversation.id == id, Conversation.user_id == user_uuid
    )
    res_conv = await db.execute(query_conv)
    conversation = res_conv.scalar_one_or_none()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversa não encontrada ou acesso não autorizado.",
        )

    history_service = PostgresChatHistory(db)

    # 1.5. Executar Guardrail de Entrada
    guardrail_res = await GuardrailService.check_input_scope(request.content)
    if not guardrail_res["inside_scope"]:
        rejection_msg = guardrail_res["rejection_reason"]
        # Gravar turno do usuário e resposta educada no histórico
        await history_service.add_message(conversation_id=id, role="user", content=request.content)
        assistant_msg = await history_service.add_message(
            conversation_id=id, role="assistant", content=rejection_msg
        )
        return assistant_msg

    # 2. Busca Vetorial de Contexto (RAG) no pgvector
    rag_context = ""
    try:
        vectorstore = await get_vectorstore()
        # Executa similaridade em banco de dados das bulas da ANVISA
        docs = vectorstore.similarity_search(request.content, k=3)
        if docs:
            rag_context = "\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        # Fallback tolerante a falhas (ex: base RAG ainda vazia)
        print(f"Alerta: Erro ao realizar busca pgvector RAG: {str(e)}")

    # 3. Carrega o histórico recente do banco
    past_messages = await history_service.load_messages(conversation_id=id)

    # 4. Formata a pilha de mensagens para a LLM
    messages_for_llm = []

    # System Message (com RAG e Resumo de histórico se houver)
    system_content = SYSTEM_PROMPT
    
    if conversation.summary:
        system_content += f"\nResumo consolidado do histórico médico anterior:\n{conversation.summary}\n"

    if rag_context:
        system_content += (
            f"\nUtilize as seguintes informações factuais sobre medicamentos obtidas da ANVISA para enriquecer sua resposta:\n"
            f"{rag_context}\n"
        )

    messages_for_llm.append(SystemMessage(content=system_content))

    # Turnos de conversa passados
    for msg in past_messages:
        if msg.role == "user":
            messages_for_llm.append(HumanMessage(content=msg.content))
        else:
            messages_for_llm.append(AIMessage(content=msg.content))

    # Nova mensagem do usuário
    messages_for_llm.append(HumanMessage(content=request.content))

    # 5. Invoca a LLM
    try:
        llm = get_llm()
        response = llm.invoke(messages_for_llm)
        reply_content = response.content
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno de comunicação com a IA: {str(e)}",
        )

    # 6. Gravar mensagens no Banco de Dados
    # Adicionar turno do usuário
    await history_service.add_message(conversation_id=id, role="user", content=request.content)
    # Adicionar turno do assistente
    assistant_msg = await history_service.add_message(
        conversation_id=id, role="assistant", content=reply_content
    )

    # 7. Dispara compressão/resumo automático se necessário
    await history_service.summarize_if_needed(conversation_id=id)

    return assistant_msg
