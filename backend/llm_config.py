import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_postgres.vectorstores import PGVector
from sqlalchemy.ext.asyncio import create_async_engine

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "dummy")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medicine_user:medicine_password@localhost:5432/medicine_chat")
# langchain-postgres PGVector mostly prefers synchronous psycopg or psycopg3 connection strings if not doing strictly async pgvector
# To keep it compatible with pgvector via SQLAlchemy, we can use the async engine directly if supported, or provide a sync connection string.
SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")

# We configure OpenRouter by overriding the base_url
llm = ChatOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    model="google/gemini-3.1-flash-lite",
    temperature=0.0,
    tiktoken_model_name="gpt-3.5-turbo"
)
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5"
        )
    return _embeddings

# Setup PGVector for RAG
ASYNC_PSYCOPG_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")
engine = create_async_engine(ASYNC_PSYCOPG_URL)

_vectorstore = None

async def get_vectorstore():
    # Helper to return the vectorstore for dependency injection
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = PGVector(
            embeddings=get_embeddings(),
            collection_name="anvisa_medicines_v2",
            connection=engine,
            use_jsonb=True,
        )
    return _vectorstore

def get_llm():
    return llm
