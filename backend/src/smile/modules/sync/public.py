"""API pública de `sync`: única superficie importable por otros módulos.

Cada módulo dueño de una tabla de la PWA la registra desde su `module.py` con
`register_table(nombre, priority=…, factory=lambda uow: <SyncTable>)`.
"""

from smile.modules.sync.application.ports.tables import Record, SyncTable, TableChanges
from smile.modules.sync.application.registry import register_table

__all__ = ["Record", "SyncTable", "TableChanges", "register_table"]
