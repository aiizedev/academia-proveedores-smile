"""Router FastAPI de `sync` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/sync", tags=["sync"])
