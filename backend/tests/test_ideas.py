import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_ideas_no_auth(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_create_idea_success(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/ideas",
        json={
            "title": "My Great Idea",
            "description": "This is a great idea description",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Great Idea"
    assert data["voted_by_me"] == True


@pytest.mark.asyncio
async def test_create_idea_no_auth(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/ideas",
        json={
            "title": "Unauthorized Idea",
            "description": "This should fail",
        },
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_idea_title_too_short(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/ideas",
        json={
            "title": "AB",
            "description": "Too short",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_idea_title_too_long(async_client: AsyncClient, test_user):
    response = await async_client.post(
        "/api/v1/ideas",
        json={
            "title": "A" * 256,
            "description": "Too long title",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_idea_by_id(async_client: AsyncClient, test_user):
    # Create an idea first
    create_response = await async_client.post(
        "/api/v1/ideas",
        json={
            "title": "Idea to Fetch",
            "description": "Fetching this idea",
        },
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = create_response.json()["id"]

    response = await async_client.get(f"/api/v1/ideas/{idea_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Idea to Fetch"


@pytest.mark.asyncio
async def test_get_idea_invalid_uuid(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas/not-a-uuid")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_idea_not_found(async_client: AsyncClient):
    fake_uuid = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/ideas/{fake_uuid}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_ideas(async_client: AsyncClient, test_user):
    # Create some ideas
    for title in ["Apple Idea", "Banana Idea", "Apple Pie"]:
        await async_client.post(
            "/api/v1/ideas",
            json={"title": title, "description": "Test"},
            headers={"Authorization": f"Bearer {test_user[1]}"},
        )

    response = await async_client.get("/api/v1/ideas/search?q=apple")
    assert response.status_code == 200
    results = response.json()
    assert len(results) <= 5


@pytest.mark.asyncio
async def test_search_ideas_too_short(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas/search?q=a")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_ideas_pagination(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas?page=1&page_size=5")
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["page_size"] == 5


@pytest.mark.asyncio
async def test_list_ideas_page_zero(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas?page=0")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_ideas_sort_votes(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas?sort=votes")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_list_ideas_filter_status(async_client: AsyncClient, test_user):
    # Create idea with under_review status
    await async_client.post(
        "/api/v1/ideas",
        json={"title": "Status Test Idea"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )

    response = await async_client.get("/api/v1/ideas?status=under_review")
    assert response.status_code == 200