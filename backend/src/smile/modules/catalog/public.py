"""API pública de `catalog`: única superficie importable por otros módulos.

Expone fachadas de casos de uso, DTOs y nombres de eventos de dominio.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.catalog.infrastructure.models import CategoryModel

__all__ = ["CategoryCodes"]


class CategoryCodes:
    """Códigos de todas las categorías (activas o próximamente: la ficha admite ambas)."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def codes(self) -> set[str]:
        return set(await self._session.scalars(select(CategoryModel.code)))
