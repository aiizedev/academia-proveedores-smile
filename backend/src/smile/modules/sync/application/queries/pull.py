"""Pull incremental por tabla (HU-SYN-02, arquitectura §5)."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from smile.modules.sync.application.ports.tables import SyncTable
from smile.shared.application.ports import Clock, CurrentUser


def from_ms(ms: int) -> datetime | None:
    """`last_pulled_at` de WatermelonDB: 0 o nulo significa primer pull."""
    return datetime.fromtimestamp(ms / 1000, tz=UTC) if ms > 0 else None


def to_ms(at: datetime) -> int:
    return int(at.timestamp() * 1000)


class Pull:
    def __init__(self, tables: dict[str, SyncTable], clock: Clock) -> None:
        self._tables = tables
        self._clock = clock

    async def __call__(self, user: CurrentUser, last_pulled_at: int) -> dict[str, Any]:
        # El sello se toma antes de leer: un cambio concurrente sale en este pull o el siguiente.
        now = self._clock.now()
        since = from_ms(last_pulled_at)
        changes: dict[str, Any] = {}
        for name, table in sorted(self._tables.items()):
            c = await table.changes_since(user, since)
            if not c.is_empty:
                changes[name] = {"created": c.created, "updated": c.updated, "deleted": c.deleted}
        return {"changes": changes, "timestamp": to_ms(now)}
