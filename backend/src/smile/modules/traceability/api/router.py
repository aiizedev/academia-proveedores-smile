"""Router FastAPI de `traceability` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/traceability", tags=["traceability"])
