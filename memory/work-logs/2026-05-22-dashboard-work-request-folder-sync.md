# 업무 로그: dashboard-work-request-folder-sync

## 메타데이터

- Task ID: dashboard-work-request-folder-sync
- Project: Jarvis
- Agent: TARS
- Role: 엔지니어링
- Started At: 2026-05-22T12:05:00+09:00
- Finished At: 2026-05-22T12:12:00+09:00
- Status: Done

## 입력

- 요청 요약: `work-requests/` 안의 폴더를 삭제해도 대시보드 그룹/요청 목록에서 삭제되지 않는 현상 확인 및 수정.
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`
- 제약: 사용자 기존 폴더는 삭제하지 않고, 검증용으로 생성한 임시 폴더만 안전 확인 후 삭제.

## 실행

- 수행한 일: 대시보드 요청 목록이 `task-events.jsonl`만 기준으로 생성되던 구조를 확인하고, `/work-requests/` 디렉터리 목록과 동기화하도록 수정.
- 사용한 도구: PowerShell, Playwright 브라우저, `apply_patch`
- 주요 판단: 이벤트 로그는 중앙 기록으로 남기되, 요청 목록은 실제 작업 폴더가 존재하는 요청만 표시하는 것이 사용자의 삭제 기대와 맞음.
- 우회 또는 피봇: 디렉터리 목록을 읽을 수 없는 환경에서는 기존 이벤트 로그 기반 표시로 fallback하도록 처리.

## 산출물

- 산출물: 대시보드 폴더 동기화 패치, 브라우저 검증 증거
- 변경 파일: `dashboards/agent-assignment-dashboard.html`, `dashboards/agent-assignment-dashboard.md`, `work-requests/2026-05-22-dashboard-work-request-folder-sync/README.md`, `work-requests/2026-05-22-dashboard-work-request-folder-sync/evidence/folder-sync-check.json`
- 검증 결과: 폴더 없는 orphan 이벤트, 삭제된 임시 폴더 이벤트, 폴더 없는 정적 샘플 요청 모두 요청 목록에서 숨김. 콘솔 오류 0건, 페이지 오류 0건.

## 리스크

- 발견한 리스크: `work-requests/` 디렉터리 목록을 제공하지 않는 서버에서는 폴더 동기화가 불가능하므로 fallback 동작이 필요.
- 호출한 CC: Friday, Diagnostic Agent, KITT/TRON
- 승격 여부: Human Conductor 승격 불필요

## 다음

- 다음 액션: 폴더 삭제 시 이벤트 로그는 기록 보존용으로 남고, 대시보드 요청 목록만 숨김 처리되는 정책을 유지.
- 후속 담당자: TARS
