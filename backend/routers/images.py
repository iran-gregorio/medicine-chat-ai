from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from auth import get_current_user
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.anonymizer import anonymize_text

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
    Integra OCR (mock) e PII anonimization.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser uma imagem.")
        
    # Placeholder para processamento OCR real.
    dummy_ocr_result = "Paciente: João da Silva\nCPF: 123.456.789-00\nReceita: Amoxicilina 500mg 1x ao dia."
    
    # Aplica anonimização de dados sensíveis antes de qualquer log ou processamento LLM
    safe_text = anonymize_text(dummy_ocr_result)
    
    print(f"Log Seguro (OCR Anonimizado): {safe_text}")
    
    return ImageUploadResponse(
        filename=file.filename,
        message="Imagem recebida e processada com sucesso. PII removido.",
        file_id="dummy-file-id-123",
        anonymized_preview=safe_text
    )
