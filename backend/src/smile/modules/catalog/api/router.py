"""Router FastAPI de `catalog` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/catalog", tags=["catalog"])
