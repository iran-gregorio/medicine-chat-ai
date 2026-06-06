from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from auth import get_current_user
import sys
import os
import base64

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.anonymizer import anonymize_text
from llm_config import get_llm, get_vectorstore
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/images", tags=["Images"])

class ImageUploadResponse(BaseModel):
    filename: str
    message: str
    file_id: str
    anonymized_preview: str = ""

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    current_user: str = Depends(get_current_user)
):
    """
    Endpoint inicial para upload de imagens (bulas/receitas médicas).
    Integra OCR (LLM Gemini 1.5 Flash via OpenRouter), PII anonymization e busca RAG.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser uma imagem.")
        
    try:
        content = await file.read()
        b64_image = base64.b64encode(content).decode('utf-8')
        
        llm = get_llm()
        messages = [
            SystemMessage(content="Você é um assistente especializado em processamento de prescrições médicas e bulas. Extraia da imagem o nome do medicamento, princípio ativo, dosagem e posologia recomendada. IMPORTANTE: NÃO transcreva nenhum dado pessoal do paciente como nome, endereço, CPF ou CRM do médico. Ignore e descarte qualquer informação que identifique uma pessoa."),
            HumanMessage(content=[
                {"type": "text", "text": "Por favor, extraia os medicamentos desta receita ou bula."},
                {"type": "image_url", "image_url": {"url": f"data:{file.content_type};base64,{b64_image}"}}
            ])
        ]
        
        response = await llm.ainvoke(messages)
        raw_text = response.content
        
        # Aplica anonimização de dados sensíveis antes de qualquer log ou RAG
        safe_text = anonymize_text(raw_text)
        print(f"Log Seguro (OCR Anonimizado): {safe_text}")
        
        # Realiza a busca RAG com a transcrição sanitizada
        vectorstore = await get_vectorstore()
        docs = await vectorstore.asimilarity_search(safe_text, k=2)
        
        rag_info = "\n\n".join([doc.page_content for doc in docs])
        
        unified_result = f"=== Informações Extraídas ===\n{safe_text}\n\n=== Contexto da ANVISA ===\n{rag_info}"
        
        return ImageUploadResponse(
            filename=file.filename,
            message="Imagem processada e sanitizada com sucesso.",
            file_id="gen-id-" + os.urandom(4).hex(),
            anonymized_preview=unified_result
        )
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao processar a imagem.")
