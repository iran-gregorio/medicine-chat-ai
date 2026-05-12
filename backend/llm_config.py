import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector
from sqlalchemy.ext.asyncio import create_async_engine

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "dummy")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medicine_user:medicine_password@localhost:5432/medicine_chat")
# langchain-postgres PGVector mostly prefers synchronous psycopg or psycopg3 connection strings if not doing strictly async pgvector
# To keep it compatible with pgvector via SQLAlchemy, we can use the async engine directly if supported, or provide a sync connection string.
SYNC_DATABASE_URL = DATABASE_URL.replace("+asyncpg", "+psycopg")

# We configure OpenRouter by overriding the base_url
llm = ChatOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    model="anthropic/claude-3.5-sonnet", # Multimodal capability placeholder
    temperature=0.0
)

embeddings = OpenAIEmbeddings(
    api_key=os.getenv("OPENAI_API_KEY", "dummy"), # Em uma implementação real, usaríamos embeddings do próprio provedor ou OpenAI real
    model="text-embedding-3-small"
)

# Setup PGVector for RAG
engine = create_async_engine(DATABASE_URL)

_vectorstore = None

async def get_vectorstore():
    # Helper to return the vectorstore for dependency injection
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = PGVector(
            embeddings=embeddings,
            collection_name="anvisa_medicines",
            connection=SYNC_DATABASE_URL,
            use_jsonb=True,
        )
    return _vectorstore

def get_llm():
    return llm
