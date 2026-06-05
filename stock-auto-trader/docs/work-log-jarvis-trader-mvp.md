# 업무 로그: Jarvis Trader MVP

## 메타데이터

- 작업 ID: `JT-001`
- 프로젝트: Jarvis Trader MVP
- 에이전트: TARS, Jarvis 조율
- 역할: 엔지니어링 구현
- 시작일: 2026-05-19
- 완료일: 2026-05-19
- 상태: Done

## 입력

- 요청 요약: 토스증권 API 기반 주식 자동매매 프로그램을 전체 에이전트 팀 모드로 만들되, 일일 목표 `+25%`, 손실 미허용, 향후 API 지원, 한국/미국 시장 대응을 포함한다.
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`, `docs/risk-shield.md`.
- 제약 조건: 실거래, 인증 정보 처리, 스크래핑, 비공식 브로커 엔드포인트, 수익 보장 주장은 차단한다.

## 실행

- 페이퍼 트레이딩 우선 Python 패키지를 생성했다.
- 오케스트레이션 추적성을 위해 To/CC 에이전트 메시지를 추가했다.
- 무손실 오해 방지, 최대 주문 크기, 최대 포지션 크기, 현금 버퍼, 신뢰도 기준, 공매도 금지, 일일 목표 도달 중단을 위한 리스크 제어를 추가했다.
- 개발 기준선으로 25% 최소 목표를 두고, 페이퍼 모드 세션 순환을 위한 한국/미국 시장 라우터를 추가했다.
- 실시간 데이터 품질 게이트, 토스 실시간 placeholder 소스, 공식 리서치 소스 레지스트리, 이슈 브리프 엔진을 추가했다.
- 실계좌 포트폴리오와 주문 접근을 차단하는 토스증권 placeholder 어댑터를 추가했다.
- 샘플 데이터, 설정, CLI 명령, 단위 테스트를 추가했다.

## 산출물

- 산출물: `jarvis_trader/`, `configs/trader.example.json`, `data/sample_candles.csv`, `tests/`, `docs/auto-trader-mvp.md`, `docs/trading-agent-assignments.md`.
- 검증: `python -m unittest discover -s tests -v`, `python -m jarvis_trader.cli status`, `python -m jarvis_trader.cli backtest --data data\sample_candles.csv`, `python -m jarvis_trader.cli run-once --symbol AAPL --data data\sample_candles.csv`.

## 리스크

- 리스크 등급: 실거래 브로커 연결 시 High, 로컬 페이퍼 모드에서는 Medium.
- 승격: 인증 정보, 실계좌, 외부 배포, 실주문 전에는 Human Conductor 승인이 필요하다.

## 다음

- 토스증권이 공식 주문 API 계약을 제공하거나 승인한 뒤에만 공식 브로커 샌드박스를 추가한다.
- 실거래 검토 전 수수료, 세금, 환율, 슬리피지, 부분 체결, 휴장일, walk-forward 검증을 추가한다.
