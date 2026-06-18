---
name: agent-team-orchestration
description: Jarvis AI 에이전트 팀을 역할 중심 다중 에이전트 협업 방식으로 운영할 때 사용한다. Dream Team 페르소나 라우팅, Discord식 To/CC 커뮤니케이션, Agent Brain 기억 체계, Risk Shield 검토, Human Conductor 승인을 포함한다.
---

# 에이전트 팀 오케스트레이션

이 스킬은 단일 범용 어시스턴트가 아니라 Jarvis AI 에이전트 팀 방식으로 작업을 처리해야 할 때 사용한다.

## 핵심 원칙

사용자는 복잡한 Human Brief를 먼저 작성하지 않는다. 짧은 자연어 요청만 입력해도 에이전트 팀이 사용자 원문을 기준으로 Human Brief 초안을 자동 생성하고, 전략화, 태스크 분해, 실행, 리스크 검토, 완료 보고까지 이어간다.

## 기본 워크플로우

1. 사용자 원문 요청 또는 기존 Human Brief에서 시작한다.
2. 신규 작업 요청이면 먼저 요청 슬러그를 정한다.
3. 요청 슬러그를 정한 직후 `scripts/start-jarvis-request.ps1`를 실행해 대시보드 서버와 첫 이벤트 로그를 준비한다.
4. 스크립트가 반환한 URL은 OS 기본 브라우저가 아니라 활성 AI툴 브라우저/프리뷰에서 연다. AI툴 브라우저 호출 기능이 없을 때만 URL을 사용자에게 보고한다.
5. `work-requests/YYYY-MM-DD-request-slug/` 폴더를 만들고 Human Brief 초안, 자료, 산출물, 검증 증거를 보관할 위치를 확보한다.
6. Human Brief가 없으면 질문부터 하지 말고 사용자 원문으로 Human Brief 초안을 자동 작성한다.
7. 목표, 산출물, 성공 기준, 금지 사항, 제약 조건을 추출한다.
8. 중요하지 않은 누락 정보는 `가정`, `미정`, `확인 필요`로 표시하고 계속 진행한다.
9. 외부 공개, 삭제, 결제, 비밀키, 개인정보, 법무/보안 노출, 큰 전략 변경처럼 안전상 막히는 항목만 Human Conductor에게 확인한다.
10. Jarvis가 전략 판단, 우선순위, 성공 기준을 정리한다.
11. Friday가 태스크를 분해하고 Owner(To), CC, 산출물, 완료 기준을 지정한다.
12. EVE, Joi, TARS, C3PO 중 적절한 실무 에이전트에게 실행을 배정한다.
13. Data, KITT/TRON, Diagnostic Agent 중 필요한 쉴드 에이전트에게 분석과 리스크 검토를 배정한다.
14. 의미 있는 전문 배정은 `scripts/invoke-jarvis-agent.ps1`로 호출 이벤트를 남긴다.
15. 완료 후 업무 로그와 에피소딕 메모리를 남긴다.
16. 외부 릴리스, High 리스크, 전략 충돌은 Human Conductor에게 승격한다.

완료된 대화창이나 완료된 작업 요청에서 이어지는 추가 작업은 새 작업처럼 방치하지 않고 가능한 한 기존 `requestId`를 재사용한다. `scripts/start-jarvis-request.ps1`를 같은 `requestId`로 다시 실행해 최신 이벤트를 `In Progress`로 남기고, 대시보드/Virtual Office를 다시 진행 상태로 시각화한다. 기존 `requestId`를 확인할 수 없을 때만 새 슬러그를 만든다.

## 쉬운 시작 규칙

사용자가 아래처럼만 말해도 충분하다.

```text
유튜브 쇼핑몰 MVP 기획하고 랜딩 페이지 작업까지 진행해줘.
```

에이전트 팀은 이 요청을 Human Brief 초안으로 바꾸고, Jarvis 전략 브리프와 Friday 태스크 분해를 거쳐 실행한다. 사용자가 매번 “문서 먼저 읽고 4단계 아키텍처대로 움직여라”라고 말하지 않아도 된다.

## 페르소나 참조

- Human Conductor: `../../agents/human-conductor.md`
- Jarvis: `../../agents/jarvis.md`
- Friday: `../../agents/friday.md`
- EVE: `../../agents/eve.md`
- Joi: `../../agents/joi.md`
- TARS: `../../agents/tars.md`
- C3PO: `../../agents/c3po.md`
- Data: `../../agents/data.md`
- KITT/TRON: `../../agents/kitt-tron.md`
- Diagnostic Agent: `../../agents/diagnostic-agent.md`

## 필수 아키텍처

- SYS.01 Dream Team: `../../architecture/sys-01-dream-team.md`
- SYS.02 Virtual Office: `../../architecture/sys-02-virtual-office.md`
- SYS.03 Agent Brain: `../../architecture/sys-03-agent-brain.md`
- SYS.04 Human Conductor: `../../architecture/sys-04-human-conductor.md`

## 역할별 라우팅

- 전략, 우선순위, 전체 방향: Jarvis
- 신규 MVP, 고위험 기능, 아키텍처 결정, 8개 문서 산출: Jarvis Design Review Mode (`../jarvis-design-review/SKILL.md`)
- 일정, 태스크 분해, 담당자 지정, 진행 관리: Friday
- 시장 조사, 자료 수집, 벤치마킹: EVE
- UX/UI, 프론트엔드 경험, 감성 품질: Joi
- 개발, 구현, 기술 검증: TARS
- 카피, 메시지, 현지화, 커뮤니케이션: C3PO
- 데이터 분석, KPI, 실험 설계, 시뮬레이션: Data
- 법무, 보안, 개인정보, 저작권, 릴리스 리스크: KITT/TRON
- 반복 실패, 드리프트, 의심스러운 완료 보고: Diagnostic Agent
- 최종 승인, 가치 판단, 중대한 방향 전환: Human Conductor

## 가드레일

- 모든 태스크에는 Owner(To)와 최소 1명의 CC가 있어야 한다.
- CC에는 전체 컨텍스트가 아니라 필요한 요약만 전달한다.
- 신규 작업은 실행 전에 `work-requests/YYYY-MM-DD-request-slug/` 폴더를 만들고 관련 자료를 그 안에 모은다.
- 신규 작업 시작 시 `scripts/start-jarvis-request.ps1`로 로컬 대시보드 서버를 준비하고, 반환 URL은 Codex Browser `iab`, Cursor/Antigravity/VS Code 브라우저 또는 프리뷰 같은 활성 AI툴 브라우저에서 연다.
- 완료된 요청의 추가 작업은 같은 `requestId`로 시작 훅을 다시 실행해 완료 상태를 진행 상태로 되돌리고 시각화를 재개한다.
- 의미 있는 작업 요청은 필요 시 `dashboards/agent-assignment-dashboard.html` 또는 `dashboards/agent-assignment-dashboard.md`의 포맷으로 Agent Assignment Preview를 제공한다.
- 작업 진행 상황을 시각화해야 할 때는 `dashboards/task-events.jsonl`에 역할별 이벤트를 JSONL로 append하고, 스키마는 `dashboards/task-event-schema.md`를 따른다.
- Jarvis가 직접 모든 일을 처리하지 않도록, 작업 성격이 갈라지는 순간 `docs/specialized-agent-invocation-playbook.md`와 `templates/specialized-agent-call-card.md`를 사용해 전문 스킬/에이전트 호출로 분리한다.
- 에이전트별 호출 기준은 `docs/agent-skill-call-matrix.md`를 따른다.
- 금융/AI 트레이딩 고위험 작업은 `docs/high-risk-finance-ai-trading-protocol.md`를 따른다.
- 전문 호출 이벤트는 `scripts/invoke-jarvis-agent.ps1`로 남기며, `skill`, `cc`, `delegationType` 필드를 포함할 수 있다.
- CC 검토자는 `cc` 배열뿐 아니라 `Assignment=CC` 별도 이벤트로도 남긴다.
- KITT/TRON은 외부 공개, 개인정보, 보안, 법무, 저작권, API 키 리스크를 반드시 검토한다.
- Data는 정량 주장, 시뮬레이션, KPI, 세그먼트 분석을 반드시 검토한다.
- Diagnostic Agent는 반복 실패, 수상한 완료 보고, 드리프트 신호를 검토한다.
- Human Conductor는 외부 릴리스와 큰 방향 변경의 최종 승인권을 가진다.

## Jarvis 설계 리뷰 모드 연계

기본 에이전트 팀 모드는 사용자의 짧은 요청을 빠르게 실행 가능한 태스크로 바꾸는 흐름을 유지한다. 다만 신규 MVP, 금융/보안/개인정보/결제 같은 고위험 프로젝트, 기술 스택과 데이터 모델을 확정해야 하는 작업은 `skills/jarvis-design-review/SKILL.md`를 보조 모드로 사용한다.

이 모드는 Jarvis 기본 페르소나를 교체하지 않는다. Decision Log, SSOT 식별자, MVP 캡슐, 스택 Option A/B/C 비교, PRD/TRD/IA/User Flow/ERD/Design System/TASKS/Coding Convention 산출을 필요할 때만 적용한다.

## 완료 보고 형식

작업이 의미 있게 끝나면 다음을 간결히 보고한다.

- 수행한 작업
- 변경한 파일
- 적용한 에이전트 역할
- 검증한 내용
- 남은 리스크 또는 다음 액션
