from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from math import floor

from .models import Candle, Market


class TrainingMode(str, Enum):
    ORACLE_TEACHER = "oracle-teacher"
    SHADOW_STUDENT = "shadow-student"


class TrainingRiskGrade(str, Enum):
    A_REALISTIC = "A_REALISTIC"
    B_AGGRESSIVE = "B_AGGRESSIVE"
    C_EXTREME = "C_EXTREME"
    D_ORACLE_ONLY = "D_ORACLE_ONLY"


@dataclass(frozen=True)
class VirtualTick:
    symbol: str
    market: Market
    timestamp: datetime
    price: float
    volume: int
    phase: str


@dataclass(frozen=True)
class TrainingPolicy:
    label: str
    daily_target_pct: float = 25.0
    min_price: float = 0.0
    max_price: float = 1_000_000.0
    min_day_notional: float = 0.0
    max_participation_pct: float = 1.0
    min_positions: int = 1
    max_positions: int = 5
    max_single_position_pct: float = 25.0
    roundtrip_cost_pct: float = 0.0
    required_deploy_pct: float = 95.0
    allow_oracle_teacher: bool = False


@dataclass(frozen=True)
class VirtualPositionPlan:
    symbol: str
    market: Market
    entry: float
    target_exit: float
    high: float
    shares: int
    entry_cost: float
    exit_value: float
    participation_pct: float
    day_notional: float


@dataclass(frozen=True)
class TrainingDayResult:
    date: date
    success: bool
    reason: str
    capital_before: float
    capital_after: float
    day_return_pct: float
    deployed_pct: float
    positions: tuple[VirtualPositionPlan, ...] = ()


@dataclass(frozen=True)
class TrainingResult:
    success: bool
    mode: TrainingMode
    policy: TrainingPolicy
    risk_grade: TrainingRiskGrade
    days: tuple[TrainingDayResult, ...]
    starting_capital: float
    ending_capital: float
    return_pct: float
    metadata: dict[str, object] = field(default_factory=dict)

    @property
    def successful_days(self) -> int:
        return sum(1 for day in self.days if day.success)


class MarketTwinReplay:
    """Replay candles as deterministic virtual market ticks."""

    def __init__(self, candles: list[Candle]) -> None:
        self.candles = sorted(candles, key=lambda item: (item.timestamp, item.symbol))

    def ticks(self) -> list[VirtualTick]:
        output: list[VirtualTick] = []
        for candle in self.candles:
            phase_volume = max(1, candle.volume // 4)
            output.extend(
                [
                    VirtualTick(candle.symbol, candle.market, candle.timestamp, candle.open, phase_volume, "open"),
                    VirtualTick(candle.symbol, candle.market, candle.timestamp, candle.high, phase_volume, "high"),
                    VirtualTick(candle.symbol, candle.market, candle.timestamp, candle.low, phase_volume, "low"),
                    VirtualTick(candle.symbol, candle.market, candle.timestamp, candle.close, phase_volume, "close"),
                ]
            )
        return output

    def daily_candles(self) -> dict[date, list[Candle]]:
        grouped: dict[date, list[Candle]] = defaultdict(list)
        for candle in self.candles:
            grouped[candle.timestamp.date()].append(candle)
        return dict(sorted(grouped.items(), key=lambda item: item[0]))


def risk_grade(policy: TrainingPolicy) -> TrainingRiskGrade:
    if policy.allow_oracle_teacher:
        return TrainingRiskGrade.D_ORACLE_ONLY
    if policy.max_participation_pct <= 1.0 and policy.max_single_position_pct <= 25.0:
        return TrainingRiskGrade.A_REALISTIC
    if policy.max_participation_pct <= 5.0:
        return TrainingRiskGrade.B_AGGRESSIVE
    return TrainingRiskGrade.C_EXTREME


class VirtualTrainingArena:
    def __init__(self, starting_capital: float = 1_000_000.0) -> None:
        if starting_capital <= 0:
            raise ValueError("starting_capital must be positive")
        self.starting_capital = starting_capital

    def run_episode(
        self,
        candles: list[Candle],
        policy: TrainingPolicy,
        required_days: int | None = None,
        mode: TrainingMode = TrainingMode.ORACLE_TEACHER,
    ) -> TrainingResult:
        if policy.min_positions <= 0 or policy.max_positions < policy.min_positions:
            raise ValueError("policy position bounds are invalid")
        if policy.daily_target_pct <= 0:
            raise ValueError("daily target must be positive")
        if required_days is not None and required_days <= 0:
            raise ValueError("required_days must be positive")
        if mode == TrainingMode.SHADOW_STUDENT and policy.allow_oracle_teacher:
            raise ValueError("shadow student mode cannot use an oracle teacher policy")

        twin = MarketTwinReplay(candles)
        days = twin.daily_candles()
        required_days = required_days or len(days)
        capital = self.starting_capital
        results: list[TrainingDayResult] = []

        for day, day_candles in list(days.items())[:required_days]:
            result = self._run_day(day, day_candles, capital, policy, mode)
            results.append(result)
            if not result.success:
                capital = result.capital_after
                break
            capital = result.capital_after

        success = len(results) >= required_days and all(day.success for day in results)
        return TrainingResult(
            success=success,
            mode=mode,
            policy=policy,
            risk_grade=risk_grade(policy),
            days=tuple(results),
            starting_capital=self.starting_capital,
            ending_capital=capital,
            return_pct=(capital / self.starting_capital - 1.0) * 100.0,
            metadata={
                "required_days": required_days,
                "available_days": len(days),
                "oracle_warning": policy.allow_oracle_teacher,
            },
        )

    def _run_day(
        self,
        day: date,
        candles: list[Candle],
        capital: float,
        policy: TrainingPolicy,
        mode: TrainingMode,
    ) -> TrainingDayResult:
        candidates = self._eligible_candidates(candles, capital, policy, mode)
        if len(candidates) < policy.min_positions:
            return TrainingDayResult(
                date=day,
                success=False,
                reason="not enough target-reaching candidates",
                capital_before=capital,
                capital_after=capital,
                day_return_pct=0.0,
                deployed_pct=0.0,
            )

        buy_cost_pct = policy.roundtrip_cost_pct / 200.0
        positions: list[VirtualPositionPlan] = []
        remaining = capital
        for candle, liquidity_capacity in candidates[: policy.max_positions]:
            per_share_cost = candle.open * (1.0 + buy_cost_pct)
            max_cost = min(liquidity_capacity, remaining)
            shares = floor(max_cost / per_share_cost)
            if shares <= 0:
                continue
            entry_cost = shares * per_share_cost
            remaining -= entry_cost
            positions.append(
                VirtualPositionPlan(
                    symbol=candle.symbol,
                    market=candle.market,
                    entry=candle.open,
                    target_exit=0.0,
                    high=candle.high,
                    shares=shares,
                    entry_cost=entry_cost,
                    exit_value=0.0,
                    participation_pct=shares / candle.volume * 100.0 if candle.volume else 0.0,
                    day_notional=candle.open * candle.volume,
                )
            )
            if len(positions) >= policy.min_positions:
                deployed_pct = (capital - remaining) / capital * 100.0
                if deployed_pct >= policy.required_deploy_pct:
                    break

        deployed = sum(position.entry_cost for position in positions)
        deployed_ratio = deployed / capital if capital else 0.0
        if len(positions) < policy.min_positions:
            return self._failed_day(day, capital, remaining, positions, "not enough sized positions")
        if deployed_ratio * 100.0 < policy.required_deploy_pct:
            return self._failed_day(day, capital, remaining, positions, "deployment below required threshold")

        required_position_target = (policy.daily_target_pct / 100.0) / deployed_ratio
        adjusted_positions: list[VirtualPositionPlan] = []
        sell_cost_pct = policy.roundtrip_cost_pct / 200.0
        for position in positions:
            target_exit = (
                position.entry
                * (1.0 + buy_cost_pct)
                * (1.0 + required_position_target)
                / (1.0 - sell_cost_pct)
            )
            if position.high + 1e-12 < target_exit:
                return self._failed_day(day, capital, remaining, positions, "target exit above day high")
            exit_value = position.shares * target_exit * (1.0 - sell_cost_pct)
            adjusted_positions.append(
                VirtualPositionPlan(
                    symbol=position.symbol,
                    market=position.market,
                    entry=position.entry,
                    target_exit=target_exit,
                    high=position.high,
                    shares=position.shares,
                    entry_cost=position.entry_cost,
                    exit_value=exit_value,
                    participation_pct=position.participation_pct,
                    day_notional=position.day_notional,
                )
            )

        capital_after = remaining + sum(position.exit_value for position in adjusted_positions)
        day_return_pct = (capital_after / capital - 1.0) * 100.0
        success = day_return_pct + 1e-9 >= policy.daily_target_pct
        return TrainingDayResult(
            date=day,
            success=success,
            reason="target reached" if success else "target missed after sizing",
            capital_before=capital,
            capital_after=capital_after,
            day_return_pct=day_return_pct,
            deployed_pct=deployed_ratio * 100.0,
            positions=tuple(adjusted_positions),
        )

    def _eligible_candidates(
        self,
        candles: list[Candle],
        capital: float,
        policy: TrainingPolicy,
        mode: TrainingMode,
    ) -> list[tuple[Candle, float]]:
        buy_cost_pct = policy.roundtrip_cost_pct / 200.0
        sell_cost_pct = policy.roundtrip_cost_pct / 200.0
        estimated_position_target = (policy.daily_target_pct / 100.0) / max(
            policy.required_deploy_pct / 100.0,
            0.01,
        )
        output: list[tuple[Candle, float]] = []
        for candle in candles:
            if candle.open < policy.min_price or candle.open > policy.max_price:
                continue
            if candle.volume <= 0 or candle.open <= 0:
                continue
            day_notional = candle.open * candle.volume
            if day_notional < policy.min_day_notional:
                continue
            liquidity_capacity = min(
                day_notional * policy.max_participation_pct / 100.0,
                capital * policy.max_single_position_pct / 100.0,
            )
            target_exit = (
                candle.open
                * (1.0 + buy_cost_pct)
                * (1.0 + estimated_position_target)
                / (1.0 - sell_cost_pct)
            )
            if mode == TrainingMode.ORACLE_TEACHER and policy.allow_oracle_teacher:
                if candle.high < target_exit:
                    continue
            else:
                momentum = (candle.close / candle.open - 1.0) * 100.0
                if momentum < policy.daily_target_pct / 5.0:
                    continue
            output.append((candle, liquidity_capacity))

        output.sort(
            reverse=True,
            key=lambda item: (
                item[1],
                (item[0].high / item[0].open - 1.0) if item[0].open else 0.0,
                item[0].volume,
            ),
        )
        return output

    def _failed_day(
        self,
        day: date,
        capital: float,
        remaining: float,
        positions: list[VirtualPositionPlan],
        reason: str,
    ) -> TrainingDayResult:
        deployed = sum(position.entry_cost for position in positions)
        return TrainingDayResult(
            date=day,
            success=False,
            reason=reason,
            capital_before=capital,
            capital_after=remaining + deployed,
            day_return_pct=0.0,
            deployed_pct=deployed / capital * 100.0 if capital else 0.0,
            positions=tuple(positions),
        )


def train_until_success(
    candles: list[Candle],
    policies: list[TrainingPolicy],
    required_days: int,
    starting_capital: float = 1_000_000.0,
) -> TrainingResult:
    if not policies:
        raise ValueError("at least one training policy is required")
    if required_days <= 0:
        raise ValueError("required_days must be positive")
    arena = VirtualTrainingArena(starting_capital)
    results = [
        arena.run_episode(
            candles,
            policy,
            required_days=required_days,
            mode=TrainingMode.ORACLE_TEACHER
            if policy.allow_oracle_teacher
            else TrainingMode.SHADOW_STUDENT,
        )
        for policy in policies
    ]
    for result in results:
        if result.success:
            return result
    return max(
        results,
        key=lambda item: (
            item.successful_days,
            item.return_pct,
            -item.policy.max_participation_pct,
        ),
    )


def default_training_ladder(target_pct: float = 25.0) -> list[TrainingPolicy]:
    return [
        TrainingPolicy(
            label="A realistic shadow gate",
            daily_target_pct=target_pct,
            min_price=5.0,
            min_day_notional=50_000_000.0,
            max_participation_pct=1.0,
            max_single_position_pct=25.0,
            min_positions=2,
            max_positions=5,
            roundtrip_cost_pct=2.5,
            required_deploy_pct=95.0,
            allow_oracle_teacher=False,
        ),
        TrainingPolicy(
            label="B aggressive shadow gate",
            daily_target_pct=target_pct,
            min_price=2.0,
            min_day_notional=10_000_000.0,
            max_participation_pct=5.0,
            max_single_position_pct=35.0,
            min_positions=2,
            max_positions=5,
            roundtrip_cost_pct=1.5,
            required_deploy_pct=94.0,
            allow_oracle_teacher=False,
        ),
        TrainingPolicy(
            label="C oracle teacher extreme",
            daily_target_pct=target_pct,
            min_price=0.75,
            min_day_notional=500_000.0,
            max_participation_pct=20.0,
            max_single_position_pct=50.0,
            min_positions=1,
            max_positions=5,
            roundtrip_cost_pct=0.6,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        ),
        TrainingPolicy(
            label="D oracle stress only",
            daily_target_pct=target_pct,
            min_price=0.75,
            min_day_notional=100_000.0,
            max_participation_pct=30.0,
            max_single_position_pct=50.0,
            min_positions=1,
            max_positions=5,
            roundtrip_cost_pct=0.5,
            required_deploy_pct=95.0,
            allow_oracle_teacher=True,
        ),
    ]
