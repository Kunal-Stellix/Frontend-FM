import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_api_key(async_client: AsyncClient, test_admin):
    response = await async_client.post(
        "/api/v1/admin/apikeys",
        json={"name": "My API Key"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["plaintext_key"] is not None
    assert data["plaintext_key"].startswith("sk_")
    assert data["key_prefix"] == data["plaintext_key"][:8]


@pytest.mark.asyncio
async def test_list_api_keys(async_client: AsyncClient, test_admin):
    # Create a key first
    await async_client.post(
        "/api/v1/admin/apikeys",
        json={"name": "List Test Key"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )

    response = await async_client.get(
        "/api/v1/admin/apikeys",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    # plaintext_key should be null on list
    for key in data:
        assert key["plaintext_key"] is None


@pytest.mark.asyncio
async def test_delete_api_key(async_client: AsyncClient, test_admin):
    # Create key
    create_response = await async_client.post(
        "/api/v1/admin/apikeys",
        json={"name": "Delete Me"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    key_id = create_response.json()["id"]

    # Delete it
    response = await async_client.delete(
        f"/api/v1/admin/apikeys/{key_id}",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["deleted"] == True


@pytest.mark.asyncio
async def test_api_key_member_forbidden(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/admin/apikeys",
        json={"name": "Unauthorized Key"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_api_key_with_header(async_client: AsyncClient, test_admin):
    # Create an API key
    create_response = await async_client.post(
        "/api/v1/admin/apikeys",
        json={"name": "Header Test Key"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    plain_key = create_response.json()["plaintext_key"]

    # Try to use it (e.g., access admin dashboard with X-API-Key)
    response = await async_client.get(
        "/api/v1/admin/dashboard",
        headers={"X-API-Key": plain_key},
    )
    # This should work - the key was just created and is active
    assert response.status_code == 200