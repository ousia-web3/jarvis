# 업무 로그: 정적 워크플로 패널 숨김

## 메타데이터

- 작업 ID: hide-static-workflow-panel
- 프로젝트: Jarvis
- 에이전트: TARS
- 역할: 엔지니어링 / 대시보드 UX 정리
- 시작 시각: 2026-05-22
- 완료 시각: 2026-05-22
- 상태: Done

## 입력

- 요청 요약: 대시보드의 `작업 흐름` 정적 영역이 꼭 필요한지 확인하고 필요 없으면 숨김 또는 제거.
- 참조 문서: `docs/README.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`
- 제약: 결정 로그 데이터 삭제 없음, 외부 배포 없음, 민감정보 처리 없음

## 실행

- 수행한 일:
  - 대시보드 `작업 흐름 + decisionLog` 정적 화면 섹션 제거
  - `renderDecision` 함수에 대상 DOM이 없을 때 조용히 종료하는 방어 처리 추가
  - HTTP 응답과 로컬 Chrome headless 스크린샷으로 화면 검증
  - 시작 훅 실패 상황을 작업 README에 기록하고 이벤트 로그는 수동 보강
- 사용한 도구: PowerShell, `rg`, `apply_patch`, Chrome headless
- 주요 판단: 해당 영역은 고정 설명이므로 실시간 운영 대시보드 첫 화면에서는 운영 게이트, Virtual Office, 실시간 로그보다 우선순위가 낮다.
- 우회 또는 피봇: `start-jarvis-request.ps1`가 Windows PowerShell 페이징 파일 오류와 timeout을 보여 수동 이벤트 기록으로 보강

## 산출물

- 산출물:
  - `dashboards/agent-assignment-dashboard.html`
  - `work-requests/2026-05-22-hide-static-workflow-panel/evidence/dashboard-static-workflow-removed-chrome.png`
- 변경 파일:
  - `dashboards/agent-assignment-dashboard.html`
  - `dashboards/task-events.jsonl`
  - `work-requests/2026-05-22-hide-static-workflow-panel/README.md`
  - `memory/work-logs/2026-05-22-hide-static-workflow-panel.md`
  - `memory/episodic/2026-05-22-hide-static-workflow-panel.md`
- 검증 결과:
  - HTML 파일에서 `<h2>작업 흐름</h2>` 제거 확인
  - HTTP 응답에서 `작업 흐름` 미포함 확인
  - Chrome headless 스크린샷에서 운영 게이트 다음에 Virtual Office가 이어지는 화면 확인

## 리스크

- 발견한 리스크: 낮음. 화면의 정적 설명 블록만 제거.
- 호출한 CC: Joi, Friday, KITT/TRON
- 승격 여부: 필요 없음

## 다음

- 다음 액션: 사용자가 원하면 삭제 대신 접이식 도움말로 다시 제공 가능
- 후속 담당자: 대시보드 UX 담당 에이전트
