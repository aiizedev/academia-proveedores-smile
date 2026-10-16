"""Router FastAPI de `receptions` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/receptions", tags=["receptions"])
