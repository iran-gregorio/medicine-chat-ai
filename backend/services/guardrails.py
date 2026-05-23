# -*- coding: utf-8 -*-
import logging
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, SystemMessage
from config.agent_prompt import GUARDRAIL_SYSTEM_PROMPT
from llm_config import get_llm
from utils.callbacks import ObservabilityCallbackHandler

logger = logging.getLogger(__name__)

class GuardrailResult(BaseModel):
    inside_scope: bool = Field(description="True se a pergunta for sobre medicamentos, posologias, reações adversas ou interações. False caso contrário.")
    rejection_reason: str = Field(description="Mensagem educada caso esteja fora do escopo. Vazia se dentro do escopo.")

class GuardrailService:
    @staticmethod
    async def check_input_scope(user_message: str) -> dict:
        """
        Classifica semanticamente a mensagem do usuário para validar se ela está
        dentro ou fora do escopo de atuação do farmacêutico.
        
        Retorna um dicionário:
        {
            "inside_scope": bool,
            "rejection_reason": str
        }
        """
        try:
            llm = get_llm()
            structured_llm = llm.with_structured_output(GuardrailResult)
            messages = [
                SystemMessage(content=GUARDRAIL_SYSTEM_PROMPT),
                HumanMessage(content=user_message)
            ]
            
            result: GuardrailResult = await structured_llm.ainvoke(messages, config={"callbacks": [ObservabilityCallbackHandler()]})
            
            inside_scope = result.inside_scope
            rejection_reason = result.rejection_reason
            
            # Se fora do escopo e sem motivo, adiciona um motivo padrão educado
            if not inside_scope and not rejection_reason:
                rejection_reason = (
                    "Olá! Como farmacêutico experiente, posso tirar dúvidas apenas sobre "
                    "medicamentos, posologias, reações adversas e interações medicamentosas. "
                    "Para outras dúvidas, recomendo consultar um profissional qualificado."
                )
                
            return {
                "inside_scope": inside_scope,
                "rejection_reason": rejection_reason
            }
        except Exception as e:
            # Fallback seguro e resiliente para não bloquear o usuário caso a API falhe
            logger.error(f"Erro ao executar guardrail de entrada (fallback seguro ativado): {str(e)}")
            return {
                "inside_scope": True,
                "rejection_reason": ""
            }
