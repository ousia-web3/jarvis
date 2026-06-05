from datetime import datetime
import unittest

from jarvis_trader.config import MarketRoutingConfig
from jarvis_trader.market_router import MarketRouter
from jarvis_trader.models import Market


class MarketRouterTest(unittest.TestCase):
    def test_routes_korea_nxt_extended_session(self) -> None:
        router = MarketRouter(MarketRoutingConfig(allow_kr_nxt_extended=True))

        route = router.route(Market.KR, datetime.fromisoformat("2026-05-18T19:00:00+09:00"))

        self.assertTrue(route.allowed)
        self.assertIsNotNone(route.window)
        self.assertIn("NXT", route.window.name)

    def test_blocks_us_after_approved_extended_window(self) -> None:
        router = MarketRouter(MarketRoutingConfig(allow_us_extended=True))

        route = router.route(Market.US, datetime.fromisoformat("2026-05-18T20:30:00-04:00"))

        self.assertFalse(route.allowed)
        self.assertIn("outside", route.reason)


if __name__ == "__main__":
    unittest.main()
