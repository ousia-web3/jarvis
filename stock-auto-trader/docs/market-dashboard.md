# 시장 데이터 대시보드

## 목적

`web/market-dashboard/`는 로그인 없이 열 수 있는 시장 정보 대시보드입니다. 실시간 스트리밍 화면이 아니라 매일 오전 7시(KST)에 배치 파일로 `data/market_dashboard/latest.json`을 갱신하고, 웹페이지는 마지막 배치 산출물을 표시합니다.

가짜 숫자는 만들지 않습니다. 데이터가 없거나 권한이 필요한 항목은 `데이터 없음`, `API 필요`, `지연 데이터` 중 하나로 표시합니다.

## 지원 범위

| 분류 | 기본 상태 | 비고 |
| --- | --- | --- |
| 미국 주식 | Stooq 지연 CSV best-effort | AAPL, MSFT, NVDA 기본 포함 |
| ETF | Stooq 지연 CSV best-effort | SPY, QQQ, TLT 기본 포함 |
| 지수 | Stooq 지연 CSV best-effort | SPX, Nasdaq 100, DJI 기본 포함 |
| 금리 | API 필요 또는 지연 공식 통계 | US10Y는 FRED 후보, 한국 기준금리는 ECOS 필요 |
| 원자재 | Stooq 지연 CSV best-effort | WTI, Gold spot 기본 포함 |
| 환율 | Stooq 지연 CSV best-effort | EUR/USD, USD/JPY, USD/KRW 기본 포함 |
| 한국 주식 | API 필요 | KRX Data Marketplace 또는 KIS Open API 필요 |

## 실행

이 폴더에서 실행합니다.

```powershell
python -m jarvis_trader.cli market-dashboard-update
python -m http.server 8801
```

브라우저에서 엽니다.

```text
http://127.0.0.1:8801/web/market-dashboard/
```

Windows 배치 래퍼도 제공합니다.

```powershell
scripts\update-market-dashboard.cmd
```

## 매일 오전 7시 배치 등록

작업 스케줄러 등록 스크립트입니다. 이 명령은 로컬 OS 작업 스케줄러를 변경하므로 사용자가 직접 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-market-dashboard-daily-task.ps1
```

수동 등록 시 동작은 다음과 같습니다.

- 프로그램: `powershell.exe`
- 인수: `-NoProfile -ExecutionPolicy Bypass -File "<repo>\stock-auto-trader\scripts\update-market-dashboard.ps1"`
- 트리거: 매일 `07:00`
- 작업 디렉터리: `stock-auto-trader`

## API 키 문서

| Provider | 환경 변수 | 용도 | 문서 |
| --- | --- | --- | --- |
| Stooq delayed CSV | 없음 | 비로그인 공개 대시보드의 일부 지연 quote | <https://stooq.com/> |
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | 미국 주식, ETF, FX, 지수, 일부 원자재 보강 | <https://www.alphavantage.co/documentation/> |
| Finnhub | `FINNHUB_API_KEY` | 근실시간 quote 보강 | <https://api.finnhub.io/docs/api/quote> |
| KRX Data Marketplace OPEN API | `KRX_API_KEY` | 한국 주식, ETF, 지수 공식 데이터 | <https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA002.jsp> |
| 한국투자증권 KIS Open API | `KIS_APP_KEY`, `KIS_APP_SECRET` | 승인된 계정 기반 국내/해외 주식 시세 조회 | <https://apiportal.koreainvestment.com/> |
| 한국은행 ECOS | `BOK_ECOS_API_KEY` | 한국 기준금리와 거시경제 통계 | <https://ecos.bok.or.kr/api/> |
| FRED CSV Export | 없음 | 미국 국채금리와 거시경제 통계 지연 데이터 | <https://fredhelp.stlouisfed.org/fred/graphs/share-my-fred-graph/export-options/> |

## 리스크 기준

- 이 대시보드는 시장 정보 표시용이며 투자 추천, 수익 보장, 실거래 주문 기능이 아닙니다.
- 브로커 주문 API, 계좌 접근, 인증 정보 저장은 구현하지 않습니다.
- KIS Open API 같은 계정 기반 API는 시세 조회 후보로만 문서화하며, 주문 활성화는 Human Conductor 승인 전까지 차단합니다.
- 공개 데이터 소스가 실패하면 숫자를 추정하지 않고 상태 문구만 남깁니다.
