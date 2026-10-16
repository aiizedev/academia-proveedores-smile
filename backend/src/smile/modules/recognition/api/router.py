"""Router FastAPI de `recognition` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/recognition", tags=["recognition"])
