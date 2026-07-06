# Jarvis 실행 모드 가이드

## 목적

Jarvis 고도화의 핵심은 모든 요청에 풀 루프를 강제하는 것이 아니라, 작업 크기와 위험도에 맞게 실행 비용을 조절하는 것입니다. 이 문서는 L0/L1/L2 트랙, Design Review, IA Draft, SI 리서치 깊이, validate 모드를 한 장에서 고르게 합니다.

## 빠른 선택

| 질문 | 선택 |
| --- | --- |
| 1~2파일 Low 리스크 문구/버그/기존 스펙 구현인가? | L0 |
| 일반 문서, 스크립트, 단일 화면 목업, Medium 이하 작업인가? | L1 |
| SI 웹, 신규 MVP, High 리스크, 아키텍처 결정, 외부 릴리스 전인가? | L2 |
| 신규 MVP 또는 고위험 기능에서 PRD/TRD/TASKS 등 8문서가 필요한가? | L2 + Design Review |
| Medium 이상 웹서비스나 공개 내비게이션이 있는가? | IA Draft 포함 |
| 하나허브/SI 화면의 근거 깊이가 필요한가? | R0/R1/R2 선택 |

## 실행 트랙

| 트랙 | 조건 | 최소 루프 | 필수 산출물 |
| --- | --- | --- | --- |
| L0 경량 | Low 리스크, 1~2파일, 문구/버그/기존 스펙 구현 | 실행 → diff 또는 스크린샷 확인 → Done 이벤트 1줄 | README 한 줄 또는 Work Log 선택 |
| L1 표준 | Medium 이하 일반 작업, 단일 화면 목업, 문서/스크립트 보강 | `start-jarvis-request` → 실행 → 검증 → Work Log | 작업 README, 검증 메모 |
| L2 풀 | SI 웹, High, 신규 MVP, Design Review, 아키텍처 결정 | 4훅 + 전문 호출 + validate + IA/리서치 | IA Brief, verification, validate Pass, Episodic Memory |

## Design Review 적용

Design Review 8문서는 L2 중에서도 다음 조건일 때만 사용합니다.

- 신규 MVP 또는 새 제품 캡슐을 정의한다.
- 고위험 기능, 결제, 개인정보, 보안, 금융, 외부 공개가 포함된다.
- 기술 스택, 데이터 모델, API 경계, 권한 모델을 확정해야 한다.
- PRD, TRD, IA, User Flow, ERD, Design System, TASKS, Coding Convention 산출이 실제 의사결정에 필요하다.

단순 파일 수정, 작은 버그 수정, 이미 결정된 구현 작업은 Design Review를 쓰지 않습니다.

## IA Draft 적용

다음 조건이면 `templates/ia-brief-template.md` 기준으로 IA Draft를 준비합니다.

- Medium 이상 웹서비스, 다페이지, 랜딩, 소개 사이트, 공개 내비게이션 포함
- 화면 구조나 메뉴 라벨이 TARS 구현 전에 정리되어야 함
- 사용자가 "사이트 구조", "메뉴", "페이지 흐름"을 요청함

생략 가능한 경우:

- Low 리스크 단일 화면 수정
- 기존 IA Brief가 승인된 후속 구현
- API-only, CLI, 배치 작업
- 하나허브 같은 포털 단일 업무 화면 목업
- 분석 대시보드, 데이터 테이블, KPI cockpit (taste-skill 비적용)

## Design Taste Skill 적용

랜딩·포트폴리오·리디자인·브랜드 키트처럼 **마케팅·소개·포트폴리오형** 시각 작업은 IA Draft(필요 시) 이후 `docs/design-taste-skill-guide.md`를 따릅니다.

| 트랙 | 적용 |
| --- | --- |
| L0 | 시각 작업이 아니면 생략 |
| L1 | 단일 랜딩/목업 — Primary Skill 1개, 스크린샷 검증 |
| L2 | IA Brief → Design System/시각 구현 단계에서 Primary Skill → Joi Design QA |

기본 Primary Skill: `design-taste-frontend` (`.agents/skills/design-taste-frontend/SKILL.md`)

## SI 리서치 깊이

| 깊이 | 언제 | 산출물 | 담당 |
| --- | --- | --- | --- |
| R0 | 단일 화면 목업, 기존 화면 미세 수정 | `source-analysis.md` 요약 1페이지 | Joi 또는 TARS |
| R1 | 신규 업무 화면 1개, 필드/그리드 근거 필요 | `source-analysis.md` + 필드표 | EVE, TARS |
| R2 | 다화면, 연동, RFP 대조, AS-IS/TO-BE 비교 | EVE SI Research Pack 전체 | EVE, Friday |

R0는 TASK-RESEARCH를 생략할 수 있습니다. R1 이상은 Friday가 TASK-RESEARCH를 별도 배정합니다.

## validate 모드

| 모드 | 명령 | 용도 |
| --- | --- | --- |
| 보고용 | `powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId <id>` | 미충족 게이트를 확인하고 다음 체크리스트로 사용 |
| 차단용 | `powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId <id> -Strict` | High/Critical, 외부 릴리스 전, Human Conductor가 차단 게이트를 요구한 경우 |

대시보드의 Needs Work는 기본적으로 차단이 아니라 채울 체크리스트입니다. `-Strict`일 때만 실패 종료를 차단 신호로 봅니다.

## 이벤트 정책

- 2026-06-19 이후 신규/진행 요청은 JSONL 이벤트를 남깁니다.
- 과거 work-request 전체 백필은 기본 보류합니다.
- 완료된 요청의 추가 작업은 기존 `requestId`를 재사용하고 `In Progress` 이벤트를 새로 남깁니다.
- 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값은 이벤트 detail과 outputs에 쓰지 않습니다.

## Agent Assignment Preview 형식

```text
요청: <요청 요약>
To: <주 Owner>
CC: <검토자>
Risk: Low / Medium / High / Critical
Expected Outputs: <파일 또는 증거>
다음 액션: <첫 실행 단계>
```
