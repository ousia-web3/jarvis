from datetime import datetime, timedelta, timezone
import unittest

from jarvis_trader.models import Market
from jarvis_trader.realtime_data import (
    DataIntegrationBlocked,
    DataQualityPolicy,
    MarketDataSnapshot,
    MarketDataStore,
    TossRealtimePlaceholderSource,
)


class RealtimeDataTest(unittest.TestCase):
    def test_accepts_fresh_snapshot(self) -> None:
        now = datetime.now(timezone.utc)
        store = MarketDataStore(DataQualityPolicy(max_age_seconds=5))
        snapshot = MarketDataSnapshot(
            symbol="AAPL",
            market=Market.US,
            timestamp=now,
            price=200.0,
            bid=199.9,
            ask=200.1,
            volume=1000,
            source="paper",
            latency_ms=20,
        )

        report = store.update(snapshot, reference_time=now)

        self.assertTrue(report.accepted)
        self.assertEqual(store.latest("AAPL"), snapshot)

    def test_rejects_stale_snapshot(self) -> None:
        now = datetime.now(timezone.utc)
        store = MarketDataStore(DataQualityPolicy(max_age_seconds=5))
        snapshot = MarketDataSnapshot(
            symbol="AAPL",
            market=Market.US,
            timestamp=now - timedelta(seconds=10),
            price=200.0,
            source="paper",
        )

        report = store.update(snapshot, reference_time=now)

        self.assertFalse(report.accepted)
        self.assertIsNone(store.latest("AAPL"))

    def test_rejects_wide_spread(self) -> None:
        now = datetime.now(timezone.utc)
        store = MarketDataStore(DataQualityPolicy(max_spread_pct=1.0))
        snapshot = MarketDataSnapshot(
            symbol="005930",
            market=Market.KR,
            timestamp=now,
            price=80000,
            bid=78000,
            ask=82000,
            source="paper",
        )

        report = store.update(snapshot, reference_time=now)

        self.assertFalse(report.accepted)
        self.assertTrue(any("spread" in reason for reason in report.reasons))

    def test_toss_realtime_placeholder_is_blocked(self) -> None:
        source = TossRealtimePlaceholderSource()

        with self.assertRaises(DataIntegrationBlocked):
            source.fetch_snapshot("AAPL", Market.US)


if __name__ == "__main__":
    unittest.main()
