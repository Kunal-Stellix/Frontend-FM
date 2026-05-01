import pytest
from httpx import AsyncClient
from app.models.user import User
from app.utils.password import hash_password


@pytest.mark.asyncio
async def test_register_success(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]
    assert data["user"]["email"] == "newuser@example.com"


@pytest.mark.asyncio
async def test_register_duplicate_email(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user[0]["email"],
            "name": "Duplicate",
            "password": "password123",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_short_password(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "shortpw@example.com",
            "name": "Short PW",
            "password": "1234567",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_invalid_email(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "notanemail",
            "name": "Bad Email",
            "password": "password123",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_empty_name(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": "emptyname@example.com",
            "name": "",
            "password": "password123",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user[0]["email"],
            "password": test_user[0]["password"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["tokens"]
    assert "refresh_token" in data["tokens"]


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user[0]["email"],
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_email(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_success(async_client: AsyncClient, test_user):
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["email"] == test_user[0]["email"]


@pytest.mark.asyncio
async def test_get_me_no_token(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_me_malformed_token(async_client: AsyncClient):
    response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer notavalidtoken"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient, test_user):
    # First login to get tokens
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user[0]["email"],
            "password": test_user[0]["password"],
        },
    )
    refresh_token = login_response.json()["tokens"]["refresh_token"]

    # Refresh
    response = await async_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_logout(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_double_logout(async_client: AsyncClient, test_user):
    # First logout
    await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    # Second logout should be idempotent
    response = await async_client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code in [200, 401]