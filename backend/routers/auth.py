import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from database import get_db
from models.user import User, UserRefreshToken, PasswordResetToken
from schemas.auth import (
    RegisterRequest, RegisterResponse, LoginRequest, TokenResponse,
    RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from auth import (
    create_access_token, get_password_hash, verify_password,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.email import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_TOKEN_EXPIRE_DAYS = 7

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Registra um novo usuário no sistema."""
    # Verifica se e-mail ou telefone já existem
    query = select(User).where(or_(User.email == request.email, User.phone == request.phone))
    result = await db.execute(query)
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="E-mail ou telefone já cadastrado"
        )
    
    new_user = User(
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        hashed_password=get_password_hash(request.password)
    )
    db.add(new_user)
    await db.commit()
    return {"message": "Usuário registrado com sucesso"}

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Autentica o usuário via e-mail ou telefone."""
    query = select(User).where(or_(User.email == request.identifier, User.phone == request.identifier))
    result = await db.execute(query)
    user = result.scalars().first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais incorretas",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    # Generate tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token_str = secrets.token_urlsafe(32)
    refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    refresh_token = UserRefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=refresh_token_expires
    )
    db.add(refresh_token)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token_str,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Renova o access token usando um refresh token válido."""
    query = select(UserRefreshToken).where(
        UserRefreshToken.token == request.refresh_token,
        UserRefreshToken.is_revoked == False
    )
    result = await db.execute(query)
    refresh_record = result.scalars().first()

    if not refresh_record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido ou revogado")
        
    # Verificar se o token expirou
    # O Python 3.11+ facilita comparações de datetime com timezone.utc
    if refresh_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expirado")

    # Obter usuário
    query_user = select(User).where(User.id == refresh_record.user_id)
    result_user = await db.execute(query_user)
    user = result_user.scalars().first()

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário inválido ou inativo")

    # Revogar o token atual
    refresh_record.is_revoked = True
    
    # Gerar novos tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}, expires_delta=access_token_expires
    )
    
    new_refresh_token_str = secrets.token_urlsafe(32)
    new_refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    new_refresh_token = UserRefreshToken(
        user_id=user.id,
        token=new_refresh_token_str,
        expires_at=new_refresh_token_expires
    )
    db.add(new_refresh_token)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token_str,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Revoga o refresh token fornecido."""
    query = select(UserRefreshToken).where(UserRefreshToken.token == request.refresh_token)
    result = await db.execute(query)
    refresh_record = result.scalars().first()

    if refresh_record:
        refresh_record.is_revoked = True
        await db.commit()
        
    return {"message": "Logout realizado com sucesso"}

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Gera um token de recuperação de senha e envia por e-mail."""
    query = select(User).where(User.email == request.email)
    result = await db.execute(query)
    user = result.scalars().first()

    # Sempre retorna sucesso para não expor a existência de contas
    message = "Se o e-mail estiver cadastrado, as instruções foram enviadas."
    if not user:
        return {"message": message}

    reset_token_str = secrets.token_urlsafe(32)
    reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=reset_token_str,
        expires_at=reset_token_expires
    )
    db.add(reset_token)
    await db.commit()

    user_name = user.full_name if user.full_name else "Usuário"
    background_tasks.add_task(send_password_reset_email, user.email, reset_token_str, user_name)

    return {"message": message}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Redefine a senha do usuário usando um token válido."""
    query = select(PasswordResetToken).where(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used_at == None
    )
    result = await db.execute(query)
    reset_record = result.scalars().first()

    if not reset_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido ou já utilizado")

    if reset_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expirado")

    # Obter usuário e atualizar senha
    query_user = select(User).where(User.id == reset_record.user_id)
    result_user = await db.execute(query_user)
    user = result_user.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário não encontrado")

    user.hashed_password = get_password_hash(request.new_password)
    reset_record.used_at = datetime.now(timezone.utc)
    
    await db.commit()

    return {"message": "Senha atualizada com sucesso"}
