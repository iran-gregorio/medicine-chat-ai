from datetime import datetime, timedelta, timezone
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from models.chat import Conversation, Message


async def purge_old_messages(session: AsyncSession) -> dict:
    """
    Remove mensagens com mais de 7 dias de idade e deleta conversas sem mensagens.
    Retorna estatísticas sobre os registros apagados.
    """
    limit_date = datetime.now(timezone.utc) - timedelta(days=7)

    # 1. Contar quantas mensagens expiram para reportar no retorno
    query_expired_count = select(Message.id).where(Message.created_at < limit_date)
    res_count = await session.execute(query_expired_count)
    expired_msg_ids = list(res_count.scalars().all())
    purged_messages_count = len(expired_msg_ids)

    # Deletar mensagens antigas
    if purged_messages_count > 0:
        stmt_del_msg = delete(Message).where(Message.created_at < limit_date)
        await session.execute(stmt_del_msg)

    # 2. Identificar e deletar conversas vazias (sem nenhuma mensagem associada)
    subquery = select(Message.conversation_id).scalar_subquery()
    stmt_del_conv = delete(Conversation).where(Conversation.id.not_in(subquery))
    
    # Contar conversas vazias antes de deletar
    query_empty_conv = select(Conversation.id).where(Conversation.id.not_in(subquery))
    res_empty_conv = await session.execute(query_empty_conv)
    empty_conv_ids = list(res_empty_conv.scalars().all())
    purged_conversations_count = len(empty_conv_ids)

    if purged_conversations_count > 0:
        await session.execute(stmt_del_conv)

    # Confirmar transação
    await session.commit()

    return {
        "purged_messages": purged_messages_count,
        "purged_conversations": purged_conversations_count,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
