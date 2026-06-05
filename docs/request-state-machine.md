# Jarvis 요청 상태 머신

## 목적

이 상태 머신은 Jarvis 운영 모델을 권장 행동에서 강제 가능한 게이트로 바꿉니다.

## 생명주기

```text
Intake
→ Human Brief Draft
→ Jarvis Strategy
→ Friday Dispatch
→ Agent Execution
→ Review
→ Verification
→ Work Log
→ Episodic Memory
→ Done
```

## 게이트 정의

| 게이트 | 필수 증거 | Owner | Done 차단 여부 |
| --- | --- | --- | --- |
| Intake | `start-jarvis-request.ps1` 이벤트 또는 Human Brief | Jarvis | 예 |
| Human Brief Draft | 작업 요청 README 또는 브리프 템플릿 | Jarvis, Friday | Medium 이상 작업 |
| Jarvis Strategy | 전략 이벤트 또는 전략 브리프 | Jarvis | 예 |
| Friday Dispatch | Owner(To), CC, 산출물, DoD | Friday | 예 |
| Agent Execution | 구현/리서치/디자인/카피/분석 이벤트 | 배정된 Owner | 예 |
| Review | 필수 CC 검토 이벤트 | Friday | 리스크에 따라 다름 |
| Verification | 테스트, 브라우저 확인, 스크린샷, 서면 검증 | TARS/Data/Joi | 예 |
| Work Log | `memory/work-logs/` 항목 또는 요청 README 업무 로그 | Owner | 예 |
| Episodic Memory | `memory/episodic/` 항목 | Owner | 예 |
| Done | 최신 요청 이벤트가 `Done` | Owner | 최종 |

## 리스크별 예외 규칙

- Low: 축약 검토를 허용하지만 검증은 여전히 필요하다.
- Medium: Friday와 관련 쉴드 검토자 1명이 필요하다.
- High: Jarvis 승격과 KITT/TRON 검토가 필요하다.
- Critical: 작업을 멈추고 Human Conductor 승인 후에만 계속한다.

## 상태 규칙

- `Todo`: 요청 또는 태스크가 있지만 실행은 시작되지 않은 상태.
- `In Progress`: Owner(To)가 실행 중인 상태.
- `Review`: 실행 결과는 있으나 검토 또는 검증이 남은 상태.
- `Blocked`: 리스크, 승인 누락, 테스트 실패, 불명확한 방향 때문에 진행이 막힌 상태.
- `Done`: 모든 차단 게이트가 충족된 상태.

## 스크립트

- `scripts/validate-jarvis-request.ps1`: 요청의 게이트 충족 여부를 확인한다.
- `scripts/close-jarvis-request.ps1`: 기억 초안을 만들고 마감 `Done` 이벤트를 추가한다.
- `scripts/promote-wisdom.ps1`: 지혜 후보 또는 승인된 지혜를 기록한다.
- `scripts/purge-memory.ps1`: 소거 대기열을 보고하거나 처리한다.
