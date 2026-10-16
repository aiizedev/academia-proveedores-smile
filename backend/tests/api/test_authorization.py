"""Autorización por endpoint (HU-IAM-03, RNF-SEC-004).

Toda ruta de /api/v1 exige sesión salvo la lista PUBLIC. Un endpoint nuevo sin
`require(...)` o `get_current_user` hace fallar esta prueba.
"""

import httpx
import pytest

from smile.main import create_app
from tests.auth import bearer

PUBLIC = {
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/refresh"),
    ("POST", "/api/v1/auth/logout"),
}


def test_every_api_route_requires_session_unless_public() -> None:
    # `get_current_user` usa HTTPBearer, que FastAPI declara como `security` en OpenAPI.
    paths = create_app().openapi()["paths"]
    operations = {
        (method.upper(), path): op
        for path, ops in paths.items()
        if path.startswith("/api/v1")
        for method, op in ops.items()
    }
    assert len(operations) >= 6  # la prueba no puede pasar recorriendo cero rutas
    missing = [
        key for key, op in operations.items() if key not in PUBLIC and not op.get("security")
    ]
    assert missing == []
    assert operations.keys() >= PUBLIC


@pytest.fixture
def client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app()), base_url="http://test"
    )


async def test_no_session_is_401(client: httpx.AsyncClient) -> None:
    r = await client.post("/api/v1/assessment/score-preview", json={})
    assert r.status_code == 401


async def test_wrong_role_is_403(client: httpx.AsyncClient) -> None:
    body = {"answers": [{"id": "q", "axis": "bpa", "weight": 1, "answer": "si"}]}
    r = await client.post("/api/v1/assessment/score-preview", json=body, headers=bearer("REVIEWER"))
    assert r.status_code == 403
    assert r.json()["error"]["code"] == "permission_denied"


async def test_refresh_token_cannot_be_used_as_access(client: httpx.AsyncClient) -> None:
    r = await client.get("/api/v1/me", headers={"Authorization": "Bearer no-es-un-jwt"})
    assert r.status_code == 401
