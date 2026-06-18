# JARVIS 웹 IA 프로세스 통합

- requestId: `jarvis-web-ia-process-integration`
- 상태: Done
- 작업일: 2026-06-18

## Human Brief

- [human-brief.md](./human-brief.md)

## 수행 작업 (보완 제안 6항목)

| # | 항목 | 결과 |
| ---: | --- | --- |
| 1 | `templates/ia-brief-template.md` 추가 | 완료 |
| 2 | Joi UX Brief 확장 (`agents/joi.md`) | 완료 |
| 3 | Design Review 7→8문서 (`skills/jarvis-design-review/SKILL.md`) | 완료 |
| 4 | Friday 웹서비스 TASK-IA 체인 (`templates/friday-task-breakdown-template.md`) | 완료 |
| 5 | request-state-machine IA Draft 게이트 + validate 스크립트 | 완료 |
| 6 | workforce-deliverables Joi IA 산출물 | 완료 |

## 변경 파일

- `templates/ia-brief-template.md` (신규)
- `templates/README.md`
- `templates/friday-task-breakdown-template.md`
- `agents/joi.md`
- `skills/jarvis-design-review/SKILL.md`
- `skills/agent-team-orchestration/SKILL.md`
- `skills/README.md`
- `docs/request-state-machine.md`
- `docs/workforce-deliverables.md`
- `docs/development-execution-checklist.md`
- `docs/agent-skill-call-matrix.md`
- `docs/pilot-youtube-shop-kickoff.md`
- `docs/README.md`
- `scripts/validate-jarvis-request.ps1`
- `AGENTS.md`

## 적용 역할

- Jarvis: 전략·운영 자산 통합
- Friday: 태스크 체인·게이트 정의
- Joi: IA/UX 산출물 기준
- TARS: 개발 체크리스트·검증 스크립트
- KITT/TRON: Low 리스크 문서 작업, 외부 배포 없음

## 검증

- [evidence/verification-2026-06-18.md](./evidence/verification-2026-06-18.md)

## 로컬 확인

```powershell
# IA 템플릿 존재
Test-Path templates/ia-brief-template.md

# 요청 검증 (본 작업은 Low 리스크 문서 작업 — ia-draft 게이트 비적용)
powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId jarvis-web-ia-process-integration
```

대시보드: http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html
