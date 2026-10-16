"""Límite de peticiones en memoria por clave (RNF-SEC-005).

Ventana deslizante de 60 s. En memoria del proceso: suficiente para el POC con una
réplica; con varias réplicas se mueve a PostgreSQL o Redis.
"""

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: float = 60.0) -> None:
        self.limit = limit
        self.window = window_seconds
        self._hits: defaultdict[str, deque[float]] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] >= self.window:
            hits.popleft()
        if len(hits) >= self.limit:
            return False
        hits.append(now)
        return True


def rate_limit(name: str, limit: int):  # type: ignore[no-untyped-def]
    """Dependencia FastAPI: un limitador por app (`app.state`) y por IP del cliente."""

    def _check(request: Request) -> None:
        state = request.app.state
        if not hasattr(state, "rate_limiters"):
            state.rate_limiters = {}
        limiters: dict[str, SlidingWindowLimiter] = state.rate_limiters
        limiter = limiters.setdefault(name, SlidingWindowLimiter(limit))
        ip = request.client.host if request.client else "unknown"
        if not limiter.allow(ip):
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                "Demasiados intentos. Espere un minuto e intente de nuevo",
                headers={"Retry-After": str(int(limiter.window))},
            )

    return _check
