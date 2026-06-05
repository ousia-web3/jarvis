from __future__ import annotations

from math import floor

from .config import RiskLimits
from .models import OrderIntent, Portfolio, RiskDecision, Side


class RiskShield:
    def __init__(self, limits: RiskLimits) -> None:
        self.limits = limits
        self.kill_switch_reason: str | None = None

    def engage_kill_switch(self, reason: str) -> None:
        self.kill_switch_reason = reason

    def clear_kill_switch(self) -> None:
        self.kill_switch_reason = None

    def size_order(self, portfolio: Portfolio, price: float) -> float:
        if price <= 0:
            return 0.0
        equity = portfolio.equity()
        max_value = equity * self.limits.max_order_value_pct / 100.0
        quantity = max_value / price
        if not self.limits.allow_fractional:
            quantity = floor(quantity)
        return max(0.0, quantity)

    def assess(self, intent: OrderIntent, portfolio: Portfolio, price: float) -> RiskDecision:
        reasons: list[str] = []
        equity = portfolio.equity({intent.symbol: price})
        day_return = portfolio.day_return_pct({intent.symbol: price})
        order_value = intent.quantity * price
        current_position = portfolio.positions.get(intent.symbol)
        current_value = (current_position.quantity * price) if current_position else 0.0

        if self.kill_switch_reason:
            reasons.append(f"kill switch engaged: {self.kill_switch_reason}")
        if intent.quantity <= 0:
            reasons.append("quantity must be positive")
        if price <= 0:
            reasons.append("price must be positive")
        if intent.confidence < self.limits.min_confidence:
            reasons.append(
                f"confidence {intent.confidence:.2f} below minimum {self.limits.min_confidence:.2f}"
            )
        if self.limits.allowed_symbols and intent.symbol not in self.limits.allowed_symbols:
            reasons.append(f"{intent.symbol} is not in the allowed symbol list")
        if day_return < -abs(self.limits.max_daily_loss_pct):
            reasons.append(
                f"daily return {day_return:.2f}% breached max loss {self.limits.max_daily_loss_pct:.2f}%"
            )
        if (
            self.limits.halt_after_profit_target
            and day_return >= self.limits.daily_profit_target_pct
        ):
            reasons.append(
                f"daily target {self.limits.daily_profit_target_pct:.2f}% reached; halt new orders"
            )
        if order_value > equity * self.limits.max_order_value_pct / 100.0:
            reasons.append(
                f"order value exceeds {self.limits.max_order_value_pct:.2f}% of equity"
            )

        if intent.side == Side.BUY:
            projected_position_value = current_value + order_value
            if projected_position_value > equity * self.limits.max_position_value_pct / 100.0:
                reasons.append(
                    f"projected position exceeds {self.limits.max_position_value_pct:.2f}% of equity"
                )
            projected_cash = portfolio.cash - order_value
            min_cash = equity * self.limits.min_cash_buffer_pct / 100.0
            if projected_cash < min_cash:
                reasons.append(
                    f"cash buffer would fall below {self.limits.min_cash_buffer_pct:.2f}%"
                )

        if intent.side == Side.SELL:
            held_quantity = current_position.quantity if current_position else 0.0
            if intent.quantity > held_quantity and not self.limits.allow_short:
                reasons.append("short selling is disabled and sell quantity exceeds holdings")

        if reasons:
            return RiskDecision.block(*reasons)
        return RiskDecision.pass_()
