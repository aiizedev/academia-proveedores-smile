"""UnitOfWork sobre una AsyncSession; persiste los eventos de los agregados en el outbox."""

from __future__ import annotations

from types import TracebackType
from typing import Self

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from smile.shared.domain.base import AggregateRoot
from smile.shared.infrastructure.outbox import OutboxMessage


class SqlAlchemyUnitOfWork:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]) -> None:
        self._session_factory = session_factory
        self._tracked: list[AggregateRoot] = []
        self.session: AsyncSession

    async def __aenter__(self) -> Self:
        self.session = self._session_factory()
        self._tracked = []
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        if exc_type is not None:
            await self.rollback()
        await self.session.close()

    def track(self, aggregate: AggregateRoot) -> None:
        self._tracked.append(aggregate)

    async def commit(self) -> None:
        for aggregate in self._tracked:
            for event in aggregate.pull_events():
                self.session.add(OutboxMessage.from_event(event))
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()
