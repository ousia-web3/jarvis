# Human Brief: stock-market-data-dashboard

## 원문 요청

`stock-auto-trader/` 폴더에 첨부 샘플 이미지와 유사한 시장 데이터 웹페이지 대시보드를 제작한다. 실시간 스트리밍보다 매일 오전 7시 배치파일로 업데이트한다. 미국 주식, ETF, 지수, 금리, 원자재, 환율, 한국 주식을 지원하고, API 키가 필요한 경우 문서화한다. 데이터가 없으면 가짜 숫자를 넣지 않고 `데이터 없음 / API 필요 / 지연 데이터`처럼 명확히 표시한다. 비로그인 사용자도 일반 시장 정보는 실제 데이터로 볼 수 있게 한다.

## Jarvis 전략

- 기본 구조: 정적 웹 대시보드 + 배치 JSON 산출물 + Python 업데이트 명령.
- 데이터 원칙: 공개 지연 데이터 best-effort를 사용하되, 실패/권한 부족 시 숫자를 만들지 않는다.
- 리스크 원칙: 실거래, 계좌 접근, 인증 정보 저장, 비공식 증권사 API, 투자 추천 표현은 제외한다.

## Friday 작업 분해

| Owner | CC | 작업 |
| --- | --- | --- |
| TARS | Data, KITT/TRON | Python 시장 대시보드 업데이트 모듈과 CLI 구현 |
| Joi | C3PO | 첨부 샘플 방향의 다크 웹 대시보드 구현 |
| Data | KITT/TRON | 데이터 상태, API 필요 항목, no-fake-number 테스트 |
| KITT/TRON | Jarvis | 금융/브로커 API 리스크 문서화 |

## 산출물

- `jarvis_trader/market_dashboard.py`
- `web/market-dashboard/`
- `scripts/update-market-dashboard.cmd`
- `scripts/update-market-dashboard.ps1`
- `scripts/install-market-dashboard-daily-task.ps1`
- `docs/market-dashboard.md`
- `data/market_dashboard/latest.json`
- `tests/test_market_dashboard.py`

## 로컬 실행

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis\stock-auto-trader
python -m jarvis_trader.cli market-dashboard-update
python -m http.server 8801
```

브라우저 URL:

```text
http://127.0.0.1:8801/web/market-dashboard/
```

## 검증 결과

- 단위 테스트: `python -m unittest discover -s tests -v` 통과, 19개 테스트 OK.
- 배치 갱신: `python -m jarvis_trader.cli market-dashboard-update --timeout-seconds 10` 통과.
- 배치 결과: `available:14`, `delayed:14`, `api_required:5`, `missing:0`, `total:19`.
- 웹 서버: `http://127.0.0.1:8801/web/market-dashboard/` 200 응답 확인.
- 브라우저 검증: AAPL, `지연 데이터`, `API 필요`, 19개 데이터 행, 19개 자산 타일, 콘솔 에러 0건 확인.
- 스크린샷: `evidence/market-dashboard-desktop.png`, `evidence/market-dashboard-mobile.png`.

## 첨부 이미지 매칭 개선

- 상단 터미널 메뉴, 명령 입력바, AI Copilot 상태, 연결 상태, 가로 티커 스트립을 추가했다.
- 좌측 레일을 `MARKET PULSE`, `ASSET GROUP MOMENTUM`, `VOL SURFACE SNAPSHOT`, `CAPITAL FLOWS` 구성으로 재배치했다.
- 중앙 대형 패널을 `AAPL US Equity` 중심 차트, 배치 탭, OHLC/Volume 레전드, Cross-Asset Matrix, Scenario Analyzer로 재구성했다.
- 우측 레일을 `ORDER & EXECUTION`, `OPTIONS FLOW INTELLIGENCE`, `TRADE ASSISTANT`, `PORTFOLIO RISK`, `DATA SOURCES`로 재구성했다.
- 실제 데이터가 없는 옵션, 포트폴리오, 역사적 intraday 차트, 한국 주식/금리 일부는 가짜 숫자 대신 `API 필요` 또는 `데이터 없음`으로 표시한다.
- 최신 증거 스크린샷: `evidence/market-dashboard-terminal-desktop.png`, `evidence/market-dashboard-terminal-mobile.png`.

## 보조 시각화 영역 통일

- `TOP NEWS`와 `AI NEWS SUMMARY`를 추가해 첨부 이미지의 하단 뉴스/요약 패널 구조를 반영했다.
- `OPTIONS FLOW INTELLIGENCE`, `TRADE ASSISTANT`, `DATA SOURCES`를 카드형에서 터미널 표/테이프형 행 구조로 변경했다.
- `MARKET DATA` 행에는 상태별 배경 톤을 적용해 `지연 데이터`, `API 필요`, `데이터 없음`이 같은 시각 언어로 보이도록 했다.
- 추가 검증 스크린샷: `evidence/market-dashboard-terminal-all-panels-desktop.png`, `evidence/market-dashboard-terminal-all-panels-mobile.png`.
