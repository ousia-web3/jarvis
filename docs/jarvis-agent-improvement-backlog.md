# Jarvis 에이전트 개선 백로그

작성일: 2026-05-22

## 목적

하네스 에이전트 동향과 현재 Jarvis 환경을 비교한 뒤, 나중에 차분히 검토할 개선 후보를 한곳에 모아둔다. 이 문서는 즉시 실행 계획이 아니라 우선순위 판단을 위한 백로그다.

## 현재 판단

Jarvis는 이미 운영형 에이전트 하네스의 기본 뼈대를 갖추고 있다. `AGENTS.md`, `docs/`, `skills/`, `work-requests/`, `dashboards/task-events.jsonl`, `memory/` 구조가 작업 접수, 역할 분담, 리스크 검토, 기록, 회고를 담당한다.

지금 필요한 개선은 새로운 멀티에이전트 프레임워크로 갈아타는 것이 아니라, 현재 Jarvis 운영 모델을 더 실행 가능하고 검증 가능하게 만드는 것이다.

## 우선순위 요약

| 우선순위 | 개선 항목 | 기대 효과 |
| --- | --- | --- |
| P0 | 루트 Git 저장소화 | 변경 이력, 리뷰, 롤백, PR 흐름 확보 |
| P0 | Jarvis 로컬 MCP 서버 | 문서/이벤트/메모리를 에이전트가 공식 도구로 호출 |
| P0 | 요청 상태 스키마 고정 | 완료 보고 드리프트와 누락 감소 |
| P1 | 완료 검증 게이트 자동화 | 작업 종료 전 필수 증거 확인 |
| P1 | Agent Brain 검색 가능화 | 과거 작업과 지혜 후보 재사용 |
| P1 | 실행 권한 정책 분리 | 삭제, 배포, 외부 전송, 비밀정보 접근 통제 |
| P2 | 장기 실행 워크플로우 도입 | 2026-05-29 로컬 Dynamic Workflow L1-L4 하네스 1차 적용. 다음 단계는 실제 AI CLI/워크트리 연동 |
| P2 | 대시보드 운영성 개선 | 이벤트 상태, 서버 상태, 요청별 필터링 강화 |

## 개선 후보 상세

### 1. 루트 Git 저장소화

현재 `jarvis` 루트는 Git 저장소가 아니다. 문서와 스크립트가 빠르게 늘어나는 구조라 변경 이력, 실험 브랜치, 롤백, 리뷰 흐름이 필요하다.

권장 작업:

- 루트에 Git 초기화 여부 결정
- 추적 제외 파일 정리
- `tmp/`, 브라우저 프로필, 캐시, 로그 파일 제외
- 작업 요청 산출물은 보존하되 대용량 증거 파일 정책 분리

판단 포인트:

- 로컬 개인 운영 저장소로만 둘지, 원격 저장소까지 연결할지
- 민감정보가 들어갈 수 있는 폴더를 어떻게 제외할지

### 2. Jarvis 로컬 MCP 서버

Jarvis 운영체계는 문서와 JSONL로 잘 정리되어 있지만, 에이전트가 호출할 수 있는 공식 도구 계층은 아직 약하다. MCP 서버를 만들면 Jarvis의 운영 규칙이 실제 도구가 된다.

후보 도구:

- `create_work_request`
- `append_task_event`
- `read_task_events`
- `validate_request`
- `read_project_doc`
- `write_work_log`
- `write_episodic_memory`
- `list_agent_roles`

주의할 점:

- 삭제, 배포, 외부 전송 도구는 기본 제공하지 않는다.
- 쓰기 도구는 경로 allowlist를 둔다.
- 이벤트 로그에는 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값을 기록하지 않는다.

### 3. 요청 상태 스키마 고정

현재 `dashboards/task-events.jsonl`과 `validate-jarvis-request.ps1`가 있지만, 요청 상태의 핵심 필드를 더 엄격하게 고정할 수 있다.

권장 필드:

- `requestId`
- `owner`
- `cc`
- `riskLevel`
- `status`
- `definitionOfDone`
- `expectedOutputs`
- `evidence`
- `riskReview`
- `doneCriteria`

구현 후보:

- JSON Schema
- Pydantic 모델
- PowerShell 검증 스크립트 확장

### 4. 완료 검증 게이트 자동화

현재 검증 스크립트는 존재하지만, 모든 의미 있는 작업의 종료 루틴에 더 강하게 연결하면 좋다.

검증 항목:

- Human Brief 또는 README 존재
- To/CC 지정
- 관련 이벤트 존재
- 실행 산출물 존재
- 검증 증거 존재
- Risk Shield 필요 여부 판단
- 최신 이벤트가 `Done`
- Work Log와 Episodic Memory 기록

### 5. Agent Brain 검색 가능화

`memory/`는 잘 쌓이고 있지만, 다음 작업에서 자동으로 관련 기억을 찾아 쓰는 구조는 약하다.

개선 방향:

- memory index 파일 생성
- 태그 규칙 추가
- requestId, agent, risk, domain 기준 검색
- wisdom candidate 승격 기준 자동 점검

간단한 시작:

- `memory/index.json` 또는 `memory/index.md` 생성
- 새 work log 작성 후 인덱스 갱신

### 6. 실행 권한 정책 분리

최신 에이전트 하네스의 핵심은 도구를 많이 주는 것이 아니라, 도구 권한을 안전하게 나누는 것이다.

권장 정책:

- 읽기: 기본 허용
- 문서 생성/수정: 작업 폴더와 문서 폴더 중심으로 허용
- 삭제/대량 이동: Human Conductor 확인
- 외부 배포/전송: Human Conductor 확인
- 비밀키/개인정보/계좌 정보: 기본 차단
- 실거래 주문: 기본 차단

산출물 후보:

- `docs/tool-permission-policy.md`
- `docs/human-approval-gates.md`

### 7. 장기 실행 워크플로우 도입

2026-05-29에 로컬 Dynamic Workflow L1-L4 하네스를 1차 적용했다. 현재 범위는 `task-graph.json`, `worker-manifest.json`, context packet, PowerShell job 기반 병렬 실행, Verifier/Fixer/Aggregator 산출물 생성이다.

적용된 파일:

- `docs/dynamic-workflow.md`
- `templates/dynamic-workflow-task-graph.json`
- `templates/dynamic-worker-manifest.json`
- `scripts/new-dynamic-workflow.ps1`
- `scripts/run-dynamic-workflow.ps1`

LangGraph, Pydantic Graph, Vercel Workflow 같은 도구는 중단/재개, 체크포인트, human-in-the-loop가 더 강하게 필요할 때 가치가 크다.

도입 조건:

- 하루 이상 이어지는 작업이 많아질 때
- 외부 API 호출과 재시도가 늘어날 때
- 사람이 중간 승인해야 하는 단계가 많아질 때

지금은 로컬 하네스 수준으로 충분하다. 다음 단계는 실제 AI CLI, Git worktree 격리, 워커별 최소 컨텍스트 자동 추출, 실패 task 자동 재시도 정책을 붙일지 판단하는 것이다.

### 8. 대시보드 운영성 개선

현재 대시보드는 로컬 이벤트 시각화에 충분하지만, 운영성이 더 좋아질 수 있다.

개선 후보:

- 요청별 완료 상태 요약
- 최근 실패/Blocked 이벤트 강조
- 검증 게이트 결과 표시
- 대시보드 서버 health 표시
- 이벤트 로그 parse warning 표시
- 오래된 이벤트 보관/아카이브 정책

## 지금은 보류해도 되는 것

- CrewAI로 전체 Jarvis 모델 교체
- LangGraph로 모든 작업을 그래프화
- A2A 기반 외부 에이전트 연동
- 원격 협업 서버 구축
- 대시보드 인증/멀티유저화

이 항목들은 현재 Jarvis의 핵심 병목이 아니다. 먼저 로컬 운영 하네스를 단단하게 만드는 편이 낫다.

## 다음에 검토할 질문

- Jarvis를 개인 로컬 운영체계로 둘 것인가, 팀 협업용으로 확장할 것인가?
- MCP 서버는 Python으로 만들 것인가, TypeScript로 만들 것인가?
- 모든 작업 요청에 Work Log와 Episodic Memory를 강제할 것인가?
- `memory/`를 단순 문서 저장소로 둘 것인가, 검색 가능한 지식베이스로 확장할 것인가?
- Git 원격 저장소를 연결한다면 공개/비공개 정책은 어떻게 둘 것인가?

## 1차 추천

다음 작업으로 하나만 고른다면 `Jarvis 로컬 MCP 서버 설계`가 가장 효과가 크다. Jarvis의 문서, 이벤트, 메모리 구조를 에이전트가 직접 호출할 수 있게 만들면 현재 운영 모델이 실제 실행 하네스로 한 단계 올라간다.
