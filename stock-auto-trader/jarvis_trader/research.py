from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .models import Market


@dataclass(frozen=True)
class ResearchSource:
    name: str
    market: Market | None
    kind: str
    url: str
    owner: str
    cc: tuple[str, ...]
    note: str


@dataclass(frozen=True)
class ResearchItem:
    title: str
    summary: str
    source_name: str
    source_url: str
    timestamp: datetime
    market: Market | None = None
    symbol: str | None = None
    tags: tuple[str, ...] = ()


@dataclass(frozen=True)
class ResearchBrief:
    headline: str
    market: Market | None
    symbol: str | None
    issue_count: int
    high_priority_count: int
    items: tuple[ResearchItem, ...]
    agent_actions: tuple[str, ...]


def default_research_sources() -> tuple[ResearchSource, ...]:
    return (
        ResearchSource(
            name="OpenDART",
            market=Market.KR,
            kind="official disclosure api",
            url="https://engopendart.fss.or.kr/intro/main.do",
            owner="EVE",
            cc=("Data", "KITT/TRON"),
            note="Korean corporate disclosure and filings source.",
        ),
        ResearchSource(
            name="KRX Data Marketplace",
            market=Market.KR,
            kind="licensed realtime market data",
            url="https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA002.jsp",
            owner="Data",
            cc=("TARS", "KITT/TRON"),
            note="KRX realtime data requires proper data licensing.",
        ),
        ResearchSource(
            name="SEC EDGAR APIs",
            market=Market.US,
            kind="official disclosure api",
            url="https://www.sec.gov/edgar/sec-api-documentation",
            owner="EVE",
            cc=("Data", "KITT/TRON"),
            note="US company facts and filing data from SEC EDGAR.",
        ),
        ResearchSource(
            name="Broker API Placeholder",
            market=None,
            kind="future broker realtime/order api",
            url="https://www.tossinvest.com/",
            owner="TARS",
            cc=("Jarvis", "KITT/TRON", "Data"),
            note="Toss Securities trading and realtime API remains blocked until official access exists.",
        ),
    )


HIGH_PRIORITY_TAGS = {
    "halt",
    "suspension",
    "delisting",
    "fraud",
    "investigation",
    "bankruptcy",
    "cybersecurity",
    "rate",
    "fomc",
    "earnings",
    "guidance",
}


class IssueResearchEngine:
    def build_brief(
        self,
        items: list[ResearchItem],
        market: Market | None = None,
        symbol: str | None = None,
    ) -> ResearchBrief:
        scoped = [
            item
            for item in items
            if (market is None or item.market in (None, market))
            and (symbol is None or item.symbol in (None, symbol))
        ]
        high_priority = [
            item
            for item in scoped
            if any(tag.lower() in HIGH_PRIORITY_TAGS for tag in item.tags)
        ]
        headline = "No blocking market issues found"
        actions = ["Data: keep monitoring source freshness and issue tags"]
        if high_priority:
            headline = "High-priority market issues require Risk Shield review"
            actions = (
                "EVE: summarize source evidence",
                "Data: quantify affected symbols and data freshness",
                "KITT/TRON: check disclosure, licensing, and compliance risk",
                "Jarvis: decide whether to pause new entries",
            )

        return ResearchBrief(
            headline=headline,
            market=market,
            symbol=symbol,
            issue_count=len(scoped),
            high_priority_count=len(high_priority),
            items=tuple(scoped),
            agent_actions=tuple(actions),
        )
