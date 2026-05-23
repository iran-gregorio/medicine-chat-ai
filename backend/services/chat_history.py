import os
import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from models.chat import Conversation, Message
from llm_config import get_llm

CONTEXT_WINDOW_MESSAGES = int(os.getenv("CONTEXT_WINDOW_MESSAGES", "20"))
SUMMARY_TOKEN_THRESHOLD = int(os.getenv("SUMMARY_TOKEN_THRESHOLD", "2000"))


class PostgresChatHistory:
    """Serviço para gerenciamento do histórico de chat e resumos automáticos no PostgreSQL."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_conversation(
        self,
        user_id: uuid.UUID,
        conversation_id: Optional[uuid.UUID] = None,
        title: Optional[str] = None,
    ) -> Conversation:
        """Recupera uma conversa existente ou cria uma nova."""
        if conversation_id:
            query = select(Conversation).where(
                Conversation.id == conversation_id, Conversation.user_id == user_id
            )
            result = await self.session.execute(query)
            conversation = result.scalar_one_or_none()
            if conversation:
                return conversation

        # Criar nova conversa se não encontrada ou não fornecido ID
        new_conv = Conversation(
            id=conversation_id or uuid.uuid4(),
            user_id=user_id,
            title=title or "Nova Conversa",
        )
        self.session.add(new_conv)
        await self.session.commit()
        await self.session.refresh(new_conv)
        return new_conv

    async def load_messages(self, conversation_id: uuid.UUID, limit: int = CONTEXT_WINDOW_MESSAGES) -> List[Message]:
        """Carrega as últimas N mensagens em ordem cronológica."""
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(query)
        messages = list(result.scalars().all())
        # Retornar em ordem cronológica
        messages.reverse()
        return messages

    def estimate_tokens(self, content: str) -> int:
        """Estima o número de tokens em uma string de forma simples e rápida."""
        if not content:
            return 0
        return int(len(content.split()) * 1.3)

    async def add_message(self, conversation_id: uuid.UUID, role: str, content: str) -> Message:
        """Adiciona uma mensagem à conversa, estimando os tokens e gerando título automático se for a primeira."""
        tokens = self.estimate_tokens(content)
        
        # Verificar se é a primeira mensagem para atualizar o título da conversa
        query_count = select(func.count(Message.id)).where(Message.conversation_id == conversation_id)
        result_count = await self.session.execute(query_count)
        msg_count = result_count.scalar() or 0

        new_message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tokens=tokens,
        )
        self.session.add(new_message)

        if msg_count == 0 and role == "user":
            # Atualizar título da conversa com os primeiros 50 caracteres da primeira mensagem
            query_conv = select(Conversation).where(Conversation.id == conversation_id)
            res_conv = await self.session.execute(query_conv)
            conv = res_conv.scalar_one_or_none()
            if conv and (not conv.title or conv.title == "Nova Conversa"):
                title_suggestion = content[:50]
                if len(content) > 50:
                    title_suggestion += "..."
                conv.title = title_suggestion

        await self.session.commit()
        await self.session.refresh(new_message)
        return new_message

    # O método summarize_if_needed foi removido, a sumarização passará a ser tratada nativamente pelo LangChain com ConversationSummaryBufferMemory no chat.py.
