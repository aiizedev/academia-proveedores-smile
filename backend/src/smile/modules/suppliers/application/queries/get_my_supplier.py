"""Ficha del proveedor autenticado (HU-SUP-01)."""

from smile.modules.suppliers.application.ports.repositories import SupplierRepository
from smile.modules.suppliers.domain.supplier import Supplier
from smile.shared.application.ports import CurrentUser
from smile.shared.domain.errors import NotFoundError


class GetMySupplier:
    def __init__(self, suppliers: SupplierRepository) -> None:
        self._suppliers = suppliers

    async def __call__(self, user: CurrentUser) -> Supplier:
        supplier = await self._suppliers.get_by_owner(user.id)
        if supplier is None:
            raise NotFoundError("Recurso no encontrado")
        return supplier
