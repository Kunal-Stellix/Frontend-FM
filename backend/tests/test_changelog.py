import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_changelog(async_client: AsyncClient):
    response = await async_client.get("/api/v1/changelog")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_changelog_entry_not_found(async_client: AsyncClient):
    import uuid
    fake_uuid = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/changelog/{fake_uuid}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_changelog_admin(async_client: AsyncClient, test_admin):
    response = await async_client.post(
        "/api/v1/admin/changelog",
        json={
            "title": "New Feature Released",
            "body": "We have released a new feature",
            "type": "new_feature",
        },
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Feature Released"


@pytest.mark.asyncio
async def test_create_changelog_member_forbidden(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/admin/changelog",
        json={
            "title": "Unauthorized Changelog",
            "type": "new_feature",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_subscribe_changelog(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/changelog/subscribe",
        json={"email": "subscriber@example.com"},
    )
    assert response.status_code == 200
    assert response.json()["subscribed"] == True


@pytest.mark.asyncio
async def test_subscribe_changelog_duplicate_email(async_client: AsyncClient):
    email = f"dup_{id(async_client)}@example.com"
    await async_client.post(
        "/api/v1/changelog/subscribe",
        json={"email": email},
    )
    # Second subscription should be idempotent
    response = await async_client.post(
        "/api/v1/changelog/subscribe",
        json={"email": email},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_subscribe_changelog_invalid_email(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/changelog/subscribe",
        json={"email": "notanemail"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_unsubscribe_changelog(async_client: AsyncClient):
    # First subscribe
    subscribe_response = await async_client.post(
        "/api/v1/changelog/subscribe",
        json={"email": "unsub@example.com"},
    )
    # Note: unsubscribe token would come from email in real app
    # For test, use a fake token
    response = await async_client.delete(
        "/api/v1/changelog/unsubscribe?token=fake_token_12345",
    )
    # 404 because token is fake
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_changelog_filter_by_type(async_client: AsyncClient):
    response = await async_client.get("/api/v1/changelog?type=new_feature")
    assert response.status_code == 200