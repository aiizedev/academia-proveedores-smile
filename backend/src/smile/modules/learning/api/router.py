"""Router FastAPI de `learning` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/learning", tags=["learning"])
