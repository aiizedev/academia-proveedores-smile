"""Proveedores de demo (MODO_POC §3.2): uno por cuenta PROVEEDOR del seed de `iam`.

Códigos DIVIPOLA de municipios de Cundinamarca (25) y Boyacá (15) usados en la demo.
"""

from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from smile.modules.suppliers.domain.nit import Nit, check_digit
from smile.modules.suppliers.domain.supplier import (
    ContactChannel,
    PersonType,
    Profile,
    Segment,
    Supplier,
)
from smile.modules.suppliers.infrastructure.models import SupplierModel
from smile.modules.suppliers.infrastructure.repositories import profile_columns
from smile.shared.infrastructure.seed import demo_id, demo_random

GENERATED = 30
STRATEGIC = 5
COMPLETED_AT = datetime(2026, 9, 1, 13, tzinfo=UTC)

MUNICIPALITIES = (
    ("25", "25290"),  # Fusagasugá
    ("25", "25743"),  # Silvania
    ("25", "25386"),  # La Mesa
    ("25", "25040"),  # Anolaima
    ("25", "25279"),  # Fómeque
    ("25", "25513"),  # Pacho
    ("25", "25875"),  # Villeta
    ("25", "25899"),  # Zipaquirá
    ("15", "15001"),  # Tunja
    ("15", "15238"),  # Duitama
    ("15", "15759"),  # Sogamoso
    ("15", "15516"),  # Paipa
    ("15", "15646"),  # Samacá
    ("15", "15861"),  # Ventaquemada
)
_FARMS = ("Finca", "Granja", "Hacienda", "Huerta", "Vereda")
_NAMES = (
    "El Recreo",
    "La Primavera",
    "San José",
    "Los Naranjos",
    "El Paraíso",
    "Buenavista",
    "La Cabaña",
    "El Retiro",
    "Santa Rosa",
    "Las Brisas",
    "Monteverde",
    "El Mirador",
)


def _nit(number: str) -> Nit:
    return Nit.parse(number, check_digit(number))


def demo_suppliers() -> list[Supplier]:
    suppliers = [
        Supplier(
            id=demo_id("suppliers.supplier:proveedor"),
            owner_user_id=demo_id("iam.user:proveedor"),
            profile=Profile(
                person_type=PersonType.NATURAL,
                tax_id=_nit("1069712345"),
                legal_name="Finca La Esperanza",
                department_code="25",
                municipality_code="25290",
                vereda="Bermejal",
                latitude=Decimal("4.336900"),
                longitude=Decimal("-74.364500"),
                contact_channel=ContactChannel.WHATSAPP,
                main_category="fruver",
            ),
            profile_completed_at=COMPLETED_AT,
        ),
        # Recién registrado: sin ficha, para demostrar el onboarding.
        Supplier(id=demo_id("suppliers.supplier:nuevo"), owner_user_id=demo_id("iam.user:nuevo")),
    ]
    rng = demo_random("suppliers")
    for n in range(1, GENERATED + 1):
        key = f"proveedor{n:02d}"
        department, municipality = rng.choice(MUNICIPALITIES)
        juridica = rng.random() < 0.3
        suppliers.append(
            Supplier(
                id=demo_id(f"suppliers.supplier:{key}"),
                owner_user_id=demo_id(f"iam.user:{key}"),
                profile=Profile(
                    person_type=PersonType.JURIDICA if juridica else PersonType.NATURAL,
                    tax_id=_nit(f"9001{n:05d}" if juridica else f"10{rng.randrange(10**7, 10**8)}"),
                    legal_name=f"{rng.choice(_FARMS)} {rng.choice(_NAMES)}"
                    + (" S.A.S." if juridica else ""),
                    legal_rep="Representante de demo" if juridica else None,
                    department_code=department,
                    municipality_code=municipality,
                    contact_channel=rng.choice(list(ContactChannel)),
                    main_category="fruver",
                ),
                segment=Segment.ESTRATEGICO if n <= STRATEGIC else Segment.LOCAL,
                profile_completed_at=COMPLETED_AT,
            )
        )
    return suppliers


async def seed_demo(session: AsyncSession) -> None:
    rows = [
        {"id": s.id, "owner_user_id": s.owner_user_id, **profile_columns(s)}
        for s in demo_suppliers()
    ]
    stmt = insert(SupplierModel).values(rows)
    updatable = [k for k in rows[0] if k != "id"]
    stmt = stmt.on_conflict_do_update(
        index_elements=[SupplierModel.id],
        set_={**{k: stmt.excluded[k] for k in updatable}, "updated_at": func.now()},
    )
    await session.execute(stmt)
