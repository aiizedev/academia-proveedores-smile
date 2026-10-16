"""Push idempotente con validación por registro (HU-SYN-02, RF-SYN-002, RF-SYN-008)."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any

from smile.modules.sync.application.ports.tables import (
    ProcessedMutations,
    Record,
    SyncTable,
    TableChanges,
    Transaction,
)
from smile.shared.application.ports import CurrentUser
from smile.shared.domain.errors import ConflictError, DomainError


@dataclass(frozen=True, kw_only=True)
class PushCommand:
    mutation_id: uuid.UUID
    priority: int
    changes: dict[str, TableChanges]


@dataclass(kw_only=True)
class PushResult:
    accepted: list[str] = field(default_factory=list)
    rejected: list[dict[str, str]] = field(default_factory=list)

    def reject(self, record_id: str, table: str, code: str, message: str) -> None:
        self.rejected.append(
            {"id": record_id, "table": table, "code": code.upper(), "message": message}
        )

    def as_dict(self) -> dict[str, Any]:
        return {"accepted": self.accepted, "rejected": self.rejected}


class Push:
    def __init__(
        self,
        tables: dict[str, SyncTable],
        processed: ProcessedMutations,
        tx: Transaction,
    ) -> None:
        self._tables = tables
        self._processed = processed
        self._tx = tx

    async def __call__(self, user: CurrentUser, cmd: PushCommand) -> dict[str, Any]:
        stored = await self._processed.get(cmd.mutation_id)
        if stored is not None:
            if stored.user_id != user.id:
                raise ConflictError("mutation_id ya usado", code="mutation_id_reused")
            return stored.result  # reenvío: mismo resultado, sin reaplicar
        result = PushResult()
        for table, changes in cmd.changes.items():
            handler = self._tables.get(table)
            for record in [*changes.created, *changes.updated]:
                await self._apply(user, result, table, handler, record)
            for record_id in changes.deleted:
                await self._apply(user, result, table, handler, {"id": record_id}, delete=True)
        await self._processed.save(cmd.mutation_id, user.id, cmd.priority, result.as_dict())
        await self._tx.commit()
        return result.as_dict()

    async def _apply(
        self,
        user: CurrentUser,
        result: PushResult,
        table: str,
        handler: SyncTable | None,
        record: Record,
        *,
        delete: bool = False,
    ) -> None:
        record_id = str(record.get("id", ""))
        if handler is None:
            result.reject(record_id, table, "unknown_table", f"Tabla no sincronizable: {table}")
            return
        try:
            async with self._tx.savepoint():
                if delete:
                    await handler.delete(user, record_id)
                else:
                    await handler.upsert(user, record)
        except DomainError as exc:
            result.reject(record_id, table, exc.code, exc.message)
            return
        result.accepted.append(record_id)
