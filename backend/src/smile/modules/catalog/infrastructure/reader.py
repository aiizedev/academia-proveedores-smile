"""Adaptador SQLAlchemy de `CatalogReader`."""

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.catalog.domain.catalog import Axis, Category, CategoryStatus, ParameterSet
from smile.modules.catalog.infrastructure.models import (
    AxisModel,
    CategoryModel,
    ParameterSetModel,
)


class SqlCatalogReader:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def categories(self) -> list[Category]:
        axes: defaultdict[str, list[Axis]] = defaultdict(list)
        for a in await self._session.scalars(select(AxisModel)):
            axes[a.category_code].append(
                Axis(
                    code=a.code,
                    name=a.name,
                    short_name=a.short_name,
                    icon=a.icon,
                    position=a.position,
                )
            )
        rows = await self._session.scalars(select(CategoryModel).order_by(CategoryModel.position))
        return [
            Category(
                code=c.code,
                name=c.name,
                status=CategoryStatus(c.status),
                icon=c.icon,
                axes=tuple(axes[c.code]),
            )
            for c in rows
        ]

    async def parameter_sets(self) -> list[ParameterSet]:
        rows = await self._session.scalars(select(ParameterSetModel))
        return [
            ParameterSet(key=p.key, version=p.version, value=p.value, valid_from=p.valid_from)
            for p in rows
        ]
