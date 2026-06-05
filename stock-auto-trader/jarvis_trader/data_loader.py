from __future__ import annotations

import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from .models import Candle, Market


def load_candles(path: str | Path) -> list[Candle]:
    candles: list[Candle] = []
    with Path(path).open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            candles.append(
                Candle(
                    symbol=row["symbol"].strip().upper(),
                    market=Market(row["market"].strip().upper()),
                    timestamp=datetime.fromisoformat(row["timestamp"].strip()),
                    open=float(row["open"]),
                    high=float(row["high"]),
                    low=float(row["low"]),
                    close=float(row["close"]),
                    volume=int(row["volume"]),
                )
            )
    return sorted(candles, key=lambda candle: (candle.symbol, candle.timestamp))


def group_by_symbol(candles: list[Candle]) -> dict[str, list[Candle]]:
    grouped: dict[str, list[Candle]] = defaultdict(list)
    for candle in candles:
        grouped[candle.symbol].append(candle)
    return dict(grouped)
