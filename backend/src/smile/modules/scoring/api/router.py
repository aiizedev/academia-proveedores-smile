"""Router FastAPI de `scoring` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/scoring", tags=["scoring"])
