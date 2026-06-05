from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Protocol

from .models import Market


class DataIntegrationBlocked(RuntimeError):
    pass


@dataclass(frozen=True)
class MarketDataSnapshot:
    symbol: str
    market: Market
    timestamp: datetime
    price: float
    bid: float | None = None
    ask: float | None = None
    volume: int | None = None
    source: str = "unknown"
    latency_ms: int = 0
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass(frozen=True)
class DataQualityPolicy:
    max_age_seconds: int = 5
    max_spread_pct: float = 3.0
    max_latency_ms: int = 3000


@dataclass(frozen=True)
class DataQualityReport:
    accepted: bool
    reasons: tuple[str, ...] = ()

    @classmethod
    def pass_(cls) -> "DataQualityReport":
        return cls(accepted=True)

    @classmethod
    def reject(cls, *reasons: str) -> "DataQualityReport":
        return cls(False, tuple(reason for reason in reasons if reason))


class RealtimeDataSource(Protocol):
    name: str

    def fetch_snapshot(self, symbol: str, market: Market) -> MarketDataSnapshot:
        raise NotImplementedError


def validate_snapshot(
    snapshot: MarketDataSnapshot,
    policy: DataQualityPolicy,
    reference_time: datetime | None = None,
) -> DataQualityReport:
    reasons: list[str] = []
    reference_time = reference_time or datetime.now(timezone.utc)

    if snapshot.timestamp.tzinfo is None:
        reasons.append("timestamp must include timezone")
    else:
        age_seconds = abs((reference_time - snapshot.timestamp).total_seconds())
        if age_seconds > policy.max_age_seconds:
            reasons.append(
                f"snapshot age {age_seconds:.2f}s exceeds {policy.max_age_seconds}s"
            )

    if snapshot.price <= 0:
        reasons.append("price must be positive")
    if snapshot.volume is not None and snapshot.volume < 0:
        reasons.append("volume cannot be negative")
    if snapshot.latency_ms > policy.max_latency_ms:
        reasons.append(
            f"latency {snapshot.latency_ms}ms exceeds {policy.max_latency_ms}ms"
        )
    if snapshot.bid is not None and snapshot.ask is not None:
        if snapshot.bid <= 0 or snapshot.ask <= 0:
            reasons.append("bid and ask must be positive")
        elif snapshot.bid > snapshot.ask:
            reasons.append("bid cannot be greater than ask")
        else:
            midpoint = (snapshot.bid + snapshot.ask) / 2.0
            spread_pct = (snapshot.ask - snapshot.bid) / midpoint * 100.0
            if spread_pct > policy.max_spread_pct:
                reasons.append(
                    f"spread {spread_pct:.2f}% exceeds {policy.max_spread_pct:.2f}%"
                )

    if reasons:
        return DataQualityReport.reject(*reasons)
    return DataQualityReport.pass_()


class MarketDataStore:
    def __init__(self, policy: DataQualityPolicy | None = None) -> None:
        self.policy = policy or DataQualityPolicy()
        self._snapshots: dict[str, MarketDataSnapshot] = {}

    def update(
        self,
        snapshot: MarketDataSnapshot,
        reference_time: datetime | None = None,
    ) -> DataQualityReport:
        report = validate_snapshot(snapshot, self.policy, reference_time)
        if report.accepted:
            self._snapshots[snapshot.symbol] = snapshot
        return report

    def latest(self, symbol: str) -> MarketDataSnapshot | None:
        return self._snapshots.get(symbol)


class TossRealtimePlaceholderSource:
    name = "toss-realtime-placeholder"

    def fetch_snapshot(self, symbol: str, market: Market) -> MarketDataSnapshot:
        raise DataIntegrationBlocked(
            "Toss Securities realtime market data is blocked until official API "
            "documentation, sandbox access, rate limits, and approval are configured."
        )
