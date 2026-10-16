"""Casos de uso de sesión: Login, RefreshSession, Logout (HU-IAM-02, CU-02)."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta

from smile.modules.iam.application.ports.passwords import PasswordHasher
from smile.modules.iam.application.ports.repositories import (
    RefreshTokenRepository,
    SupplierLookup,
    UserRepository,
)
from smile.modules.iam.application.ports.tokens import TokenService
from smile.modules.iam.domain.session import RefreshToken
from smile.modules.iam.domain.user import (
    InvalidUserError,
    User,
    normalize_email,
    normalize_phone,
)
from smile.shared.application.ports import Clock, UnitOfWork
from smile.shared.domain.errors import AuthenticationError, LockedError

INVALID_CREDENTIALS = "Celular, correo o contraseña incorrectos"
LOCKED_MESSAGE = "Por seguridad, su cuenta está en pausa 15 minutos"
INVALID_SESSION = "La sesión no es válida; ingrese de nuevo"


@dataclass(frozen=True, kw_only=True)
class LoginPolicy:
    max_attempts: int
    lock: timedelta


@dataclass(frozen=True, kw_only=True)
class SessionTokens:
    user: User
    access_token: str
    refresh_token: str
    expires_in: int


@dataclass(frozen=True, kw_only=True)
class LoginCommand:
    identifier: str  # celular o correo
    password: str


class _Sessions:
    def __init__(
        self,
        uow: UnitOfWork,
        users: UserRepository,
        refresh_tokens: RefreshTokenRepository,
        tokens: TokenService,
        clock: Clock,
        suppliers: SupplierLookup,
    ) -> None:
        self._uow = uow
        self._suppliers = suppliers
        self._users = users
        self._refresh = refresh_tokens
        self._tokens = tokens
        self._clock = clock

    async def _issue(
        self, user: User, family_id: uuid.UUID, now: datetime
    ) -> tuple[SessionTokens, RefreshToken]:
        raw, token_hash = self._tokens.new_refresh()
        token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user.id,
            family_id=family_id,
            token_hash=token_hash,
            issued_at=now,
            expires_at=now + timedelta(days=self._tokens.refresh_ttl_days),
        )
        await self._refresh.add(token)
        return (
            SessionTokens(
                user=user,
                access_token=self._tokens.issue_access(
                    user, await self._suppliers.supplier_id_for(user.id)
                ),
                refresh_token=raw,
                expires_in=self._tokens.access_ttl_seconds,
            ),
            token,
        )


class Login(_Sessions):
    def __init__(
        self,
        uow: UnitOfWork,
        users: UserRepository,
        refresh_tokens: RefreshTokenRepository,
        tokens: TokenService,
        clock: Clock,
        suppliers: SupplierLookup,
        *,
        hasher: PasswordHasher,
        policy: LoginPolicy,
    ) -> None:
        super().__init__(uow, users, refresh_tokens, tokens, clock, suppliers)
        self._hasher = hasher
        self._policy = policy

    async def _find(self, identifier: str) -> User | None:
        try:
            if "@" in identifier:
                return await self._users.get_by_email(normalize_email(identifier))
            return await self._users.get_by_phone(normalize_phone(identifier))
        except InvalidUserError:
            return None

    async def __call__(self, cmd: LoginCommand) -> SessionTokens:
        now = self._clock.now()
        user = await self._find(cmd.identifier)
        if user is None or not user.is_active:
            raise AuthenticationError(INVALID_CREDENTIALS, code="invalid_credentials")
        if user.is_locked(now):
            raise LockedError(LOCKED_MESSAGE, code="account_locked")
        if not self._hasher.verify(user.password_hash, cmd.password):
            user.register_failed_login(now, self._policy.max_attempts, self._policy.lock)
            await self._users.save_login_state(user)
            await self._uow.commit()
            if user.is_locked(now):
                raise LockedError(LOCKED_MESSAGE, code="account_locked")
            raise AuthenticationError(INVALID_CREDENTIALS, code="invalid_credentials")
        user.register_successful_login()
        await self._users.save_login_state(user)
        session, _ = await self._issue(user, uuid.uuid4(), now)
        await self._uow.commit()
        return session


class RefreshSession(_Sessions):
    async def __call__(self, raw_refresh: str) -> SessionTokens:
        now = self._clock.now()
        current = await self._refresh.get_by_hash(self._tokens.hash_refresh(raw_refresh))
        if current is None:
            raise AuthenticationError(INVALID_SESSION, code="invalid_session")
        if current.was_used:
            # RNF-SEC-003: reutilización ⇒ alguien copió el token; se cierra toda la sesión.
            await self._refresh.revoke_family(current.family_id, now)
            await self._uow.commit()
            raise AuthenticationError(INVALID_SESSION, code="refresh_reused")
        user = await self._users.get(current.user_id)
        if current.is_expired(now) or user is None or not user.is_active:
            raise AuthenticationError(INVALID_SESSION, code="invalid_session")
        session, new = await self._issue(user, current.family_id, now)
        await self._refresh.mark_replaced(current, new.id, now)
        await self._uow.commit()
        return session


class Logout(_Sessions):
    async def __call__(self, raw_refresh: str) -> None:
        current = await self._refresh.get_by_hash(self._tokens.hash_refresh(raw_refresh))
        if current is not None:
            await self._refresh.revoke_family(current.family_id, self._clock.now())
            await self._uow.commit()
