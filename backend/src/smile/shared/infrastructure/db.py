"""Motor y sesiones async de SQLAlchemy + Base declarativa con convenciones de nombres."""

from __future__ import annotations

from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy import MetaData, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from smile.config import get_settings

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

#: Esquemas PostgreSQL: uno por módulo + `shared` (ADR-0002).
SCHEMAS: tuple[str, ...] = (
    "shared",
    "iam",
    "privacy",
    "suppliers",
    "catalog",
    "assessment",
    "improvement",
    "erp",
    "traceability",
    "receptions",
    "scoring",
    "recognition",
    "learning",
    "impact",
    "reporting",
    "notifications",
    "sync",
)


class Base(DeclarativeBase):
    """Base de todos los modelos ORM. Cada modelo declara `__table_args__ = {"schema": ...}`."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


@lru_cache
def get_engine() -> AsyncEngine:
    settings = get_settings()
    return create_async_engine(
        settings.database_url, pool_pre_ping=True, pool_size=5, max_overflow=5
    )


@lru_cache
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def session_scope() -> AsyncIterator[AsyncSession]:
    async with get_sessionmaker()() as session:
        yield session


async def ping_database() -> bool:
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
