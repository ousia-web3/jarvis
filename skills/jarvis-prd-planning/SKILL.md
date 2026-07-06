---
name: jarvis-prd-planning
description: Jarvis 표준 PRD 기획서(6섹션 양식)를 신규 작성하거나, 기존 PRD·TASKS md의 누락 섹션만 보강할 때 사용한다. 사용자가 PRD, 기획서, 과제 정의, 개선 사항 정리, TASKS 연계 기획을 요청하거나 기생성 prd/task 파일 보완을 요청할 때 적용한다.
---

# Jarvis PRD 기획 스킬

이 스킬은 **업무 기획용 표준 PRD 6섹션 양식**을 따른다. `skills/jarvis-design-review/SKILL.md`의 8문서 산출(PRD/TRD/IA/TASKS 등)과 **병행 가능**하며, Design Review를 대체하지 않는다.

- Design Review: 신규 MVP·고위험·아키텍처 결정 시 Decision Log, SSOT, 8문서 전체
- **본 스킬**: SI/업무 개선 과제의 **기획서 본문 품질**과 **섹션 완성도**에 집중

## 트리거

- PRD, 기획서, 과제 정의서, 개선안 문서를 새로 작성할 때
- `*prd*.md`, `*PRD*.md`, `01-prd.md` 등 **기생성 PRD**가 있고 형식 보강·누락 채우기를 요청할 때
- `*task*.md`, `*TASKS*.md`, `07-tasks.md` 등 **기생성 TASKS**가 있고 PRD와 정합·보완을 요청할 때
- Human Brief, 회의록, VOC, 스크린샷만 있고 표준 PRD로 정리해야 할 때
- UI/UX 과제에서 섹션 6(시안) 포함 여부를 판단해야 할 때

## 비트리거

- 단순 코드 수정, 버그 픽스
- 이미 완성된 PRD의 오탈자만 수정
- Design Review 8문서 전체를 처음부터 새로 만드는 L2 풀 루프만 필요한 경우 → `jarvis-design-review` 우선

## SSOT

- 양식 본문: `templates/prd-planning-template.md`
- 태스크 분해 연계: `templates/friday-task-breakdown-template.md`
- SSOT 식별자(`EPIC-#`, `FEAT-#`, `REQ-#`, `TASK-###`)는 Design Review와 동일 규칙을 따른다. 기존 문서에 식별자가 있으면 **재사용**한다.

## 역할 분장

- **Jarvis**: 스콥·우선순위·미확정 항목을 Decision/Assumption으로 표기
- **C3PO**: 섹션 1·3 문장 품질, 애매 표현 제거
- **Joi**: 섹션 6 시안·화면 설명, UX 관점 bullet
- **Friday**: PRD 확정 후 TASKS 분해 또는 기존 TASKS와 매핑
- **Data**: 수치·지표·전환율 등 정량 근거 검토
- **Human Conductor**: 범위 확대, 외부 배포, 정책 확정 보류 승격

## 워크플로우

### 1. 컨텍스트 수집

1. 작업 폴더(`work-requests/.../deliverables/` 등)에서 기존 문서를 검색한다.
2. Human Brief, 회의록, 위키 링크, 스크린샷, VOC를 입력으로 수집한다.
3. UI/UX 과제 여부를 판단한다 → 해당 시 **섹션 6을 사실상 필수**로 취급한다.

### 2. 기존 파일 유무 판단

| 상황 | 행동 |
| --- | --- |
| PRD 없음 | `templates/prd-planning-template.md` 전체로 신규 작성 |
| PRD 있음, TASKS 없음 | PRD 갭 분석 후 보강 → 필요 시 Friday가 TASKS 초안 제안 |
| PRD·TASKS 둘 다 있음 | **갭 분석만** 수행 후, 누락·불완전 섹션만 추가 생성 요청 |
| TASKS만 있음 | TASKS를 역추적해 PRD 초안 생성 후 사용자 확인 |

**기존 파일 검색 패턴**(대소문자 무시):

- PRD: `*prd*`, `*PRD*`, `01-prd.md`, `deliverables/*prd*`
- TASKS: `*task*`, `*TASKS*`, `07-tasks.md`, `friday-task*`

### 3. 갭 분석 (기생성 파일 있을 때)

아래 체크리스트로 **섹션별 상태**를 표로 요약한 뒤, 사용자에게 보강 범위를 제안한다.

| 섹션 | 필수 | 완료 기준 |
| --- | --- | --- |
| 1. 개요 | 필수 | 목적·배경·관련 문서 각 1문단 이상 |
| 2. 범위 | 필수 | 대상 도메인, In/Out Scope 명시 |
| 3. 주요 내용·개선 사항 | 필수 | 개선 항목마다 요약 1~2문장 + 상세 bullet |
| 4. 정책·흐름도 | 필수 | 정책 표 1개 이상 + 텍스트 플로우 |
| 5. 특이사항 | 선택 | 보류·협의·리스크가 있을 때만 |
| 6. 디자인 시안 | UI 시 필수 | PC/모바일 시안 또는 (시안 준비 중) 명시 |

상태 라벨: `완료` / `부분` / `누락` / `해당 없음`

**보강 원칙**

- 기존 본문은 **삭제·대량 재작성하지 않는다**. 누락 섹션·빈 하위 항목·(초안) 표기가 필요한 곳만 추가한다.
- TASKS에만 있는 요구사항은 PRD 섹션 3·4에 **역매핑** 제안을 한다.
- PRD에만 있는 개선 항목은 TASKS에 **TASK-### 후보**로 제안한다.

### 4. 신규 작성

1. `templates/prd-planning-template.md` 구조를 그대로 따른다.
2. 필수 섹션(1~4)은 모두 채운다. 확정 전 내용은 `(초안)`, `(검토 중)`, `(향후 협의 예정)`을 붙인다.
3. 섹션 3은 개선 항목 수만큼 `3-n` 하위 절을 둔다.
4. 권장 저장 경로: `work-requests/<request-id>/deliverables/prd.md` 또는 프로젝트 관례 파일명(`01-prd.md` 등). **기존 파일명이 있으면 그 경로를 유지**한다.

### 5. TASKS 연계

PRD 섹션 3의 각 개선 항목마다 Friday가 아래를 검토한다.

- `TASK-###` 제목, Owner, 우선순위, 완료 기준
- In Scope(2-2)와 TASK 범위 일치 여부
- Out of Scope(2-3) 침범 여부

기존 TASKS md가 있으면 **신규 TASK를 무분별하게 추가하지 않고**, 갭·중복·누락만 정리한다.

### 6. 품질 게이트 (작성 가이드)

`templates/prd-planning-template.md` 하단 **작성 가이드**를 반드시 적용한다.

- 애매 표현 금지 → 구체 일자·건수·팀·% 사용
- 제목만 있고 본문 비우기 금지
- 모든 섹션 최소 1문단(또는 표/bullet) 이상
- UI/UX 과제: 섹션 6 미비 시 `(시안 준비 중, 2026-MM-DD)` 등 상태 명시

### 7. 완료 보고

- 생성·보강한 파일 경로
- 갭 분석 표(기존 파일 있었을 때)
- 추가 생성한 섹션 목록
- PRD↔TASKS 매핑 요약
- Open Questions / Human Conductor 승격 항목

## 사용자 요청 예시

```text
work-requests/.../deliverables/01-prd.md 형식에 맞춰 누락 섹션만 채워줘.
```

```text
Human Brief 기준으로 표준 PRD 6섹션 초안 작성해줘. UI 과제라 6번도 포함.
```

```text
기존 TASKS.md 보고 PRD 섹션 3·4만 보강해줘.
```

## Design Review와 함께 쓸 때

L2 풀 루프에서 8문서를 산출할 때:

1. **본 스킬**로 PRD 본문(섹션 1~6)을 먼저 또는 병행 작성
2. `jarvis-design-review`로 TRD, IA, ERD, Design System 등 확장
3. SSOT 식별자는 두 스킬 간 **동일 ID** 유지

## 추가 자료

- 전체 섹션 양식: [templates/prd-planning-template.md](../../templates/prd-planning-template.md)
- 태스크 분해: [templates/friday-task-breakdown-template.md](../../templates/friday-task-breakdown-template.md)
- 설계 리뷰 8문서: [skills/jarvis-design-review/SKILL.md](../jarvis-design-review/SKILL.md)
