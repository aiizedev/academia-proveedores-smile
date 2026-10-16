"""Router FastAPI de `catalog` (montado bajo /api/v1)."""

from typing import Annotated

from fastapi import APIRouter, Depends

from smile.modules.catalog.api.schemas import (
    AxisOut,
    CatalogBundleOut,
    CategoryOut,
    ParameterSetOut,
)
from smile.modules.catalog.application.queries.get_catalog_bundle import GetCatalogBundle
from smile.shared.api.deps import get_current_user
from smile.shared.application.ports import CurrentUser

router = APIRouter(prefix="/catalog", tags=["catalog"])


def get_catalog_bundle() -> GetCatalogBundle:
    """Punto de inyección; `module.py` lo reemplaza por la implementación concreta."""
    raise NotImplementedError("catalog no está cableado: falta module.dependency_overrides")


@router.get("/bundle", response_model=CatalogBundleOut)
async def bundle(
    _: Annotated[CurrentUser, Depends(get_current_user)],
    query: Annotated[GetCatalogBundle, Depends(get_catalog_bundle)],
) -> CatalogBundleOut:
    """Categorías con sus ejes y parámetros vigentes (RF-CAT-001, 002, 004)."""
    result = await query()
    return CatalogBundleOut(
        categories=[
            CategoryOut(
                code=c.code,
                name=c.name,
                status=c.status.value,
                icon=c.icon,
                axes=[
                    AxisOut(code=a.code, name=a.name, short_name=a.short_name, icon=a.icon)
                    for a in c.ordered_axes()
                ],
            )
            for c in result.categories
        ],
        parameters={
            k: ParameterSetOut(version=p.version, valid_from=p.valid_from, value=p.value)
            for k, p in sorted(result.parameters.items())
        },
    )
