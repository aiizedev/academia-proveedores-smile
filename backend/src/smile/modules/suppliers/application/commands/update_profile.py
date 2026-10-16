"""Guardar la ficha de identificación (HU-SUP-01, CU-04).

Lo invoca el handler de sync `supplier_profile` (P2) cuando exista (HU-SYN-02).
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from smile.modules.suppliers.application.ports.repositories import (
    CategoryCatalog,
    SupplierRepository,
)
from smile.modules.suppliers.domain.supplier import InvalidProfileError, Profile, Supplier
from smile.shared.application.ports import Clock, CurrentUser, Role, UnitOfWork
from smile.shared.domain.errors import ConflictError, NotFoundError, PermissionDeniedError


@dataclass(frozen=True, kw_only=True)
class UpdateProfileCommand:
    supplier_id: uuid.UUID
    profile: Profile


class UpdateSupplierProfile:
    def __init__(
        self,
        uow: UnitOfWork,
        suppliers: SupplierRepository,
        categories: CategoryCatalog,
        clock: Clock,
    ) -> None:
        self._uow = uow
        self._suppliers = suppliers
        self._categories = categories
        self._clock = clock

    async def __call__(self, user: CurrentUser, cmd: UpdateProfileCommand) -> Supplier:
        if user.role is not Role.PROVEEDOR:
            raise PermissionDeniedError("Solo el proveedor edita su ficha")
        user.ensure_supplier_access(cmd.supplier_id)
        supplier = await self._suppliers.get(cmd.supplier_id)
        if supplier is None:
            raise NotFoundError("Recurso no encontrado")
        codes = await self._categories.codes()
        unknown = {cmd.profile.main_category, *cmd.profile.secondary_categories} - codes
        if unknown:
            raise InvalidProfileError("Categoría desconocida", code="unknown_category")
        if await self._suppliers.tax_id_taken(cmd.profile.tax_id.number, by_other_than=supplier.id):
            raise ConflictError("Ese NIT ya está inscrito", code="tax_id_taken")
        supplier.update_profile(cmd.profile, self._clock.now())
        await self._suppliers.save(supplier)
        self._uow.track(supplier)
        await self._uow.commit()
        return supplier
