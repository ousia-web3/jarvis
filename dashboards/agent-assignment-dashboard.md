# 에이전트 배정 대시보드

## 목적

`dashboards/agent-assignment-dashboard.html`은 Jarvis AI Agent Team의 작업 배정과 실시간 이벤트를 한 화면에서 확인하기 위한 로컬 대시보드입니다.

이번 버전은 텍스트 로그만 보는 피로도를 줄이기 위해 `Virtual Office` 시각화를 추가했습니다. `dashboards/task-events.jsonl`에 기록되는 이벤트가 에이전트 캐릭터의 위치, 상태 뱃지, 움직임으로 반영됩니다.

## 적용 결정

```text
{D-04, Virtual Office Agent Visualization,
"텍스트 중심 실시간 이벤트 로그 위에 2D 오피스 배경과 움직이는 에이전트 캐릭터 레이어를 추가한다.",
"이벤트 로그는 정확하지만 장시간 관찰 시 피로도가 높다. 동일 JSONL 이벤트를 캐릭터 상태, 위치, 활동 뱃지로 변환하면 To/CC 흐름을 더 빨리 이해할 수 있다.",
"SYS.02 Virtual Office가 눈에 보이는 작업 공간으로 확장되고, SYS.01 Dream Team의 역할 분담이 대시보드 첫 화면에서 즉시 드러난다.",
"대안: 텍스트 로그와 카드 UI만 유지",
"보류: 실제 원격 협업 서버, 인증 기반 이벤트 수집, 사용자별 알림"}
```

## 파일

- `dashboards/agent-assignment-dashboard.html`: 브라우저에서 여는 정적 대시보드
- `dashboards/agent-assignment-data.json`: 에이전트, To/CC 샘플 요청, 오피스 스테이션 좌표, 이미지 자산 경로
- `dashboards/task-events.jsonl`: 역할별 작업 이벤트 로그
- `dashboards/task-event-schema.md`: 이벤트 로그 작성 규칙
- `assets/dashboard/virtual-office-robot-coworking.png`: 캐릭터 톤에 맞춰 재생성한 2D Virtual Office 배경
- `assets/dashboard/virtual-office.png`: 이전 2D Virtual Office 배경
- `assets/dashboard/agent-bot.png`: 투명 배경 에이전트 캐릭터
- `assets/dashboard/agent-bot-chromakey.png`: 배경 제거 전 원본 캐릭터 생성물
- `assets/dashboard/human-conductor.png`: 투명 배경 Human Conductor 캐릭터
- `assets/dashboard/human-conductor-chromakey.png`: 배경 제거 전 원본 Human Conductor 생성물

## 사용 방법

작업 요청 시작 시에는 자동 시작 스크립트를 우선 사용합니다.

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<요청 요약>"
```

반환된 `url`을 현재 AI툴 브라우저 또는 프리뷰 표면에서 엽니다. 예: Codex Browser `iab`, Cursor 브라우저/프리뷰, Antigravity 브라우저, VS Code Simple Browser/Webview. OS 기본 브라우저 자동 실행은 기본 경로가 아닙니다.

수동으로 서버만 켤 때는 프로젝트 루트에서 로컬 HTTP 서버를 실행합니다.

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis
python -m http.server 8787
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:8787/dashboards/agent-assignment-dashboard.html
```

HTML 파일을 직접 열 수도 있지만, 브라우저 보안 정책 때문에 `agent-assignment-data.json`과 `task-events.jsonl` fetch가 막힐 수 있습니다. 이 경우 대시보드는 내장 샘플 데이터를 표시합니다.

## 동적 처리 방식

- `task-events.jsonl`은 2초 간격으로 다시 읽습니다.
- `task-events.jsonl`에 새 `requestId`가 들어오면 대시보드가 현재 작업 요청을 자동으로 생성해 표시합니다.
- 단, 로컬 HTTP 서버에서 `work-requests/` 디렉터리 목록을 읽을 수 있을 때는 실제 작업 폴더가 있는 `requestId`만 요청 목록에 표시합니다. `work-requests/YYYY-MM-DD-request-slug/` 폴더가 삭제되면 이벤트 로그가 남아 있어도 해당 요청은 목록에서 숨겨집니다.
- 선택된 작업 요청의 `timestamp` 기준 최신 이벤트가 `Done`이면 요청 상태, 요청 선택 라벨, 실시간 로그, Virtual Office 상태를 모두 완료로 표시합니다.
- 완료된 요청에 같은 `requestId`로 추가 작업 이벤트가 들어오면 최신 `In Progress` 이벤트가 `Done`보다 우선합니다. 따라서 요청 상태와 Virtual Office는 다시 작업 중 시각화로 전환되어야 합니다.
- 최신 이벤트의 `agent`가 해당 캐릭터 상태를 갱신합니다.
- 최신 이벤트의 `channel`은 오피스 안의 스테이션 위치로 매핑됩니다.
- `status`는 캐릭터 애니메이션으로 표현됩니다.
- 캐릭터를 클릭하면 해당 에이전트 이벤트만 필터링됩니다.
- Human Conductor는 사람 캐릭터 1명으로 표시하고, 나머지 역할은 AI 에이전트 캐릭터로 표시합니다.
- Dynamic Workflow 이벤트가 있으면 전용 패널이 `workflowId`, `dynamicLevel`, 최신 stage, worker count, stage별 상태, worker별 최신 이벤트를 표시합니다.
- worker는 별도 캐릭터로 분리하지 않고, 전용 패널의 worker lane에서 `workerId`, `workerType`, `taskId`, 담당 에이전트, 상태를 추적합니다.

## 상태 표현

- `Todo`: 대기 상태
- `In Progress`: 작은 이동 애니메이션
- `Review`: 강조 펄스 애니메이션
- `Blocked`: 흔들림 애니메이션
- `Done`: 가벼운 점프 애니메이션

## 이벤트 로그 작성 규칙

`dashboards/task-events.jsonl`에는 한 줄에 하나의 JSON 객체를 append합니다. 필수 필드는 `timestamp`, `eventId`, `agent`, `assignment`, `status`, `task`입니다.

```json
{"timestamp":"2026-05-21T11:12:00+09:00","eventId":"EVT-015","requestId":"visual-office-dashboard","agent":"TARS","role":"엔지니어링","assignment":"To","status":"In Progress","task":"Virtual Office UI 구현","detail":"오피스 배경과 에이전트 캐릭터를 dashboard 이벤트 상태에 연결한다.","riskLevel":"Low","outputs":["agent-assignment-dashboard.html"],"channel":"implementation"}
```

Dynamic Workflow 이벤트는 다음 확장 필드를 함께 사용할 수 있습니다.

```json
{"timestamp":"2026-05-29T09:57:12+09:00","eventId":"EVT-DWF-001","requestId":"dynamic-workflow-level4-upgrade","agent":"TARS","role":"Implementer","assignment":"To","status":"Done","task":"Worker result: task-001","detail":"Dynamic Workflow parallel-execution","riskLevel":"Medium","outputs":["work-requests/.../results/task-001.result.json"],"channel":"implementation","skill":"dynamic-workflow","delegationType":"dynamic-workflow","workflowId":"DWF-dynamic-workflow-level4-upgrade","workflowStage":"parallel-execution","taskId":"task-001","workerId":"worker-task-001","workerType":"Implementer","dynamicLevel":"L4"}
```

## Dynamic Workflow 패널

전용 패널은 선택한 요청의 최신 `workflowId`를 기준으로 이벤트를 묶습니다.

- 요약: `dynamicLevel`, worker count, 최신 stage, 최신 상태
- Stage: `task-graph`, `worker-manifest`, `parallel-execution`, `verification`, `fixer`, `aggregation`
- Worker lane: `workerId`, `taskId`, `workerType`, 담당 agent, 최신 status
- 이벤트 로그: 기존 실시간 로그에도 `dynamicLevel`, stage, worker type, worker id 배지를 함께 표시

주의: 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값은 이벤트 로그에 기록하지 않습니다.

## 에이전트 배정 미리보기 형식

```text
Agent Assignment Preview

요청:

To:
- Jarvis
- Friday
- Joi
- TARS

CC:
- Data
- KITT/TRON
- Diagnostic Agent

Risk:
- 외부 배포 없음
- 로컬 정적 자산
- 개인정보/비밀키 기록 금지

Expected Outputs:
- agent-assignment-dashboard.html
- agent-assignment-data.json
- assets/dashboard/agent-bot.png
- assets/dashboard/human-conductor.png
- assets/dashboard/virtual-office-robot-coworking.png
```

## 개선 후보

- 작업 요청별 `agent-assignment-data.json` 자동 생성
- `EPIC/FEAT/REQ/NFR/RISK` 식별자 표시
- 이벤트 로그 append helper 스크립트 추가
- 원격 협업 이벤트 수집 서버와 인증 모델 설계
