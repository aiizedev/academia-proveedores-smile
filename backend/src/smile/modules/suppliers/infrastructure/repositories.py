"""Repositorio SQLAlchemy de `suppliers`."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.suppliers.domain.nit import Nit
from smile.modules.suppliers.domain.supplier import (
    ContactChannel,
    PersonType,
    Profile,
    Segment,
    Supplier,
)
from smile.modules.suppliers.infrastructure.models import SupplierModel


def to_domain(m: SupplierModel) -> Supplier:
    profile = None
    if m.profile_completed_at is not None:
        assert m.person_type and m.tax_id and m.tax_dv and m.legal_name
        assert m.department_code and m.municipality_code and m.contact_channel
        assert m.main_category
        profile = Profile(
            person_type=PersonType(m.person_type),
            # Ya validado al guardar: no se recalcula el DV al leer.
            tax_id=Nit(number=m.tax_id, dv=m.tax_dv),
            legal_name=m.legal_name,
            legal_rep=m.legal_rep,
            department_code=m.department_code,
            municipality_code=m.municipality_code,
            vereda=m.vereda,
            latitude=m.latitude,
            longitude=m.longitude,
            contact_channel=ContactChannel(m.contact_channel),
            main_category=m.main_category,
            secondary_categories=tuple(m.secondary_categories or ()),
        )
    return Supplier(
        id=m.id,
        owner_user_id=m.owner_user_id,
        profile=profile,
        segment=Segment(m.segment),
        profile_completed_at=m.profile_completed_at,
    )


def profile_columns(supplier: Supplier) -> dict[str, object]:
    p = supplier.profile
    return {
        "person_type": p.person_type.value if p else None,
        "tax_id": p.tax_id.number if p else None,
        "tax_dv": p.tax_id.dv if p else None,
        "legal_name": p.legal_name if p else None,
        "legal_rep": p.legal_rep if p else None,
        "department_code": p.department_code if p else None,
        "municipality_code": p.municipality_code if p else None,
        "vereda": p.vereda if p else None,
        "latitude": p.latitude if p else None,
        "longitude": p.longitude if p else None,
        "contact_channel": p.contact_channel.value if p else None,
        "main_category": p.main_category if p else None,
        "secondary_categories": list(p.secondary_categories) if p else [],
        "segment": supplier.segment.value,
        "profile_completed_at": supplier.profile_completed_at,
    }


class SqlSupplierRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get(self, supplier_id: uuid.UUID) -> Supplier | None:
        m = await self._session.get(SupplierModel, supplier_id)
        return to_domain(m) if m else None

    async def get_by_owner(self, user_id: uuid.UUID) -> Supplier | None:
        m = await self._session.scalar(
            select(SupplierModel).where(SupplierModel.owner_user_id == user_id)
        )
        return to_domain(m) if m else None

    async def tax_id_taken(self, tax_id: str, *, by_other_than: uuid.UUID) -> bool:
        found = await self._session.scalar(
            select(SupplierModel.id).where(
                SupplierModel.tax_id == tax_id, SupplierModel.id != by_other_than
            )
        )
        return found is not None

    async def save(self, supplier: Supplier) -> None:
        m = await self._session.get(SupplierModel, supplier.id)
        if m is None:
            m = SupplierModel(id=supplier.id, owner_user_id=supplier.owner_user_id)
            self._session.add(m)
        for key, value in profile_columns(supplier).items():
            setattr(m, key, value)
