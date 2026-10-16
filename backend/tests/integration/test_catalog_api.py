"""GET /api/v1/catalog/bundle (HU-CAT-01)."""

import httpx
import pytest

from smile.main import create_app
from smile.shared.infrastructure.db import get_engine
from tests.auth import token_for


@pytest.fixture
async def client() -> httpx.AsyncClient:
    yield httpx.AsyncClient(transport=httpx.ASGITransport(app=create_app()), base_url="http://test")
    await get_engine().dispose()


async def test_requires_session(client: httpx.AsyncClient) -> None:
    r = await client.get("/api/v1/catalog/bundle")
    assert r.status_code == 401


async def test_bundle_has_categories_axes_and_parameters(client: httpx.AsyncClient) -> None:
    r = await client.get(
        "/api/v1/catalog/bundle", headers={"Authorization": f"Bearer {token_for('PROVEEDOR')}"}
    )
    assert r.status_code == 200
    body = r.json()
    status = {c["code"]: c["status"] for c in body["categories"]}
    assert status == {
        "fruver": "ACTIVA",
        "lacteos": "PROXIMAMENTE",
        "carnes": "PROXIMAMENTE",
        "pescados_mariscos": "PROXIMAMENTE",
        "insumos_servicios": "PROXIMAMENTE",
    }
    fruver = next(c for c in body["categories"] if c["code"] == "fruver")
    assert [a["code"] for a in fruver["axes"]] == ["bpa", "residuos", "carbono", "infantil", "ddhh"]
    assert body["parameters"]["assessment.levels"]["value"] == {
        "desarrollo_from": "40",
        "avanzado_from": "75",
    }
    assert body["parameters"]["scoring.weights"]["version"] == 1
