# Jarvis 프로젝트 구조 분석 및 개선 제안

## 한 줄 결론

현재 프로젝트는 단일 앱 저장소가 아니라 `Jarvis 운영체계 + 작업 요청 저장소 + Agent Brain + 3개 하위 제품/실험 프로젝트`가 한 루트에 모인 로컬 운영 허브다. 문서와 운영 철학은 탄탄하지만, 루트 Git 부재, 대시보드 시작 훅 불안정성, 하위 프로젝트 인덱싱 누락, 작업 요청/증거 누적 정책의 실행 강제 부족이 다음 병목이다.

## 현재 구조 요약

### Jarvis 운영 코어

- `AGENTS.md`: Codex/에이전트 기본 운영 지침
- `README.md`, `docs/README.md`: 루트와 문서 지도
- `architecture/`: SYS.01~SYS.04 4단계 아키텍처와 계약
- `agents/`: Jarvis, Friday, EVE, Joi, TARS, C3PO, Data, KITT/TRON, Diagnostic Agent 역할 정의
- `skills/`: 에이전트 팀 오케스트레이션, Jarvis Design Review Mode
- `templates/`: Human Brief, Friday 태스크 분해, Risk Shield, Work Log, Episodic Memory 템플릿
- `scripts/`: 요청 시작, 검증, 완료, 동적 워크플로우, 메모리 승격/소거 훅
- `dashboards/`: Virtual Office 대시보드와 `task-events.jsonl`

### 운영 기록과 지식 저장소

- `work-requests/`: 요청별 Human Brief, 산출물, evidence 저장소. 현재 60개 요청 폴더.
- `memory/`: work logs, episodic memory, wisdom 후보/레지스트리. 핵심 파일 스캔 기준 111개로 가장 큼.
- `decisions/`, `evals/`: 결정 기록과 평가 하네스.

### 하위 프로젝트

- `stock-auto-trader/`: Python 자동매매 시뮬레이터. 단위 테스트 19개 통과.
- `atlassian-knowledge-graph/`: Python/HTML 로컬 지식그래프 앱. 단위 테스트 7개 통과.
- `setlog-local-first-app/`: Expo/React Native 로컬 우선 앱. 실행 스크립트는 있으나 테스트 스크립트는 없음.

## 좋은 점

- 운영 원칙이 코드 근처에 있다. `AGENTS.md`, `docs/README.md`, `skills/agent-team-orchestration/SKILL.md`가 같은 방향을 가리킨다.
- 작업 요청 라이프사이클이 문서뿐 아니라 스크립트로 일부 강제된다. `start-jarvis-request.ps1`, `validate-jarvis-request.ps1`, `close-jarvis-request.ps1`가 있다.
- 파일 관리 정책이 명확하다. 삭제, 대량 이동, evidence 보관, `.playwright-mcp/`, `tmp/` 처리 기준이 이미 문서화되어 있다.
- 하위 Python 프로젝트의 테스트 상태가 좋다. `stock-auto-trader` 19개, `atlassian-knowledge-graph` 7개가 통과했다.
- 개선 백로그가 현실적이다. `docs/jarvis-agent-improvement-backlog.md`의 P0/P1 항목은 현재 스캔 결과와 잘 맞는다.

## 핵심 개선점

### P0. 루트를 Git 저장소로 만들기

현재 `git status`가 `fatal: not a git repository`를 반환한다. 그런데 루트에는 문서, 운영 스크립트, 대시보드, 작업 요청, 하위 프로젝트가 모두 쌓이고 있다. 변경 이력과 롤백이 없으면 Jarvis 운영체계 자체가 커질수록 회귀 추적이 어려워진다.

권장:

- 루트 Git 초기화 여부를 Human Conductor 결정으로 확정
- 초기 커밋 전 민감/대형 파일 점검
- `.env`, `node_modules`, `tmp`, `.playwright-mcp`, `__pycache__`, 대형 evidence 제외 정책 확인
- 하위 프로젝트를 한 저장소에 둘지, Git submodule/별도 repo로 나눌지 결정

### P0. 대시보드 시작 훅 안정화

신규 요청 시작 훅은 첫 실행에서 `Path`/`PATH` 중복으로 실패했다. 환경 변수를 정규화한 뒤에는 JSON 반환까지 성공했지만, 반환된 대시보드 URL은 브라우저 자동화 표면에서 `ERR_CONNECTION_REFUSED`가 났다. 이건 사용자가 매번 보는 시작 경험에 바로 영향을 준다.

권장:

- `scripts/start-dashboard.ps1` 시작부에서 프로세스 환경 변수 키를 대소문자 비구분 기준으로 정규화
- `Start-Process` + stdout/stderr redirect 조합을 Windows PowerShell에서 재검증
- 서버 기동 후 `processId` 생존 확인과 `/dashboards/agent-assignment-dashboard.html` health check를 결과 JSON에 포함
- 실패 시 이벤트 로그에는 `Review` 또는 `Blocked` 진단 이벤트를 append

### P0. 하위 프로젝트 인덱스 정리

루트 README와 `docs/README.md`는 `stock-auto-trader`를 분리 하위 프로젝트로 설명하지만, 실제 루트에는 `atlassian-knowledge-graph`와 `setlog-local-first-app`도 주요 프로젝트로 존재한다. 지금 상태에서는 새 작업자가 루트를 열었을 때 “무엇이 운영 코어이고 무엇이 제품/실험 프로젝트인가”를 한 번에 파악하기 어렵다.

권장:

- 루트 README의 주요 폴더 표에 `atlassian-knowledge-graph/`, `setlog-local-first-app/` 추가
- `docs/README.md`의 “분리된 하위 프로젝트”에 3개 하위 프로젝트 모두 등재
- 각 하위 프로젝트에 공통 표준 섹션 추가: 목적, 실행, 테스트, 민감정보, 산출물 위치, Jarvis와의 관계
- 루트에 `projects/` 인덱스 문서 또는 `docs/subprojects.md` 추가

### P1. 작업 요청 건강도 자동 보정 루틴 추가

`audit-work-requests.ps1` 결과 현재 60개 요청 중 11개가 Review다. 특히 `missing-readme`, `empty-evidence`, `large-evidence`가 반복된다. 정책은 있는데 마감 루틴에서 자동으로 보정하지 않는 구멍이 남아 있다.

권장:

- `close-jarvis-request.ps1`가 완료 전 `audit-work-requests.ps1` 결과를 요약하도록 연결
- `empty-evidence`가 합리적인 요청은 README에 “증거 없음/중앙 로그 참조”를 자동 기입하는 옵션 추가
- `large-evidence`는 삭제가 아니라 `evidence-manifest.md`를 생성해 보존 이유를 기록
- `missing-readme`는 별도 정리 요청으로 Human Brief 최소 초안 생성

### P1. 루트 통합 검증 명령 만들기

현재 검증은 하위 프로젝트별로 흩어져 있다. 이번 조사에서는 Python 프로젝트 테스트를 직접 실행했고, Node 앱은 `npm run`으로 스크립트만 확인했다. 루트에서 전체 상태를 보는 명령이 있으면 작업 완료 전 품질 신호가 훨씬 빨리 잡힌다.

권장:

- `scripts/test-all.ps1` 추가
- 포함 항목:
  - `scripts/validate-jarvis-request.ps1 -RequestId <id>`
  - `scripts/audit-work-requests.ps1`
  - `stock-auto-trader`: `python -m unittest discover -s tests -v`
  - `atlassian-knowledge-graph`: `python -m unittest discover -s tests -v`
  - `setlog-local-first-app`: `npm run` 또는 향후 `npm test`

### P1. 민감정보 경계 가시화

`atlassian-knowledge-graph/.env`가 실제로 존재한다. 내용은 열람하지 않았지만, 이 하위 프로젝트는 Confluence/Atlassian 토큰 가능성이 있어 루트 Git 저장소화 전 반드시 점검해야 한다.

권장:

- `.env` 존재 여부만 검사하는 `scripts/check-sensitive-files.ps1` 추가
- 파일 내용 출력 금지
- 결과는 `path`, `exists`, `ignoredByPolicy`, `actionRequired` 정도로만 표시
- Git 초기화 전 필수 게이트로 연결

### P2. 캐시와 대형 산출물 정리 정책 실행화

`node_modules`와 Python `__pycache__`/`.pyc`가 실제 파일 트리에 있다. `.gitignore`는 잘 되어 있지만 Git이 없으니 현재는 검색/백업/압축 시 잡음이 된다.

권장:

- 삭제는 별도 승인 후 진행
- 우선 `rg` 기본 제외 패턴을 문서와 스크립트에 통일
- `scripts/audit-work-requests.ps1`처럼 `scripts/audit-generated-artifacts.ps1` 추가
- 삭제형이 아니라 “발견/보고형”으로 먼저 만들기

## 권장 실행 순서

1. `scripts/start-dashboard.ps1` 안정화
2. 루트 README와 `docs/README.md`에 3개 하위 프로젝트 인덱스 보강
3. 루트 Git 저장소화 여부 결정 및 민감/대형 파일 사전 점검
4. `scripts/test-all.ps1` 또는 통합 검증 명령 추가
5. 작업 요청 Review 11건을 별도 정리 요청으로 보정
6. Jarvis 로컬 MCP 서버 설계로 문서/이벤트/메모리 접근을 공식 도구화

## 적용 에이전트 관점

- Jarvis: 구조상 병목은 실행 모델보다 운영 게이트와 저장소 경계에 있음
- Friday: 우선순위는 대시보드 시작 훅, 하위 프로젝트 인덱스, 통합 검증 순서
- EVE: 문서와 실제 폴더 사이의 누락을 확인
- TARS: Python 하위 프로젝트 테스트 통과, 대시보드 시작 훅 불안정 확인
- KITT/TRON: `.env` 존재, Git 부재, 대형 산출물과 증거 보관 정책을 리스크로 표시
- Diagnostic Agent: `Path`/`PATH` 중복, 서버 프로세스 유지 실패, 작업 요청 Review 누적을 드리프트 신호로 표시

## 검증 결과

- `stock-auto-trader`: 19 tests OK
- `atlassian-knowledge-graph`: 7 tests OK
- `setlog-local-first-app`: `npm run`으로 실행 스크립트 확인
- `audit-work-requests.ps1 -Markdown`: 60개 요청, 11개 Review 확인
- 대시보드 시작 훅: 환경 변수 정규화 후 이벤트 기록 성공, 브라우저 URL 확인은 연결 거부로 실패
