"""Router FastAPI de `suppliers` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/suppliers", tags=["suppliers"])
