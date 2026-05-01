import asyncio
import uuid
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.main import app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.category import Category
from app.utils.password import hash_password


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


test_engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=NullPool,
)

TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def async_session() -> AsyncGenerator[AsyncSession, None]:
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def async_client(async_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield async_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(async_session: AsyncSession) -> tuple[dict, str]:
    user_dict = {
        "email": f"testuser_{uuid.uuid4().hex[:8]}@example.com",
        "name": "Test User",
        "password": "password123",
    }
    user = User(
        email=user_dict["email"],
        name=user_dict["name"],
        hashed_password=hash_password(user_dict["password"]),
    )
    async_session.add(user)
    await async_session.commit()
    await async_session.refresh(user)

    from app.core.security import create_access_token
    token = create_access_token({"sub": str(user.id), "email": user.email})

    return user_dict, token


@pytest_asyncio.fixture
async def test_admin(async_session: AsyncSession) -> tuple[dict, str]:
    admin_dict = {
        "email": f"admin_{uuid.uuid4().hex[:8]}@example.com",
        "name": "Admin User",
        "password": "adminpass123",
        "role": "admin",
    }
    admin = User(
        email=admin_dict["email"],
        name=admin_dict["name"],
        hashed_password=hash_password(admin_dict["password"]),
    )
    async_session.add(admin)
    await async_session.commit()
    await async_session.refresh(admin)

    from app.core.security import create_access_token
    token = create_access_token({"sub": str(admin.id), "email": admin.email})

    return admin_dict, token


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}