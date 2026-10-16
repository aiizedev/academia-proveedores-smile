import pytest

from smile.modules.iam.domain.user import InvalidUserError, User, normalize_phone
from smile.modules.iam.infrastructure.seed import GENERATED_SUPPLIERS, demo_users
from smile.shared.application.ports import Role


def _user(**kw: object) -> User:
    base: dict[str, object] = {"full_name": "Ana", "role": Role.PROVEEDOR, "password_hash": "x"}
    return User(**(base | kw))  # type: ignore[arg-type]


@pytest.mark.parametrize("raw", ["3001234567", "+57 300 123 4567", "300-123-4567"])
def test_phone_normalized(raw: str) -> None:
    assert normalize_phone(raw) == "3001234567"


@pytest.mark.parametrize("raw", ["2001234567", "300123456", "30012345678"])
def test_phone_invalid(raw: str) -> None:
    with pytest.raises(InvalidUserError):
        normalize_phone(raw)


def test_requires_phone_or_email() -> None:
    with pytest.raises(InvalidUserError) as exc:
        _user()
    assert exc.value.code == "contact_required"


def test_email_lowercased() -> None:
    assert _user(email=" Ana@Smile.TEST ").email == "ana@smile.test"


def test_demo_users_deterministic_and_unique() -> None:
    a, b = demo_users("h"), demo_users("h")
    assert [(u.id, u.full_name) for u in a] == [(u.id, u.full_name) for u in b]
    assert len(a) == 4 + GENERATED_SUPPLIERS
    assert len({u.email for u in a}) == len(a)
    assert len({u.phone for u in a if u.phone}) == len([u for u in a if u.phone])
    roles = {u.email: u.role for u in a}
    assert roles["admin@smile.test"] is Role.ADMIN
    assert roles["reviewer@smile.test"] is Role.REVIEWER
