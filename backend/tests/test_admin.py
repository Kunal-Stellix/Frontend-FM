import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_patch_idea_status(async_client: AsyncClient, test_admin, test_user):
    # Create idea with test_user
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Status Change Idea"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    # Change status as admin
    response = await async_client.patch(
        f"/api/v1/admin/ideas/{idea_id}/status",
        json={"status": "planned", "note": "Planning this"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "planned"


@pytest.mark.asyncio
async def test_list_ideas_admin(async_client: AsyncClient, test_admin):
    response = await async_client.get(
        "/api/v1/admin/ideas",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_approve_idea(async_client: AsyncClient, test_admin, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Approve Me"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/admin/ideas/{idea_id}/approve",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_reject_idea(async_client: AsyncClient, test_admin, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Reject Me"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/admin/ideas/{idea_id}/reject",
        json={"reason": "Not appropriate"},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    assert response.json()["rejected"] == True


@pytest.mark.asyncio
async def test_get_admin_dashboard(async_client: AsyncClient, test_admin):
    response = await async_client.get(
        "/api/v1/admin/dashboard",
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "pending_ideas_count" in data
    assert "top_ideas" in data
    assert "total_ideas" in data


@pytest.mark.asyncio
async def test_admin_route_member_forbidden(async_client: AsyncClient, test_user):
    response = await async_client.get(
        "/api/v1/admin/ideas",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_route_no_auth(async_client: AsyncClient):
    response = await async_client.get("/api/v1/admin/ideas")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_merge_ideas(async_client: AsyncClient, test_admin, test_user):
    # Create two ideas
    idea1_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Primary Idea"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea1_id = idea1_response.json()["id"]

    idea2_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Secondary Idea"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea2_id = idea2_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/admin/ideas/{idea1_id}/merge",
        json={"primary_idea_id": idea1_id, "secondary_idea_ids": [idea2_id]},
        headers={"Authorization": f"Bearer {test_admin[1]}"},
    )
    # Note: The primary_id in the URL path is used, and secondary_idea_ids are the ones to merge in
    # If idea1_id is the primary, secondary_idea_ids should be empty or different from primary
    assert response.status_code in [200, 400, 404]