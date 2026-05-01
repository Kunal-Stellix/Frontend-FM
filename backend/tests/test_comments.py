import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_comments_no_auth(async_client: AsyncClient):
    response = await async_client.get("/api/v1/ideas")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_post_comment_success(async_client: AsyncClient, test_user):
    # Create an idea first
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Idea for Comment", "description": "Comment here"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/comments",
        json={"body": "This is a test comment"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["body"] == "This is a test comment"


@pytest.mark.asyncio
async def test_post_comment_reply(async_client: AsyncClient, test_user):
    # Create idea and first comment
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Idea for Reply", "description": "Reply here"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    parent_response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/comments",
        json={"body": "Parent comment"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    parent_id = parent_response.json()["id"]

    # Reply to parent
    response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/comments",
        json={"body": "Reply comment", "parent_id": parent_id},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 201
    assert response.json()["parent_id"] == parent_id


@pytest.mark.asyncio
async def test_delete_comment_by_author(async_client: AsyncClient, test_user):
    # Create idea and comment
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Delete Comment Idea", "description": "Delete me"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    comment_response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/comments",
        json={"body": "Comment to delete"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    comment_id = comment_response.json()["id"]

    response = await async_client.delete(
        f"/api/v1/ideas/{idea_id}/comments/{comment_id}",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_post_comment_no_auth(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/ideas/some-id/comments",
        json={"body": "Unauthorized comment"},
    )
    assert response.status_code in [401, 403, 404]


@pytest.mark.asyncio
async def test_post_comment_empty_body(async_client: AsyncClient, test_user):
    # Create idea
    idea_response = await async_client.post(
        "/api/v1/ideas",
        json={"title": "Empty Body Idea", "description": "Test"},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    idea_id = idea_response.json()["id"]

    response = await async_client.post(
        f"/api/v1/ideas/{idea_id}/comments",
        json={"body": ""},
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_delete_non_existent_comment(async_client: AsyncClient, test_user):
    fake_uuid = str(uuid.uuid4())
    response = await async_client.delete(
        f"/api/v1/ideas/{fake_uuid}/comments/{fake_uuid}",
        headers={"Authorization": f"Bearer {test_user[1]}"},
    )
    assert response.status_code == 404