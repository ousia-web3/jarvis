from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .config import MarketRoutingConfig
from .market_hours import MarketWindow, active_window
from .models import Market


@dataclass(frozen=True)
class MarketRoute:
    market: Market
    allowed: bool
    window: MarketWindow | None
    reason: str


class MarketRouter:
    def __init__(self, config: MarketRoutingConfig) -> None:
        self.config = config

    def route(self, market: Market, moment: datetime) -> MarketRoute:
        if not self.config.rotate_kr_us:
            return MarketRoute(
                market=market,
                allowed=True,
                window=None,
                reason="market rotation disabled; paper route allowed",
            )

        window = active_window(
            moment,
            market,
            allow_kr_nxt_extended=self.config.allow_kr_nxt_extended,
            allow_us_extended=self.config.allow_us_extended,
            allow_us_overnight_when_approved=self.config.allow_us_overnight_when_approved,
        )
        if window is None:
            return MarketRoute(
                market=market,
                allowed=False,
                window=None,
                reason=f"{market.value} market is outside approved paper trading sessions",
            )
        return MarketRoute(
            market=market,
            allowed=True,
            window=window,
            reason=f"{market.value} routed through {window.name}",
        )
