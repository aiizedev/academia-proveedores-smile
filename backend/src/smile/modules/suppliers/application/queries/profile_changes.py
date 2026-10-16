"""Ficha a enviar en el pull de sync si cambió desde `since` (HU-SYN-02, S-22)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from smile.modules.suppliers.application.ports.repositories import SupplierRepository
from smile.modules.suppliers.domain.supplier import Supplier
from smile.shared.application.ports import CurrentUser


@dataclass(frozen=True, kw_only=True)
class ProfileChange:
    supplier: Supplier
    updated_at: datetime


class ProfileChangesSince:
    def __init__(self, suppliers: SupplierRepository) -> None:
        self._suppliers = suppliers

    async def __call__(self, user: CurrentUser, since: datetime | None) -> ProfileChange | None:
        if user.supplier_id is None:
            return None
        supplier = await self._suppliers.get(user.supplier_id)
        updated_at = await self._suppliers.updated_at(user.supplier_id)
        if supplier is None or updated_at is None or not supplier.is_profile_complete:
            return None  # S-22: solo la ficha completa vive en el servidor
        if since is not None and updated_at <= since:
            return None
        return ProfileChange(supplier=supplier, updated_at=updated_at)
