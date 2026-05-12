import asyncio
import os
import csv
from uuid import uuid4
from langchain_core.documents import Document

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm_config import get_vectorstore

async def sync_anvisa_data():
    """
    Simula o download e processamento de um CSV da ANVISA e armazena no PostgreSQL via pgvector.
    Em um cenário real, isso faria requisições HTTP para os dados abertos da ANVISA.
    """
    print("Iniciando rotina de ingestão de dados da ANVISA...")
    
    # Simulação de dados parseados do CSV
    dummy_csv_data = [
        {"registro": "100290002", "nome": "Paracetamol 750mg", "principio_ativo": "Paracetamol", "indicacao": "Febre e dores leves"},
        {"registro": "100290003", "nome": "Dipirona 500mg", "principio_ativo": "Dipirona Sódica", "indicacao": "Febre e dores agudas"},
        {"registro": "100290004", "nome": "Ibuprofeno 400mg", "principio_ativo": "Ibuprofeno", "indicacao": "Inflamações e febre"}
    ]
    
    vectorstore = await get_vectorstore()
    
    documents = []
    for item in dummy_csv_data:
        # Prepara o conteúdo textual para o Embedding
        page_content = f"Nome: {item['nome']}\nPrincípio Ativo: {item['principio_ativo']}\nIndicação: {item['indicacao']}"
        
        doc = Document(
            page_content=page_content,
            metadata={"registro_anvisa": item["registro"], "source": "anvisa_csv"}
        )
        documents.append(doc)
    
    print(f"Gerando embeddings e inserindo {len(documents)} documentos...")
    # langchains PGVector .add_documents is sync
    vectorstore.add_documents(documents)
    print("Sincronização concluída com sucesso!")

if __name__ == "__main__":
    asyncio.run(sync_anvisa_data())
