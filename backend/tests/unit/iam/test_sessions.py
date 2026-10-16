"""Login, rotación de refresh y reutilización con fakes (HU-IAM-02)."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest

from smile.modules.iam.application.commands.sessions import (
    Login,
    LoginCommand,
    LoginPolicy,
    Logout,
    RefreshSession,
)
from smile.modules.iam.domain.session import RefreshToken
from smile.modules.iam.domain.user import User
from smile.shared.application.ports import Role
from smile.shared.domain.errors import AuthenticationError, LockedError


class Clock:
    def __init__(self) -> None:
        self.at = datetime(2026, 10, 16, 8, tzinfo=UTC)

    def now(self) -> datetime:
        return self.at


class Uow:
    commits = 0

    async def commit(self) -> None:
        self.commits += 1


class Users:
    def __init__(self, *users: User) -> None:
        self.by_id = {u.id: u for u in users}

    async def get(self, user_id: uuid.UUID) -> User | None:
        return self.by_id.get(user_id)

    async def get_by_phone(self, phone: str) -> User | None:
        return next((u for u in self.by_id.values() if u.phone == phone), None)

    async def get_by_email(self, email: str) -> User | None:
        return next((u for u in self.by_id.values() if u.email == email), None)

    async def save_login_state(self, user: User) -> None:
        pass


class Tokens:
    access_ttl_seconds = 900
    refresh_ttl_days = 30
    n = 0

    def issue_access(self, user: User, supplier_id: uuid.UUID | None) -> str:
        return f"access-{user.id}-{supplier_id}"

    def new_refresh(self) -> tuple[str, bytes]:
        self.n += 1
        raw = f"refresh-{self.n}"
        return raw, raw.encode()

    def hash_refresh(self, raw: str) -> bytes:
        return raw.encode()


class Refresh:
    def __init__(self) -> None:
        self.tokens: dict[bytes, RefreshToken] = {}

    async def add(self, token: RefreshToken) -> None:
        self.tokens[token.token_hash] = token

    async def get_by_hash(self, token_hash: bytes) -> RefreshToken | None:
        return self.tokens.get(token_hash)

    async def mark_replaced(self, token: RefreshToken, by: uuid.UUID, at: datetime) -> None:
        token.replaced_by, token.revoked_at = by, at

    async def revoke_family(self, family_id: uuid.UUID, at: datetime) -> None:
        for t in self.tokens.values():
            if t.family_id == family_id and t.revoked_at is None:
                t.revoked_at = at


class Suppliers:
    def __init__(self) -> None:
        self.by_user: dict[uuid.UUID, uuid.UUID] = {}

    async def supplier_id_for(self, user_id: uuid.UUID) -> uuid.UUID | None:
        return self.by_user.get(user_id)


class Hasher:
    def hash(self, password: str) -> str:
        return f"h:{password}"

    def verify(self, password_hash: str, password: str) -> bool:
        return password_hash == f"h:{password}"


@pytest.fixture
def env() -> dict[str, object]:
    user = User(
        full_name="Ana",
        role=Role.PROVEEDOR,
        password_hash="h:Smile2026!",
        phone="3001234567",
        email="ana@smile.test",
    )
    clock, refresh, suppliers = Clock(), Refresh(), Suppliers()
    supplier_id = uuid.uuid4()
    suppliers.by_user[user.id] = supplier_id
    args = (Uow(), Users(user), refresh, Tokens(), clock, suppliers)
    return {
        "user": user,
        "supplier_id": supplier_id,
        "clock": clock,
        "refresh_repo": refresh,
        "login": Login(
            *args, hasher=Hasher(), policy=LoginPolicy(max_attempts=5, lock=timedelta(minutes=15))
        ),
        "refresh": RefreshSession(*args),
        "logout": Logout(*args),
    }


async def test_login_by_phone_or_email(env: dict) -> None:
    s1 = await env["login"](LoginCommand(identifier="+57 300 123 4567", password="Smile2026!"))
    s2 = await env["login"](LoginCommand(identifier="ANA@smile.test", password="Smile2026!"))
    assert s1.user.id == s2.user.id
    assert s1.expires_in == 900
    assert s1.access_token.endswith(str(env["supplier_id"]))


async def test_unknown_identifier_is_invalid_credentials(env: dict) -> None:
    with pytest.raises(AuthenticationError) as exc:
        await env["login"](LoginCommand(identifier="no-es-celular", password="x"))
    assert exc.value.code == "invalid_credentials"


async def test_locked_after_five_failures_even_with_right_password(env: dict) -> None:
    for _ in range(4):
        with pytest.raises(AuthenticationError):
            await env["login"](LoginCommand(identifier="3001234567", password="mal"))
    with pytest.raises(LockedError):  # quinto fallo: bloquea
        await env["login"](LoginCommand(identifier="3001234567", password="mal"))
    with pytest.raises(LockedError) as exc:  # sexto, con la contraseña correcta
        await env["login"](LoginCommand(identifier="3001234567", password="Smile2026!"))
    assert "15 minutos" in exc.value.message
    env["clock"].at += timedelta(minutes=15)
    assert await env["login"](LoginCommand(identifier="3001234567", password="Smile2026!"))


async def test_refresh_rotates_and_reuse_revokes_family(env: dict) -> None:
    first = await env["login"](LoginCommand(identifier="3001234567", password="Smile2026!"))
    second = await env["refresh"](first.refresh_token)
    assert second.refresh_token != first.refresh_token
    with pytest.raises(AuthenticationError) as exc:
        await env["refresh"](first.refresh_token)  # reutilización
    assert exc.value.code == "refresh_reused"
    with pytest.raises(AuthenticationError):
        await env["refresh"](second.refresh_token)  # la familia quedó revocada


async def test_expired_refresh_rejected(env: dict) -> None:
    s = await env["login"](LoginCommand(identifier="3001234567", password="Smile2026!"))
    env["clock"].at += timedelta(days=31)
    with pytest.raises(AuthenticationError):
        await env["refresh"](s.refresh_token)


async def test_logout_revokes_session(env: dict) -> None:
    s = await env["login"](LoginCommand(identifier="3001234567", password="Smile2026!"))
    await env["logout"](s.refresh_token)
    with pytest.raises(AuthenticationError):
        await env["refresh"](s.refresh_token)
