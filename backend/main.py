from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, images, auth

app = FastAPI(
    title="Medicine Chat AI API",
    description="Backend API for Medicine Chat AI application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
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
    return {"status": "ok"}
