"""Puertos de lectura del catálogo."""

from typing import Protocol

from smile.modules.catalog.domain.catalog import Category, ParameterSet


class CatalogReader(Protocol):
    async def categories(self) -> list[Category]: ...

    async def parameter_sets(self) -> list[ParameterSet]: ...
