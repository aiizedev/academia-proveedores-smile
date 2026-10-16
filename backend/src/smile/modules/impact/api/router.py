"""Router FastAPI de `impact` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/impact", tags=["impact"])
