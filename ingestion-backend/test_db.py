import asyncio
from sqlalchemy import text
from db import engine

async def main():
    async with engine.begin() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%langchain%'"))
        print(res.fetchall())

asyncio.run(main())
