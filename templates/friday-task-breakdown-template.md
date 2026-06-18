# Friday 에이전트 Task Breakdown Template

Friday가 인간 대표 또는 Jarvis의 목표를 실행 가능한 태스크로 분해할 때 사용하는 표준 양식입니다.

## 1. 태스크 메타

- Task ID:
- 태스크명:
- 프로젝트:
- 우선순위: P0 / P1 / P2
- 상태: Todo / In Progress / Review / Blocked / Done
- 마감:

## 2. 책임 구조

- Owner(To):
- CC:
- 필수 리뷰어:
- 최종 승인자:

## 3. 입력

- 참고 문서:
- 필요한 데이터:
- 선행 태스크:
- 결정된 제약:

## 4. 실행 범위

- 해야 할 일:
- 하지 말아야 할 일:
- 예상 산출물:
- 완료 기준:

## 5. 검증 및 리스크

- 검증 방법:
- 예상 리스크:
- KITT/TRON 검토 필요 여부:
- Data 검토 필요 여부:
- 인간 대표 승격 조건:

## 6. 보고 포맷

```text
To: Friday
CC: Jarvis, {필요 리뷰어}
Subject: [Task ID] 완료 보고

결과:
근거:
산출물:
리스크:
다음 액션:
```

## 7. 웹서비스 표준 태스크 체인

다페이지 웹·랜딩·소개 사이트·공개 UI가 포함된 요청은 Friday가 아래 순서로 태스크를 분해한다. 단일 화면 목업·기존 스펙 구현·IA가 이미 확정된 작업은 Friday가 생략할 수 있다.

| Task ID | 태스크명 | Owner(To) | CC | 선행 | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-IA | 정보설계(IA) | Joi | TARS, Jarvis | Human Brief, Strategy | `ia-brief.md` (`templates/ia-brief-template.md`) | 사이트맵, 내비 모델, 라벨 사전, IA DoD 충족 |
| TASK-UX | UX Brief / User Flow | Joi | C3PO, TARS | TASK-IA | Joi UX Brief, User Flow | Primary Flow, Key Screens, IA 연결 |
| TASK-WEB | 웹 구현 | TARS | Joi, C3PO | TASK-IA, TASK-UX | HTML/CSS/JS 등 | IA·UX Brief와 내비/라벨 일치, 로컬 검증 |
| TASK-WEB-QA | IA/UX 검수 | Joi | TARS, Friday | TASK-WEB | UI Review, IA Risks | 탐색·라벨·CTA 이슈 기록 |

### TASK-IA 메타 예시

- Task ID: TASK-IA
- 태스크명: 웹 정보설계(IA) Brief
- Owner(To): Joi
- CC: TARS, Jarvis
- 선행 태스크: Jarvis Strategy, (선택) EVE 리서치
- 예상 산출물: `ia-brief.md`
- 완료 기준: `templates/ia-brief-template.md` 10번 DoD 체크리스트 충족
- 하지 말아야 할 일: 시각 디자인 확정, 코드 구현, 카피 최종 확정
