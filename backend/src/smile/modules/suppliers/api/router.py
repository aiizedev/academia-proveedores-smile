"""Router FastAPI de `suppliers` (montado bajo /api/v1)."""

from typing import Annotated

from fastapi import APIRouter, Depends

from smile.modules.iam.public import Permission, require
from smile.modules.suppliers.api.schemas import MySupplierOut, ProfileOut
from smile.modules.suppliers.application.queries.get_my_supplier import GetMySupplier
from smile.shared.application.ports import CurrentUser

router = APIRouter(tags=["suppliers"])


def get_my_supplier() -> GetMySupplier:
    """Punto de inyección; `module.py` lo reemplaza por la implementación concreta."""
    raise NotImplementedError("suppliers no está cableado: falta module.dependency_overrides")


@router.get("/me/supplier", response_model=MySupplierOut)
async def my_supplier(
    user: Annotated[CurrentUser, Depends(require(Permission.SUPPLIER_SELF_SERVICE))],
    query: Annotated[GetMySupplier, Depends(get_my_supplier)],
) -> MySupplierOut:
    """Ficha del proveedor autenticado; `profile` es nulo hasta completarla (HU-SUP-01).

    La escritura llega por sync (`supplier_profile`, P2), no por REST (PLAN_BACKEND §5).
    """
    s = await query(user)
    p = s.profile
    return MySupplierOut(
        id=s.id,
        profile_completed_at=s.profile_completed_at,
        profile=ProfileOut(
            person_type=p.person_type.value,
            tax_id=p.tax_id.number,
            tax_dv=p.tax_id.dv,
            legal_name=p.legal_name,
            legal_rep=p.legal_rep,
            department_code=p.department_code,
            municipality_code=p.municipality_code,
            vereda=p.vereda,
            latitude=p.latitude,
            longitude=p.longitude,
            contact_channel=p.contact_channel.value,
            main_category=p.main_category,
            secondary_categories=list(p.secondary_categories),
        )
        if p
        else None,
    )
