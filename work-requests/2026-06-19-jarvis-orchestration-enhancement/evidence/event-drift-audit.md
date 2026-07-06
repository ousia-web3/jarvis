# 이벤트 드리프트 감사

- requestId: `jarvis-orchestration-enhancement`
- 감사일: 2026-06-19
- Owner(To): Diagnostic Agent
- CC: Friday, Jarvis

## 확인 내용

- `dashboards/task-events.jsonl`의 최신 20줄을 확인했다.
- 2026-06-05 이후 이벤트가 끊긴 구간이 있었고, 2026-06-19 `jarvis-orchestration-enhancement` 요청에서 다시 `In Progress` 이벤트가 기록됐다.
- 이번 작업 시작 훅 결과: `eventWritten=true`, `requestId=jarvis-orchestration-enhancement`, URL `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html`.
- Codex Browser `iab`는 현재 세션에서 사용할 수 없어 대시보드 URL fallback으로 처리했다.

## 정책 결정

- 과거 work-request 전체 JSONL 백필은 기본 보류한다.
- 2026-06-19 이후 신규/진행 요청은 `start-jarvis-request.ps1`, `invoke-jarvis-agent.ps1`, `close-jarvis-request.ps1` 중 적절한 훅으로 이벤트를 남긴다.
- 완료된 요청에 후속 작업이 들어오면 기존 `requestId`를 재사용하고 새 `In Progress` 이벤트를 append한다.
- 대시보드의 Needs Work는 기본적으로 차단이 아니라 체크리스트이며, `validate -Strict`일 때만 차단 신호로 본다.

## 리스크

- 과거 이벤트 공백은 README/Work Log를 SSOT로 보완한다.
- 대시보드 시각화는 JSONL 최신 이벤트를 기준으로 하므로, 향후 의미 있는 요청은 최소 시작/완료 이벤트를 남겨야 한다.
