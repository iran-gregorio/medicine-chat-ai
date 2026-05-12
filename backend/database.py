import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# The database URL can be provided by environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://medicine_user:medicine_password@localhost:5432/medicine_chat")

engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
