"""Composition root de la API (arquitectura.md §3.2)."""

from __future__ import annotations

import importlib
import re
import time
import uuid
from collections.abc import Awaitable, Callable

import structlog
from fastapi import APIRouter, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from smile.config import get_settings
from smile.modules import MODULE_NAMES
from smile.observability import configure_logging
from smile.shared.api import health
from smile.shared.api.errors import install_error_handlers
from smile.shared.api.gzip_request import GzipRequestMiddleware
from smile.shared.infrastructure.event_bus import event_bus

API_PREFIX = "/api/v1"
_REQUEST_ID = re.compile(r"[A-Za-z0-9._-]{1,64}")
access_log = structlog.get_logger("smile.access")


def _route_template(request: Request) -> str:
    """Ruta como plantilla (`/api/v1/suppliers/{id}`): la URL real puede llevar datos."""
    if request.scope.get("route") is None:
        return "unmatched"
    params = {str(v): k for k, v in request.path_params.items()}
    return "/".join(
        f"{{{params[seg]}}}" if seg in params else seg for seg in request.url.path.split("/")
    )


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)
    app = FastAPI(
        title="Academia de Proveedores Smile API",
        version="0.1.0",
        openapi_url=f"{API_PREFIX}/openapi.json",
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None,
    )
    app.add_middleware(GzipRequestMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def request_context(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        incoming = request.headers.get("x-request-id", "")
        request_id = incoming if _REQUEST_ID.fullmatch(incoming) else str(uuid.uuid4())
        request.state.request_id = request_id
        structlog.contextvars.bind_contextvars(request_id=request_id)
        health.count_request()
        started = time.perf_counter()
        try:
            response = await call_next(request)
            response.headers["x-request-id"] = request_id
            access_log.info(
                "request",
                method=request.method,
                route=_route_template(request),
                status=response.status_code,
                duration_ms=round((time.perf_counter() - started) * 1000, 1),
            )
            return response
        finally:
            structlog.contextvars.clear_contextvars()

    install_error_handlers(app)
    app.include_router(health.router)

    api = APIRouter(prefix=API_PREFIX)
    for name in MODULE_NAMES:
        module = importlib.import_module(f"smile.modules.{name}.module")
        api.include_router(module.router)
        app.dependency_overrides.update(module.dependency_overrides)
        module.register_handlers(event_bus)
    app.include_router(api)
    return app


app = create_app()
