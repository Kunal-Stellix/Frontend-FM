import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_member_cannot_access_admin_routes(async_client: AsyncClient, test_user):
    routes = [
        ("/api/v1/admin/ideas", "get", None),
        ("/api/v1/admin/roadmap", "get", None),
        ("/api/v1/admin/settings", "get", None),
        ("/api/v1/admin/webhooks", "get", None),
        ("/api/v1/admin/apikeys", "get", None),
    ]

    for path, method, _ in routes:
        if method == "get":
            response = await async_client.get(
                path,
                headers={"Authorization": f"Bearer {test_user[1]}"},
            )
            assert response.status_code == 403, f"{path} returned {response.status_code}"


@pytest.mark.asyncio
async def test_admin_can_access_admin_routes(async_client: AsyncClient, test_admin):
    routes = [
        "/api/v1/admin/ideas",
        "/api/v1/admin/dashboard",
    ]

    for path in routes:
        response = await async_client.get(
            path,
            headers={"Authorization": f"Bearer {test_admin[1]}"},
        )
        assert response.status_code == 200, f"{path} returned {response.status_code}"


@pytest.mark.asyncio
async def test_no_auth_returns_403(async_client: AsyncClient):
    response = await async_client.get("/api/v1/admin/ideas")
    assert response.status_code == 403