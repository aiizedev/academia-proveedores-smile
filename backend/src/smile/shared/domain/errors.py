"""Errores de dominio. La capa api los traduce a HTTP (shared/api/errors.py)."""


class DomainError(Exception):
    """Violación de una regla de negocio. HTTP 422."""

    code: str = "domain_error"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        if code:
            self.code = code


class NotFoundError(DomainError):
    """Recurso inexistente o no visible para el usuario. HTTP 404."""

    code = "not_found"


class PermissionDeniedError(DomainError):
    """El usuario no puede operar sobre el recurso (RF-IAM-004). HTTP 403."""

    code = "permission_denied"


class ConflictError(DomainError):
    """Conflicto con el estado actual (p. ej. ALREADY_SUBMITTED). HTTP 409."""

    code = "conflict"


class AuthenticationError(DomainError):
    """Credenciales o sesión inválidas. HTTP 401."""

    code = "unauthenticated"


class LockedError(DomainError):
    """Recurso bloqueado temporalmente (p. ej. cuenta tras intentos fallidos). HTTP 423."""

    code = "locked"


class ValidationFailedError(DomainError):
    """Un registro no cumple la forma esperada (p. ej. en sync). HTTP 400."""

    code = "validation_error"
