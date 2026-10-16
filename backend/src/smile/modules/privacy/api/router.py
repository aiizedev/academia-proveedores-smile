"""Router FastAPI de `privacy` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/privacy", tags=["privacy"])
