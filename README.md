# Jarvis AI 에이전트 팀 운영체계

Jarvis는 작업 요청을 역할 기반 AI 에이전트 팀으로 접수하고, 분해하고, 실행하고, 검증하고, 회고하는 로컬 운영체계입니다. 이 README는 Jarvis 프로젝트 루트에서 전체 구조를 빠르게 이해하기 위한 첫 안내서입니다.

이 문서는 Jarvis 운영 시스템 자체를 설명합니다. `stock-auto-trader/` 주식 자동매매 하위 프로젝트와 `today/`, `todo/`, `오늘의할일/` 같은 개인 또는 일일 작업 큐 성격의 폴더는 이 개요에서 제외합니다. 그런 폴더는 각 폴더의 전용 README나 작업 요청 문서에서 별도로 관리합니다.

## 빠른 시작

1. 먼저 `docs/README.md`를 읽어 프로젝트 문서 지도를 확인합니다.
2. 신규 작업 요청이면 요청 슬러그를 정합니다.
3. 프로젝트 루트에서 작업 시작 훅을 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<요청 요약>"
```

4. 반환된 대시보드 URL은 OS 기본 브라우저가 아니라 Codex Browser, Cursor 프리뷰, Antigravity 브라우저, VS Code Simple Browser 같은 현재 AI툴 브라우저 또는 프리뷰에서 엽니다.
5. `work-requests/YYYY-MM-DD-request-slug/` 폴더에 Human Brief 초안, 참고 자료, 산출물, 검증 증거를 보관합니다.
6. 완료 전에는 검증 훅을 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId <request-slug>
```

## 핵심 아키텍처

Jarvis는 항상 다음 4단계 아키텍처를 보존합니다.

| 단계 | 이름 | 역할 |
| --- | --- | --- |
| SYS.01 | Dream Team | 역할 기반 에이전트 팀 |
| SYS.02 | Virtual Office | To/CC 커뮤니케이션과 작업 채널 |
| SYS.03 | Agent Brain | 기억, 회고, 지혜 승격, 망각 체계 |
| SYS.04 | Human Conductor | 인간의 비전, 최종 승인, 코칭, 리스크 승격 |

자세한 계약과 원칙은 `architecture/`와 `docs/README.md`에서 확인합니다.

## 에이전트 역할

| 에이전트 | 기본 책임 |
| --- | --- |
| Human Conductor | 비전, 최종 승인, 중대한 전략 결정 |
| Jarvis | 지휘관, 전략적 종합, 우선순위 판단 |
| Friday | 프로젝트 매니저, 태스크 분해, Owner/CC 배정 |
| EVE | 리서치, 탐색, 자료 수집 |
| Joi | 디자인, UX, 프론트엔드 경험 |
| TARS | 엔지니어링, 구현, 기술 검증 |
| C3PO | 카피, 커뮤니케이션, 현지화 |
| Data | 정량 분석, 세그먼트, 시뮬레이션, KPI 검증 |
| KITT/TRON | 법무, 보안, 개인정보, 릴리스 리스크 검토 |
| Diagnostic Agent | 드리프트, 의심스러운 완료 보고, 반복 실패 진단 |

역할 라우팅의 기준 파일은 `agents/00-agent-management-index.md`입니다.

## 주요 폴더

| 경로 | 설명 |
| --- | --- |
| `AGENTS.md` | Codex와 AI 에이전트가 자동으로 따르는 루트 운영 지침 |
| `docs/` | PRD, TASK, 매뉴얼, 운영 문서, 리스크 게이트, 데이터 지침 |
| `architecture/` | 4단계 아키텍처와 운영 계약 |
| `agents/` | 역할별 에이전트 지침 |
| `skills/` | Jarvis 팀 운영과 설계 리뷰 모드 스킬 |
| `templates/` | Human Brief, Jarvis 지휘, Friday 태스크 분해, 로그 템플릿 |
| `dashboards/` | 에이전트 분장 대시보드와 작업 이벤트 JSONL |
| `work-requests/` | 작업 요청별 산출물, 참고 자료, 검증 증거 보관소 |
| `memory/` | Agent Brain의 업무 로그, 에피소딕 메모리, 지혜 후보 |
| `evals/` | 평가 하네스와 회귀 검증 자료 |
| `scripts/` | 작업 시작, 검증, 완료 훅 |
| `decisions/` | 승인과 의사결정 기록 |
| `assets/` | 공용 시각 자료와 리소스 |
| `.cursor/`, `.github/`, `.windsurfrules`, `.clinerules` | IDE와 에이전트 도구별 자동 적용 지침 |

이 루트 개요에서는 `stock-auto-trader/`와 오늘의할일 계열 폴더를 의도적으로 다루지 않습니다.

## 핵심 문서

| 문서 | 용도 |
| --- | --- |
| `docs/README.md` | 전체 문서 지도와 기본 실행 순서 |
| `docs/project-user-manual.html` | 사용자가 읽는 상세 HTML 매뉴얼 |
| `docs/operating-assets-inventory-65.md` | 운영 자산 인벤토리 |
| `docs/file-management-policy.md` | 원본, 생성물, 증거, 임시 로그, 아카이브 관리 정책 |
| `docs/data-research-tooling-guidelines.md` | Data와 EVE의 데이터, 리서치 도구 운영 지침 |
| `docs/risk-shield.md` | 보안, 개인정보, 릴리스 리스크 쉴드 |
| `docs/development-execution-checklist.md` | 개발 실행 체크리스트 |
| `docs/jarvis-agent-improvement-backlog.md` | 향후 개선 후보 백로그 |
| `dashboards/agent-assignment-dashboard.html` | 역할별 진행 상황을 보는 로컬 대시보드 |

## 작업 흐름

1. 사용자는 짧은 자연어 요청만 입력해도 됩니다.
2. Jarvis는 사용자 원문을 Human Brief 초안으로 바꿉니다.
3. Jarvis가 전략, 우선순위, 성공 기준을 정리합니다.
4. Friday가 작업을 분해하고 Owner(To), CC, 산출물, 완료 기준을 지정합니다.
5. EVE, Joi, TARS, C3PO, Data가 필요한 실무를 수행합니다.
6. KITT/TRON과 Diagnostic Agent가 리스크, 드리프트, 의심스러운 완료 보고를 검토합니다.
7. 완료 후 `memory/work-logs/`와 `memory/episodic/`에 기록을 남깁니다.

## 데이터와 리서치 지침

Data와 EVE는 `docs/data-research-tooling-guidelines.md`를 기준으로 데이터 수집과 분석을 설계합니다.

- Microsoft Clarity와 Google Tag Manager는 행동 데이터 태깅, 세그먼트, 봇 페르소나 실험 설계의 기준 도구로 다룹니다.
- `yt-dlp`는 영상 메타데이터 수집과 리서치 자동화의 기준 도구로 다룹니다.
- 개인정보, 저작권, 외부 전송, 서비스 약관, 자동화 부하 리스크는 KITT/TRON 검토를 거칩니다.

## 승인과 리스크

다음 항목은 실행 전에 Human Conductor에게 확인하거나 승격합니다.

- 기존 사용자 파일 삭제 또는 대량 이름 변경
- 외부 배포 또는 공개 릴리스
- 워크스페이스 밖으로 데이터 전송
- 비밀키, 인증 정보, 결제, 개인정보 처리
- 법무, 보안, 컴플라이언스 판단
- 프로젝트의 큰 방향 변경

일반적인 문서 작업, 내부 기획, 파일 수정, 비파괴적 분석, 합리적인 기본값 선택은 차단 리스크가 없으면 계속 진행합니다.

## 파일 관리

원본 문서, 생성물, 검증 증거, 임시 로그, 아카이브의 기준은 `docs/file-management-policy.md`를 따릅니다.

- `.playwright-mcp/`와 `tmp/`는 도구 산출물 또는 임시 로그로 보고 `.gitignore`에 포함합니다.
- PDF 추출물은 `docs/opendataloader-extract/`에 보존하되, 일상 편집 대상이 아닙니다.
- 작업 요청 폴더의 README, evidence, 대형 증거 파일은 `scripts/audit-work-requests.ps1`로 점검합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-work-requests.ps1 -Markdown
```

## 문서 작성 원칙

Jarvis 프로젝트의 에이전트 지침, 작업 요청, 분석 보고서, 회고, 운영 문서처럼 사용자가 직접 읽는 Markdown 파일은 가급적 한글로 작성합니다. 코드 식별자, 파일 경로, 명령어, API 이름, 고유명사, 원문 인용, 외부 문서 제목은 필요할 때 원문 표기를 유지할 수 있습니다.

새로운 루트 폴더나 핵심 운영 문서가 추가되면 이 README와 `docs/README.md`를 함께 갱신합니다.
