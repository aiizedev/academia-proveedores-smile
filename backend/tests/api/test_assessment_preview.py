import httpx
import pytest

from smile.main import create_app


@pytest.fixture
def client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=create_app()), base_url="http://test"
    )


async def test_score_preview(client: httpx.AsyncClient) -> None:
    body = {
        "category": "fruver",
        "answers": [
            {"id": "q1", "axis": "bpa", "weight": 3, "answer": "si"},
            {"id": "q2", "axis": "residuos", "weight": 2, "answer": "no"},
            {
                "id": "q3",
                "axis": "infantil",
                "weight": 5,
                "answer": "aveces",
                "critical_when": ["no", "aveces"],
            },
        ],
    }
    r = await client.post("/api/v1/assessment/score-preview", json=body)
    assert r.status_code == 200
    data = r.json()
    assert data["axes"]["infantil"]["urgent"] is True
    assert data["axes"]["carbono"]["score"] is None
    assert data["axes"]["bpa"]["score"] == 100.0
    assert [p["axis"] for p in data["plan"]] == ["infantil", "residuos", "bpa"]


async def test_inactive_category_is_404(client: httpx.AsyncClient) -> None:
    body = {
        "category": "lacteos",
        "answers": [{"id": "q", "axis": "bpa", "weight": 1, "answer": "si"}],
    }
    r = await client.post("/api/v1/assessment/score-preview", json=body)
    assert r.status_code == 404
    assert r.json()["code"] == "not_found"


async def test_invalid_payload_is_422(client: httpx.AsyncClient) -> None:
    r = await client.post("/api/v1/assessment/score-preview", json={"answers": []})
    assert r.status_code == 422
