import re

def anonymize_text(text: str) -> str:
    """
    Filtro de anonimização (PII) básico utilizando RegEx.
    Em produção, pode ser acoplado a LLMs ou bibliotecas especializadas (como Presidio)
    para remover Nomes, CPFs, RGs e números de prontuário das prescrições antes do registro em log.
    """
    if not text:
        return text
        
    # Remove CPFs (formato XXX.XXX.XXX-XX)
    anonymized = re.sub(r'\d{3}\.\d{3}\.\d{3}-\d{2}', '[CPF REMOVIDO]', text)
    
    # Remove RGs comuns (simplificado)
    anonymized = re.sub(r'(?i)(rg|registro geral)[:\s]*\d+', '[RG REMOVIDO]', anonymized)
    
    # Remove Nomes de Pacientes que comecem com 'Paciente:' (simplificado)
    anonymized = re.sub(r'(?i)(paciente|nome)[:\s]*([A-Za-zÀ-ÿ\s]+)', r'\1: [NOME REMOVIDO]', anonymized)
    
    return anonymized
