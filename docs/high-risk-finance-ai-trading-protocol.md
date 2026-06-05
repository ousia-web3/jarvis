# 고위험 금융/AI 트레이딩 프로토콜

## 목적

금융, 자동매매, 실시간 데이터, 브로커 API, 목표 수익률, AI 트레이딩이 등장하는 작업은 성공 압박과 실거래 위험이 크다. 이 프로토콜은 역할을 분리해 오라클 누수, 과최적화, 수익 보장 표현, 비공식 API 사용, 실계좌 접근을 차단한다.

## 기본 금지선

- 실계좌 주문 금지
- 비공식 증권사 API 호출 금지
- 인증 정보, 계좌번호, 개인정보 저장 금지
- 수익 보장 표현 금지
- 사후 고가를 본 `oracle` 결과를 실전 신호로 표현 금지
- Human Conductor 승인 없는 외부 배포 금지

## Owner/CC 구조

| 단계 | Owner(To) | CC | 산출물 |
| --- | --- | --- | --- |
| 목표/금지선 정의 | Jarvis | Friday, KITT/TRON | Strategy Brief, 금지선 |
| 작업 분해 | Friday | Jarvis | Owner/CC Dispatch |
| 공식 출처 확인 | EVE | Data, KITT/TRON | Source Notes |
| 시뮬레이션/백테스트 | Data | KITT/TRON, Diagnostic Agent | Analysis Report |
| paper/replay 구현 | TARS | Data, KITT/TRON | 코드, 테스트 결과 |
| 오라클/과최적화 진단 | Diagnostic Agent | Jarvis, Data | Diagnostic Review |
| 문구 정리 | C3PO | KITT/TRON | 금지 주장 제거 보고 |
| 최종 리스크 판정 | KITT/TRON | Human Conductor | Pass/Blocked |

## 승격 단계

| 단계 | 허용 범위 | 승인 필요 |
| --- | --- | --- |
| Paper Replay | 과거/샘플 데이터 재생, 주문 없음 | 일반적으로 불필요 |
| Shadow Live | 실시간 데이터 관찰, 주문 없음 | KITT/TRON 검토 |
| Paper Broker | 가상 주문, 실계좌 없음 | KITT/TRON 검토 |
| Live Trading | 실계좌 주문 | Human Conductor 명시 승인 |

## 완료 전 체크

- Data가 누수, 편향, 유동성, 체결 가능성 한계를 기록했는가?
- TARS가 실거래 경로를 기본 차단했는가?
- KITT/TRON이 브로커 API, 개인정보, 보장 표현을 검토했는가?
- Diagnostic Agent가 `반드시 성공`, `45거래일 매일 +25%` 같은 과신 표현을 진단했는가?
- C3PO가 사용자 보고에서 투자 추천 오해를 줄였는가?

## 호출 예시

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "stock-market-issue-goal-scenario-test" `
  -Agent "Diagnostic Agent" `
  -Assignment CC `
  -Skill "oracle-bias-check" `
  -Task "오라클 누수와 과최적화 점검" `
  -Channel diagnostic `
  -RiskLevel High
```
