from __future__ import annotations

from jarvis_trader.models import (
    Market,
    OrderIntent,
    OrderResult,
    OrderStatus,
    Portfolio,
    Position,
    Side,
)

from .base import BrokerAdapter


class PaperBroker(BrokerAdapter):
    name = "paper"

    def __init__(self, starting_cash: float) -> None:
        self._portfolio = Portfolio(cash=starting_cash, day_start_equity=starting_cash)
        self.orders: list[OrderResult] = []

    def portfolio(self) -> Portfolio:
        return self._portfolio

    def place_order(self, intent: OrderIntent, price: float) -> OrderResult:
        if price <= 0 or intent.quantity <= 0:
            return self._record(OrderStatus.REJECTED, intent, "invalid price or quantity")

        if intent.side == Side.BUY:
            return self._buy(intent, price)
        return self._sell(intent, price)

    def _buy(self, intent: OrderIntent, price: float) -> OrderResult:
        cost = intent.quantity * price
        if cost > self._portfolio.cash:
            return self._record(OrderStatus.REJECTED, intent, "insufficient paper cash")

        position = self._portfolio.positions.get(intent.symbol)
        if position is None:
            self._portfolio.positions[intent.symbol] = Position(
                symbol=intent.symbol,
                market=intent.market,
                quantity=intent.quantity,
                average_price=price,
            )
        else:
            total_quantity = position.quantity + intent.quantity
            total_cost = position.quantity * position.average_price + cost
            position.quantity = total_quantity
            position.average_price = total_cost / total_quantity
        self._portfolio.cash -= cost
        return self._record(OrderStatus.FILLED, intent, "paper buy filled", price)

    def _sell(self, intent: OrderIntent, price: float) -> OrderResult:
        position = self._portfolio.positions.get(intent.symbol)
        held_quantity = position.quantity if position else 0.0
        if intent.quantity > held_quantity:
            return self._record(OrderStatus.REJECTED, intent, "insufficient paper holdings")

        proceeds = intent.quantity * price
        if position is None:
            market = Market.US
            average_price = price
        else:
            market = position.market
            average_price = position.average_price
            position.quantity -= intent.quantity
            if position.quantity <= 0:
                self._portfolio.positions.pop(intent.symbol, None)

        self._portfolio.cash += proceeds
        self._portfolio.realized_pnl += (price - average_price) * intent.quantity
        return self._record(OrderStatus.FILLED, intent, "paper sell filled", price)

    def _record(
        self,
        status: OrderStatus,
        intent: OrderIntent,
        message: str,
        fill_price: float | None = None,
    ) -> OrderResult:
        result = OrderResult(
            status=status,
            intent=intent,
            message=message,
            fill_price=fill_price,
            filled_quantity=intent.quantity if status == OrderStatus.FILLED else 0.0,
        )
        self.orders.append(result)
        return result
