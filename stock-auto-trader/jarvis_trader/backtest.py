from __future__ import annotations

from dataclasses import dataclass

from .agents import JarvisTraderTeam
from .brokers.paper import PaperBroker
from .config import TeamConfig
from .data_loader import group_by_symbol
from .models import Candle, OrderStatus


@dataclass(frozen=True)
class BacktestSummary:
    starting_cash: float
    ending_equity: float
    return_pct: float
    filled_orders: int
    blocked_orders: int
    symbols: tuple[str, ...]


def run_backtest(candles: list[Candle], config: TeamConfig) -> BacktestSummary:
    broker = PaperBroker(config.broker.paper_starting_cash)
    team = JarvisTraderTeam(config=config, broker=broker)
    grouped = group_by_symbol(candles)
    blocked_orders = 0

    for symbol, symbol_candles in grouped.items():
        rolling: list[Candle] = []
        for candle in symbol_candles:
            rolling.append(candle)
            result = team.run_once(rolling)
            if result.order and result.order.status == OrderStatus.BLOCKED:
                blocked_orders += 1

    latest_prices = {
        symbol: symbol_candles[-1].close for symbol, symbol_candles in grouped.items()
    }
    ending_equity = broker.portfolio().equity(latest_prices)
    starting_cash = config.broker.paper_starting_cash
    return_pct = (
        (ending_equity - starting_cash) / starting_cash * 100.0 if starting_cash else 0.0
    )
    filled_orders = sum(1 for order in broker.orders if order.status == OrderStatus.FILLED)
    return BacktestSummary(
        starting_cash=starting_cash,
        ending_equity=ending_equity,
        return_pct=return_pct,
        filled_orders=filled_orders,
        blocked_orders=blocked_orders,
        symbols=tuple(grouped.keys()),
    )
