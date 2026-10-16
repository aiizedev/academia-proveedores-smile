"""Adaptadores SQLAlchemy de `sync`: mutaciones procesadas y transacción con savepoints."""

import uuid
from contextlib import AbstractAsyncContextManager
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.sync.application.ports.tables import StoredResult
from smile.modules.sync.infrastructure.models import ProcessedMutationModel


class SqlProcessedMutations:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, mutation_id: uuid.UUID) -> StoredResult | None:
        m = await self._session.get(ProcessedMutationModel, mutation_id)
        return StoredResult(user_id=m.user_id, result=m.result) if m else None

    async def save(
        self, mutation_id: uuid.UUID, user_id: uuid.UUID, priority: int, result: dict[str, Any]
    ) -> None:
        self._session.add(
            ProcessedMutationModel(
                mutation_id=mutation_id, user_id=user_id, priority=priority, result=result
            )
        )


class SqlTransaction:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def savepoint(self) -> AbstractAsyncContextManager[object]:
        return self._session.begin_nested()

    async def commit(self) -> None:
        await self._session.commit()
