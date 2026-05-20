from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, images, auth
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from services.chat_purge import purge_old_messages
from database import AsyncSessionLocal

scheduler = AsyncIOScheduler(timezone="UTC")


async def scheduled_purge_job():
    async with AsyncSessionLocal() as session:
        try:
            stats = await purge_old_messages(session)
            print(f"Purge job completed successfully: {stats}")
        except Exception as e:
            print(f"Error executing purge job: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Executar purge_old_messages() diariamente às 03:00 UTC
    scheduler.add_job(
        scheduled_purge_job,
        trigger="cron",
        hour=3,
        minute=0,
        id="purge_old_messages_job",
        replace_existing=True
    )
    scheduler.start()
    print("Background scheduler started.")
    yield
    scheduler.shutdown()
    print("Background scheduler shut down.")


app = FastAPI(
    title="Medicine Chat AI API",
    description="Backend API for Medicine Chat AI application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(images.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Medicine Chat AI API"}


@app.get("/health")
async def health_check():
    job = scheduler.get_job("purge_old_messages_job")
    next_run = job.next_run_time.isoformat() if job and job.next_run_time else None
    return {
        "status": "ok",
        "scheduler": {
            "running": scheduler.running,
            "next_purge_run": next_run
        }
    }
