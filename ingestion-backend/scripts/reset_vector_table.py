import asyncio
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Adiciona o diretório backend ao path para importação correta
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medicine_user:medicine_password@localhost:5432/medicine_chat")

async def reset_tables():
    print(f"Conectando ao banco de dados: {DATABASE_URL}")
    engine = create_async_engine(DATABASE_URL)
    
    try:
        async with engine.begin() as conn:
            print("Removendo tabela 'langchain_pg_embedding' (CASCADE)...")
            await conn.execute(text("DROP TABLE IF EXISTS langchain_pg_embedding CASCADE;"))
            
            print("Removendo tabela 'langchain_pg_collection' (CASCADE)...")
            await conn.execute(text("DROP TABLE IF EXISTS langchain_pg_collection CASCADE;"))
            
            print("✓ Tabelas de vetores removidas com sucesso!")
    except Exception as e:
        print(f"Erro ao tentar remover as tabelas: {str(e)}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_tables())
