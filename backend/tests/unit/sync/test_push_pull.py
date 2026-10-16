"""Push idempotente, rechazo por registro y pull incremental con fakes (HU-SYN-02)."""

import uuid
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any

import pytest

from smile.modules.sync.application.commands.push import Push, PushCommand
from smile.modules.sync.application.ports.tables import StoredResult, TableChanges
from smile.modules.sync.application.queries.pull import Pull, from_ms
from smile.shared.application.ports import CurrentUser, Role
from smile.shared.domain.errors import ConflictError, ValidationFailedError

USER = CurrentUser(id=uuid.uuid4(), role=Role.PROVEEDOR, supplier_id=uuid.uuid4())


class Table:
    def __init__(self) -> None:
        self.rows: dict[str, dict[str, Any]] = {}
        self.since: list[datetime | None] = []

    async def upsert(self, user: CurrentUser, record: dict[str, Any]) -> None:
        if record.get("qty", 0) < 0:
            raise ValidationFailedError("cantidad negativa")
        self.rows[record["id"]] = record

    async def delete(self, user: CurrentUser, record_id: str) -> None:
        self.rows.pop(record_id, None)

    async def changes_since(self, user: CurrentUser, since: datetime | None) -> TableChanges:
        self.since.append(since)
        return TableChanges(updated=list(self.rows.values()))


class Processed:
    def __init__(self) -> None:
        self.saved: dict[uuid.UUID, StoredResult] = {}

    async def get(self, mutation_id: uuid.UUID) -> StoredResult | None:
        return self.saved.get(mutation_id)

    async def save(
        self, mutation_id: uuid.UUID, user_id: uuid.UUID, priority: int, result: dict[str, Any]
    ) -> None:
        self.saved[mutation_id] = StoredResult(user_id=user_id, result=result)


class Tx:
    commits = 0

    @asynccontextmanager
    async def _sp(self):  # type: ignore[no-untyped-def]
        yield None

    def savepoint(self):  # type: ignore[no-untyped-def]
        return self._sp()

    async def commit(self) -> None:
        self.commits += 1


def _cmd(mutation_id: uuid.UUID, records: list[dict[str, Any]], table: str = "t") -> PushCommand:
    return PushCommand(
        mutation_id=mutation_id, priority=2, changes={table: TableChanges(created=records)}
    )


async def test_one_bad_record_does_not_block_the_rest() -> None:
    table = Table()
    push = Push({"t": table}, Processed(), Tx())
    records = [{"id": f"r{i}", "qty": 1} for i in range(9)] + [{"id": "bad", "qty": -1}]
    result = await push(USER, _cmd(uuid.uuid4(), records))
    assert len(result["accepted"]) == 9
    assert result["rejected"] == [
        {"id": "bad", "table": "t", "code": "VALIDATION_ERROR", "message": "cantidad negativa"}
    ]


async def test_resend_returns_stored_result_without_reapplying() -> None:
    table, processed, tx = Table(), Processed(), Tx()
    push = Push({"t": table}, processed, tx)
    m = uuid.uuid4()
    first = await push(USER, _cmd(m, [{"id": "a", "qty": 1}]))
    table.rows.clear()
    again = await push(USER, _cmd(m, [{"id": "a", "qty": 1}]))
    assert again == first
    assert table.rows == {} and tx.commits == 1


async def test_mutation_id_of_other_user_is_conflict() -> None:
    processed = Processed()
    m = uuid.uuid4()
    await Push({"t": Table()}, processed, Tx())(USER, _cmd(m, [{"id": "a"}]))
    other = CurrentUser(id=uuid.uuid4(), role=Role.PROVEEDOR)
    with pytest.raises(ConflictError):
        await Push({"t": Table()}, processed, Tx())(other, _cmd(m, [{"id": "a"}]))


async def test_unknown_table_rejected() -> None:
    result = await Push({}, Processed(), Tx())(USER, _cmd(uuid.uuid4(), [{"id": "x"}], "nope"))
    assert result["rejected"][0]["code"] == "UNKNOWN_TABLE"


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 10, 16, 12, tzinfo=UTC)


async def test_pull_converts_ms_and_skips_empty_tables() -> None:
    full, empty = Table(), Table()
    full.rows["a"] = {"id": "a"}
    out = await Pull({"full": full, "empty": empty}, Clock())(USER, 1_760_000_000_000)
    assert list(out["changes"]) == ["full"]
    assert out["timestamp"] == int(Clock().now().timestamp() * 1000)
    assert full.since == [from_ms(1_760_000_000_000)]
    assert from_ms(0) is None
