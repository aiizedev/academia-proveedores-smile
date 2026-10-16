"""Logs JSON estructurados (RNF-OBS-001, HU-PLAT-06). Nunca registrar datos personales."""

import logging
import re
from collections.abc import MutableMapping
from typing import Any

import structlog

#: Campos que nunca se registran, aunque un desarrollador los pase al logger.
PII_KEYS = frozenset(
    {"email", "phone", "document_number", "name", "full_name", "password", "nit", "token"}
)
_PHONE = re.compile(r"(?<!\d)(?:\+?57)?3\d{9}(?!\d)")
_EMAIL = re.compile(r"[^@\s\"']+@[^@\s\"']+\.[a-zA-Z]{2,}")
REDACTED = "[redactado]"


def _scrub(value: Any) -> Any:
    if isinstance(value, str):
        return _EMAIL.sub(REDACTED, _PHONE.sub(REDACTED, value))
    if isinstance(value, dict):
        return {k: REDACTED if k in PII_KEYS else _scrub(v) for k, v in value.items()}
    if isinstance(value, list | tuple):
        return [_scrub(v) for v in value]
    return value


def redact_pii(_: Any, __: str, event_dict: MutableMapping[str, Any]) -> MutableMapping[str, Any]:
    """Procesador structlog: oculta campos de PII conocidos y celulares/correos en texto."""
    for key, value in list(event_dict.items()):
        event_dict[key] = REDACTED if key in PII_KEYS else _scrub(value)
    return event_dict


def configure_logging(level: str) -> None:
    logging.basicConfig(level=level, format="%(message)s")
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.TimeStamper(fmt="iso", utc=True),
            redact_pii,
            structlog.processors.format_exc_info,
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.getLevelName(level)),
    )
