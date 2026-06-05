import unittest

from jarvis_trader.config import RiskLimits
from jarvis_trader.models import Market, OrderIntent, Portfolio, Side
from jarvis_trader.risk import RiskShield


class RiskShieldTest(unittest.TestCase):
    def test_zero_loss_tolerance_blocks_when_day_return_is_negative(self) -> None:
        shield = RiskShield(RiskLimits(max_daily_loss_pct=0.0))
        portfolio = Portfolio(cash=990.0, day_start_equity=1000.0)
        intent = OrderIntent(
            symbol="AAPL",
            market=Market.US,
            side=Side.BUY,
            quantity=1,
            confidence=0.9,
        )

        decision = shield.assess(intent, portfolio, price=100.0)

        self.assertFalse(decision.allowed)
        self.assertTrue(any("daily return" in reason for reason in decision.reasons))

    def test_short_sell_is_blocked_without_holdings(self) -> None:
        shield = RiskShield(RiskLimits(allow_short=False))
        portfolio = Portfolio(cash=1000.0, day_start_equity=1000.0)
        intent = OrderIntent(
            symbol="AAPL",
            market=Market.US,
            side=Side.SELL,
            quantity=1,
            confidence=0.9,
        )

        decision = shield.assess(intent, portfolio, price=100.0)

        self.assertFalse(decision.allowed)
        self.assertTrue(any("short selling" in reason for reason in decision.reasons))


if __name__ == "__main__":
    unittest.main()
