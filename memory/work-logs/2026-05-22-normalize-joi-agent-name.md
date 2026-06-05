# 업무 로그: Joi 에이전트 명칭 통합

## 메타데이터

- 작업 ID: `normalize-joi-agent-name`
- 프로젝트: Jarvis
- 에이전트: TARS, Joi, Friday, KITT/TRON, Diagnostic Agent
- 역할: 문서 정리, 대시보드 설정 수정, 검증
- 시작 시각: 2026-05-22T10:05:00+09:00
- 완료 시각: 2026-05-22T10:15:00+09:00
- 상태: Done

## 입력

- 요청 요약: 이전 병기 표기가 두 개의 에이전트처럼 보이지 않도록 `Joi` 단일 에이전트로 통합한다.
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`
- 제약: 현재 운영 파일을 중심으로 수정하고, 과거 증거 스냅샷과 브라우저 캐시 기록은 보존한다.

## 실행

- 수행한 일:
  - `agents/joi-joy.md`를 `agents/joi.md`로 이동하고 내부 명칭을 `Joi`로 수정했다.
  - 활성 운영 문서, 스킬, 템플릿, 대시보드 설정, 검증 스크립트의 에이전트 명칭과 링크를 `Joi` 기준으로 통합했다.
  - 대시보드의 에이전트 ID를 `joi`로 정리했다.
  - 활성 운영 파일에서 이전 복합 표기와 기존 파일 식별자가 남았는지 검색했다.
- 사용한 도구: PowerShell, Playwright 브라우저 표면, apply_patch
- 주요 판단: 과거 `work-requests/*/evidence`와 `tmp/` 캐시 파일은 기록 증거라 수정하지 않았다.
- 우회 또는 피봇: 신규 이벤트 detail에 이전 표기가 다시 들어간 것을 확인하고, 중앙 이벤트 로그도 `Joi` 표기로 정리했다.

## 산출물

- 산출물:
  - `agents/joi.md`
  - `work-requests/2026-05-22-normalize-joi-agent-name/README.md`
  - `work-requests/2026-05-22-normalize-joi-agent-name/evidence/active-joi-legacy-search.txt`
  - `work-requests/2026-05-22-normalize-joi-agent-name/evidence/dashboard-joi-check.json`
- 변경 범위:
  - `AGENTS.md`
  - `agents/`
  - `architecture/`
  - `dashboards/`
  - `docs/`
  - `scripts/validate-jarvis-request.ps1`
  - `skills/`
  - `templates/`
- 검증 결과:
  - 활성 운영 파일에서 이전 복합 표기와 기존 파일 식별자 검색 결과 없음
  - 대시보드 HTML 응답 200, `Joi` 포함, 이전 표기와 기존 ID 미포함

## 리스크

- 발견한 리스크: 과거 증거 파일까지 수정하면 감사 기록이 흐려질 수 있어 보존했다.
- 호출한 CC: Friday, Joi, KITT/TRON, Diagnostic Agent
- 승격 여부: Low risk라 Human Conductor 승격 없음.

## 다음

- 다음 액션: 나중에 Agent Brain 검색이나 MCP 서버를 만들 때도 에이전트 ID는 `joi` 기준으로 사용한다.
- 후속 담당자: Jarvis, TARS
