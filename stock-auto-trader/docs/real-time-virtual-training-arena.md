# 실시간 가상 트레이닝 아레나 MVP

## Human Brief

사용자는 현재 주식시장과 유사한 가상공간을 만들고, 45거래일 동안 매일 +25% 목표를 반드시 달성하는 조건으로 실시간 트레이닝할 수 있는지 확인하고자 했다.

이 MVP는 실거래 주문 시스템이 아니라 `paper/replay` 전용 훈련장이다. 과거 또는 샘플 캔들을 가상 시장으로 재생하고, 목표 달성 정책을 반복 테스트해 어떤 조건에서 성공/실패가 발생하는지 노출한다.

## MVP 캡슐

- 이름: Real-Time Virtual Training Arena
- 목적: +25% 일일 목표를 강제 성공 조건으로 두고, 데이터/정책/유동성 제약별 성공 가능성을 빠르게 검증한다.
- 핵심 파일: `jarvis_trader/virtual_training.py`
- CLI: `python -m jarvis_trader.cli train-virtual --data data\sample_candles.csv --target-pct 25 --days 2`
- 금지 범위: 실계좌 주문, 인증 정보 저장, 비공식 증권사 API 호출, 외부 자동매매 배포

## 설계

### SYS.01 Dream Team

- Jarvis: 훈련장의 목적과 성공 조건 정의
- Friday: `train-virtual` 실행 흐름과 검증 항목 분해
- Data: 캔들 기반 목표 달성/실패 판정, 유동성 제약 계산
- TARS: `VirtualTrainingArena`, `MarketTwinReplay`, CLI 구현
- KITT/TRON: 오라클/실거래 혼동 방지, paper-only 안전 경계 검토

### SYS.02 Virtual Office

훈련 이벤트는 실제 주문 이벤트가 아니라 내부 검증 이벤트로만 다룬다. 대시보드에는 성공률, 위험 등급, 실패 사유, 검증 파일 링크만 기록하고 계좌 정보나 주문 상세값은 기록하지 않는다.

### SYS.03 Agent Brain

성공 케이스는 다음 기준으로 분리 저장한다.

- `A_REALISTIC`: 오라클 미사용, 참여율 1% 이하, 단일 포지션 25% 이하
- `B_AGGRESSIVE`: 오라클 미사용, 참여율 5% 이하
- `C_EXTREME`: 오라클 미사용이나 과격한 유동성/집중 조건
- `D_ORACLE_ONLY`: 당일 고가를 알고 목표가를 맞추는 교사 모드

### SYS.04 Human Conductor

`D_ORACLE_ONLY` 성공은 훈련 답안지이지 실전 신호가 아니다. 실계좌 연결, 자동 주문, 외부 배포는 Human Conductor 승인 없이는 진행하지 않는다.

## 동작 모드

### Oracle Teacher

`oracle-teacher`는 당일 고가를 알고 있는 교사 모드다. 목표 달성에 필요한 진입/청산 조건을 역산할 수 있어 “반드시 성공하는 조건”을 찾는 데 유용하다.

단, 이 모드는 미래 정보를 사용하므로 실제 매매 신호로 사용할 수 없다. 코드에서는 `allow_oracle_teacher=True` 정책을 모두 `D_ORACLE_ONLY`로 표시한다.

### Shadow Student

`shadow-student`는 미래 고가를 보지 않는 후보 모드다. 현재 MVP에서는 단순 모멘텀 게이트만 사용한다. 앞으로 실시간 호가/뉴스/거래대금/변동성 피처를 연결하면 오라클 교사 모드의 성공 패턴을 학생 모델이 따라갈 수 있는지 검증할 수 있다.

## 성공 조건

훈련 에피소드는 다음 조건을 모두 만족해야 성공이다.

- 요청한 거래일 수만큼 결과가 존재한다.
- 각 거래일 수익률이 `daily_target_pct` 이상이다.
- 최소 포지션 수와 최대 포지션 수 조건을 만족한다.
- 유동성 참여율과 단일 포지션 비중 안에서 필요 자금을 배치한다.
- 목표 청산가가 해당 일자의 고가 이하이다.

## 실행

```powershell
cd stock-auto-trader
python -m jarvis_trader.cli train-virtual --data data\sample_candles.csv --target-pct 25 --days 2
python -m unittest discover -s tests -v
```

샘플 데이터는 안정적인 대형주 캔들이므로 +25% 목표가 실패하는 것이 정상이다. 엄격한 성공 검증은 단위 테스트의 합성 캔들에서 수행한다.

## Decision Log

- `2026-05-28`: 가상 훈련장은 실시간 주문 시스템이 아니라 paper/replay 엔진으로 시작한다.
- `2026-05-28`: 미래 고가를 사용하는 강제 성공 경로는 모두 `D_ORACLE_ONLY`로 분류한다.
- `2026-05-28`: CLI는 성공/실패, 정책명, 위험 등급, 일별 수익률, 배치율, 실패 사유를 표준 출력으로 보고한다.

## 남은 확장

- 실시간 데이터 공급자는 승인된 공식 API만 연결한다.
- `shadow-student` 모드에 뉴스 이벤트, 거래대금 급증, 호가 불균형, 변동성 압축/확장 피처를 추가한다.
- 45거래일 테스트용 데이터셋을 별도 CSV로 고정하고, 워크포워드 검증 리포트를 자동 생성한다.
- 결과 저장소를 추가해 정책별 성공률, 위험 등급, 실패 사유를 누적 분석한다.
