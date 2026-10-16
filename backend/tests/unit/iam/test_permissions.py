"""Matriz §2.3 y propiedad del recurso (HU-IAM-03)."""

import uuid

import pytest

from smile.modules.iam.domain.permissions import Permission, has_permission
from smile.shared.application.ports import CurrentUser, Role
from smile.shared.domain.errors import NotFoundError


@pytest.mark.parametrize(
    ("role", "permission", "allowed"),
    [
        (Role.PROVEEDOR, Permission.SUPPLIER_SELF_SERVICE, True),
        (Role.PROVEEDOR, Permission.RECORD_RECEPTIONS, False),
        (Role.PROVEEDOR, Permission.VIEW_SUPPLIERS, False),
        (Role.REVIEWER, Permission.RECORD_RECEPTIONS, True),
        (Role.REVIEWER, Permission.SUPPLIER_SELF_SERVICE, False),
        (Role.REVIEWER, Permission.SET_PARETO_SEGMENT, False),
        (Role.REVIEWER, Permission.MANAGE_USERS, False),
        (Role.ADMIN, Permission.SET_PARETO_SEGMENT, True),
        (Role.ADMIN, Permission.MANAGE_USERS, True),
        (Role.ADMIN, Permission.RECORD_RECEPTIONS, True),
    ],
)
def test_matrix(role: Role, permission: Permission, allowed: bool) -> None:
    assert has_permission(role, permission) is allowed


def test_every_role_reads_catalog() -> None:
    assert all(has_permission(r, Permission.READ_CATALOG) for r in Role)


def test_supplier_cannot_access_other_supplier_404() -> None:
    a, b = uuid.uuid4(), uuid.uuid4()
    user = CurrentUser(id=uuid.uuid4(), role=Role.PROVEEDOR, supplier_id=a)
    user.ensure_supplier_access(a)
    with pytest.raises(NotFoundError):
        user.ensure_supplier_access(b)


def test_internal_roles_pass_ownership_check() -> None:
    CurrentUser(id=uuid.uuid4(), role=Role.REVIEWER).ensure_supplier_access(uuid.uuid4())
