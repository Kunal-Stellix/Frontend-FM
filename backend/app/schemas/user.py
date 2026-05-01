from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import RoleEnum





class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v) < 1:
            raise ValueError("Name must be at least 1 character")
        if len(v) > 255:
            raise ValueError("Name must be at most 255 characters")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 128:
            raise ValueError("Password must be at most 128 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: RoleEnum
    avatar_url: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse


class SSOTokenRequest(BaseModel):
    token: str


class SSOTokenClaims(BaseModel):
    sub: str
    email: EmailStr
    name: str
    plan: str | None = None
    exp: int