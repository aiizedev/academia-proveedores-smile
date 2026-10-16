"""Router FastAPI de `reporting` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/reporting", tags=["reporting"])
