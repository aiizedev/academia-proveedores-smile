"""Composición de `iam`: router, cableado de puertos y handlers de eventos."""

from collections.abc import Callable
from datetime import timedelta
from typing import Annotated, Any

from fastapi import Depends

from smile.config import get_settings
from smile.modules.iam.api.router import (
    get_login,
    get_logout,
    get_me_query,
    get_refresh_session,
    router,
)
from smile.modules.iam.application.commands.sessions import (
    Login,
    LoginPolicy,
    Logout,
    RefreshSession,
)
from smile.modules.iam.application.queries.get_me import GetMe
from smile.modules.iam.infrastructure.passwords import Argon2PasswordHasher
from smile.modules.iam.infrastructure.repositories import (
    SqlRefreshTokenRepository,
    SqlUserRepository,
)
from smile.modules.iam.infrastructure.tokens import JwtTokenService
from smile.shared.api.deps import get_uow
from smile.shared.infrastructure.clock import SystemClock
from smile.shared.infrastructure.event_bus import InMemoryEventBus
from smile.shared.infrastructure.uow import SqlAlchemyUnitOfWork

__all__ = ["dependency_overrides", "register_handlers", "router"]

Uow = Annotated[SqlAlchemyUnitOfWork, Depends(get_uow)]
_hasher = Argon2PasswordHasher()


def _tokens() -> JwtTokenService:
    s = get_settings()
    return JwtTokenService(s.jwt_secret, s.jwt_access_ttl_min, s.jwt_refresh_ttl_days)


def _session_args(uow: SqlAlchemyUnitOfWork) -> tuple[Any, ...]:
    return (
        uow,
        SqlUserRepository(uow.session),
        SqlRefreshTokenRepository(uow.session),
        _tokens(),
        SystemClock(),
    )


def _login(uow: Uow) -> Login:
    s = get_settings()
    policy = LoginPolicy(
        max_attempts=s.login_max_attempts, lock=timedelta(minutes=s.login_lock_minutes)
    )
    return Login(*_session_args(uow), hasher=_hasher, policy=policy)


def _refresh(uow: Uow) -> RefreshSession:
    return RefreshSession(*_session_args(uow))


def _logout(uow: Uow) -> Logout:
    return Logout(*_session_args(uow))


def _get_me(uow: Uow) -> GetMe:
    return GetMe(SqlUserRepository(uow.session))


#: Proveedor abstracto (api) → implementación concreta (infrastructure).
dependency_overrides: dict[Callable[..., Any], Callable[..., Any]] = {
    get_login: _login,
    get_refresh_session: _refresh,
    get_logout: _logout,
    get_me_query: _get_me,
}


def register_handlers(bus: InMemoryEventBus) -> None:
    """Suscribe los handlers de eventos de este módulo (ninguno todavía)."""
