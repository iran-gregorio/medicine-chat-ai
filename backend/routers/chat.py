import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
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

from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationSummaryBufferMemory
from services.chat_history_memory import CustomSQLChatMessageHistory
from utils.callbacks import ObservabilityCallbackHandler


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


@router.post("/conversations/{id}/messages")
async def send_message(
    id: uuid.UUID,
    request: MessageCreate,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Envia uma mensagem no chat via streaming, utiliza RAG e LCEL Chain.
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

    # 2. Executar Guardrail de Entrada
    guardrail_res = await GuardrailService.check_input_scope(request.content)
    if not guardrail_res["inside_scope"]:
        rejection_msg = guardrail_res["rejection_reason"]
        
        async def generate_rejection():
            await history_service.add_message(conversation_id=id, role="user", content=request.content)
            await history_service.add_message(conversation_id=id, role="assistant", content=rejection_msg)
            yield rejection_msg
            
        return StreamingResponse(generate_rejection(), media_type="text/event-stream")

    # 3. Configurar Memória
    past_messages = await history_service.load_messages(conversation_id=id)
    chat_history = CustomSQLChatMessageHistory()
    for msg in past_messages:
        if msg.role == "user":
            chat_history.add_user_message(msg.content)
        else:
            chat_history.add_ai_message(msg.content)

    memory = ConversationSummaryBufferMemory(
        llm=get_llm(),
        max_token_limit=2000,
        chat_memory=chat_history,
        return_messages=True
    )
    if conversation.summary:
        memory.moving_summary_buffer = conversation.summary

    # 4. Criar Chain LCEL
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT + "\n\nUtilize as seguintes informações factuais sobre medicamentos obtidas da ANVISA para enriquecer sua resposta:\n{context}\n"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    
    vectorstore = await get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    llm = get_llm()
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    # 5. Streamer e Callback
    async def generate_response():
        # Grava a mensagem do usuário
        await history_service.add_message(conversation_id=id, role="user", content=request.content)
        
        memory_vars = memory.load_memory_variables({})
        chat_history_messages = memory_vars.get("history", [])
        
        full_response = ""
        try:
            async for chunk in rag_chain.astream(
                {"input": request.content, "chat_history": chat_history_messages},
                config={"callbacks": [ObservabilityCallbackHandler()]}
            ):
                if "answer" in chunk:
                    token = chunk["answer"]
                    full_response += token
                    yield token
        except Exception as e:
            error_msg = f"\n[Erro na comunicação com a IA: {str(e)}]"
            full_response += error_msg
            yield error_msg
            
        if full_response:
            # Grava a mensagem do assistente
            await history_service.add_message(conversation_id=id, role="assistant", content=full_response)
            
            # Atualiza o summary buffer
            memory.save_context({"input": request.content}, {"output": full_response})
            if memory.moving_summary_buffer and memory.moving_summary_buffer != conversation.summary:
                conversation.summary = memory.moving_summary_buffer
                await db.commit()

    return StreamingResponse(generate_response(), media_type="text/event-stream")

from services.chat_purge import purge_old_messages

@router.post("/internal/purge")
async def trigger_purge(
    db: AsyncSession = Depends(get_db)
):
    """Executa a limpeza de mensagens antigas. Idealmente protegido por IAM ou headers no Cloud Run."""
    try:
        stats = await purge_old_messages(db)
        return {"status": "success", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
