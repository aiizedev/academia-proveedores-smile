"""Tabla de sync `supplier_profile` (P2): adaptador entrante de la PWA (HU-SUP-01, S-22)."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, ValidationError

from smile.modules.suppliers.application.commands.update_profile import (
    UpdateProfileCommand,
    UpdateSupplierProfile,
)
from smile.modules.suppliers.application.queries.profile_changes import ProfileChangesSince
from smile.modules.suppliers.domain.nit import Nit
from smile.modules.suppliers.domain.supplier import ContactChannel, PersonType, Profile
from smile.modules.sync.public import Record, TableChanges
from smile.shared.application.ports import CurrentUser
from smile.shared.domain.errors import (
    NotFoundError,
    PermissionDeniedError,
    ValidationFailedError,
)

TABLE = "supplier_profile"


class SupplierProfileRecord(BaseModel):
    """Fila de WatermelonDB (columnas snake_case, fechas en ms). Ignora `_status`/`_changed`."""

    model_config = ConfigDict(extra="ignore")

    id: str
    person_type: Literal["natural", "juridica"] | None = None
    tax_id: str | None = None
    tax_dv: str | None = None
    legal_name: str | None = None
    legal_rep: str | None = None
    department_code: str | None = None
    municipality_code: str | None = None
    vereda: str | None = None
    contact_channel: Literal["whatsapp", "llamada", "correo"] | None = None
    main_category: str | None = None
    completed_at: int | None = None


def _ms(at: datetime) -> int:
    return int(at.timestamp() * 1000)


class SupplierProfileSyncTable:
    def __init__(self, update: UpdateSupplierProfile, changes: ProfileChangesSince) -> None:
        self._update = update
        self._changes = changes

    async def upsert(self, user: CurrentUser, record: Record) -> None:
        try:
            r = SupplierProfileRecord.model_validate(record)
        except ValidationError as exc:
            raise ValidationFailedError(_first_error(exc)) from exc
        if r.completed_at is None:
            return  # S-22: borrador; se queda en el dispositivo
        if user.supplier_id is None:
            raise NotFoundError("Recurso no encontrado")
        missing = [
            f
            for f in (
                "person_type",
                "tax_id",
                "tax_dv",
                "legal_name",
                "department_code",
                "municipality_code",
                "contact_channel",
                "main_category",
            )
            if getattr(r, f) in (None, "")
        ]
        if missing:
            raise ValidationFailedError(f"Faltan campos obligatorios: {', '.join(missing)}")
        assert r.person_type and r.tax_id and r.tax_dv and r.legal_name and r.main_category
        assert r.department_code and r.municipality_code and r.contact_channel
        profile = Profile(
            person_type=PersonType(r.person_type),
            tax_id=Nit.parse(r.tax_id, r.tax_dv),
            legal_name=r.legal_name,
            legal_rep=r.legal_rep or None,
            department_code=r.department_code,
            municipality_code=r.municipality_code,
            vereda=r.vereda or None,
            contact_channel=ContactChannel(r.contact_channel),
            main_category=r.main_category,
        )
        # La fila es única por proveedor: se identifica por el JWT, no por el id local.
        await self._update(
            user, UpdateProfileCommand(supplier_id=user.supplier_id, profile=profile)
        )

    async def delete(self, user: CurrentUser, record_id: str) -> None:
        raise PermissionDeniedError("La ficha no se puede borrar", code="not_allowed")

    async def changes_since(self, user: CurrentUser, since: datetime | None) -> TableChanges:
        change = await self._changes(user, since)
        if change is None:
            return TableChanges()
        s, p = change.supplier, change.supplier.profile
        assert p is not None and s.profile_completed_at is not None
        row: Record = {
            "id": str(s.id),
            "person_type": p.person_type.value,
            "tax_id": p.tax_id.number,
            "tax_dv": p.tax_id.dv,
            "legal_name": p.legal_name,
            "legal_rep": p.legal_rep,
            "department_code": p.department_code,
            "municipality_code": p.municipality_code,
            "vereda": p.vereda,
            "contact_channel": p.contact_channel.value,
            "main_category": p.main_category,
            "completed_at": _ms(s.profile_completed_at),
            "created_at": _ms(s.profile_completed_at),
            "updated_at": _ms(change.updated_at),
        }
        return TableChanges(created=[row]) if since is None else TableChanges(updated=[row])


def _first_error(exc: ValidationError) -> str:
    e = exc.errors()[0]
    return f"Campo {'.'.join(str(x) for x in e['loc'])}: {e['msg']}"
