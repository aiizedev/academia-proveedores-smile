"""Router FastAPI de `iam` (montado bajo /api/v1)."""

from fastapi import APIRouter

router = APIRouter(prefix="/iam", tags=["iam"])
