from datetime import datetime, timezone
import unittest

from jarvis_trader.market_dashboard import (
    DashboardInstrument,
    StooqDelayedCsvSource,
    build_dashboard_snapshot,
)


class MarketDashboardTest(unittest.TestCase):
    def test_marks_key_required_without_price(self) -> None:
        instrument = DashboardInstrument(
            id="samsung",
            name="삼성전자",
            category="kr_stocks",
            market="KR",
            display_symbol="005930",
            api_required=True,
            api_hint="KRX API 필요",
        )
        snapshot = build_dashboard_snapshot(
            instruments=[instrument],
            source=StooqDelayedCsvSource(http_get=lambda _url, _timeout: ""),
            generated_at=datetime(2026, 6, 1, tzinfo=timezone.utc),
        )

        item = snapshot["categories"][-1]["items"][0]

        self.assertEqual(item["status"], "API 필요")
        self.assertIsNone(item["price"])
        self.assertIn("KRX", item["message"])

    def test_parses_stooq_csv_without_synthetic_values(self) -> None:
        csv_text = (
            "Symbol,Date,Time,Open,High,Low,Close,Volume\n"
            "AAPL.US,2026-05-29,22:00:19,311.775,315,309.53,312.06,70026752\n"
        )
        source = StooqDelayedCsvSource(http_get=lambda _url, _timeout: csv_text)
        instrument = DashboardInstrument(
            id="aapl",
            name="Apple",
            category="us_stocks",
            market="US",
            display_symbol="AAPL",
            stooq_symbol="aapl.us",
            unit="USD",
        )

        quote = source.fetch(instrument)

        self.assertEqual(quote.status, "지연 데이터")
        self.assertEqual(quote.price, 312.06)
        self.assertEqual(quote.volume, 70026752)
        self.assertAlmostEqual(quote.change or 0.0, 0.285)

    def test_missing_csv_close_does_not_fake_price(self) -> None:
        csv_text = "Symbol,Date,Time,Open,High,Low,Close,Volume\n005930.KR,N/D,N/D,N/D,N/D,N/D,N/D,N/D\n"
        source = StooqDelayedCsvSource(http_get=lambda _url, _timeout: csv_text)
        instrument = DashboardInstrument(
            id="005930",
            name="삼성전자",
            category="kr_stocks",
            market="KR",
            display_symbol="005930",
            stooq_symbol="005930.kr",
        )

        quote = source.fetch(instrument)

        self.assertEqual(quote.status, "데이터 없음")
        self.assertIsNone(quote.price)


if __name__ == "__main__":
    unittest.main()
