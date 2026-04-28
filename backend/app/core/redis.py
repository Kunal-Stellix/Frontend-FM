import redis.asyncio as aioredis
from app.core.config import settings

_redis_client: aioredis.Redis | None = None


async def init_redis():
    global _redis_client
    _redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True,
    )
    await _redis_client.ping()
    print("✅ Redis connected")


async def close_redis():
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()


def get_redis() -> aioredis.Redis:
    if _redis_client is None:
        raise RuntimeError("Redis not initialised. Call init_redis() first.")
    return _redis_client
