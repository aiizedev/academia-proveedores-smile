"""Puertos de `suppliers`."""

import uuid
from typing import Protocol

from smile.modules.suppliers.domain.supplier import Supplier


class SupplierRepository(Protocol):
    async def get(self, supplier_id: uuid.UUID) -> Supplier | None: ...

    async def get_by_owner(self, user_id: uuid.UUID) -> Supplier | None: ...

    async def tax_id_taken(self, tax_id: str, *, by_other_than: uuid.UUID) -> bool: ...

    async def save(self, supplier: Supplier) -> None: ...


class CategoryCatalog(Protocol):
    """Códigos de categoría vigentes (lo provee `catalog.public`)."""

    async def codes(self) -> set[str]: ...
