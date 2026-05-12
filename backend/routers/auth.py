from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from auth import create_access_token, verify_password, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Endpoint para autenticar o usuário e retornar o token JWT.
    (Em produção, deve validar contra o banco de dados)
    """
    # Exemplo mockado (substituir por query real no DB)
    if request.username == "testuser" and request.password == "testpass":
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": request.username}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais incorretas",
        headers={"WWW-Authenticate": "Bearer"},
    )
