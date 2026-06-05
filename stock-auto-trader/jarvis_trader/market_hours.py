from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, time
from zoneinfo import ZoneInfo

from .models import Market


@dataclass(frozen=True)
class MarketWindow:
    market: Market
    name: str
    timezone: str
    open_time: time
    close_time: time
    approved_for_orders: bool = True


KR_REGULAR = MarketWindow(
    market=Market.KR,
    name="KRX regular",
    timezone="Asia/Seoul",
    open_time=time(9, 0),
    close_time=time(15, 30),
)

KR_NXT_EXTENDED = MarketWindow(
    market=Market.KR,
    name="NXT extended paper watch",
    timezone="Asia/Seoul",
    open_time=time(8, 0),
    close_time=time(20, 0),
)

US_REGULAR = MarketWindow(
    market=Market.US,
    name="US regular",
    timezone="America/New_York",
    open_time=time(9, 30),
    close_time=time(16, 0),
)

US_EXTENDED = MarketWindow(
    market=Market.US,
    name="US extended watch",
    timezone="America/New_York",
    open_time=time(4, 0),
    close_time=time(20, 0),
)

US_OVERNIGHT_PENDING = MarketWindow(
    market=Market.US,
    name="US overnight pending approval",
    timezone="America/New_York",
    open_time=time(21, 0),
    close_time=time(4, 0),
    approved_for_orders=False,
)


def is_weekday(moment: datetime, timezone: str) -> bool:
    local = moment.astimezone(ZoneInfo(timezone))
    return local.weekday() < 5


def is_inside_window(moment: datetime, window: MarketWindow) -> bool:
    local = moment.astimezone(ZoneInfo(window.timezone))
    if local.weekday() >= 5:
        return False
    current = local.time()
    if window.open_time > window.close_time:
        return current >= window.open_time or current <= window.close_time
    return window.open_time <= current <= window.close_time


def windows_for_market(
    market: Market,
    allow_kr_nxt_extended: bool = True,
    allow_us_extended: bool = True,
    allow_us_overnight_when_approved: bool = False,
) -> tuple[MarketWindow, ...]:
    if market == Market.KR:
        return (KR_NXT_EXTENDED,) if allow_kr_nxt_extended else (KR_REGULAR,)
    if market == Market.US:
        windows = [US_EXTENDED if allow_us_extended else US_REGULAR]
        if allow_us_overnight_when_approved:
            windows.append(US_OVERNIGHT_PENDING)
        return tuple(windows)
    return ()


def active_window(
    moment: datetime,
    market: Market,
    allow_kr_nxt_extended: bool = True,
    allow_us_extended: bool = True,
    allow_us_overnight_when_approved: bool = False,
) -> MarketWindow | None:
    for window in windows_for_market(
        market,
        allow_kr_nxt_extended,
        allow_us_extended,
        allow_us_overnight_when_approved,
    ):
        if window.approved_for_orders and is_inside_window(moment, window):
            return window
    return None


def paper_trade_allowed(
    moment: datetime,
    market: Market,
    allow_kr_nxt_extended: bool = True,
    allow_us_extended: bool = True,
    allow_us_overnight_when_approved: bool = False,
) -> bool:
    return (
        active_window(
            moment,
            market,
            allow_kr_nxt_extended,
            allow_us_extended,
            allow_us_overnight_when_approved,
        )
        is not None
    )
