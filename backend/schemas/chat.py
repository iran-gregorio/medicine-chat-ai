import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConversationCreate(BaseModel):
    """Corpo da requisição para criar uma nova conversa."""
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    """Dados de resposta de uma conversa."""
    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str]
    summary: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageCreate(BaseModel):
    """Corpo da requisição para enviar uma nova mensagem de chat."""
    content: str


class MessageResponse(BaseModel):
    """Dados de resposta de uma mensagem."""
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: str
    content: str
    tokens: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
