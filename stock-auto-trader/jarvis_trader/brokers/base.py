from __future__ import annotations

from abc import ABC, abstractmethod

from jarvis_trader.models import OrderIntent, OrderResult, Portfolio


class LiveTradingBlocked(RuntimeError):
    pass


class BrokerAdapter(ABC):
    name: str

    @abstractmethod
    def portfolio(self) -> Portfolio:
        raise NotImplementedError

    @abstractmethod
    def place_order(self, intent: OrderIntent, price: float) -> OrderResult:
        raise NotImplementedError
