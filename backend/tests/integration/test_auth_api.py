"""Login, refresh, logout y /me contra los usuarios del seed (HU-IAM-02)."""

import httpx
import pytest

from smile.main import create_app
from smile.seed.__main__ import run as seed
from smile.shared.infrastructure.db import get_engine

PASSWORD = "Smile2026!"


@pytest.fixture
async def client() -> httpx.AsyncClient:
    await seed()  # restaura contraseñas y desbloquea
    yield httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app()), base_url="http://test")
    await get_engine().dispose()


async def _login(client: httpx.AsyncClient, identifier: str, password: str = PASSWORD):
    return await client.post(
        "/api/v1/auth/login", json={"identifier": identifier, "password": password}
    )


async def test_supplier_logs_in_with_phone_and_reads_me(client: httpx.AsyncClient) -> None:
    r = await _login(client, "3001234567")
    assert r.status_code == 200
    body = r.json()
    assert body["expires_in"] == 900
    assert body["user"]["role"] == "PROVEEDOR"
    me = await client.get("/api/v1/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.json()["email"] == "proveedor@smile.test"
    bundle = await client.get(
        "/api/v1/catalog/bundle", headers={"Authorization": f"Bearer {body['access_token']}"}
    )
    assert bundle.status_code == 200


async def test_reviewer_logs_in_with_email(client: httpx.AsyncClient) -> None:
    r = await _login(client, "Reviewer@Smile.test")
    assert r.json()["user"]["role"] == "REVIEWER"


async def test_wrong_password_is_401_without_detail(client: httpx.AsyncClient) -> None:
    r = await _login(client, "admin@smile.test", "otra")
    assert r.status_code == 401
    assert r.json()["error"]["code"] == "invalid_credentials"


async def test_lock_after_five_failures_is_423(client: httpx.AsyncClient) -> None:
    for _ in range(5):
        await _login(client, "proveedor05@smile.test", "mal")
    r = await _login(client, "proveedor05@smile.test")
    assert r.status_code == 423
    assert r.json()["error"]["message"] == "Por seguridad, su cuenta está en pausa 15 minutos"


async def test_refresh_reuse_is_401_and_revokes_family(client: httpx.AsyncClient) -> None:
    first = (await _login(client, "nuevo@smile.test")).json()
    second = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": first["refresh_token"]}
    )
    assert second.status_code == 200
    reused = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": first["refresh_token"]}
    )
    assert reused.status_code == 401
    after = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": second.json()["refresh_token"]}
    )
    assert after.status_code == 401


async def test_logout_then_refresh_fails(client: httpx.AsyncClient) -> None:
    s = (await _login(client, "proveedor01@smile.test")).json()
    out = await client.post("/api/v1/auth/logout", json={"refresh_token": s["refresh_token"]})
    assert out.status_code == 204
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": s["refresh_token"]})
    assert r.status_code == 401


async def test_eleventh_login_in_a_minute_is_429(client: httpx.AsyncClient) -> None:
    codes = [(await _login(client, "x@smile.test", "x")).status_code for _ in range(11)]
    assert codes[:10] == [401] * 10
    assert codes[10] == 429
