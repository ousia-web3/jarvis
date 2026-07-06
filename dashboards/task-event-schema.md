# 작업 이벤트 로그 스키마

## 목적

`dashboards/task-events.jsonl`은 Jarvis 에이전트 팀의 역할별 작업 이벤트를 한 줄씩 기록하는 로컬 이벤트 로그입니다.

`agent-assignment-dashboard.html`은 로컬 HTTP 서버에서 열렸을 때 이 파일을 2초 간격으로 읽고, 다음 두 가지 방식으로 표시합니다.

- 텍스트 기반 실시간 작업 이벤트 로그
- `Virtual Office` 위의 2D 에이전트 캐릭터 위치와 상태 애니메이션

## 결정 기록

```text
{D-03, 에이전트 작업 이벤트 로그,
"정적 배정 대시보드 + JSONL 기반 실시간 작업 로그 병행",
"로컬 파일 append만으로 역할별 진행 상황을 브라우저에서 확인 가능",
"작업 중 To/CC 배정과 실제 이벤트 흐름의 가시성이 올라감",
"대안: 수동 텍스트 완료 보고만 유지",
"보류: 원격 작업 서버, 인증, 원격 이벤트 수집"}

{D-04, Virtual Office Agent Visualization,
"텍스트 중심 실시간 이벤트 로그 위에 2D 오피스 배경과 움직이는 에이전트 캐릭터 레이어를 추가",
"같은 JSONL 이벤트를 캐릭터 상태, 위치, 활동 뱃지로 변환해 피로도를 줄임",
"SYS.02 Virtual Office를 시각적 작업 공간으로 확장",
"대안: 텍스트 로그와 카드 UI만 유지",
"보류: 원격 협업 서버와 인증 기반 알림"}
```

## 파일 형식

- 형식: JSONL
- 위치: `dashboards/task-events.jsonl`
- 규칙: 한 줄에 하나의 JSON 객체
- 정렬: append 순서를 보존하되, 대시보드는 `timestamp` 기준 최신순으로 표시
- 보안: 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값은 기록 금지
- 표기: `role`, `task`, `detail`, 사람이 읽는 `outputs` 값은 한글을 기본으로 쓴다. 파일 경로, 명령어, 코드 식별자, 고유명사는 원문 표기를 유지할 수 있다.
- 재개: 완료된 요청에 추가 작업이 들어오면 같은 `requestId`로 `In Progress` 이벤트를 append한다. 대시보드는 최신 이벤트를 기준으로 완료 상태를 진행 상태로 되돌리고 Virtual Office 시각화를 다시 작업 중으로 표시한다.

## 필드

| 필드 | 필수 | 예시 | 설명 |
| --- | --- | --- | --- |
| `timestamp` | 필수 | `2026-05-21T11:12:00+09:00` | ISO 8601 시각 |
| `eventId` | 필수 | `EVT-015` | 이벤트 식별자 |
| `requestId` | 권장 | `visual-office-dashboard` | 작업 요청 묶음 식별자 |
| `agent` | 필수 | `TARS` | 해당 에이전트 이름. 대시보드의 `agents[].name`과 맞추는 것을 권장 |
| `role` | 권장 | `엔지니어링` | 역할 설명 |
| `assignment` | 필수 | `To` | `To`, `CC`, `Standby` 중 하나 |
| `status` | 필수 | `In Progress` | `Todo`, `In Progress`, `Review`, `Blocked`, `Done` 중 하나 |
| `task` | 필수 | `Virtual Office UI 구현` | 작업 제목 |
| `detail` | 권장 | `오피스 배경과 캐릭터를 이벤트 상태에 연결` | 이벤트 상세. 대시보드 표시용 문구는 `~했다`, `~합니다` 같은 문장 종결형보다 명사형 또는 작업 항목형을 권장 |
| `riskLevel` | 권장 | `Low` | `Low`, `Medium`, `High`, `Critical` 중 하나 |
| `outputs` | 권장 | `["agent-assignment-dashboard.html"]` | 관련 산출물 목록 |
| `channel` | 권장 | `implementation` | 오피스 스테이션 위치 매핑에 사용 |
| `skill` | 선택 | `simulation-validation` | 전문 스킬 또는 호출 모드 이름 |
| `cc` | 선택 | `["KITT/TRON"]` | 요약 검토를 맡은 CC 에이전트 목록 |
| `delegationType` | 선택 | `specialized-agent-call` | 수동 이벤트인지 전문 에이전트 호출 이벤트인지 구분 |
| `workflowId` | 선택 | `DWF-dynamic-workflow-level4-upgrade` | Dynamic Workflow 식별자 |
| `workflowStage` | 선택 | `parallel-execution` | `task-graph`, `worker-manifest`, `parallel-execution`, `verification`, `fixer`, `aggregation` 중 하나 |
| `taskId` | 선택 | `task-001` | Task Graph의 태스크 식별자 |
| `workerId` | 선택 | `worker-task-001` | 동적 worker 식별자 |
| `workerType` | 선택 | `Implementer` | `Implementer`, `Verifier`, `Fixer`, `Aggregator`, `Executor` 중 하나 |
| `dynamicLevel` | 선택 | `L4` | 적용된 Dynamic Workflow 레벨 |

## channel 매핑

`channel` 값은 `agent-assignment-data.json`의 `visualOffice.channelStationMap`을 통해 오피스 위치로 변환됩니다.

기본 매핑:

- `approval`: Human 승인 존
- `strategy`: Jarvis 전략 테이블
- `ops`: Friday 운영 데스크
- `research`: EVE 리서치 서가
- `design`: Joi 디자인 테이블
- `implementation`: TARS 개발 콘솔
- `docs`, `copy`: C3PO 커뮤니케이션 라운지
- `analysis`: Data 분석 스테이션
- `risk`: KITT/TRON Risk Shield
- `diagnostic`: Diagnostic 점검 포드

## 예시

```json
{"timestamp":"2026-05-21T11:12:00+09:00","eventId":"EVT-015","requestId":"visual-office-dashboard","agent":"TARS","role":"엔지니어링","assignment":"To","status":"In Progress","task":"Virtual Office UI 구현","detail":"오피스 배경과 에이전트 캐릭터를 dashboard 이벤트 상태에 연결","riskLevel":"Low","outputs":["agent-assignment-dashboard.html"],"channel":"implementation"}
```

Dynamic Workflow 이벤트 예시:

```json
{"timestamp":"2026-05-29T09:57:12+09:00","eventId":"EVT-DWF-001","requestId":"dynamic-workflow-level4-upgrade","agent":"TARS","role":"Implementer","assignment":"To","status":"Done","task":"Worker result: task-001","detail":"Dynamic Workflow parallel-execution","riskLevel":"Medium","outputs":["work-requests/.../results/task-001.result.json"],"channel":"implementation","skill":"dynamic-workflow","delegationType":"dynamic-workflow","workflowId":"DWF-dynamic-workflow-level4-upgrade","workflowStage":"parallel-execution","taskId":"task-001","workerId":"worker-task-001","workerType":"Implementer","dynamicLevel":"L4"}
```

## 로컬 실행

작업 요청 시작 훅으로 실행할 때는 다음 스크립트를 사용합니다.

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<요청 요약>"
```

스크립트는 로컬 서버를 시작하거나 기존 서버를 재사용하고, 첫 작업 이벤트를 `dashboards/task-events.jsonl`에 append합니다. 반환된 URL은 OS 기본 브라우저가 아니라 활성 AI툴 브라우저/프리뷰에서 바로 엽니다. 가능하면 선택된 기존 탭/프리뷰를 재사용하고 별도 `about:blank` 창이나 탭을 먼저 만들지 않습니다.

서버만 수동 실행할 때는 다음 명령을 사용합니다.

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis
python -m http.server 8787
```

브라우저에서 엽니다.

```text
http://localhost:8787/dashboards/agent-assignment-dashboard.html
```

HTML 파일을 직접 열면 브라우저 보안 정책 때문에 JSONL fetch가 막힐 수 있습니다. 이 경우 대시보드는 내장 샘플 이벤트를 표시합니다.

## 표기 원칙

- 사용자에게 보이는 이벤트 제목, 상세, 산출물 설명은 한글로 작성합니다.
- `detail`은 짧은 작업 항목처럼 작성합니다. 예: `작업을 분해`, `검증 완료`, `브라우저 확인`.
- 파일 경로, 명령어, 코드 식별자, 에이전트 고유명은 원문 표기를 유지할 수 있습니다.
- 영어로 남아 있는 과거 이벤트는 대시보드 표시 단계에서 한글 별칭으로 보정할 수 있습니다.
