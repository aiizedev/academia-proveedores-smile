"""Seed de demo contra PostgreSQL real: idempotente (MODO_POC §3.1)."""

import os
import subprocess
import sys

import pytest
from sqlalchemy import text

from smile.seed.__main__ import run
from smile.shared.infrastructure.db import get_engine, ping_database

pytestmark = pytest.mark.skipif(
    os.environ.get("APP_ENV") != "test" or "DATABASE_URL" not in os.environ,
    reason="requiere DATABASE_URL de prueba",
)


@pytest.fixture(scope="module", autouse=True)
def migrated() -> None:
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)


async def test_seed_is_idempotent() -> None:
    assert await ping_database()
    await run()
    await run()
    async with get_engine().connect() as conn:
        total = await conn.scalar(text("SELECT count(*) FROM iam.users"))
        admin = await conn.scalar(
            text("SELECT role FROM iam.users WHERE email = 'ADMIN@smile.test'")
        )
    await get_engine().dispose()
    assert total == 34
    assert admin == "ADMIN"
