from __future__ import annotations

from collections import defaultdict
from typing import Callable, DefaultDict, List, Protocol

from .base import BaseEvent


class EventHandler(Protocol):
    def __call__(self, event: BaseEvent) -> None: ...


class EventDispatcher:
    """Simple in-memory dispatcher for domain events."""

    def __init__(self) -> None:
        self._subscribers: DefaultDict[str, List[EventHandler]] = defaultdict(list)

    def subscribe(self, event_name: str, handler: EventHandler) -> None:
        self._subscribers[event_name].append(handler)

    def dispatch(self, event: BaseEvent) -> None:
        for handler in self._subscribers.get(event.name, []):
            handler(event)


event_dispatcher = EventDispatcher()

