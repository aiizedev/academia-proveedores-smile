"""Endpoints transversales (arquitectura.md §7.3, RNF-OBS-002)."""

import time

from fastapi import APIRouter, Response, status
from fastapi.responses import PlainTextResponse

from smile.config import get_settings
from smile.shared.infrastructure.db import ping_database
from smile.shared.infrastructure.storage import build_file_storage

router = APIRouter(tags=["health"])
_STARTED = time.time()
_requests_total = 0


def count_request() -> None:
    global _requests_total
    _requests_total += 1


@router.get("/health/live")
async def live() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/ready")
async def ready(response: Response) -> dict[str, object]:
    db_ok = await ping_database()
    try:
        storage_ok = build_file_storage(get_settings()).ping()
    except Exception:
        storage_ok = False
    ok = db_ok and storage_ok
    if not ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return {
        "status": "ok" if ok else "degraded",
        "db": "up" if db_ok else "down",
        "storage": "up" if storage_ok else "down",
    }


@router.get("/metrics", response_class=PlainTextResponse)
async def metrics() -> str:
    uptime = time.time() - _STARTED
    return (
        "# TYPE smile_uptime_seconds gauge\n"
        f"smile_uptime_seconds {uptime:.0f}\n"
        "# TYPE smile_http_requests_total counter\n"
        f"smile_http_requests_total {_requests_total}\n"
    )
