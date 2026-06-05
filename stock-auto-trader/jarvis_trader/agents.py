from __future__ import annotations

from dataclasses import dataclass

from .brokers.base import BrokerAdapter
from .config import TeamConfig
from .market_router import MarketRouter
from .models import AgentMessage, Candle, OrderIntent, OrderResult, OrderStatus, Signal
from .risk import RiskShield
from .strategies import MovingAverageMomentumStrategy


@dataclass(frozen=True)
class TeamRunResult:
    messages: tuple[AgentMessage, ...]
    signal: Signal
    order: OrderResult | None


class JarvisTraderTeam:
    def __init__(self, config: TeamConfig, broker: BrokerAdapter) -> None:
        self.config = config
        self.broker = broker
        self.strategy = MovingAverageMomentumStrategy(config.strategy)
        self.risk = RiskShield(config.risk)
        self.router = MarketRouter(config.market_routing)

    def run_once(self, candles: list[Candle]) -> TeamRunResult:
        if not candles:
            raise ValueError("candles cannot be empty")

        messages: list[AgentMessage] = [
            AgentMessage(
                to="Jarvis",
                cc=("Friday", "Data", "KITT/TRON"),
                subject="Human Brief translated",
                body=(
                    "Operate in paper-first KR/US rotation mode. Treat the minimum "
                    "25% daily target as a strategy benchmark and stop target, "
                    "never as a promised outcome."
                ),
            )
        ]
        latest = candles[-1]
        route = self.router.route(latest.market, latest.timestamp)
        messages.append(
            AgentMessage(
                to="Friday",
                cc=("Jarvis", "Data", "KITT/TRON"),
                subject="Market route checked",
                body=route.reason,
            )
        )
        if not route.allowed:
            blocked_signal = Signal(
                symbol=latest.symbol,
                market=latest.market,
                side=None,
                confidence=0.0,
                reason=route.reason,
            )
            return TeamRunResult(tuple(messages), blocked_signal, None)

        signal = self.strategy.generate(candles)
        side_label = signal.side.value if signal.side else "HOLD"
        messages.append(
            AgentMessage(
                to="Friday",
                cc=("Jarvis", "TARS"),
                subject="Signal generated",
                body=f"{signal.symbol}: {side_label} ({signal.reason})",
            )
        )

        if signal.side is None:
            return TeamRunResult(tuple(messages), signal, None)

        portfolio = self.broker.portfolio()
        quantity = self.risk.size_order(portfolio, latest.close)
        intent = OrderIntent(
            symbol=signal.symbol,
            market=signal.market,
            side=signal.side,
            quantity=quantity,
            reason=signal.reason,
            confidence=signal.confidence,
        )
        risk_decision = self.risk.assess(intent, portfolio, latest.close)
        if not risk_decision.allowed:
            blocked = OrderResult(
                status=OrderStatus.BLOCKED,
                intent=intent,
                message="; ".join(risk_decision.reasons),
            )
            messages.append(
                AgentMessage(
                    to="KITT/TRON",
                    cc=("Jarvis", "Friday", "Data"),
                    subject="Order blocked",
                    body=blocked.message,
                )
            )
            return TeamRunResult(tuple(messages), signal, blocked)

        result = self.broker.place_order(intent, latest.close)
        messages.append(
            AgentMessage(
                to="TARS",
                cc=("Jarvis", "Friday", "KITT/TRON"),
                subject="Paper execution result",
                body=f"{result.status.value}: {result.message}",
            )
        )
        return TeamRunResult(tuple(messages), signal, result)
