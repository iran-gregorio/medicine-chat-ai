import asyncio
import os
import argparse
import glob
from uuid import uuid4
from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from sqlalchemy import text

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

from db import get_vectorstore, engine
import re

def redact_pii(text: str) -> str:
    """Removes sensitive PII like CPF, Emails, and Phone numbers from text."""
    # Redact CPF (XXX.XXX.XXX-XX or XXXXXXXXXXX)
    text = re.sub(r'\b\d{3}\.\d{3}\.\d{3}-\d{2}\b', '[CPF REMOVED]', text)
    text = re.sub(r'\b\d{11}\b', '[CPF REMOVED]', text)
    # Redact Email
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', '[EMAIL REMOVED]', text)
    # Redact Phone (e.g. (XX) XXXXX-XXXX)
    text = re.sub(r'\(\d{2}\)\s*\d{4,5}-\d{4}', '[PHONE REMOVED]', text)
    return text


async def clear_existing_pdf_embeddings(filename: str, vectorstore):
    """
    Remove do banco todos os embeddings antigos correspondentes a um determinado arquivo PDF
    para evitar duplicações e desperdício de embeddings.
    """
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "DELETE FROM langchain_pg_embedding "
                "WHERE cmetadata ->> 'filename' = :filename "
                "AND cmetadata ->> 'source' = 'local_pdf'"
            ),
            {"filename": filename}
        )


async def process_local_pdfs(dir_path: str):
    """
    Lê, valida e vetoriza todos os arquivos PDF em um diretório local.
    """
    if not os.path.exists(dir_path):
        print(f"Erro: O diretório '{dir_path}' não existe.")
        return
        
    if not os.path.isdir(dir_path):
        print(f"Erro: O caminho '{dir_path}' não é um diretório.")
        return

    # Busca arquivos .pdf no diretório (case-insensitive)
    pdf_pattern = os.path.join(dir_path, "*")
    all_files = glob.glob(pdf_pattern)
    pdf_files = [f for f in all_files if f.lower().endswith(".pdf")]

    if not pdf_files:
        print(f"Aviso: Nenhum arquivo PDF encontrado no diretório '{dir_path}'.")
        return

    print(f"Encontrados {len(pdf_files)} arquivos PDF para processamento.")
    vectorstore = await get_vectorstore()
    
    # Ensure tables exist before trying to delete from them
    await vectorstore.acreate_tables_if_not_exists()
    
    # Configura o splitter de texto
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        print(f"\nProcessando arquivo: {filename}...")
        
        try:
            reader = PdfReader(pdf_path)
            documents = []
            total_text_length = 0
            
            for page_idx, page in enumerate(reader.pages):
                page_num = page_idx + 1
                page_text = page.extract_text() or ""
                page_text_stripped = page_text.strip()
                page_text_stripped = redact_pii(page_text_stripped)
                
                if not page_text_stripped:
                    print(f"  [Aviso] Página {page_num} do arquivo '{filename}' está vazia ou é imagem (sem texto extraível).")
                    continue
                
                total_text_length += len(page_text_stripped)
                
                # Split do texto da página
                chunks = splitter.split_text(page_text_stripped)
                for chunk in chunks:
                    doc = Document(
                        page_content=chunk,
                        metadata={
                            "source": "local_pdf",
                            "filename": filename,
                            "page": page_num
                        }
                    )
                    documents.append(doc)
            
            if total_text_length == 0:
                print(f"  [Aviso] O arquivo '{filename}' parece estar vazio ou escaneado (sem texto extraível). Pulando gravação de embeddings.")
                continue

            if not documents:
                print(f"  [Aviso] Nenhum texto útil pôde ser extraído e fragmentado de '{filename}'.")
                continue

            print(f"  -> Removendo embeddings antigos para '{filename}' para evitar duplicação...")
            await clear_existing_pdf_embeddings(filename, vectorstore)
            
            print(f"  -> Gerando embeddings e inserindo {len(documents)} blocos de texto...")
            await vectorstore.aadd_documents(documents)
            print(f"  ✓ Processamento e indexação de '{filename}' concluídos com sucesso!")
            
        except Exception as e:
            print(f"  [Erro] Falha ao processar o arquivo '{filename}': {str(e)}")


async def main():
    parser = argparse.ArgumentParser(
        description="CLI para ingestão de PDFs locais no PGVector RAG."
    )
    parser.add_argument(
        "--pdf-dir",
        type=str,
        required=True,
        help="Caminho do diretório local contendo arquivos PDF para ingestão de embeddings."
    )
    
    args = parser.parse_args()
    await process_local_pdfs(args.pdf_dir)


if __name__ == "__main__":
    asyncio.run(main())
