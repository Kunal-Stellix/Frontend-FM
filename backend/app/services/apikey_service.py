import uuid
import secrets
import hashlib
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.api_key import ApiKey


async def list_api_keys(db: AsyncSession, user_id: uuid.UUID) -> list[ApiKey]:
    result = await db.execute(
        select(ApiKey).where(ApiKey.created_by == user_id)
    )
    return list(result.scalars().all())


async def create_api_key(
    db: AsyncSession,
    name: str,
    user_id: uuid.UUID,
) -> tuple[ApiKey, str]:
    plaintext = "sk_" + secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(plaintext.encode()).hexdigest()
    key_prefix = plaintext[:8]

    api_key = ApiKey(
        name=name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        created_by=user_id,
    )
    db.add(api_key)
    await db.flush()
    await db.refresh(api_key)
    return api_key, plaintext


async def delete_api_key(
    db: AsyncSession,
    key_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.created_by == user_id)
    )
    key = result.scalar_one_or_none()
    if not key:
        return False
    await db.delete(key)
    return True


async def verify_api_key(
    db: AsyncSession,
    raw_key: str,
) -> uuid.UUID | None:
    """Verify API key and return user_id. Updates last_used_at."""
    if not raw_key.startswith("sk_"):
        return None

    key_prefix = raw_key[:8]
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

    result = await db.execute(
        select(ApiKey).where(
            ApiKey.key_prefix == key_prefix,
            ApiKey.is_active == True,
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        return None

    if api_key.key_hash != key_hash:
        return None

    # Update last_used_at
    api_key.last_used_at = datetime.now(timezone.utc)
    await db.flush()
    return api_key.created_by