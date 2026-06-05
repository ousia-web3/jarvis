from __future__ import annotations

from datetime import datetime, timezone
import unittest

from jarvis_trader.models import Candle, Market
from jarvis_trader.virtual_training import (
    TrainingMode,
    TrainingPolicy,
    TrainingRiskGrade,
    VirtualTrainingArena,
    train_until_success,
)


def make_candle(day: int, symbol: str = "GOAL") -> Candle:
    return Candle(
        symbol=f"{symbol}{day}",
        market=Market.US,
        timestamp=datetime(2026, 5, day, 9, 30, tzinfo=timezone.utc),
        open=10.0,
        high=13.0,
        low=9.5,
        close=12.8,
        volume=10_000,
    )


class VirtualTrainingArenaTest(unittest.TestCase):
    def test_oracle_teacher_reaches_strict_daily_target(self) -> None:
        candles = [make_candle(1), make_candle(2)]
        policy = TrainingPolicy(
            label="strict oracle",
            daily_target_pct=25.0,
            max_participation_pct=100.0,
            max_single_position_pct=100.0,
            min_positions=1,
            max_positions=1,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        )

        result = VirtualTrainingArena(starting_capital=1_000.0).run_episode(
            candles,
            policy,
            required_days=2,
            mode=TrainingMode.ORACLE_TEACHER,
        )

        self.assertTrue(result.success)
        self.assertEqual(result.risk_grade, TrainingRiskGrade.D_ORACLE_ONLY)
        self.assertEqual(result.successful_days, 2)
        self.assertGreaterEqual(min(day.day_return_pct for day in result.days), 25.0)

    def test_liquidity_capacity_can_block_required_deployment(self) -> None:
        candles = [make_candle(1)]
        policy = TrainingPolicy(
            label="capacity blocked",
            daily_target_pct=25.0,
            max_participation_pct=1.0,
            max_single_position_pct=25.0,
            min_positions=1,
            max_positions=1,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        )

        result = VirtualTrainingArena(starting_capital=1_000.0).run_episode(
            candles,
            policy,
            required_days=1,
            mode=TrainingMode.ORACLE_TEACHER,
        )

        self.assertFalse(result.success)
        self.assertEqual(result.days[0].reason, "deployment below required threshold")
        self.assertLess(result.days[0].deployed_pct, 95.0)

    def test_train_until_success_selects_first_successful_policy(self) -> None:
        candles = [make_candle(1), make_candle(2)]
        blocked = TrainingPolicy(
            label="blocked first",
            daily_target_pct=25.0,
            max_participation_pct=1.0,
            max_single_position_pct=25.0,
            min_positions=1,
            max_positions=1,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        )
        successful = TrainingPolicy(
            label="successful second",
            daily_target_pct=25.0,
            max_participation_pct=100.0,
            max_single_position_pct=100.0,
            min_positions=1,
            max_positions=1,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        )

        result = train_until_success(
            candles,
            [blocked, successful],
            required_days=2,
            starting_capital=1_000.0,
        )

        self.assertTrue(result.success)
        self.assertEqual(result.policy.label, "successful second")

    def test_shadow_student_rejects_oracle_policy(self) -> None:
        policy = TrainingPolicy(label="oracle", allow_oracle_teacher=True)

        with self.assertRaises(ValueError):
            VirtualTrainingArena().run_episode(
                [make_candle(1)],
                policy,
                required_days=1,
                mode=TrainingMode.SHADOW_STUDENT,
            )


if __name__ == "__main__":
    unittest.main()
