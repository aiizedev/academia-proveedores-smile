"""Seed de demo contra PostgreSQL real: idempotente (MODO_POC §3.1)."""

from sqlalchemy import text

from smile.seed.__main__ import run
from smile.shared.infrastructure.db import get_engine, ping_database


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
