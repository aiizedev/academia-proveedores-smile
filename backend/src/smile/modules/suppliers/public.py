"""API pública de `suppliers`: única superficie importable por otros módulos.

Expone fachadas de casos de uso, DTOs y nombres de eventos de dominio.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.suppliers.domain.supplier import SupplierProfileCompleted
from smile.modules.suppliers.infrastructure.models import SupplierModel

__all__ = ["SupplierDirectory", "SupplierProfileCompleted"]


class SupplierDirectory:
    """Resuelve el proveedor de una cuenta (lo usa `iam` para el `supplier_id` del JWT)."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def supplier_id_for(self, user_id: uuid.UUID) -> uuid.UUID | None:
        return await self._session.scalar(
            select(SupplierModel.id).where(SupplierModel.owner_user_id == user_id)
        )
