"""Traduce errores a HTTP con cuerpo uniforme (PLAN_BACKEND §6.3, HU-PLAT-02).

`{"error": {"code", "message", "details", "request_id"}}`. Los detalles de validación
nunca incluyen el valor recibido (puede contener datos personales, RNF-OBS-001).
"""

from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from smile.shared.domain.errors import (
    AuthenticationError,
    ConflictError,
    DomainError,
    LockedError,
    NotFoundError,
    PermissionDeniedError,
    ValidationFailedError,
)

_DOMAIN_STATUS: tuple[tuple[type[DomainError], int], ...] = (
    (NotFoundError, 404),
    (PermissionDeniedError, 403),
    (ConflictError, 409),
    (AuthenticationError, 401),
    (LockedError, 423),
    (ValidationFailedError, 400),
)
_HTTP_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "permission_denied",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    413: "payload_too_large",
    423: "locked",
    429: "rate_limited",
}
log = structlog.get_logger("smile.api")


def error_response(
    request: Request, status: int, code: str, message: str, details: Any = None
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=status,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details,
                "request_id": request_id,
            }
        },
        headers={"x-request-id": request_id} if request_id else None,
    )


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain(request: Request, exc: DomainError) -> JSONResponse:
        status = next((s for t, s in _DOMAIN_STATUS if isinstance(exc, t)), 422)
        return error_response(request, status, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def _validation(request: Request, exc: RequestValidationError) -> JSONResponse:
        details = [
            {"loc": list(e.get("loc", ())), "type": e.get("type"), "msg": e.get("msg")}
            for e in exc.errors()
        ]
        return error_response(
            request, 400, "validation_error", "La solicitud no es válida", details
        )

    @app.exception_handler(HTTPException)
    async def _http(request: Request, exc: HTTPException) -> JSONResponse:
        code = _HTTP_CODES.get(exc.status_code, "http_error")
        response = error_response(request, exc.status_code, code, str(exc.detail))
        if exc.headers:
            response.headers.update(exc.headers)
        return response

    @app.exception_handler(Exception)
    async def _unexpected(request: Request, exc: Exception) -> JSONResponse:
        log.exception("unhandled_error", error_type=type(exc).__name__)
        return error_response(request, 500, "internal_error", "Error interno")
