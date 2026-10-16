"""Matriz de permisos por rol (requerimientos §2.3, RF-IAM-004)."""

from enum import StrEnum

from smile.shared.application.ports import Role


class Permission(StrEnum):
    READ_CATALOG = "read_catalog"
    SUPPLIER_SELF_SERVICE = "supplier_self_service"  # ficha, diagnóstico, plan, Mini ERP propios
    REPLY_MESSAGES = "reply_messages"
    VIEW_SUPPLIERS = "view_suppliers"  # expedientes, scores y etapas
    VIEW_ERP_AGGREGATES = "view_erp_aggregates"  # nunca transacciones individuales
    RECORD_RECEPTIONS = "record_receptions"  # recepciones, visitas, incidentes
    VERIFY_DOCUMENTS = "verify_documents"
    MANAGE_FLOWERS = "manage_flowers"
    SEND_MESSAGES = "send_messages"
    VALIDATE_GOALS = "validate_goals"
    EXPORT_REPORTS = "export_reports"
    SET_PARETO_SEGMENT = "set_pareto_segment"
    OVERRIDE_STAGE = "override_stage"
    MANAGE_CONTENT = "manage_content"  # banco, guías, contenidos, catálogos, parámetros
    MANAGE_USERS = "manage_users"
    MANAGE_PRIVACY_REQUESTS = "manage_privacy_requests"


_INTERNAL = frozenset(
    {
        Permission.READ_CATALOG,
        Permission.VIEW_SUPPLIERS,
        Permission.VIEW_ERP_AGGREGATES,
        Permission.RECORD_RECEPTIONS,
        Permission.VERIFY_DOCUMENTS,
        Permission.MANAGE_FLOWERS,
        Permission.SEND_MESSAGES,
        Permission.VALIDATE_GOALS,
        Permission.EXPORT_REPORTS,
    }
)

PERMISSIONS: dict[Role, frozenset[Permission]] = {
    Role.PROVEEDOR: frozenset(
        {Permission.READ_CATALOG, Permission.SUPPLIER_SELF_SERVICE, Permission.REPLY_MESSAGES}
    ),
    Role.REVIEWER: _INTERNAL,
    Role.ADMIN: _INTERNAL
    | {
        Permission.SET_PARETO_SEGMENT,
        Permission.OVERRIDE_STAGE,
        Permission.MANAGE_CONTENT,
        Permission.MANAGE_USERS,
        Permission.MANAGE_PRIVACY_REQUESTS,
    },
}


def has_permission(role: Role, permission: Permission) -> bool:
    return permission in PERMISSIONS[role]
