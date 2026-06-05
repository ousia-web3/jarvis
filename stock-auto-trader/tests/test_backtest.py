from pathlib import Path
import unittest

from jarvis_trader.backtest import run_backtest
from jarvis_trader.config import load_config
from jarvis_trader.data_loader import load_candles


class BacktestTest(unittest.TestCase):
    def test_sample_backtest_runs_without_live_broker(self) -> None:
        config = load_config("configs/trader.example.json")
        candles = load_candles(Path("data/sample_candles.csv"))

        summary = run_backtest(candles, config)

        self.assertEqual(summary.starting_cash, 10000000)
        self.assertGreater(summary.ending_equity, 0)
        self.assertEqual(set(summary.symbols), {"005930", "AAPL"})

    def test_config_enforces_twenty_five_percent_target_floor(self) -> None:
        config = load_config()

        self.assertGreaterEqual(
            config.risk.daily_profit_target_pct,
            config.risk.min_daily_profit_target_pct,
        )
        self.assertGreaterEqual(config.risk.daily_profit_target_pct, 25.0)


if __name__ == "__main__":
    unittest.main()
