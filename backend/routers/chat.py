from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from auth import get_current_user
from llm_config import get_llm, get_vectorstore

router = APIRouter(prefix="/chat", tags=["Chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: str = Depends(get_current_user)):
    """
    Endpoint inicial para Chat.
    Integra com o LangChain configurado para receber mensagens do usuário,
    buscar contexto no pgvector (RAG) e responder utilizando a LLM configurada.
    """
    # Placeholder for actual RAG pipeline invocation
    llm = get_llm()
    vectorstore = await get_vectorstore()
    
    # Simple direct LLM call for now (until full pipeline is set up)
    try:
        response = llm.invoke(request.message)
        reply_content = response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return ChatResponse(reply=reply_content, session_id=request.session_id)
