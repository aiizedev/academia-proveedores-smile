"""Bus de eventos en memoria: los módulos registran handlers en `module.py`."""

from __future__ import annotations

from collections import defaultdict
from collections.abc import Awaitable, Callable

Handler = Callable[[dict[str, object]], Awaitable[None]]


class InMemoryEventBus:
    def __init__(self) -> None:
        self._handlers: dict[str, list[Handler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: Handler) -> None:
        self._handlers[event_name].append(handler)

    def handlers_for(self, event_name: str) -> list[Handler]:
        return list(self._handlers.get(event_name, []))

    async def publish(self, event_name: str, payload: dict[str, object]) -> None:
        for handler in self.handlers_for(event_name):
            await handler(payload)


event_bus = InMemoryEventBus()
