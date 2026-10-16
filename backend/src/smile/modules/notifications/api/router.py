"""Router FastAPI de `notifications` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/notifications", tags=["notifications"])
