import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_post_vote_success(async_client: AsyncClient, test_user):
    # Create an idea first
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Idea to Vote On", "description": "Vote for this"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["voted"] == True
    assert data["vote_count"] >= 1


@pytest.mark.asyncio
async def test_post_vote_toggle(async_client: AsyncClient, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Toggle Vote Idea", "description": "Toggle me"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    # First vote
    await async_client.post(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )

    # Second vote (toggle off)
    response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.json()["voted"] == False


@pytest.mark.asyncio
async def test_delete_vote(async_client: AsyncClient, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Delete Vote Idea", "description": "Delete my vote"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    # Vote first
    await async_client.post(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )

    # Delete vote
    response = await async_client.delete(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code in [200, 204]


@pytest.mark.asyncio
async def test_vote_on_nonexistent_idea(async_client: AsyncClient, test_user):
    fake_uuid = str(uuid.uuid4())
    response = await async_client.post(
        f"/api/v1/ideas/{fake_uuid}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_vote_status(async_client: AsyncClient, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Get Vote Status Idea", "description": "Check status"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.get(
        f"/api/v1/ideas/{idea_id}/vote",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "voted" in data


@pytest.mark.asyncio
async def test_vote_no_auth(async_client: AsyncClient):
    fake_uuid = str(uuid.uuid4())
    response = await async_client.post(f"/api/v1/ideas/{fake_uuid}/vote")
    assert response.status_code == 403