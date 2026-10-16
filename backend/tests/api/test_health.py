import httpx
import pytest

from smile.main import create_app


@pytest.fixture
def client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app()), base_url="http://test"
    )


async def test_live(client: httpx.AsyncClient) -> None:
    r = await client.get("/health/live")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
    assert "x-request-id" in r.headers


async def test_openapi_lists_all_modules(client: httpx.AsyncClient) -> None:
    r = await client.get("/api/v1/openapi.json")
    assert r.status_code == 200
    assert "/api/v1/assessment/score-preview" in r.json()["paths"]


async def test_metrics(client: httpx.AsyncClient) -> None:
    r = await client.get("/metrics")
    assert "smile_uptime_seconds" in r.text
