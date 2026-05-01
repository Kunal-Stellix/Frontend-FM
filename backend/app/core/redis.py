import logging
from typing import Optional

import redis.asyncio as aioredis
from app.core.config import settings

_redis_client: Optional[aioredis.Redis] = None

logger = logging.getLogger(__name__)


class InMemoryRedis:
    """Fallback in-memory cache when Redis is unavailable."""

    def __init__(self):
        self._store: dict[str, str] = {}

    async def setex(self, key: str, seconds: int, value: str):
        self._store[key] = value

    async def get(self, key: str) -> Optional[str]:
        return self._store.get(key)

    async def delete(self, key: str):
        self._store.pop(key, None)

    async def ping(self) -> bool:
        return True

    async def aclose(self):
        self._store.clear()


_memory_redis: Optional[InMemoryRedis] = None


async def init_redis():
    global _redis_client
    try:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        await _redis_client.ping()
        print("Redis connected")
    except Exception as e:
        logger.warning(f"Redis unavailable ({e}), using in-memory fallback")
        _redis_client = None
        global _memory_redis
        _memory_redis = InMemoryRedis()


async def close_redis():
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None


def get_redis() -> aioredis.Redis | InMemoryRedis:
    if _redis_client is not None:
        return _redis_client
    if _memory_redis is not None:
        return _memory_redis
    raise RuntimeError("Redis not initialised. Call init_redis() first.")
