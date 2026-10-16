"""Router FastAPI de `erp` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/erp", tags=["erp"])
