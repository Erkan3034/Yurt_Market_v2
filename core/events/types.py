from dataclasses import dataclass, field
from typing import Any, Dict

from .base import BaseEvent


@dataclass(frozen=True, slots=True)
class OrderCreatedEvent(BaseEvent):
    name: str = "order_created"
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class StockDecreasedEvent(BaseEvent):
    name: str = "stock_decreased"
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class ProductOutOfStockEvent(BaseEvent):
    name: str = "product_out_of_stock"
    payload: Dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True, slots=True)
class SubscriptionActivatedEvent(BaseEvent):
    name: str = "subscription_activated"
    payload: Dict[str, Any] = field(default_factory=dict)

