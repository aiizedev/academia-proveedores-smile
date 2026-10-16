"""Dependencias FastAPI compartidas: UnitOfWork y usuario actual.

`get_current_user` es un placeholder: valida el JWT emitido por `iam` y construye
`CurrentUser`. El módulo `iam` reemplazará la emisión de tokens (RF-IAM-002).
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from smile.config import get_settings
from smile.shared.application.ports import CurrentUser, Role
from smile.shared.infrastructure.db import get_sessionmaker
from smile.shared.infrastructure.uow import SqlAlchemyUnitOfWork

_bearer = HTTPBearer(auto_error=False)


async def get_uow() -> AsyncIterator[SqlAlchemyUnitOfWork]:
    async with SqlAlchemyUnitOfWork(get_sessionmaker()) as uow:
        yield uow


def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> CurrentUser:
    if creds is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    try:
        claims = jwt.decode(creds.credentials, get_settings().jwt_secret, algorithms=["HS256"])
        supplier = claims.get("supplier_id")
        return CurrentUser(
            id=uuid.UUID(claims["sub"]),
            role=Role(claims["role"]),
            supplier_id=uuid.UUID(supplier) if supplier else None,
        )
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido") from exc


def require_roles(*roles: Role):  # type: ignore[no-untyped-def]
    """Uso: `Depends(require_roles(Role.ADMIN))` (matriz de permisos, requerimientos §2.3)."""

    def _check(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Permiso denegado")
        return user

    return _check
