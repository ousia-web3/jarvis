# Jarvis Trader MVP 문서

## Human Brief 인간 브리프 초안

- 원문 요청: 토스증권 API를 활용해 주식 자동매매 프로그램을 만들고, 100% 에이전트 모드로 운용하며, 일일 수익률 +25%, 마이너스 미허용, 추후 API 적용, 한국 및 미국 증시 대응, 각 에이전트의 주식 트레이드 각성 모드를 포함한다.
- 안전한 해석: 실거래 자동주문이 아니라 페이퍼 트레이딩 우선의 에이전트 팀 시뮬레이터와 브로커 어댑터 골격을 만든다. `+25%`는 수익 보장이 아니라 신규 주문을 멈추는 일일 목표선으로 처리한다. `마이너스 용납불가`는 손실이 절대 발생하지 않는다는 의미가 아니라, 당일 페이퍼 평가손익이 음수로 전환되면 신규 주문을 차단하는 리스크 게이트로 구현한다.
- 추가 지시 반영: 한국장과 미국장을 오가며 감시하고, 목표 수익률은 최소 `25%` 이상을 개발 기준선으로 둔다. 이 기준선은 전략 평가와 목표 도달 시 중단 조건에 사용하며, 실제 수익 보장 문구로 쓰지 않는다.
- 차단 조건: 실계좌 주문, 인증 정보 저장, 비공식 스크래핑, 외부 배포, 투자 추천 엔진, 수익률 보장 표현은 MVP 범위에서 제외한다.

## Jarvis 전략

- SYS.01 Dream Team: Jarvis는 방향을 조율하고, Friday는 작업을 분해하며, TARS는 구현을 맡는다. Data는 지표를 검증하고, KITT/TRON은 법무·보안 리스크를 차단하며, Diagnostic Agent는 과신과 허위 완료 보고를 점검한다.
- SYS.02 Virtual Office: 실행 중 메시지는 To/CC 형식의 `AgentMessage` 기록으로 남긴다.
- SYS.03 Agent Brain: 백테스트 요약, 주문 차단 사유, 리스크 판단 결과를 추후 기억 후보로 남긴다.
- SYS.04 Human Conductor: 실거래, 인증 정보 처리, 외부 배포, 브로커 API 활성화는 반드시 Human Conductor의 명시적 승인을 거친다.

## Friday 에이전트 태스크 분해

| Task ID | Owner(To) | CC | 산출물 |
| --- | --- | --- | --- |
| JT-001 | TARS | Jarvis, Friday | `jarvis_trader` Python 패키지 |
| JT-002 | Data | KITT/TRON | 리스크 게이트와 백테스트 요약 |
| JT-003 | KITT/TRON | Jarvis | 실거래 주문을 차단하는 토스증권 placeholder 어댑터 |
| JT-004 | Diagnostic Agent | Friday | 무손실 보장 오해와 공매도 차단 테스트 |
| JT-005 | Data | TARS, KITT/TRON | 실시간 시세 품질 게이트와 최신 데이터 저장소 |
| JT-006 | EVE | Data, Jarvis | 공식 공시·거래소·시장 이슈 리서치 브리프 |
| JT-007 | TARS | Jarvis, KITT/TRON | 추후 토스 API 연결용 realtime placeholder 인터페이스 |

## 리스크 Shield 검토

- 리스크 등급: 실거래 브로커 자동화는 High, 로컬 페이퍼 모드는 Medium으로 낮춰 진행 가능하다.
- 실거래는 `TossSecuritiesPlaceholderAdapter`를 통해 기본 차단한다.
- 일일 `+25%`는 예측이나 보장이 아니라 `halt_after_profit_target` 중단 조건으로만 구현한다.
- `min_daily_profit_target_pct: 25.0`을 설정해 목표 수익률 개발 기준선이 25% 아래로 내려가지 않게 한다.
- `max_daily_loss_pct: 0.0`은 당일 페이퍼 수익률이 0% 아래로 내려가면 신규 주문을 차단한다는 뜻이다.
- API 키, 계좌번호, 개인정보, 토스 인증 정보는 저장하지 않는다.
- 토스증권 어댑터는 공식 API 문서, 테스트 계정, Human Conductor 승인 전까지 실제 주문 계약을 가정하지 않는다.
- 시장 시간 처리는 참고용 안전장치이며, 향후 실거래 어댑터는 반드시 브로커와 거래소의 공식 캘린더를 신뢰해야 한다.
- 백테스트 결과는 시뮬레이션 결과일 뿐이며 투자 조언이나 수익 보장 자료로 사용하면 안 된다.

## 한국/미국 장 순환 설계

- 기본 모드: `rotate_kr_us: true`
- 한국 시장: KRX 정규장과 NXT 확장 감시 구간을 분리한다. 페이퍼 모드에서는 NXT 기준 08:00-20:00 감시를 허용하되, 실거래는 브로커의 실제 지원 종목과 최선집행 정책 확인 전까지 차단한다.
- 미국 시장: 현행 페이퍼 기준은 NYSE Arca Early/Core/Late 구간인 04:00-20:00 ET를 사용한다.
- 미국 overnight: NYSE Arca의 21:00-04:00 ET overnight 구간은 SEC 승인 및 2026년 12월 6일 목표 일정이 붙은 계획이므로, 현재 설정에서는 `allow_us_overnight_when_approved: false`로 둔다.
- 라우팅 결과: 시장 시간이 아니면 신호 생성 및 신규 주문을 진행하지 않고 `Market route checked` 메시지로 차단 사유를 남긴다.
- 목표 기준: KR/US 어느 시장에서든 일일 목표 수익률은 최소 25% 이상으로 평가하되, 목표 도달 시에는 공격적으로 추가 진입하지 않고 신규 주문을 멈춘다.

## 사용 방법

```powershell
python -m jarvis_trader.cli status
python -m jarvis_trader.cli backtest --data data/sample_candles.csv
python -m jarvis_trader.cli run-once --symbol AAPL --data data/sample_candles.csv
```

## 시장 시간 참고 근거

- KRX: 정규 거래 시간 09:00-15:30, 시간외 거래 구조는 KRX 공식 한국 주식시장 거래 가이드를 기준으로 한다.
- NXT: 한국 ATS인 Nextrade는 08:00-20:00 확장 거래 시간을 안내한다.
- NYSE Arca: 현행 Early 04:00-09:30, Core 09:30-16:00, Late 16:00-20:00 ET 구간을 기준으로 한다. Overnight 21:00-04:00 ET는 승인 및 출시 조건이 남아 있으므로 기본 차단한다.

## 향후 토스증권 API 연결 조건

`jarvis_trader/brokers/toss_placeholder.py`는 아래 조건이 모두 충족된 뒤에만 실제 어댑터로 확장한다.

1. 토스증권의 공식 주문 API 문서가 확보되어야 한다.
2. 샌드박스 또는 페이퍼 계정이 제공되어야 한다.
3. 주문, 취소, 체결, 잔고, 호출 제한, 오류 응답 계약이 문서화되어야 한다.
4. 비밀 정보는 로컬 시크릿 매니저나 환경 변수로 분리되어야 한다.
5. Human Conductor가 실거래 활성화를 명시적으로 승인해야 한다.

## 실시간 데이터와 증시 이슈 리서치 확장

- 실시간 종목 데이터: `jarvis_trader/realtime_data.py`에서 가격, bid/ask, 거래량, 지연시간, 데이터 출처를 스냅샷으로 관리한다.
- 데이터 품질: freshness 5초, spread 3%, latency 3000ms 기준을 넘으면 신규 주문 판단에 쓰지 않는다.
- 토스 API: `TossRealtimePlaceholderSource`는 공식 API 문서, sandbox, rate limit, 승인 전까지 차단된다.
- 리서치 소스: `jarvis_trader/research.py`는 OpenDART, KRX Data Marketplace, SEC EDGAR API, 토스 placeholder를 공식 소스 레지스트리로 관리한다.
- 이슈 반영: 거래정지, 상장폐지, 조사, 파산, 사이버보안, 금리, FOMC, 실적, 가이던스 태그가 들어오면 `IssueResearchEngine`이 Risk Shield 검토 대상으로 올린다.
- 상세 역할 분장은 `docs/trading-agent-assignments.md`에 기록한다.
