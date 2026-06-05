# 주식 자동매매

Jarvis 에이전트 팀 기반 주식 자동매매 MVP를 독립 관리하는 하위 프로젝트입니다.

## 현재 범위

- 한국/미국 시장 순환 감시
- 목표 수익률 최소 25% 개발 기준선
- 페이퍼 트레이딩 우선 실행
- 실시간 시세 품질 게이트
- 증시 이슈 리서치 레지스트리
- 토스증권 주문/실시간 API placeholder
- 실거래 주문, 인증 정보, 계좌 접근 차단

`25%`는 수익 보장이 아니라 전략 평가 기준선과 목표 도달 시 신규 주문 중단 조건입니다.

## 폴더 구조

```text
stock-auto-trader/
  jarvis_trader/   # Python 패키지
  tests/           # 단위 테스트
  configs/         # 실행 설정
  data/            # 샘플 데이터
  docs/            # 자동매매 전용 문서
  pyproject.toml   # 패키지 메타데이터
```

## 실행

이 폴더에서 실행합니다.

```powershell
python -m unittest discover -s tests -v
python -m jarvis_trader.cli status
python -m jarvis_trader.cli backtest --data data\sample_candles.csv
python -m jarvis_trader.cli train-virtual --data data\sample_candles.csv --target-pct 25 --days 2
python -m jarvis_trader.cli run-once --symbol AAPL --data data\sample_candles.csv
python -m jarvis_trader.cli market-dashboard-update
python -m http.server 8801
```

시장 데이터 대시보드는 `web/market-dashboard/`에서 열 수 있습니다. 매일 오전 7시 배치 업데이트 방식과 필요한 API 키는 `docs/market-dashboard.md`에 정리했습니다.

## 주요 개선 방향

- 24시간 스킬 기반 모니터링 및 종목 선정 DB 설계: `docs/advanced-monitoring-architecture.md`
- 100만원 기준 45영업일 가상 종목 선정/매수·매도 시나리오: `docs/45day-paper-trading-scenario.md`
- +25% 목표 달성 극단 사후 탐색 시나리오: `docs/45day-extreme-goal-seeking-scenario.md`
- Nasdaq 저가·고거래량 유니버스 45거래일 연속 +25% 극단 성공 탐색: `docs/45day-consecutive-nasdaq-universe-success.md`
- 45거래일 극단 성공 케이스 유동성 현실성 검토: `docs/45day-consecutive-liquidity-reality-check.md`
- 2~5종목 포트폴리오 유동성 기반 +25% 탐색: `docs/45day-portfolio-2to5-liquidity-search.md`
- 100개 시나리오 현실 매매 가능성 매트릭스: `docs/100-scenario-realistic-tradability-matrix.md`
- 8개 극단 성공 시나리오 기반 현실 접근 후보 검토: `docs/8-extreme-success-realistic-candidate-review.md`
- 최종 현실 제약 기반 달성 가능 시나리오: `docs/final-realistic-achievable-scenario.md`
- 섹터 사이클 최적화 10회 반복 테스트: `docs/cycle-optimization-10-tests.md`
- 토스증권 공식 주문/실시간 API 문서 확보 후 adapter 구현
- KRX/DART/SEC EDGAR 데이터 수집을 실제 connector로 확장
- 수수료, 세금, 환율, 슬리피지, 부분 체결, 휴장일 반영
- walk-forward, out-of-sample, shadow live 검증 추가
- 수동 kill switch와 감사 로그 영속화

## 안전 원칙

- 실계좌 주문은 기본 차단한다.
- API 키, 계좌번호, 개인정보는 저장하지 않는다.
- 비공식 엔드포인트, 화면 스크래핑, 앱 자동조작은 구현하지 않는다.
- 리서치 결과는 투자 추천이 아니라 Risk Shield 입력 자료로만 사용한다.
