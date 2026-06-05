# 65개 운영 자산 인벤토리

이 문서는 매뉴얼의 `65개+` 카드가 가리키는 핵심 운영 자산을 사람이 읽기 좋게 풀어쓴 목록입니다. 기준은 Jarvis 에이전트 팀 운영에 직접 쓰이는 문서, 스크립트, 저장소, 평가 하네스, 스킬 파일입니다.

## 한글 처리 원칙

- 사용자가 직접 읽는 Markdown 설명은 한글을 기본으로 작성한다.
- 파일 경로, 명령어, API 이름, 에이전트 고유명, 코드 식별자, 원문 인용은 원문 표기를 유지할 수 있다.
- 과거 작업 로그도 제목과 설명 필드는 한글을 우선 사용하되, `requestId`처럼 추적에 필요한 식별자는 바꾸지 않는다.
- PDF 추출물처럼 외부 원본에서 파생된 보존 파일은 추출 링크 구조를 유지하고, 필요한 설명만 한글로 보강한다.

## 65개 핵심 파일

| 번호 | 파일 | 범주 | 설명 |
| ---: | --- | --- | --- |
| 1 | `architecture/contracts.md` | 아키텍처 | SYS.01-SYS.04 사이의 입력, 출력, Done 계약을 정의해 계층 간 연결 규칙을 고정합니다. |
| 2 | `architecture/operating-principles.md` | 아키텍처 | Jarvis 운영 판단의 양보할 수 없는 원칙과 충돌 해결 기준을 정리합니다. |
| 3 | `architecture/sys-01-dream-team.md` | 아키텍처 | 역할 기반 에이전트 팀 구조와 각 역할이 왜 필요한지 설명합니다. |
| 4 | `architecture/sys-02-virtual-office.md` | 아키텍처 | To/CC, 채널, 이벤트 로그를 통해 가상 사무실처럼 협업하는 방식을 정의합니다. |
| 5 | `architecture/sys-03-agent-brain.md` | 아키텍처 | Work Log, Episodic Memory, 지혜 승격, 망각 체계로 이어지는 기억 구조를 설명합니다. |
| 6 | `architecture/sys-04-human-conductor.md` | 아키텍처 | 인간 대표의 승인권, 비전 판단, 리스크 승격 기준을 정리합니다. |
| 7 | `agents/00-agent-management-index.md` | 에이전트 | 모든 에이전트 지침 파일의 색인이고 Friday가 Owner(To)/CC를 배정할 때 기준으로 씁니다. |
| 8 | `agents/human-conductor.md` | 에이전트 | 최종 승인자와 비전 소유자로서 인간 대표의 권한과 개입 시점을 정의합니다. |
| 9 | `agents/jarvis.md` | 에이전트 | 전략 지휘관 Jarvis의 판단 범위, 산출물, 승격 책임을 설명합니다. |
| 10 | `agents/friday.md` | 에이전트 | 프로젝트 매니저 Friday의 태스크 분해, 일정, DoD 관리 역할을 정의합니다. |
| 11 | `agents/eve.md` | 에이전트 | 리서치 담당 EVE의 자료 수집, 출처 품질, 한계 표시 기준을 설명합니다. |
| 12 | `agents/joi.md` | 에이전트 | UX/UI와 경험 품질을 맡는 Joi의 화면 흐름, 사용성, 접근성 검토 기준을 정합니다. |
| 13 | `agents/tars.md` | 에이전트 | 구현과 기술 검증을 맡는 TARS의 코드 변경, 테스트, 실행 보고 기준을 정합니다. |
| 14 | `agents/c3po.md` | 에이전트 | 카피, 메시지, 현지화 담당 C3PO의 커뮤니케이션 품질 기준을 정의합니다. |
| 15 | `agents/data.md` | 에이전트 | 정량 분석, KPI, 시뮬레이션, 근거 없는 수치 주장 검토 역할을 설명합니다. |
| 16 | `agents/kitt-tron.md` | 에이전트 | 법무, 보안, 개인정보, 저작권, 릴리스 리스크를 검토하는 쉴드 역할을 정의합니다. |
| 17 | `agents/diagnostic-agent.md` | 에이전트 | 반복 실패, 드리프트, 허위 완료 보고, 과신을 진단하는 역할을 정리합니다. |
| 18 | `docs/README.md` | 문서 허브 | Jarvis 문서의 시작점이며 운영 문서, 템플릿, 저장소, 스킬 위치를 안내합니다. |
| 19 | `docs/project-user-manual.html` | 사용자 매뉴얼 | 브라우저에서 읽는 상세 매뉴얼로, 운영 흐름과 주요 파일 링크를 시각적으로 제공합니다. |
| 20 | `docs/PRD-ai-agent-collaboration-architecture.md` | 기획 문서 | Jarvis 에이전트 협업 아키텍처의 제품 요구사항과 목표 상태를 설명합니다. |
| 21 | `docs/TASK-ai-agent-collaboration-architecture.md` | 실행 문서 | PRD를 실행 가능한 태스크와 산출물 목록으로 분해한 문서입니다. |
| 22 | `docs/ai-agent-team-guide.md` | 원본 가이드 | PDF와 매뉴얼의 바탕이 되는 에이전트 팀 운영 가이드입니다. |
| 23 | `docs/agent-cards.md` | 역할 카드 | 10개 에이전트의 역할, 좋은/나쁜 산출물, 성숙도, 개선 목표를 한 장으로 정리합니다. |
| 24 | `docs/request-state-machine.md` | 운영 게이트 | 요청이 Intake에서 Done까지 이동할 때 필요한 게이트와 필수 증거를 정의합니다. |
| 25 | `docs/to-cc-message-protocol.md` | 커뮤니케이션 | To/CC 기반 메시지 작성과 역할별 전달 규칙을 설명합니다. |
| 26 | `docs/virtual-office-discord-structure.md` | 커뮤니케이션 | Discord식 가상 사무실 구조와 채널 운영 방식을 설명합니다. |
| 27 | `docs/risk-shield.md` | 리스크 | Data, KITT/TRON, Diagnostic Agent가 수행하는 리스크 쉴드 절차를 정의합니다. |
| 28 | `docs/release-risk-gate.md` | 리스크 | 외부 공개, 배포, 법무/보안/개인정보 리스크가 있는 작업의 릴리스 통과 기준을 정합니다. |
| 29 | `docs/workforce-deliverables.md` | 산출물 기준 | 실무 에이전트별로 기대하는 산출물과 완료 품질 기준을 정리합니다. |
| 30 | `docs/development-execution-checklist.md` | 실행 체크리스트 | 구현 작업을 시작하고 검증할 때 확인해야 할 개발 실행 체크리스트입니다. |
| 31 | `docs/data-analysis-pipeline.md` | 분석 | 정량 분석, 데이터 품질, KPI 검토의 기본 절차를 정리합니다. |
| 32 | `docs/bot-simulation-design.md` | 시뮬레이션 | 에이전트 또는 봇 시뮬레이션을 설계할 때 필요한 흐름과 검증 기준을 설명합니다. |
| 33 | `docs/pilot-youtube-shop-kickoff.md` | 파일럿 | YouTube Shop 파일럿을 예시로 Jarvis 운영 흐름을 적용하는 킥오프 문서입니다. |
| 34 | `docs/wisdom-promotion-process.md` | 기억 | 반복 패턴을 지혜 후보에서 승인된 운영 지혜로 승격하는 절차를 설명합니다. |
| 35 | `docs/forgetting-and-purging-policy.md` | 기억 | 불필요한 자료를 요약, 격리, 소거하는 기준과 금지 사항을 정리합니다. |
| 36 | `docs/drift-diagnosis-checklist.md` | 진단 | 작업 흐름이 목표에서 벗어났는지 점검하는 드리프트 진단 체크리스트입니다. |
| 37 | `docs/completion-report.md` | 완료 보고 | 초기 문서화 작업의 완료 범위, 산출물, 검증 결과를 정리한 보고서입니다. |
| 38 | `docs/pdf-extraction-report.md` | 추출 보고 | 별도 보관된 원본 PDF에서 이미지, JSON, Markdown을 추출한 결과와 한계를 기록합니다. |
| 39 | `docs/parallel-workspace-port-policy.md` | 실행 정책 | 병렬 작업공간이 로컬 포트와 런타임 리소스를 충돌 없이 쓰는 규칙을 정합니다. |
| 40 | `docs/jarvis-agent-improvement-backlog.md` | 개선 백로그 | 에이전트 팀과 운영 체계를 다음 단계로 개선하기 위한 후보 작업 목록입니다. |
| 41 | `templates/simple-start-request.md` | 템플릿 | 사용자가 짧은 요청만 입력해도 Human Brief와 운영 흐름이 시작되도록 안내합니다. |
| 42 | `templates/human-brief-template.md` | 템플릿 | 인간 대표의 목표, 성공 기준, 제약, 리스크를 정리하는 기본 양식입니다. |
| 43 | `templates/jarvis-command-protocol.md` | 템플릿 | Jarvis가 전략 브리프와 방향 지시를 작성할 때 쓰는 형식입니다. |
| 44 | `templates/friday-task-breakdown-template.md` | 템플릿 | Friday가 Owner(To), CC, 산출물, DoD를 분해하는 기본 양식입니다. |
| 45 | `templates/work-log-template.md` | 템플릿 | 작업 수행 후 무엇을 했고 어떻게 검증했는지 남기는 업무 로그 양식입니다. |
| 46 | `templates/episodic-memory-template.md` | 템플릿 | 작업 회고와 학습을 Agent Brain에 남기는 에피소딕 메모리 양식입니다. |
| 47 | `dashboards/agent-assignment-dashboard.html` | 대시보드 | 작업 배정, 이벤트 로그, Virtual Office 상태를 한 화면에 보여주는 로컬 HTML 대시보드입니다. |
| 48 | `dashboards/agent-assignment-dashboard.md` | 대시보드 문서 | 대시보드 사용법, 이벤트 표시 방식, Agent Assignment Preview 형식을 설명합니다. |
| 49 | `dashboards/agent-assignment-data.json` | 대시보드 데이터 | 에이전트, 샘플 요청, 오피스 위치, 시각화 설정을 담는 데이터 원본입니다. |
| 50 | `dashboards/task-event-schema.md` | 이벤트 스키마 | `task-events.jsonl`에 기록할 필드와 보안 금지 사항을 정의합니다. |
| 51 | `scripts/start-jarvis-request.ps1` | 시작 훅 | 신규 요청 ID로 대시보드 서버를 준비하고 첫 이벤트를 기록합니다. |
| 52 | `scripts/start-dashboard.ps1` | 대시보드 실행 | 대시보드 로컬 HTTP 서버를 시작하거나 재사용하는 보조 스크립트입니다. |
| 53 | `scripts/validate-jarvis-request.ps1` | 검증 훅 | 요청의 Done 게이트, Work Log, Episodic Memory, 리스크 검토 여부를 확인합니다. |
| 54 | `scripts/close-jarvis-request.ps1` | 완료 훅 | 작업 로그와 에피소딕 메모리 초안을 만들고 완료 이벤트를 기록합니다. |
| 55 | `scripts/promote-wisdom.ps1` | 기억 자동화 | 반복 교훈을 지혜 후보 또는 승인 지혜로 기록하는 스크립트입니다. |
| 56 | `scripts/purge-memory.ps1` | 기억 정리 | 소거 대기열을 보고하거나 승인된 정리 작업을 처리하는 스크립트입니다. |
| 57 | `decisions/README.md` | 결정 저장소 | 승인 원장과 결정 로그의 목적을 안내하는 저장소 README입니다. |
| 58 | `decisions/decision-log.md` | 결정 로그 | 전략, 아키텍처, 운영 방식에 영향을 주는 결정을 기록합니다. |
| 59 | `decisions/approval-ledger.md` | 승인 원장 | Human Conductor 승인, 보류, 반려 이력을 남기는 원장입니다. |
| 60 | `memory/README.md` | 기억 저장소 | Work Log, Episodic Memory, 지혜, 격리, 소거 대기열의 역할을 안내합니다. |
| 61 | `memory/wisdom-registry.md` | 지혜 저장소 | 승인된 운영 지혜와 재사용 가능한 원칙을 보관합니다. |
| 62 | `memory/wisdom-candidates.md` | 지혜 후보 | 반복 관찰된 패턴을 지혜로 승격하기 전 후보 상태로 보관합니다. |
| 63 | `evals/README.md` | 평가 하네스 | 평가 과제와 루브릭을 사용해 에이전트 행동을 채점하는 방법을 안내합니다. |
| 64 | `skills/agent-team-orchestration/SKILL.md` | 스킬 | Jarvis 에이전트 팀 오케스트레이션을 실행하는 핵심 운영 스킬입니다. |
| 65 | `skills/jarvis-design-review/SKILL.md` | 스킬 | 신규 MVP, 고위험 기능, 아키텍처 결정에서 Decision Log, SSOT, MVP 캡슐을 보조하는 설계 리뷰 스킬입니다. |

## 운영상 해석

`65개+`는 정확히 65개 파일만 존재한다는 뜻이 아닙니다. 위 목록은 사용자가 이해해야 할 핵심 운영 자산이고, 실제 저장소에는 작업별 로그, 에피소딕 메모리, PDF 추출 이미지, 하위 프로젝트 문서가 더 있습니다.

## 최근 보강된 파일 관리 자산

파일 관리 감사 이후 다음 자산을 추가로 운영 기준에 포함합니다.

| 파일 | 범주 | 설명 |
| --- | --- | --- |
| `README.md` | 루트 개요 | Jarvis 프로젝트 전체 구조와 제외 범위를 설명하는 첫 안내서입니다. |
| `.gitignore` | 파일 관리 | 브라우저 검증 산출물, 임시 로그, 캐시, 비밀키 후보를 추적 대상에서 제외합니다. |
| `docs/file-management-policy.md` | 파일 관리 | 원본, 생성물, 증거, 임시 로그, 아카이브의 보관 기준을 정의합니다. |
| `docs/opendataloader-extract/README.md` | 보존 자료 | PDF 추출물 폴더가 일상 편집 대상이 아니라는 점을 명시합니다. |
| `scripts/audit-work-requests.ps1` | 점검 자동화 | 작업 요청 폴더의 README, evidence, outputs, 대형 증거 파일 상태를 점검합니다. |
| `agents/README.md` 외 폴더별 README | 탐색 보조 | 핵심 폴더에 들어갔을 때 역할과 갱신 기준을 바로 확인하게 합니다. |
