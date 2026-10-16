"""Pruebas contra PostgreSQL real: requieren APP_ENV=test y DATABASE_URL de prueba."""

import os
import subprocess
import sys

import pytest

if os.environ.get("APP_ENV") != "test" or "DATABASE_URL" not in os.environ:
    pytest.skip("requiere DATABASE_URL de prueba", allow_module_level=True)


@pytest.fixture(scope="session", autouse=True)
def migrated() -> None:
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
