"""Dependencia `require(permission)` (HU-IAM-03). Se publica en `iam.public`."""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status

from smile.modules.iam.domain.permissions import Permission, has_permission
from smile.shared.api.deps import get_current_user
from smile.shared.application.ports import CurrentUser


def require(permission: Permission) -> Callable[[CurrentUser], CurrentUser]:
    """Uso: `user: Annotated[CurrentUser, Depends(require(Permission.VIEW_SUPPLIERS))]`.

    Sin sesión → 401; rol sin el permiso → 403. La propiedad del recurso se verifica en
    el caso de uso con `CurrentUser.ensure_supplier_access` (404, RNF-SEC-004).
    """

    def _check(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if not has_permission(user.role, permission):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No tiene permiso para esta acción")
        return user

    return _check
