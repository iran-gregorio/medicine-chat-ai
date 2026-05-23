from typing import List
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.messages import BaseMessage

class CustomSQLChatMessageHistory(BaseChatMessageHistory):
    """
    Implementação da memória de chat do LangChain que é preenchida a partir
    do histórico lido do banco de dados (nossa tabela Message).
    Como as classes de Memory do LangChain operam de forma síncrona
    e nossa sessão com banco de dados é assíncrona, usamos esta classe 
    como um proxy em memória durante a execução da Chain.
    """
    def __init__(self, messages: List[BaseMessage] = None):
        self._messages = messages or []

    @property
    def messages(self) -> List[BaseMessage]:
        return self._messages

    def add_message(self, message: BaseMessage) -> None:
        self._messages.append(message)

    def clear(self) -> None:
        self._messages = []
