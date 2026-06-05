from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Iterable, Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


HttpGet = Callable[[str, int], str]


CATEGORY_LABELS: dict[str, str] = {
    "us_stocks": "미국 주식",
    "etfs": "ETF",
    "indices": "지수",
    "rates": "금리",
    "commodities": "원자재",
    "fx": "환율",
    "kr_stocks": "한국 주식",
}


@dataclass(frozen=True)
class DashboardInstrument:
    id: str
    name: str
    category: str
    market: str
    display_symbol: str
    stooq_symbol: str | None = None
    unit: str = ""
    api_required: bool = False
    api_hint: str = ""
    note: str = ""


@dataclass(frozen=True)
class DashboardQuote:
    instrument: DashboardInstrument
    status: str
    status_level: str
    price: float | None = None
    open: float | None = None
    high: float | None = None
    low: float | None = None
    volume: int | None = None
    change: float | None = None
    change_pct: float | None = None
    source: str = ""
    source_symbol: str = ""
    source_timestamp: str = ""
    fetched_at: str = ""
    message: str = ""

    def as_dict(self) -> dict[str, Any]:
        return {
            "id": self.instrument.id,
            "name": self.instrument.name,
            "category": self.instrument.category,
            "category_label": CATEGORY_LABELS[self.instrument.category],
            "market": self.instrument.market,
            "symbol": self.instrument.display_symbol,
            "unit": self.instrument.unit,
            "status": self.status,
            "status_level": self.status_level,
            "price": self.price,
            "open": self.open,
            "high": self.high,
            "low": self.low,
            "volume": self.volume,
            "change": self.change,
            "change_pct": self.change_pct,
            "source": self.source,
            "source_symbol": self.source_symbol,
            "source_timestamp": self.source_timestamp,
            "fetched_at": self.fetched_at,
            "message": self.message,
            "api_required": self.instrument.api_required,
            "api_hint": self.instrument.api_hint,
            "note": self.instrument.note,
        }


DEFAULT_MARKET_DASHBOARD_UNIVERSE: tuple[DashboardInstrument, ...] = (
    DashboardInstrument("aapl", "Apple", "us_stocks", "US", "AAPL", "aapl.us", "USD"),
    DashboardInstrument("msft", "Microsoft", "us_stocks", "US", "MSFT", "msft.us", "USD"),
    DashboardInstrument("nvda", "NVIDIA", "us_stocks", "US", "NVDA", "nvda.us", "USD"),
    DashboardInstrument("spy", "SPDR S&P 500 ETF", "etfs", "US", "SPY", "spy.us", "USD"),
    DashboardInstrument("qqq", "Invesco QQQ", "etfs", "US", "QQQ", "qqq.us", "USD"),
    DashboardInstrument("tlt", "iShares 20+ Year Treasury Bond ETF", "etfs", "US", "TLT", "tlt.us", "USD"),
    DashboardInstrument("spx", "S&P 500", "indices", "US", "SPX", "^spx", "pt"),
    DashboardInstrument("ndx", "Nasdaq 100", "indices", "US", "NDX", "^ndq", "pt"),
    DashboardInstrument("dji", "Dow Jones Industrial Average", "indices", "US", "DJI", "^dji", "pt"),
    DashboardInstrument("us10y", "US 10Y Treasury Yield", "rates", "US", "US10Y", None, "%", True, "FRED DGS10 또는 유료 시세 API 필요"),
    DashboardInstrument("kr_base_rate", "한국 기준금리", "rates", "KR", "BOK Base Rate", None, "%", True, "한국은행 ECOS API 인증키 필요"),
    DashboardInstrument("wti", "WTI Crude Oil", "commodities", "Global", "WTI", "cl.f", "USD"),
    DashboardInstrument("gold", "Gold Spot", "commodities", "Global", "XAU/USD", "xauusd", "USD"),
    DashboardInstrument("eurusd", "EUR/USD", "fx", "Global", "EURUSD", "eurusd"),
    DashboardInstrument("usdjpy", "USD/JPY", "fx", "Global", "USDJPY", "usdjpy"),
    DashboardInstrument("usdkrw", "USD/KRW", "fx", "KR", "USDKRW", "usdkrw", "KRW"),
    DashboardInstrument("samsung", "삼성전자", "kr_stocks", "KR", "005930", None, "KRW", True, "KRX Data Marketplace 또는 KIS Open API 필요"),
    DashboardInstrument("sk_hynix", "SK하이닉스", "kr_stocks", "KR", "000660", None, "KRW", True, "KRX Data Marketplace 또는 KIS Open API 필요"),
    DashboardInstrument("naver", "NAVER", "kr_stocks", "KR", "035420", None, "KRW", True, "KRX Data Marketplace 또는 KIS Open API 필요"),
)


API_KEY_REQUIREMENTS: tuple[dict[str, str], ...] = (
    {
        "provider": "Stooq delayed CSV",
        "env": "없음",
        "coverage": "일부 미국 주식, ETF, 지수, 원자재, 환율",
        "usage": "비로그인 공개 대시보드의 기본 best-effort 지연 데이터",
        "docs": "https://stooq.com/",
        "risk": "공식 실시간 피드가 아니므로 지연 데이터로만 표시",
    },
    {
        "provider": "Alpha Vantage",
        "env": "ALPHA_VANTAGE_API_KEY",
        "coverage": "미국 주식, ETF, 지수, FX, 일부 원자재",
        "usage": "Stooq 누락 항목 보강 또는 명시적 API 키 기반 업데이트",
        "docs": "https://www.alphavantage.co/documentation/",
        "risk": "요금제별 호출 제한과 지연 조건 확인 필요",
    },
    {
        "provider": "Finnhub",
        "env": "FINNHUB_API_KEY",
        "coverage": "주식, ETF, FX, 지수성 데이터",
        "usage": "근실시간 quote 보강",
        "docs": "https://api.finnhub.io/docs/api/quote",
        "risk": "토큰 기반 호출 제한과 무료/유료 권한 확인 필요",
    },
    {
        "provider": "KRX Data Marketplace OPEN API",
        "env": "KRX_API_KEY",
        "coverage": "한국 주식, ETF, ETN, 지수, 파생상품",
        "usage": "한국 시장 공식 데이터 보강",
        "docs": "https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA002.jsp",
        "risk": "상품 신청, 권한, 실시간 재분배 조건 확인 필요",
    },
    {
        "provider": "한국투자증권 KIS Open API",
        "env": "KIS_APP_KEY, KIS_APP_SECRET",
        "coverage": "국내/해외 주식 시세, 주문 관련 API",
        "usage": "승인된 계정 기반 시세 조회. 주문 기능은 본 프로젝트 기본 차단",
        "docs": "https://apiportal.koreainvestment.com/",
        "risk": "계좌 및 인증 정보 필요. 실거래/주문 활성화는 Human Conductor 승인 전 차단",
    },
    {
        "provider": "한국은행 ECOS",
        "env": "BOK_ECOS_API_KEY",
        "coverage": "한국 기준금리와 거시경제 통계",
        "usage": "금리 패널 보강",
        "docs": "https://ecos.bok.or.kr/api/",
        "risk": "인증키와 통계코드 관리 필요",
    },
    {
        "provider": "FRED CSV Export",
        "env": "없음",
        "coverage": "미국 국채금리와 거시경제 통계",
        "usage": "미국 금리 지연 데이터 보강 후보",
        "docs": "https://fredhelp.stlouisfed.org/fred/graphs/share-my-fred-graph/export-options/",
        "risk": "실시간 데이터가 아닌 발표/갱신 지연 데이터",
    },
)


class StooqDelayedCsvSource:
    name = "Stooq delayed CSV"

    def __init__(self, http_get: HttpGet | None = None, timeout_seconds: int = 8) -> None:
        self.http_get = http_get or _http_get
        self.timeout_seconds = timeout_seconds

    def fetch(self, instrument: DashboardInstrument) -> DashboardQuote:
        fetched_at = datetime.now(timezone.utc).isoformat()
        if not instrument.stooq_symbol:
            return _missing_quote(instrument, fetched_at)

        query = urlencode(
            {
                "s": instrument.stooq_symbol,
                "f": "sd2t2ohlcv",
                "h": "",
                "e": "csv",
            }
        )
        url = f"https://stooq.com/q/l/?{query}"
        try:
            text = self.http_get(url, self.timeout_seconds)
        except (HTTPError, URLError, TimeoutError, OSError) as exc:
            return DashboardQuote(
                instrument=instrument,
                status="데이터 없음",
                status_level="missing",
                source=self.name,
                source_symbol=instrument.stooq_symbol,
                fetched_at=fetched_at,
                message=f"데이터 소스 연결 실패: {exc.__class__.__name__}",
            )

        rows = list(csv.DictReader(text.splitlines()))
        if not rows:
            return DashboardQuote(
                instrument=instrument,
                status="데이터 없음",
                status_level="missing",
                source=self.name,
                source_symbol=instrument.stooq_symbol,
                fetched_at=fetched_at,
                message="CSV 응답에 행이 없음",
            )

        row = rows[0]
        price = _parse_float(row.get("Close"))
        if price is None:
            return _missing_quote(instrument, fetched_at, self.name, instrument.stooq_symbol)

        open_price = _parse_float(row.get("Open"))
        high = _parse_float(row.get("High"))
        low = _parse_float(row.get("Low"))
        volume = _parse_int(row.get("Volume"))
        change = None
        change_pct = None
        if open_price and open_price > 0:
            change = price - open_price
            change_pct = change / open_price * 100.0

        source_timestamp = _source_timestamp(row.get("Date"), row.get("Time"))
        return DashboardQuote(
            instrument=instrument,
            status="지연 데이터",
            status_level="delayed",
            price=price,
            open=open_price,
            high=high,
            low=low,
            volume=volume,
            change=change,
            change_pct=change_pct,
            source=self.name,
            source_symbol=str(row.get("Symbol") or instrument.stooq_symbol),
            source_timestamp=source_timestamp,
            fetched_at=fetched_at,
            message="공개 CSV 소스에서 받은 지연 quote. 실시간 주문 판단에 사용하지 않음",
        )


def build_dashboard_snapshot(
    instruments: Iterable[DashboardInstrument] = DEFAULT_MARKET_DASHBOARD_UNIVERSE,
    source: StooqDelayedCsvSource | None = None,
    generated_at: datetime | None = None,
) -> dict[str, Any]:
    generated_at = generated_at or datetime.now(timezone.utc)
    source = source or StooqDelayedCsvSource()
    quotes = [source.fetch(instrument) for instrument in instruments]
    grouped: dict[str, list[dict[str, Any]]] = {key: [] for key in CATEGORY_LABELS}
    for quote in quotes:
        grouped[quote.instrument.category].append(quote.as_dict())

    categories = [
        {
            "id": category_id,
            "label": label,
            "items": grouped[category_id],
        }
        for category_id, label in CATEGORY_LABELS.items()
    ]

    available = [quote for quote in quotes if quote.price is not None]
    delayed = [quote for quote in quotes if quote.status_level == "delayed"]
    api_needed = [quote for quote in quotes if quote.status_level == "api_required"]
    missing = [quote for quote in quotes if quote.status_level == "missing"]

    return {
        "schema_version": "1.0",
        "generated_at": generated_at.isoformat(),
        "refresh_policy": {
            "mode": "daily_batch",
            "scheduled_local_time": "07:00",
            "timezone": "Asia/Seoul",
            "no_synthetic_values": True,
            "public_view": "로그인 없는 사용자는 마지막 배치 JSON의 실제 데이터와 명시적 상태만 조회",
        },
        "market_pulse": {
            "available_count": len(available),
            "delayed_count": len(delayed),
            "api_required_count": len(api_needed),
            "missing_count": len(missing),
            "total_count": len(quotes),
        },
        "categories": categories,
        "api_key_requirements": list(API_KEY_REQUIREMENTS),
        "disclaimer": "시장 정보 대시보드이며 투자 추천, 수익 보장, 실거래 주문 기능이 아님",
    }


def write_dashboard_snapshot(snapshot: dict[str, Any], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(snapshot, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )


def update_dashboard(output_path: Path, timeout_seconds: int = 8) -> dict[str, Any]:
    snapshot = build_dashboard_snapshot(
        source=StooqDelayedCsvSource(timeout_seconds=timeout_seconds)
    )
    write_dashboard_snapshot(snapshot, output_path)
    return snapshot


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="jarvis-trader market-dashboard-update",
        description="Update the public market dashboard JSON without synthetic prices.",
    )
    parser.add_argument(
        "--output",
        default="data/market_dashboard/latest.json",
        help="Output JSON path.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=8,
        help="Per-request network timeout.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    snapshot = update_dashboard(Path(args.output), args.timeout_seconds)
    pulse = snapshot["market_pulse"]
    print(f"output={args.output}")
    print(
        "market_pulse="
        f"available:{pulse['available_count']} "
        f"delayed:{pulse['delayed_count']} "
        f"api_required:{pulse['api_required_count']} "
        f"missing:{pulse['missing_count']} "
        f"total:{pulse['total_count']}"
    )
    return 0


def _http_get(url: str, timeout_seconds: int) -> str:
    request = Request(url, headers={"User-Agent": "jarvis-trader-market-dashboard/0.1"})
    with urlopen(request, timeout=timeout_seconds) as response:
        return response.read().decode("utf-8-sig")


def _missing_quote(
    instrument: DashboardInstrument,
    fetched_at: str,
    source: str = "",
    source_symbol: str = "",
) -> DashboardQuote:
    if instrument.api_required:
        return DashboardQuote(
            instrument=instrument,
            status="API 필요",
            status_level="api_required",
            source=source,
            source_symbol=source_symbol,
            fetched_at=fetched_at,
            message=instrument.api_hint or "공식 API 키 또는 데이터 상품 권한 필요",
        )
    return DashboardQuote(
        instrument=instrument,
        status="데이터 없음",
        status_level="missing",
        source=source,
        source_symbol=source_symbol,
        fetched_at=fetched_at,
        message="공개 데이터 소스에서 유효한 quote를 받지 못함",
    )


def _parse_float(value: str | None) -> float | None:
    if value is None:
        return None
    value = value.strip()
    if not value or value.upper() == "N/D":
        return None
    try:
        return float(value)
    except ValueError:
        return None


def _parse_int(value: str | None) -> int | None:
    parsed = _parse_float(value)
    if parsed is None:
        return None
    return int(parsed)


def _source_timestamp(date_value: str | None, time_value: str | None) -> str:
    if not date_value or date_value == "N/D":
        return ""
    if not time_value or time_value == "N/D":
        return date_value
    return f"{date_value} {time_value}"


if __name__ == "__main__":
    raise SystemExit(main())
