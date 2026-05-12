from fastapi import FastAPI
from routers import chat, images, auth

app = FastAPI(
    title="Medicine Chat AI API",
    description="Backend API for Medicine Chat AI application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(images.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Medicine Chat AI API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
