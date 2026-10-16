"""supplier_id en el JWT y GET /me/supplier (HU-SUP-01)."""

import httpx
import jwt
import pytest

from smile.main import create_app
from smile.seed.__main__ import run as seed
from smile.shared.infrastructure.db import get_engine
from smile.shared.infrastructure.seed import demo_id


@pytest.fixture
async def client() -> httpx.AsyncClient:
    await seed()
    yield httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app()), base_url="http://test")
    await get_engine().dispose()


async def _token(client: httpx.AsyncClient, identifier: str) -> str:
    r = await client.post(
        "/api/v1/auth/login", json={"identifier": identifier, "password": "Smile2026!"}
    )
    return str(r.json()["access_token"])


async def test_supplier_token_carries_supplier_id_and_reads_profile(
    client: httpx.AsyncClient,
) -> None:
    token = await _token(client, "proveedor@smile.test")
    claims = jwt.decode(token, options={"verify_signature": False})
    assert claims["supplier_id"] == str(demo_id("suppliers.supplier:proveedor"))
    r = await client.get("/api/v1/me/supplier", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    body = r.json()
    assert body["profile"]["legal_name"] == "Finca La Esperanza"
    assert body["profile"]["municipality_code"] == "25290"


async def test_new_supplier_has_no_profile_yet(client: httpx.AsyncClient) -> None:
    token = await _token(client, "nuevo@smile.test")
    r = await client.get("/api/v1/me/supplier", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["profile"] is None
    assert r.json()["profile_completed_at"] is None


async def test_reviewer_has_no_supplier_endpoint(client: httpx.AsyncClient) -> None:
    token = await _token(client, "reviewer@smile.test")
    assert "supplier_id" not in jwt.decode(token, options={"verify_signature": False})
    r = await client.get("/api/v1/me/supplier", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
