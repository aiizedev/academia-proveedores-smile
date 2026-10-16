"""Router FastAPI de `iam` (montado bajo /api/v1): /auth/* y /me (HU-IAM-02)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from smile.config import get_settings
from smile.modules.iam.api.schemas import LoginIn, MeOut, RefreshIn, SessionOut
from smile.modules.iam.application.commands.sessions import (
    Login,
    LoginCommand,
    Logout,
    RefreshSession,
    SessionTokens,
)
from smile.modules.iam.application.queries.get_me import GetMe
from smile.modules.iam.domain.user import User
from smile.shared.api.deps import get_current_user
from smile.shared.api.rate_limit import rate_limit
from smile.shared.application.ports import CurrentUser

router = APIRouter()
auth = APIRouter(prefix="/auth", tags=["auth"])


def _not_wired() -> NotImplementedError:
    return NotImplementedError("iam no está cableado: falta module.dependency_overrides")


def get_login() -> Login:
    """Puntos de inyección; `module.py` los reemplaza por la implementación concreta."""
    raise _not_wired()


def get_refresh_session() -> RefreshSession:
    raise _not_wired()


def get_logout() -> Logout:
    raise _not_wired()


def get_me_query() -> GetMe:
    raise _not_wired()


def _me(user: User) -> MeOut:
    return MeOut(
        id=user.id,
        full_name=user.full_name,
        role=user.role.value,
        phone=user.phone,
        email=user.email,
    )


def _session(s: SessionTokens) -> SessionOut:
    return SessionOut(
        access_token=s.access_token,
        refresh_token=s.refresh_token,
        expires_in=s.expires_in,
        user=_me(s.user),
    )


@auth.post(
    "/login",
    response_model=SessionOut,
    dependencies=[Depends(rate_limit("login", get_settings().login_rate_limit_per_minute))],
)
async def login(body: LoginIn, use_case: Annotated[Login, Depends(get_login)]) -> SessionOut:
    """Ingreso con celular o correo (RF-IAM-002); bloqueo tras intentos fallidos (RF-IAM-006)."""
    return _session(
        await use_case(LoginCommand(identifier=body.identifier, password=body.password))
    )


@auth.post("/refresh", response_model=SessionOut)
async def refresh(
    body: RefreshIn, use_case: Annotated[RefreshSession, Depends(get_refresh_session)]
) -> SessionOut:
    """Rota el refresh token; si se reutiliza uno ya rotado, revoca la sesión (RNF-SEC-003)."""
    return _session(await use_case(body.refresh_token))


@auth.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshIn, use_case: Annotated[Logout, Depends(get_logout)]) -> Response:
    await use_case(body.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=MeOut, tags=["auth"])
async def me(
    current: Annotated[CurrentUser, Depends(get_current_user)],
    query: Annotated[GetMe, Depends(get_me_query)],
) -> MeOut:
    return _me(await query(current))


router.include_router(auth)
