"""Registro de tablas sincronizables. Cada módulo registra las suyas en su `module.py`."""

from __future__ import annotations

from dataclasses import dataclass

from smile.modules.sync.application.ports.tables import TableFactory


@dataclass(frozen=True, kw_only=True)
class TableRegistration:
    name: str
    priority: int  # 1, 2 o 3 (arquitectura §5)
    factory: TableFactory


_TABLES: dict[str, TableRegistration] = {}


def register_table(name: str, *, priority: int, factory: TableFactory) -> None:
    if priority not in (1, 2, 3):
        raise ValueError(f"Prioridad inválida para {name}: {priority}")
    _TABLES[name] = TableRegistration(name=name, priority=priority, factory=factory)


def registered_tables() -> dict[str, TableRegistration]:
    return dict(_TABLES)
