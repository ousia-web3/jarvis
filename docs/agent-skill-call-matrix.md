# 에이전트별 스킬 호출 매트릭스

## 목적

이 문서는 Jarvis가 직접 모든 일을 처리하지 않도록, 작업 유형별 Owner(To), CC, 사용 스킬, 산출물, 이벤트 채널을 한 장으로 고정한다.

## 기본 매트릭스

| 에이전트 | 기본 호출 트리거 | 사용 스킬/문서 | 필수 산출물 | 필수 CC | 채널 |
| --- | --- | --- | --- | --- | --- |
| Jarvis | 전략, 우선순위, 승격 판단 | `templates/jarvis-command-protocol.md`, `skills/jarvis-design-review/SKILL.md` | Strategy Brief, Decision Log | Friday, KITT/TRON | `strategy` |
| Friday | 태스크 분해, Owner/CC 지정 | `templates/friday-task-breakdown-template.md`, `templates/specialized-agent-call-card.md` | Dispatch, DoD, 검증 명령 | Jarvis | `ops` |
| EVE | 리서치, 공식 출처 수집 | `docs/data-research-tooling-guidelines.md` | Source Notes, 출처 한계 | Data, KITT/TRON | `research` |
| Data | KPI, 시뮬레이션, 백테스트 | `docs/data-analysis-pipeline.md` | Analysis Report, Confidence, Limitations | KITT/TRON, Diagnostic Agent | `analysis` |
| TARS | 구현, 테스트, 로컬 검증 | `docs/development-execution-checklist.md` | 변경 파일, 실행법, 테스트 결과 | Data, KITT/TRON, Joi | `implementation` |
| Joi | UX/UI, IA, 화면 품질 | `templates/ia-brief-template.md`, User Flow, Design QA | IA Brief, Flow, UI Review, UX·IA Risks | TARS, C3PO | `design` |
| C3PO | 카피, 보고, 현지화 | Messaging Brief, 금지 주장 목록 | Copy Options, Risky Claims | KITT/TRON, Joi | `copy` |
| KITT/TRON | 보안, 개인정보, 금융, 릴리스 | `docs/risk-shield.md`, `docs/release-risk-gate.md` | Pass/Blocked 판정 | Jarvis, Human Conductor | `risk` |
| Diagnostic Agent | 반복 실패, 과신, 완료 불일치 | `docs/drift-diagnosis-checklist.md` | Diagnostic Review, Recovery Plan | Jarvis, Friday | `diagnostic` |
| Human Conductor | 실거래, 배포, 큰 방향 변경 | 승인 원장, Decision Log | 승인/보류/조건 | Jarvis, KITT/TRON | `approval` |

## 호출 이벤트 규칙

전문 호출은 다음 스크립트로 기록한다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "<request-id>" `
  -Agent "<agent>" `
  -Skill "<skill>" `
  -Task "<task>" `
  -Channel "<channel>" `
  -RiskLevel "<risk>"
```

CC는 `cc` 배열에만 넣지 말고, 대시보드 가시성을 위해 별도 이벤트도 남긴다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "<request-id>" `
  -Agent "KITT/TRON" `
  -Assignment CC `
  -Skill "risk-review" `
  -Task "리스크 검토" `
  -Channel risk `
  -RiskLevel High
```

## High 리스크 필수 분리

`riskLevel`이 `High` 또는 `Critical`인 요청은 다음 이벤트가 있어야 한다.

- `delegationType=specialized-agent-call` 전문 호출 이벤트
- `KITT/TRON` 또는 `channel=risk` 독립 리스크 리뷰 이벤트
- 테스트/검증/evidence 이벤트
- Work Log와 Episodic Memory

이 조건은 `scripts/validate-jarvis-request.ps1`에서 게이트로 확인한다.
