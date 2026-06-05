# 검증 증거

## 명령

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis\stock-auto-trader
python -m unittest discover -s tests -v
python -m jarvis_trader.cli market-dashboard-update --timeout-seconds 10
python -m http.server 8801 --bind 127.0.0.1
```

## 결과

- 단위 테스트: 19개 통과.
- 배치 갱신: `market_pulse=available:14 delayed:14 api_required:5 missing:0 total:19`.
- 웹 응답: `http://127.0.0.1:8801/web/market-dashboard/` HTTP 200.
- DOM 검증: AAPL, `지연 데이터`, `API 필요`, 19개 행, 19개 타일 확인.
- 콘솔 에러: 0건.

## 화면 증거

- `market-dashboard-desktop.png`
- `market-dashboard-mobile.png`
- `market-dashboard-terminal-desktop.png`
- `market-dashboard-terminal-mobile.png`

## 첨부 이미지 매칭 추가 검증

- 터미널형 UI 브라우저 검증: 19개 데이터 행, 12개 상단 티커 카드, 13개 패널 렌더링 확인.
- 콘솔 에러: 0건.

## 보조 시각화 영역 통일 검증

- 단위 테스트: 19개 통과.
- 배치 갱신: `market_pulse=available:14 delayed:14 api_required:5 missing:0 total:19`.
- 브라우저 검증: 19개 데이터 행, 12개 티커 카드, 4개 뉴스 행, 4개 AI 요약 행, 8개 데이터 소스 행, 3개 어시스턴트 행 확인.
- 콘솔 에러: 0건.
- 화면 증거: `market-dashboard-terminal-all-panels-desktop.png`, `market-dashboard-terminal-all-panels-mobile.png`.
