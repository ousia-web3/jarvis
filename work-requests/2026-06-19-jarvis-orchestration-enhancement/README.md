# Jarvis 오케스트레이션 고도화

- requestId: `jarvis-orchestration-enhancement`
- 시작일: 2026-06-19

## Human Brief

### 요청 요약

2026-06-19 대화에서 정리한 Jarvis 운영·SI·멀티 IDE·리서치 갭을 바탕으로 **고도화 작업목록 MD**를 작성한다.

### 목표

- 오케스트레이션 연동 상태, MVP/Design Review 구분, SI EVE 리서치, Codex/Antigravity 규칙을 **실행 가능한 WBS**로 통합
- **L0/L1/L2 실행 트랙**과 비용·단점 완화 정책을 반영해 과도한 오버헤드 없이 고도화

### 성공 기준

- [x] `jarvis-enhancement-worklist.md`에 P0/P1/P2/P3 작업 ID·Owner·산출물·완료 기준 포함
- [x] 대화 근거(드리프트, Dynamic Workflow, SI 리서치, IDE)가 영역별로 추적 가능
- [x] `start-jarvis-request.ps1` intake 이벤트 기록
- [x] L0/L1/L2 트랙, R0~R2 리서치 깊이, validate 보고용/차단용, 신규-only JSONL 정책 반영

### 금지 사항

- CrewAI/LangGraph 전면 교체를 1차 권장으로 두지 않음
- 외부 배포·대량 삭제 없음

## 산출물

| 파일 | 설명 |
| --- | --- |
| [jarvis-enhancement-worklist.md](./jarvis-enhancement-worklist.md) | 고도화 작업목록 본문 |
| [README.md](./README.md) | Human Brief 및 폴더 안내 |
| [event-drift-audit.md](./evidence/event-drift-audit.md) | JSONL 신규-only 정책과 현재 이벤트 재개 확인 |
| [../../docs/execution-mode-guide.md](../../docs/execution-mode-guide.md) | L0/L1/L2, Design Review, IA Draft, R0/R1/R2 실행 모드 가이드 |
| [../../templates/source-analysis-template.md](../../templates/source-analysis-template.md) | R0/R1 SI 소스 분석 템플릿 |
| [../../templates/eve-si-research-pack.md](../../templates/eve-si-research-pack.md) | R2 EVE SI 리서치 Pack |

## 2026-06-19 추가 실행

### Agent Assignment Preview

| 항목 | 내용 |
| --- | --- |
| 요청 | `jarvis-enhancement-worklist.md` 기준 Jarvis 오케스트레이션 개선 진행 |
| To | Jarvis, Friday, TARS, C3PO |
| CC | Diagnostic Agent, KITT/TRON |
| Risk | Low |
| Expected Outputs | SSOT 실행 트랙, IDE 규칙, 실행 모드 가이드, SI 템플릿, catbook 검증 경로 |
| 다음 액션 | P0/P1 1차 권장 묶음 적용 후 validate |

### 적용한 작업 ID

- P0-01: `AGENTS.md`, `skills/agent-team-orchestration/SKILL.md`에 L0/L1/L2, validate 모드, 신규-only JSONL 정책 추가
- P0-02: `.cursor/rules/jarvis-agent-team.mdc`를 `@AGENTS.md` 참조형 규칙으로 정리
- P0-03: `.agents/rules/jarvis-agent-team.md` Antigravity Always On 규칙 추가
- P0-04: `docs/README.md`, `docs/project-user-manual.html`에 Antigravity와 실행 모드 가이드 연결
- P0-05: `evidence/event-drift-audit.md`로 이벤트 정책 확정
- P0-06: `scripts/validate-jarvis-request.ps1`가 `catbook/project-records/work-requests/`를 인식하도록 보강
- P0-07: `docs/execution-mode-guide.md` 추가
- P1-07/P1-08: `templates/eve-si-research-pack.md`, `templates/source-analysis-template.md` 추가

## Work Log

- 시작 훅: 기존 `requestId=jarvis-orchestration-enhancement` 재사용, `In Progress` 이벤트 기록
- 브라우저: Codex Browser `iab`가 현재 세션에서 제공되지 않아 대시보드 URL fallback 기록
- 구현: SSOT, IDE 규칙, 매뉴얼 링크, 실행 모드 가이드, SI 템플릿, validate 경로 보강
- Risk Shield: 문서·로컬 스크립트 변경만 포함하며 삭제, 외부 배포, 비밀키, 개인정보 처리 없음

## 로컬 확인

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId jarvis-orchestration-enhancement
```

대시보드: http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html

추가 검증:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId jarvis-orchestration-enhancement
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId ontology-terms-production-manual
```
