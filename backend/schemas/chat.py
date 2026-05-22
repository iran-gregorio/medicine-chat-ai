import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ConversationCreate(BaseModel):
    """Corpo da requisição para criar uma nova conversa."""
    title: Optional[str] = None


class ConversationUpdate(BaseModel):
    """Corpo da requisição para atualizar uma conversa existente."""
    title: Optional[str] = None
    is_archived: Optional[bool] = None


class ConversationResponse(BaseModel):
    """Dados de resposta de uma conversa."""
    id: uuid.UUID
    user_id: uuid.UUID
    title: Optional[str]
    summary: Optional[str]
    is_archived: bool
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
