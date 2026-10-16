"""Cuerpo uniforme de errores (HU-PLAT-02, PLAN_BACKEND §6.3)."""

import httpx
import pytest

from smile.main import create_app
from tests.auth import bearer


@pytest.fixture
def client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app()), base_url="http://test"
    )


async def test_unknown_route_uses_uniform_body(client: httpx.AsyncClient) -> None:
    r = await client.get("/api/v1/no-existe", headers={"x-request-id": "abc-123"})
    assert r.status_code == 404
    assert r.json() == {
        "error": {
            "code": "not_found",
            "message": "Not Found",
            "details": None,
            "request_id": "abc-123",
        }
    }


async def test_validation_error_hides_input(client: httpx.AsyncClient) -> None:
    r = await client.post(
        "/api/v1/assessment/score-preview",
        json={"answers": [{"id": "3001234567", "axis": "bpa", "weight": 9, "answer": "si"}]},
        headers=bearer("PROVEEDOR"),
    )
    assert r.status_code == 400
    assert "3001234567" not in r.text
    assert r.json()["error"]["details"][0]["loc"][-1] == "weight"
