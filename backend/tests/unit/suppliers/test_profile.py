"""Ficha de identificación (HU-SUP-01)."""

import uuid
from datetime import UTC, datetime

import pytest

from smile.modules.suppliers.application.commands.update_profile import (
    UpdateProfileCommand,
    UpdateSupplierProfile,
)
from smile.modules.suppliers.domain.nit import InvalidNitError, Nit, check_digit
from smile.modules.suppliers.domain.supplier import (
    ContactChannel,
    InvalidProfileError,
    PersonType,
    Profile,
    Supplier,
    SupplierProfileCompleted,
)
from smile.modules.suppliers.infrastructure.seed import STRATEGIC, demo_suppliers
from smile.shared.application.ports import CurrentUser, Role
from smile.shared.domain.errors import ConflictError, NotFoundError, PermissionDeniedError

NOW = datetime(2026, 10, 16, tzinfo=UTC)


def _profile(**kw: object) -> Profile:
    base: dict[str, object] = {
        "person_type": PersonType.NATURAL,
        "tax_id": Nit.parse("900123456", "8"),
        "legal_name": "Finca La Esperanza",
        "department_code": "25",
        "municipality_code": "25290",
        "contact_channel": ContactChannel.WHATSAPP,
        "main_category": "fruver",
    }
    return Profile(**(base | kw))  # type: ignore[arg-type]


def test_dian_check_digit_from_story() -> None:
    assert check_digit("900123456") == "8"


def test_wrong_check_digit_is_rejected() -> None:
    with pytest.raises(InvalidNitError) as exc:
        Nit.parse("900123456", "3")
    assert exc.value.message == "El dígito de verificación no coincide"


def test_juridica_requires_legal_rep() -> None:
    with pytest.raises(InvalidProfileError) as exc:
        _profile(person_type=PersonType.JURIDICA)
    assert exc.value.code == "legal_rep_required"
    assert _profile(person_type=PersonType.JURIDICA, legal_rep="Ana Rojas").legal_rep


def test_municipality_must_belong_to_department() -> None:
    with pytest.raises(InvalidProfileError):
        _profile(department_code="15", municipality_code="25290")


def test_profile_completed_event_only_first_time() -> None:
    s = Supplier(owner_user_id=uuid.uuid4())
    s.update_profile(_profile(), NOW)
    s.update_profile(_profile(vereda="Bermejal"), NOW)
    events = s.pull_events()
    assert [type(e) for e in events] == [SupplierProfileCompleted]
    assert s.profile_completed_at == NOW


class _Uow:
    def __init__(self) -> None:
        self.tracked: list[Supplier] = []

    def track(self, aggregate: Supplier) -> None:
        self.tracked.append(aggregate)

    async def commit(self) -> None:
        pass


class _Repo:
    def __init__(self, *suppliers: Supplier, taken: set[str] | None = None) -> None:
        self.by_id = {s.id: s for s in suppliers}
        self.taken = taken or set()

    async def get(self, supplier_id: uuid.UUID) -> Supplier | None:
        return self.by_id.get(supplier_id)

    async def get_by_owner(self, user_id: uuid.UUID) -> Supplier | None:
        return None

    async def tax_id_taken(self, tax_id: str, *, by_other_than: uuid.UUID) -> bool:
        return tax_id in self.taken

    async def save(self, supplier: Supplier) -> None:
        pass


class _Categories:
    async def codes(self) -> set[str]:
        return {"fruver", "lacteos"}


class _Clock:
    def now(self) -> datetime:
        return NOW


def _use_case(supplier: Supplier, **kw: object) -> tuple[UpdateSupplierProfile, _Uow]:
    uow = _Uow()
    return UpdateSupplierProfile(uow, _Repo(supplier, **kw), _Categories(), _Clock()), uow  # type: ignore[arg-type]


def _owner(s: Supplier) -> CurrentUser:
    return CurrentUser(id=s.owner_user_id, role=Role.PROVEEDOR, supplier_id=s.id)


async def test_owner_saves_profile_and_event_goes_to_uow() -> None:
    s = Supplier(owner_user_id=uuid.uuid4())
    use_case, uow = _use_case(s)
    await use_case(_owner(s), UpdateProfileCommand(supplier_id=s.id, profile=_profile()))
    assert uow.tracked == [s] and s.is_profile_complete


async def test_other_supplier_gets_404() -> None:
    s = Supplier(owner_user_id=uuid.uuid4())
    other = CurrentUser(id=uuid.uuid4(), role=Role.PROVEEDOR, supplier_id=uuid.uuid4())
    use_case, _ = _use_case(s)
    with pytest.raises(NotFoundError):
        await use_case(other, UpdateProfileCommand(supplier_id=s.id, profile=_profile()))


async def test_reviewer_cannot_edit() -> None:
    s = Supplier(owner_user_id=uuid.uuid4())
    use_case, _ = _use_case(s)
    with pytest.raises(PermissionDeniedError):
        await use_case(
            CurrentUser(id=uuid.uuid4(), role=Role.REVIEWER),
            UpdateProfileCommand(supplier_id=s.id, profile=_profile()),
        )


async def test_unknown_category_and_taken_tax_id() -> None:
    s = Supplier(owner_user_id=uuid.uuid4())
    use_case, _ = _use_case(s)
    with pytest.raises(InvalidProfileError):
        await use_case(
            _owner(s),
            UpdateProfileCommand(supplier_id=s.id, profile=_profile(main_category="flores")),
        )
    use_case, _ = _use_case(s, taken={"900123456"})
    with pytest.raises(ConflictError):
        await use_case(_owner(s), UpdateProfileCommand(supplier_id=s.id, profile=_profile()))


def test_demo_suppliers_deterministic_and_unique() -> None:
    a, b = demo_suppliers(), demo_suppliers()
    assert [(s.id, s.profile) for s in a] == [(s.id, s.profile) for s in b]
    tax_ids = [s.profile.tax_id.number for s in a if s.profile]
    assert len(tax_ids) == len(set(tax_ids)) == len(a) - 1  # nuevo@ sin ficha
    assert sum(s.segment.value == "ESTRATEGICO" for s in a) == STRATEGIC
