import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from jose import jwt, JWTError

from app.repositories.user_repository import UserRepository
from app.models.user import User, RoleEnum
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    UserResponse,
    AuthResponse,
    SSOTokenRequest,
    SSOTokenClaims,
)
from app.utils.password import hash_password, verify_password
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.redis import get_redis
from app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    def _make_tokens(self, user) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token({"sub": str(user.id), "email": user.email}),
            refresh_token=create_refresh_token({"sub": str(user.id)}),
        )

    async def register(self, data: RegisterRequest) -> AuthResponse:
        if await self.repo.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # First user becomes admin automatically
        count_result = await self.repo.db.execute(select(func.count()).select_from(User))
        total_users = count_result.scalar() or 0
        role = RoleEnum.admin if total_users == 0 else RoleEnum.member

        user = await self.repo.create(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
            role=role,
        )
        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=self._make_tokens(user),
        )

    async def login(self, data: LoginRequest) -> AuthResponse:
        user = await self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account deactivated"
            )
        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=self._make_tokens(user),
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token, expected_type="refresh")
        user = await self.repo.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        return self._make_tokens(user)

    async def logout(self, token: str) -> dict:
        payload = decode_token(token, expected_type="access")
        redis =  get_redis()
        await redis.setex(f"blacklist:{token}", 900, "1")  # 15 min = 900 sec
        return {"message": "logged out"}

    async def get_current_user(self, token: str) -> UserResponse:
        payload = decode_token(token, expected_type="access")
        # Blacklist check
        redis =  get_redis()
        if await redis.get(f"blacklist:{token}"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been invalidated"
            )
        user = await self.repo.get_by_id(uuid.UUID(payload["sub"]))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.model_validate(user)

    async def sso_authenticate(self, token: str) -> AuthResponse:
        try:
            payload = decode_token(token, expected_type="access")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired SSO token"
            )

        user = await self.repo.get_by_email(payload.get("email"))
        if not user:
            # Create new user with role=member
            user = await self.repo.create(
                name=payload.get("name", "SSO User"),
                email=payload["email"],
                hashed_password=hash_password(uuid.uuid4().hex[:16]),  # Random password
            )
        elif not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account deactivated"
            )

        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=self._make_tokens(user),
        )