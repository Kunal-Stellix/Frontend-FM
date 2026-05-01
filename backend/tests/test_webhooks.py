import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_webhook(async_client: AsyncClient, test_admin):
    response = await async_client.post(
        "/api/v1/admin/webhooks",
        json={
            "url": "https://example.com/webhook",
            "events": ["idea.created", "changelog.published"],
        },
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["secret"] is not None
    assert data["url"] == "https://example.com/webhook"


@pytest.mark.asyncio
async def test_list_webhooks(async_client: AsyncClient, test_admin):
    response = await async_client.get(
        "/api/v1/admin/webhooks",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_delete_webhook(async_client: AsyncClient, test_admin):
    # Create webhook first
    create_response = await async_client.post(
        "/api/v1/admin/webhooks",
        json={
            "url": "https://example.com/delete-me",
            "events": ["idea.created"],
        },
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    webhook_id = create_response.json()["id"]

    response = await async_client.delete(
        f"/api/v1/admin/webhooks/{webhook_id}",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["deleted"] == True


@pytest.mark.asyncio
async def test_webhook_http_url_rejected(async_client: AsyncClient, test_admin):
    response = await async_client.post(
        "/api/v1/admin/webhooks",
        json={
            "url": "http://example.com/webhook",  # http not https
            "events": ["idea.created"],
        },
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_webhook_member_forbidden(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/admin/webhooks",
        json={
            "url": "https://example.com/webhook",
            "events": ["idea.created"],
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 403