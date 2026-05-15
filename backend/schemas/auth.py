from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

def validate_password_complexity(v: str) -> str:
    if len(v) < 8:
        raise ValueError('A senha deve ter pelo menos 8 caracteres.')
    if not re.search(r'[A-Z]', v):
        raise ValueError('A senha deve conter pelo menos uma letra maiúscula.')
    if not re.search(r'[a-z]', v):
        raise ValueError('A senha deve conter pelo menos uma letra minúscula.')
    if not re.search(r'\d', v):
        raise ValueError('A senha deve conter pelo menos um número.')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
        raise ValueError('A senha deve conter pelo menos um caractere especial.')
    return v

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        return validate_password_complexity(v)

class RegisterResponse(BaseModel):
    message: str

class LoginRequest(BaseModel):
    identifier: str  # Pode ser e-mail ou telefone
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        return validate_password_complexity(v)

