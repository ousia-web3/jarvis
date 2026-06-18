# 검증 기록 — 2026-06-18

## 1. 템플릿·문서 존재 확인

| 항목 | 경로 | 결과 |
| --- | --- | --- |
| IA Brief 템플릿 | `templates/ia-brief-template.md` | PASS — 사이트맵, 콘텐츠 계층, 내비, 라벨, DoD 포함 |
| Joi IA 확장 | `agents/joi.md` | PASS — Site Map, Navigation Model, Label Dictionary 필드 |
| Design Review 8문서 | `skills/jarvis-design-review/SKILL.md` | PASS — IA가 3번 문서로 추가 |
| Friday TASK-IA | `templates/friday-task-breakdown-template.md` | PASS — TASK-IA/UX/WEB/WEB-QA 체인 |
| IA Draft 게이트 | `docs/request-state-machine.md` | PASS — 생명주기·게이트·생략 규칙 |
| Joi 산출물 | `docs/workforce-deliverables.md` | PASS — IA Brief 등 10항목 |
| TARS 체크리스트 | `docs/development-execution-checklist.md` | PASS — IA Brief 확인 항목 |
| validate 스크립트 | `scripts/validate-jarvis-request.ps1` | PASS — `ia-draft` 게이트 추가 |

## 2. 교차 참조

- `templates/README.md` — ia-brief-template 등록
- `docs/agent-skill-call-matrix.md` — Joi IA Brief 산출물
- `docs/pilot-youtube-shop-kickoff.md` — IA 단계 추가
- `AGENTS.md`, `skills/README.md`, `docs/README.md` — 8개 문서 반영

## 3. 한계

- catbook 등 기존 프로젝트에 소급 `ia-brief.md` 생성은 범위 외
- Human Brief 템플릿 본문에 IA 섹션 추가는 이번 6항목 목록에 없어 미적용
- 운영 자산 65개 인벤토리 번호 재집계는 미적용

## 4. Risk Shield

- Risk: Low
- 외부 배포 없음, 기존 워크플로우 확장만 수행
