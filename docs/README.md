# Jarvis AI 에이전트 팀 문서

이 폴더는 AI 에이전트 팀 기반 자율 협업 시스템을 설명하는 PRD, TASK, 운영 문서, 리스크 게이트, 원본/추출 리소스를 담고 있습니다. 아키텍처, 에이전트 지침, 템플릿, 스킬형 지침은 프로젝트 루트의 `architecture/`, `agents/`, `templates/`, `skills/`에서 관리합니다.

## 시작점

- 전체 프로젝트 루트 개요: `../README.md`
- 간단 시작 요청: `../templates/simple-start-request.md`
- PRD: `PRD-ai-agent-collaboration-architecture.md`
- TASK: `TASK-ai-agent-collaboration-architecture.md`
- 상세 HTML 매뉴얼: `project-user-manual.html`
- 매뉴얼 버전 기록: `project-user-manual-version-history.md`
- 65개+ 운영 자산 인벤토리: `operating-assets-inventory-65.md`
- 파일 관리 정책: `file-management-policy.md`
- 운영 원칙: `../architecture/operating-principles.md`
- 4단계 계약: `../architecture/contracts.md`
- Dynamic Workflow: `dynamic-workflow.md`
- 요청 상태 머신: `request-state-machine.md`
- 원본 가이드: `ai-agent-team-guide.md`
- PDF 추출 리포트: `pdf-extraction-report.md`
- 완료 보고: `completion-report.md`

## IDE 자동 적용 지침

사용자는 매번 “문서 먼저 읽고 4단계 아키텍처와 에이전트 역할대로 움직여라”라고 입력하지 않아도 됩니다. 프로젝트 루트에 IDE/에이전트가 자동으로 참조할 수 있는 지침 파일을 추가했습니다.

- Codex/에이전트 공통: `../AGENTS.md`
- Cursor: `../.cursor/rules/jarvis-agent-team.mdc`
- GitHub Copilot: `../.github/copilot-instructions.md`
- Windsurf: `../.windsurfrules`
- Cline/Roo 계열: `../.clinerules`, `../.clinerule`

새 작업은 작업 요청만 입력하면 됩니다. 에이전트는 먼저 `../work-requests/YYYY-MM-DD-request-slug/` 신규 작업 폴더를 만들고 관련 자료를 보관한 뒤, Human Brief 초안을 자동 생성하고 Jarvis 전략, Friday 태스크 분해, 실무 실행, 리스크 쉴드, 완료 보고 순서로 진행합니다.

신규 작업 요청을 받으면 요청 슬러그를 정한 직후 프로젝트 루트에서 `scripts/start-jarvis-request.ps1`를 실행해 운영 대시보드 서버와 첫 이벤트 로그를 준비합니다. 스크립트가 반환하는 URL은 OS 기본 브라우저가 아니라 현재 AI툴 브라우저 또는 프리뷰 표면에서 엽니다. 예: Codex Browser `iab`, Cursor 브라우저/프리뷰, Antigravity 브라우저, VS Code Simple Browser/Webview. AI툴 브라우저를 호출할 수 없는 환경에서는 서버를 유지한 채 URL을 사용자에게 보고합니다.

완료된 대화창이나 완료된 작업 요청에서 추가 작업을 이어서 받으면 기존 `requestId`를 재사용해 `scripts/start-jarvis-request.ps1`를 다시 실행합니다. 시작 훅은 최신 상태가 `Done`인 요청을 자동으로 재개 이벤트로 표시하고 `In Progress` 상태를 기록하므로, 대시보드와 Virtual Office 시각화가 다시 작업 중 상태로 돌아와야 합니다.

## 4단계 아키텍처

- SYS.01 Dream Team: `../architecture/sys-01-dream-team.md`
- SYS.02 Virtual Office: `../architecture/sys-02-virtual-office.md`
- SYS.03 Agent Brain: `../architecture/sys-03-agent-brain.md`
- SYS.04 Human Conductor: `../architecture/sys-04-human-conductor.md`

## 에이전트 관리

- 에이전트 인덱스: `../agents/00-agent-management-index.md`
- 지휘부: `../agents/human-conductor.md`, `../agents/jarvis.md`
- 프로젝트 매니저: `../agents/friday.md`
- 기획 및 실무진: `../agents/eve.md`, `../agents/joi.md`, `../agents/tars.md`, `../agents/c3po.md`
- 분석 및 리스크관리 쉴드: `../agents/data.md`, `../agents/kitt-tron.md`, `../agents/diagnostic-agent.md`

## 운영 문서

- 65개+ 운영 자산 인벤토리: `operating-assets-inventory-65.md`
- To/CC 프로토콜: `to-cc-message-protocol.md`
- Discord 가상 사무실: `virtual-office-discord-structure.md`
- 리스크 쉴드: `risk-shield.md`
- 실무 산출물 기준: `workforce-deliverables.md`
- 지혜 승격: `wisdom-promotion-process.md`
- 망각 및 소거: `forgetting-and-purging-policy.md`
- 요청 상태 머신: `request-state-machine.md`
- 드리프트 진단: `drift-diagnosis-checklist.md`
- 릴리스 리스크 게이트: `release-risk-gate.md`
- 데이터 분석 파이프라인: `data-analysis-pipeline.md`
- Data/EVE 데이터·리서치 도구 운영 지침: `data-research-tooling-guidelines.md`
- 전문 스킬 및 에이전트 호출 플레이북: `specialized-agent-invocation-playbook.md`
- 에이전트별 스킬 호출 매트릭스: `agent-skill-call-matrix.md`
- Dynamic Workflow: `dynamic-workflow.md`
- 고위험 금융/AI 트레이딩 프로토콜: `high-risk-finance-ai-trading-protocol.md`
- 봇 시뮬레이션: `bot-simulation-design.md`
- 파일럿 킥오프: `pilot-youtube-shop-kickoff.md`
- 개발 실행 체크리스트: `development-execution-checklist.md`
- 파일 관리 정책: `file-management-policy.md`

## 작업 요청 보관소

- 신규 작업 요청 보관소: `../work-requests/`
  - 모든 신규 작업은 시작 전에 `YYYY-MM-DD-request-slug/` 폴더를 만든다.
  - Human Brief 초안, 참고 자료, 산출물, 검증 증거, 로컬 실행 방법을 해당 폴더에 모은다.
  - 대시보드와 공용 로그처럼 중앙에서 유지해야 하는 파일은 원위치에 두고 작업 폴더에는 링크와 스냅샷을 보관한다.

## 운영 대시보드

- 에이전트 분장 대시보드: `../dashboards/agent-assignment-dashboard.html`
  - Codex 작업 요청 시 에이전트별 To/CC, 작업 내용, 리스크, 예상 산출물을 시각화한다.
  - 작업 시작 훅: `powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<요청 요약>"`
  - 반환 URL은 활성 AI툴 브라우저/프리뷰에서 열며, OS 기본 브라우저 자동 실행은 기본값으로 사용하지 않는다.
  - `../dashboards/task-events.jsonl`을 2초 간격으로 읽어 역할별 작업 이벤트 로그를 표시한다.
  - 완료된 요청에 추가 작업이 들어오면 같은 `requestId`의 새 `In Progress` 이벤트를 최신 상태로 표시해 완료 상태를 재진행 상태로 되돌린다.
  - 텍스트 안내 포맷은 `../dashboards/agent-assignment-dashboard.md`를 따른다.
  - 데이터 원본은 `../dashboards/agent-assignment-data.json`에 둔다.
  - 이벤트 로그 스키마는 `../dashboards/task-event-schema.md`에 둔다.

## 분리된 하위 프로젝트

- 주식 자동매매 MVP: `../stock-auto-trader/`
  - 코드, 테스트, 설정, 샘플 데이터, 전용 문서는 이 폴더 안에서 독립 관리한다.
  - 실거래, 인증 정보, 계좌 접근은 Human Conductor 승인 전까지 차단한다.

## 템플릿

- 간단 시작 요청: `../templates/simple-start-request.md`
- 인간 대표 입력: `../templates/human-brief-template.md`
- Jarvis 지휘: `../templates/jarvis-command-protocol.md`
- Friday 태스크 분해: `../templates/friday-task-breakdown-template.md`
- 전문 에이전트 호출 카드: `../templates/specialized-agent-call-card.md`
- Dynamic Workflow Task Graph: `../templates/dynamic-workflow-task-graph.json`
- Dynamic Worker Manifest: `../templates/dynamic-worker-manifest.json`
- Risk Shield Review: `../templates/risk-shield-review-template.md`
- Evidence Manifest: `../templates/evidence-manifest-template.md`
- 업무 로그: `../templates/work-log-template.md`
- 에피소딕 메모리: `../templates/episodic-memory-template.md`

## 운영 저장소

- 승인/결정 기록: `../decisions/`
- Agent Brain 저장소: `../memory/`
- 평가 하네스: `../evals/`
- 요청 검증 훅: `../scripts/validate-jarvis-request.ps1`
- 전문 에이전트 호출 기록 훅: `../scripts/invoke-jarvis-agent.ps1`
- Dynamic Workflow 생성 훅: `../scripts/new-dynamic-workflow.ps1`
- Dynamic Workflow 실행 훅: `../scripts/run-dynamic-workflow.ps1`
- 요청 완료 훅: `../scripts/close-jarvis-request.ps1`
- 작업 요청 건강도 점검 훅: `../scripts/audit-work-requests.ps1`

## 스킬형 지침

- 에이전트 팀 오케스트레이션: `../skills/agent-team-orchestration/SKILL.md`
- Jarvis Design Review Mode: `../skills/jarvis-design-review/SKILL.md`
  - 신규 MVP, 고위험 기능, 아키텍처 결정, 8개 문서(PRD, TRD, IA, User Flow, ERD, Design System, TASKS, Coding Convention) 산출이 필요한 경우에만 사용한다.
  - Jarvis 기본 역할을 덮어쓰지 않고 Decision Log, SSOT, MVP 캡슐, 스택 결정 프로토콜을 보조 모드로 제공한다.

## 기본 실행 순서

1. 인간 대표는 작업 요청만 입력해도 된다. 예시는 `../templates/simple-start-request.md`를 따른다.
2. 요청 슬러그를 정하고 프로젝트 루트에서 `scripts/start-jarvis-request.ps1`로 대시보드 서버를 준비한 뒤 반환 URL을 활성 AI툴 브라우저/프리뷰에서 연다.
3. 신규 작업 폴더를 `../work-requests/YYYY-MM-DD-request-slug/`로 만들고 관련 자료 보관 위치를 먼저 정한다.
4. Jarvis와 Friday가 사용자 원문을 기준으로 `../templates/human-brief-template.md` 형식의 Human Brief 초안을 자동 생성한다.
5. Jarvis가 `../templates/jarvis-command-protocol.md`로 전략 브리프를 만든다.
6. Friday가 `../templates/friday-task-breakdown-template.md`로 태스크를 분해한다.
7. 작업이 크거나 병렬화 이득이 있으면 `../scripts/new-dynamic-workflow.ps1`로 Task Graph와 Worker Manifest를 생성한다.
8. Owner(To)는 `../agents/*.md`의 개별 지침 또는 Dynamic Workflow worker packet에 따라 실행한다.
9. CC는 요약 컨텍스트만 검토한다.
10. Data, KITT/TRON, 진단 에이전트가 리스크 쉴드를 수행한다.
11. 동적 워크플로우는 `../scripts/run-dynamic-workflow.ps1`로 병렬 실행, 검증, Fixer 검토, 집계를 수행한다.
12. 완료 후 업무 로그와 에피소딕 메모리를 남긴다.
13. 외부 공개 전 `release-risk-gate.md`를 통과한다.

## 파일 관리 기준

- 원본 문서, 생성물, 검증 증거, 임시 로그, 아카이브 기준은 `file-management-policy.md`를 따른다.
- `.playwright-mcp/`와 `tmp/`는 원본 문서가 아니라 도구 산출물과 임시 로그로 다룬다.
- `docs/opendataloader-extract/`는 PDF 추출 보존 자료이며 일상 편집 대상이 아니다.
- 작업 요청 폴더의 건강도는 `../scripts/audit-work-requests.ps1`로 점검한다.
