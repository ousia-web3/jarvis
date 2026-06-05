from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any


class Market(str, Enum):
    KR = "KR"
    US = "US"


class Side(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderType(str, Enum):
    MARKET = "MARKET"
    LIMIT = "LIMIT"


class OrderStatus(str, Enum):
    BLOCKED = "BLOCKED"
    ACCEPTED = "ACCEPTED"
    FILLED = "FILLED"
    REJECTED = "REJECTED"


@dataclass(frozen=True)
class Candle:
    symbol: str
    market: Market
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


@dataclass(frozen=True)
class Signal:
    symbol: str
    market: Market
    side: Side | None
    confidence: float
    reason: str


@dataclass(frozen=True)
class OrderIntent:
    symbol: str
    market: Market
    side: Side
    quantity: float
    order_type: OrderType = OrderType.MARKET
    limit_price: float | None = None
    reason: str = ""
    confidence: float = 0.0


@dataclass(frozen=True)
class RiskDecision:
    allowed: bool
    reasons: tuple[str, ...] = ()

    @classmethod
    def pass_(cls) -> "RiskDecision":
        return cls(allowed=True)

    @classmethod
    def block(cls, *reasons: str) -> "RiskDecision":
        return cls(allowed=False, reasons=tuple(reason for reason in reasons if reason))


@dataclass
class Position:
    symbol: str
    market: Market
    quantity: float
    average_price: float

    @property
    def market_value_at_cost(self) -> float:
        return self.quantity * self.average_price


@dataclass
class Portfolio:
    cash: float
    day_start_equity: float
    positions: dict[str, Position] = field(default_factory=dict)
    realized_pnl: float = 0.0

    def equity(self, prices: dict[str, float] | None = None) -> float:
        prices = prices or {}
        position_value = 0.0
        for symbol, position in self.positions.items():
            price = prices.get(symbol, position.average_price)
            position_value += position.quantity * price
        return self.cash + position_value

    def day_return_pct(self, prices: dict[str, float] | None = None) -> float:
        if self.day_start_equity <= 0:
            return 0.0
        return (self.equity(prices) - self.day_start_equity) / self.day_start_equity * 100.0


@dataclass(frozen=True)
class OrderResult:
    status: OrderStatus
    intent: OrderIntent
    message: str
    fill_price: float | None = None
    filled_quantity: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class AgentMessage:
    to: str
    cc: tuple[str, ...]
    subject: str
    body: str
