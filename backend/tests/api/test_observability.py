"""request_id, log de acceso y readiness (HU-PLAT-06)."""

import httpx
import pytest
from structlog.testing import capture_logs

from smile.main import create_app
from smile.shared.api import health


@pytest.fixture
def client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app()), base_url="http://test"
    )


async def test_access_log_has_route_template_status_and_duration(
    client: httpx.AsyncClient,
) -> None:
    with capture_logs() as logs:
        r = await client.get("/health/live", headers={"x-request-id": "req-1"})
    assert r.headers["x-request-id"] == "req-1"
    entry = next(e for e in logs if e["event"] == "request")
    assert entry["route"] == "/health/live"
    assert entry["status"] == 200
    assert entry["duration_ms"] >= 0


async def test_malformed_request_id_is_replaced(client: httpx.AsyncClient) -> None:
    r = await client.get("/health/live", headers={"x-request-id": "x" * 200})
    assert r.headers["x-request-id"] != "x" * 200


async def test_ready_is_503_when_db_down(
    client: httpx.AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def down() -> bool:
        return False

    monkeypatch.setattr(health, "ping_database", down)
    r = await client.get("/health/ready")
    assert r.status_code == 503
    assert r.json()["db"] == "down"
    assert (await client.get("/health/live")).status_code == 200
