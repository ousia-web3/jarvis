from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path


@dataclass(frozen=True)
class RiskLimits:
    daily_profit_target_pct: float = 25.0
    min_daily_profit_target_pct: float = 25.0
    max_daily_loss_pct: float = 0.0
    max_order_value_pct: float = 2.0
    max_position_value_pct: float = 8.0
    min_cash_buffer_pct: float = 20.0
    min_confidence: float = 0.55
    halt_after_profit_target: bool = True
    allow_short: bool = False
    allow_fractional: bool = False
    allowed_symbols: tuple[str, ...] = ()


@dataclass(frozen=True)
class StrategyConfig:
    fast_window: int = 3
    slow_window: int = 5
    momentum_threshold_pct: float = 0.15


@dataclass(frozen=True)
class BrokerConfig:
    name: str = "paper"
    live_trading_enabled: bool = False
    paper_starting_cash: float = 10_000_000.0
    require_human_approval_for_live: bool = True


@dataclass(frozen=True)
class MarketRoutingConfig:
    rotate_kr_us: bool = True
    allow_kr_nxt_extended: bool = True
    allow_us_extended: bool = True
    allow_us_overnight_when_approved: bool = False


@dataclass(frozen=True)
class TeamConfig:
    mode_name: str = "agent-awakening-paper-mode"
    markets: tuple[str, ...] = ("KR", "US")
    risk: RiskLimits = field(default_factory=RiskLimits)
    strategy: StrategyConfig = field(default_factory=StrategyConfig)
    broker: BrokerConfig = field(default_factory=BrokerConfig)
    market_routing: MarketRoutingConfig = field(default_factory=MarketRoutingConfig)


def _tuple(value: object) -> tuple[str, ...]:
    if value is None:
        return ()
    if isinstance(value, str):
        return (value,)
    return tuple(str(item) for item in value)


def load_config(path: str | Path | None = None) -> TeamConfig:
    if path is None:
        return TeamConfig()

    data = json.loads(Path(path).read_text(encoding="utf-8"))
    risk_data = data.get("risk", {})
    strategy_data = data.get("strategy", {})
    broker_data = data.get("broker", {})
    routing_data = data.get("market_routing", {})
    min_daily_profit_target_pct = float(
        risk_data.get("min_daily_profit_target_pct", 25.0)
    )
    daily_profit_target_pct = max(
        float(risk_data.get("daily_profit_target_pct", 25.0)),
        min_daily_profit_target_pct,
    )

    risk = RiskLimits(
        daily_profit_target_pct=daily_profit_target_pct,
        min_daily_profit_target_pct=min_daily_profit_target_pct,
        max_daily_loss_pct=float(risk_data.get("max_daily_loss_pct", 0.0)),
        max_order_value_pct=float(risk_data.get("max_order_value_pct", 2.0)),
        max_position_value_pct=float(risk_data.get("max_position_value_pct", 8.0)),
        min_cash_buffer_pct=float(risk_data.get("min_cash_buffer_pct", 20.0)),
        min_confidence=float(risk_data.get("min_confidence", 0.55)),
        halt_after_profit_target=bool(risk_data.get("halt_after_profit_target", True)),
        allow_short=bool(risk_data.get("allow_short", False)),
        allow_fractional=bool(risk_data.get("allow_fractional", False)),
        allowed_symbols=_tuple(risk_data.get("allowed_symbols")),
    )
    strategy = StrategyConfig(
        fast_window=int(strategy_data.get("fast_window", 3)),
        slow_window=int(strategy_data.get("slow_window", 5)),
        momentum_threshold_pct=float(strategy_data.get("momentum_threshold_pct", 0.15)),
    )
    broker = BrokerConfig(
        name=str(broker_data.get("name", "paper")),
        live_trading_enabled=bool(broker_data.get("live_trading_enabled", False)),
        paper_starting_cash=float(broker_data.get("paper_starting_cash", 10_000_000.0)),
        require_human_approval_for_live=bool(
            broker_data.get("require_human_approval_for_live", True)
        ),
    )
    market_routing = MarketRoutingConfig(
        rotate_kr_us=bool(routing_data.get("rotate_kr_us", True)),
        allow_kr_nxt_extended=bool(routing_data.get("allow_kr_nxt_extended", True)),
        allow_us_extended=bool(routing_data.get("allow_us_extended", True)),
        allow_us_overnight_when_approved=bool(
            routing_data.get("allow_us_overnight_when_approved", False)
        ),
    )
    return TeamConfig(
        mode_name=str(data.get("mode_name", "agent-awakening-paper-mode")),
        markets=_tuple(data.get("markets", ("KR", "US"))),
        risk=risk,
        strategy=strategy,
        broker=broker,
        market_routing=market_routing,
    )
