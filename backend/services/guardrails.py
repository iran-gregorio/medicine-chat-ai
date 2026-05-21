# -*- coding: utf-8 -*-
import json
import logging
from langchain_core.messages import HumanMessage, SystemMessage
from config.agent_prompt import GUARDRAIL_SYSTEM_PROMPT
from llm_config import get_llm

logger = logging.getLogger(__name__)

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
            messages = [
                SystemMessage(content=GUARDRAIL_SYSTEM_PROMPT),
                HumanMessage(content=user_message)
            ]
            response = await llm.ainvoke(messages)
            content = response.content.strip()
            
            # Limpa possíveis blocos de código markdown que a LLM possa gerar
            if content.startswith("```"):
                lines = content.split("\n")
                if lines[0].startswith("```json") or lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()
            
            result = json.loads(content)
            inside_scope = bool(result.get("inside_scope", True))
            rejection_reason = result.get("rejection_reason", "")
            
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
