"""Pruebas contra PostgreSQL real: requieren APP_ENV=test y DATABASE_URL de prueba."""

import os
import subprocess
import sys
import uuid

import jwt
import pytest

from smile.config import get_settings

if os.environ.get("APP_ENV") != "test" or "DATABASE_URL" not in os.environ:
    pytest.skip("requiere DATABASE_URL de prueba", allow_module_level=True)


@pytest.fixture(scope="session", autouse=True)
def migrated() -> None:
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)


def token_for(role: str, supplier_id: uuid.UUID | None = None) -> str:
    claims = {"sub": str(uuid.uuid4()), "role": role}
    if supplier_id:
        claims["supplier_id"] = str(supplier_id)
    return jwt.encode(claims, get_settings().jwt_secret, algorithm="HS256")
