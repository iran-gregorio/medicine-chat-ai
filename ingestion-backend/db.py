import os
from dotenv import load_dotenv
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_postgres.vectorstores import PGVector
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medicine_user:medicine_password@localhost:5432/medicine_chat")
SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5"
        )
    return _embeddings

ASYNC_PSYCOPG_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")
engine = create_async_engine(ASYNC_PSYCOPG_URL)

_vectorstore = None

async def get_vectorstore():
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = PGVector(
            embeddings=get_embeddings(),
            collection_name="anvisa_medicines_v2",
            connection=engine,
            use_jsonb=True,
        )
    return _vectorstore
