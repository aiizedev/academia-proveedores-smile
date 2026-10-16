"""Composition root de la API (arquitectura.md §3.2)."""

from __future__ import annotations

import importlib
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
from smile.shared.infrastructure.event_bus import event_bus

API_PREFIX = "/api/v1"


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
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        structlog.contextvars.bind_contextvars(request_id=request_id)
        health.count_request()
        response = await call_next(request)
        response.headers["x-request-id"] = request_id
        structlog.contextvars.clear_contextvars()
        return response

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
