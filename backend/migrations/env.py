"""Alembic async. Una sola rama; cada migración de módulo usa el prefijo `<modulo>_` en el slug."""

import asyncio
import contextlib
import importlib
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

from smile.config import get_settings
from smile.modules import MODULE_NAMES
from smile.shared.infrastructure import outbox  # noqa: F401  (registra el modelo)
from smile.shared.infrastructure.db import SCHEMAS, Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

for name in MODULE_NAMES:  # registra modelos ORM de cada módulo si existen
    with contextlib.suppress(ModuleNotFoundError):
        importlib.import_module(f"smile.modules.{name}.infrastructure.models")

target_metadata = Base.metadata
URL = get_settings().database_url


def include_name(name, type_, parent_names):  # type: ignore[no-untyped-def]
    """Autogenerate solo mira los esquemas propios (no el catálogo de TimescaleDB)."""
    if type_ == "schema":
        return name in SCHEMAS
    return True


def run_offline() -> None:
    context.configure(
        url=URL,
        target_metadata=target_metadata,
        literal_binds=True,
        include_schemas=True,
        version_table_schema="shared",
    )
    with context.begin_transaction():
        context.run_migrations()


def _do_run(connection) -> None:  # type: ignore[no-untyped-def]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        include_name=include_name,
        version_table_schema="shared",
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_online() -> None:
    engine = create_async_engine(URL)
    async with engine.connect() as conn:
        await conn.exec_driver_sql("CREATE SCHEMA IF NOT EXISTS shared")
        await conn.commit()
        await conn.run_sync(_do_run)
    await engine.dispose()


if context.is_offline_mode():
    run_offline()
else:
    asyncio.run(run_online())
