"""pull/push de sync con la tabla supplier_profile (HU-SYN-02, S-22)."""

import gzip
import json
import uuid

import httpx
import pytest
from sqlalchemy import text

from smile.main import create_app
from smile.seed.__main__ import run as seed
from smile.shared.infrastructure.db import get_engine
from smile.shared.infrastructure.seed import demo_id

PROFILE = {
    "id": "local-row-1",
    "person_type": "juridica",
    "tax_id": "900123456",
    "tax_dv": "8",
    "legal_name": "Agro Nuevo S.A.S.",
    "legal_rep": "Ana Rojas",
    "department_code": "25",
    "municipality_code": "25290",
    "contact_channel": "whatsapp",
    "main_category": "fruver",
    "completed_at": 1_760_600_000_000,
    "created_at": 1_760_600_000_000,
    "updated_at": 1_760_600_000_000,
    "_status": "created",
    "_changed": "",
}


@pytest.fixture
async def client() -> httpx.AsyncClient:
    await seed()
    yield httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app()), base_url="http://test")
    await get_engine().dispose()


async def _auth(client: httpx.AsyncClient, identifier: str) -> dict[str, str]:
    r = await client.post(
        "/api/v1/auth/login", json={"identifier": identifier, "password": "Smile2026!"}
    )
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def _push_body(records: list[dict], mutation_id: uuid.UUID | None = None) -> dict:
    return {
        "mutation_id": str(mutation_id or uuid.uuid4()),
        "priority": "P2",
        "last_pulled_at": 0,
        "changes": {"supplier_profile": {"created": records, "updated": [], "deleted": []}},
    }


async def _completed_events(supplier_id: uuid.UUID) -> int:
    async with get_engine().connect() as conn:
        return int(
            await conn.scalar(
                text(
                    "SELECT count(*) FROM shared.outbox WHERE event_name = "
                    "'suppliers.SupplierProfileCompleted' AND payload->>'supplier_id' = :s"
                ),
                {"s": str(supplier_id)},
            )
        )


async def test_profile_push_is_idempotent_and_emits_event_once(
    client: httpx.AsyncClient,
) -> None:
    auth = await _auth(client, "nuevo@smile.test")
    supplier_id = demo_id("suppliers.supplier:nuevo")
    before = await _completed_events(supplier_id)
    body = _push_body([PROFILE])
    first = await client.post("/api/v1/sync/push", json=body, headers=auth)
    again = await client.post("/api/v1/sync/push", json=body, headers=auth)
    assert first.status_code == again.status_code == 200
    assert first.json() == again.json() == {"accepted": ["local-row-1"], "rejected": []}
    me = (await client.get("/api/v1/me/supplier", headers=auth)).json()
    assert me["profile"]["legal_name"] == "Agro Nuevo S.A.S."
    assert await _completed_events(supplier_id) == before + 1


async def test_bad_record_rejected_individually(client: httpx.AsyncClient) -> None:
    auth = await _auth(client, "nuevo@smile.test")
    bad_dv = {**PROFILE, "id": "bad", "tax_dv": "3"}
    missing = {**PROFILE, "id": "missing", "legal_name": ""}
    r = await client.post("/api/v1/sync/push", json=_push_body([bad_dv, missing]), headers=auth)
    assert r.status_code == 200
    codes = {x["id"]: x["code"] for x in r.json()["rejected"]}
    assert codes == {"bad": "NIT_CHECK_DIGIT_MISMATCH", "missing": "VALIDATION_ERROR"}


async def test_draft_is_accepted_but_not_stored(client: httpx.AsyncClient) -> None:
    auth = await _auth(client, "nuevo@smile.test")
    draft = {**PROFILE, "completed_at": None, "tax_dv": "3"}
    r = await client.post("/api/v1/sync/push", json=_push_body([draft]), headers=auth)
    assert r.json()["accepted"] == ["local-row-1"]
    assert (await client.get("/api/v1/me/supplier", headers=auth)).json()["profile"] is None


async def test_gzip_push_like_the_pwa(client: httpx.AsyncClient) -> None:
    auth = await _auth(client, "nuevo@smile.test")
    body = gzip.compress(json.dumps(_push_body([PROFILE])).encode())
    r = await client.post(
        "/api/v1/sync/push",
        content=body,
        headers={**auth, "Content-Type": "application/json", "Content-Encoding": "gzip"},
    )
    assert r.status_code == 200
    assert r.json()["accepted"] == ["local-row-1"]


async def test_pull_is_incremental_and_isolated(client: httpx.AsyncClient) -> None:
    auth = await _auth(client, "proveedor@smile.test")
    first = (await client.get("/api/v1/sync/pull?last_pulled_at=0", headers=auth)).json()
    rows = first["changes"]["supplier_profile"]["created"]
    assert [r["id"] for r in rows] == [str(demo_id("suppliers.supplier:proveedor"))]
    assert rows[0]["legal_name"] == "Finca La Esperanza"
    nxt = await client.get(f"/api/v1/sync/pull?last_pulled_at={first['timestamp']}", headers=auth)
    assert nxt.json()["changes"] == {}
    other = await _auth(client, "proveedor01@smile.test")
    theirs = (await client.get("/api/v1/sync/pull", headers=other)).json()
    ids = [r["id"] for r in theirs["changes"]["supplier_profile"]["created"]]
    assert ids == [str(demo_id("suppliers.supplier:proveedor01"))]


async def test_internal_roles_cannot_sync(client: httpx.AsyncClient) -> None:
    auth = await _auth(client, "reviewer@smile.test")
    assert (await client.get("/api/v1/sync/pull", headers=auth)).status_code == 403
