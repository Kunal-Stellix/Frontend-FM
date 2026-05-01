import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_roadmap(async_client: AsyncClient):
    response = await async_client.get("/api/v1/roadmap")
    assert response.status_code == 200
    data = response.json()
    assert "planned" in data
    assert "in_progress" in data
    assert "shipped" in data


@pytest.mark.asyncio
async def test_create_roadmap_item_admin(async_client: AsyncClient, test_admin):
    response = await async_client.post(
        "/api/v1/admin/roadmap",
        json={
            "title": "New Roadmap Item",
            "description": "Test description",
            "status": "planned",
            "idea_ids": [],
        },
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "New Roadmap Item"


@pytest.mark.asyncio
async def test_create_roadmap_item_member_forbidden(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/admin/roadmap",
        json={
            "title": "Member Roadmap Item",
            "status": "planned",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_roadmap_item_admin(async_client: AsyncClient, test_admin):
    # Create item
    create_response = await async_client.post(
        "/api/v1/admin/roadmap",
        json={"title": "Admin Get Item", "status": "planned"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    item_id = create_response.json()["id"]

    response = await async_client.get(
        f"/api/v1/admin/roadmap/{item_id}",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_patch_roadmap_item(async_client: AsyncClient, test_admin):
    # Create item
    create_response = await async_client.post(
        "/api/v1/admin/roadmap",
        json={"title": "Patch Me", "status": "planned"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    item_id = create_response.json()["id"]

    response = await async_client.patch(
        f"/api/v1/admin/roadmap/{item_id}",
        json={"title": "Patched Title"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Patched Title"


@pytest.mark.asyncio
async def test_delete_roadmap_item(async_client: AsyncClient, test_admin):
    # Create item
    create_response = await async_client.post(
        "/api/v1/admin/roadmap",
        json={"title": "Delete Me", "status": "planned"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    item_id = create_response.json()["id"]

    response = await async_client.delete(
        f"/api/v1/admin/roadmap/{item_id}",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_roadmap_nonexistent_item(async_client: AsyncClient, test_admin):
    fake_uuid = str(uuid.uuid4())
    response = await async_client.get(
        f"/api/v1/admin/roadmap/{fake_uuid}",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 404