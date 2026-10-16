"""Traduce errores de dominio a respuestas HTTP con cuerpo uniforme."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from smile.shared.domain.errors import DomainError, NotFoundError, PermissionDeniedError

_STATUS = {NotFoundError: 404, PermissionDeniedError: 403}


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainError)
    async def _domain_error(_: Request, exc: DomainError) -> JSONResponse:
        status = next((s for t, s in _STATUS.items() if isinstance(exc, t)), 422)
        return JSONResponse(status_code=status, content={"code": exc.code, "message": exc.message})
