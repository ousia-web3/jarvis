from __future__ import annotations

from .config import StrategyConfig
from .models import Candle, Signal, Side


class MovingAverageMomentumStrategy:
    """Simple baseline strategy for simulator and adapter tests."""

    def __init__(self, config: StrategyConfig) -> None:
        if config.fast_window <= 0 or config.slow_window <= 0:
            raise ValueError("strategy windows must be positive")
        if config.fast_window >= config.slow_window:
            raise ValueError("fast_window must be smaller than slow_window")
        self.config = config

    def generate(self, candles: list[Candle]) -> Signal:
        if not candles:
            raise ValueError("at least one candle is required")

        latest = candles[-1]
        if len(candles) < self.config.slow_window:
            return Signal(
                symbol=latest.symbol,
                market=latest.market,
                side=None,
                confidence=0.0,
                reason="not enough candles for slow moving average",
            )

        closes = [candle.close for candle in candles]
        fast = sum(closes[-self.config.fast_window :]) / self.config.fast_window
        slow = sum(closes[-self.config.slow_window :]) / self.config.slow_window
        edge_pct = (fast - slow) / slow * 100.0 if slow else 0.0
        confidence = min(0.95, max(0.0, abs(edge_pct) / 2.0 + 0.5))

        if edge_pct > self.config.momentum_threshold_pct:
            return Signal(
                symbol=latest.symbol,
                market=latest.market,
                side=Side.BUY,
                confidence=confidence,
                reason=f"fast MA above slow MA by {edge_pct:.2f}%",
            )
        if edge_pct < -self.config.momentum_threshold_pct:
            return Signal(
                symbol=latest.symbol,
                market=latest.market,
                side=Side.SELL,
                confidence=confidence,
                reason=f"fast MA below slow MA by {edge_pct:.2f}%",
            )
        return Signal(
            symbol=latest.symbol,
            market=latest.market,
            side=None,
            confidence=confidence,
            reason=f"MA edge {edge_pct:.2f}% inside no-trade band",
        )
