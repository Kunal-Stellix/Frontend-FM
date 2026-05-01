import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_notifications(async_client: AsyncClient, test_user):
    response = await async_client.get(
        "/api/v1/notifications",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "unread_count" in data


@pytest.mark.asyncio
async def test_get_notifications_no_auth(async_client: AsyncClient):
    response = await async_client.get("/api/v1/notifications")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_mark_all_read(async_client: AsyncClient, test_user):
    response = await async_client.patch(
        "/api/v1/notifications/read-all",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200
    assert "updated" in response.json()


@pytest.mark.asyncio
async def test_mark_single_read_not_found(async_client: AsyncClient, test_user):
    import uuid
    fake_uuid = str(uuid.uuid4())
    response = await async_client.patch(
        f"/api/v1/notifications/{fake_uuid}/read",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 404