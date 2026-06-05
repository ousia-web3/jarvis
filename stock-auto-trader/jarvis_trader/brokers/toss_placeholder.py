from __future__ import annotations

from jarvis_trader.models import OrderIntent, OrderResult, Portfolio

from .base import BrokerAdapter, LiveTradingBlocked


class TossSecuritiesPlaceholderAdapter(BrokerAdapter):
    """Future Toss Securities adapter.

    No public trading API contract is assumed here. This adapter deliberately
    raises until a signed API agreement, official documentation, test account,
    and Human Conductor approval are available.
    """

    name = "toss-placeholder"

    def __init__(self, live_trading_enabled: bool = False) -> None:
        self.live_trading_enabled = live_trading_enabled

    def portfolio(self) -> Portfolio:
        raise LiveTradingBlocked(
            "Toss Securities live portfolio access is blocked until official API docs "
            "and explicit approval are configured."
        )

    def place_order(self, intent: OrderIntent, price: float) -> OrderResult:
        raise LiveTradingBlocked(
            "Toss Securities live order placement is blocked by design. Use paper mode "
            "or implement this adapter only after official API access and review."
        )
