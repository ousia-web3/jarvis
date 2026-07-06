# Jarvis 프로젝트 지침

이 프로젝트는 Jarvis AI 에이전트 팀 운영 모델을 기본으로 사용합니다. 사용자가 매번 “문서 먼저 읽고 4단계 아키텍처를 따라라”라고 반복해서 말하지 않아도 됩니다. 모든 프로젝트 작업에서 아래 규칙을 기본 동작으로 취급합니다.

## 기본 시작 절차

사용자가 짧은 작업 요청을 포함해 어떤 작업 요청을 하든 다음 순서로 시작합니다.

1. `docs/` 아래의 관련 프로젝트 문서를 읽습니다.
2. 시작점은 `docs/README.md`로 둡니다.
3. 쉬운 시작 규칙은 `templates/simple-start-request.md`를 사용합니다.
4. 핵심 운영 스킬은 `skills/agent-team-orchestration/SKILL.md`를 사용합니다.
5. 역할 라우팅은 `agents/00-agent-management-index.md`를 기준으로 합니다.
6. 신규 작업 요청이면 요청 슬러그를 정한 직후 `scripts/start-jarvis-request.ps1`를 실행해 운영 대시보드 서버를 준비하고 첫 이벤트를 기록합니다.
7. 스크립트가 반환한 `url`은 OS 기본 브라우저가 아니라 현재 AI툴 브라우저 또는 프리뷰 표면에서 바로 엽니다. 가능하면 선택된 기존 탭/프리뷰를 재사용하고, 별도 `about:blank` 창이나 탭을 먼저 띄우지 않습니다. AI툴 브라우저를 호출할 수 없는 경우에만 URL을 사용자에게 보고합니다.
8. 신규 작업 요청이면 실행 전에 `work-requests/YYYY-MM-DD-request-slug/` 형식의 신규 작업 폴더를 만들고 Human Brief 초안, 참고 자료, 산출물, 검증 증거를 그 폴더에 보관합니다.
9. 별도의 Human Brief가 없으면 사용자 원문 요청을 바탕으로 Human Brief 초안을 자동 생성합니다.
10. Jarvis 전략화, Friday 태스크 분해, 실행, Risk Shield 검토, 완료 보고 순서로 진행합니다.

완료된 대화창이나 완료된 작업 요청에서 사용자가 추가 작업을 요청하면 가능한 한 기존 `requestId`를 재사용합니다. 이때 `scripts/start-jarvis-request.ps1`를 다시 실행해 최신 이벤트를 `In Progress`로 기록하고, 완료 상태였던 요청을 진행 상태로 되돌린 뒤 대시보드/Virtual Office 시각화를 다시 보여줍니다. 기존 요청 식별자를 알 수 없을 때만 새 요청 슬러그를 만듭니다.

신규 MVP, 고위험 기능, 아키텍처 결정, PRD/TRD/TASKS 등 8개 문서 산출이 필요한 작업은 `skills/jarvis-design-review/SKILL.md`를 보조 모드로 사용합니다. 이 모드는 Jarvis 기본 역할을 덮어쓰지 않고 Decision Log, SSOT 식별자, MVP 캡슐, IA(정보설계), 스택 결정 프로토콜을 추가합니다. 단순 파일 수정, 작은 버그 수정, 이미 결정된 구현 작업에는 적용하지 않습니다.

## 실행 트랙 및 비용 통제

모든 요청에 풀 루프를 강제하지 않습니다. Jarvis와 Friday는 작업 시작 직후 L0/L1/L2 중 하나를 고르고, 선택 근거를 README, Work Log, 이벤트 detail 중 한 곳에 남깁니다.

| 트랙 | 조건 | 최소 루프 | 필수 산출물 |
| --- | --- | --- | --- |
| L0 경량 | Low 리스크, 1~2파일, 문구/버그/기존 스펙 구현 | 실행 → diff 또는 스크린샷 확인 → Done 이벤트 1줄 | README 한 줄 또는 Work Log 선택 |
| L1 표준 | Medium 이하 일반 작업, 단일 화면 목업, 문서/스크립트 보강 | `start-jarvis-request` → 실행 → 검증 → Work Log | `work-requests/.../README.md`, 검증 메모 |
| L2 풀 | SI 웹, High 리스크, 신규 MVP, Design Review, 아키텍처 결정 | 4훅 + 전문 에이전트 호출 + validate + IA/리서치 | IA Brief, verification, validate Pass, Episodic Memory |

- L0에서도 새 작업으로 추적 가치가 있거나 기존 `requestId`가 있으면 `start-jarvis-request.ps1`를 사용합니다. 단, 전문 호출, Design Review, `-Strict` 검증, 과도한 리서치는 생략할 수 있습니다.
- Design Review 8문서는 L2 중에서도 신규 MVP, 고위험 기능, 아키텍처·스택·데이터 모델을 확정해야 하는 경우에만 사용합니다.
- Medium 이상 웹서비스, 다페이지, 랜딩, 공개 내비게이션이 포함된 작업은 `templates/ia-brief-template.md` 기준의 IA Draft를 준비합니다. 단일 업무 화면 목업이나 이미 IA가 확정된 후속 구현은 생략할 수 있습니다.
- 랜딩·포트폴리오·리디자인·브랜드 키트 시각 작업은 IA(필요 시) 이후 `docs/design-taste-skill-guide.md`의 Design Taste Skill을 Joi/TARS에 배정합니다. 분석 대시보드·업무 그리드·다단계 포털 UI는 taste-skill을 생략합니다.
- validate는 기본적으로 보고용 `scripts/validate-jarvis-request.ps1 -RequestId <id>`를 사용합니다. `-Strict`는 High/Critical, 외부 릴리스 전, Human Conductor가 차단 게이트를 요청한 경우에만 권장합니다.
- 이벤트 로그는 2026-06-19 이후 신규/진행 요청부터 충실히 남깁니다. 과거 work-request 전체 JSONL 백필은 기본 보류하고, 필요한 경우 README 또는 Work Log를 SSOT로 둡니다.
- 자세한 모드 선택 기준은 `docs/execution-mode-guide.md`를 따릅니다.

의미 있는 작업 요청에서는 필요 시 `dashboards/agent-assignment-dashboard.html` 기준으로 Agent Assignment Preview를 텍스트로 안내합니다. 이 안내에는 요청 요약, To, CC, Risk, Expected Outputs, 다음 액션이 포함됩니다.

의미 있는 신규 작업 요청에서는 다음 명령을 기본 시작 훅으로 사용합니다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<요청 요약>"
```

반환된 대시보드 URL은 반드시 활성 AI툴 브라우저/프리뷰에서 바로 엽니다. 가능하면 선택된 기존 탭/프리뷰를 재사용하고 별도 `about:blank` 창이나 탭을 만들지 않습니다. OS 기본 브라우저 자동 실행은 사용자가 명시적으로 원할 때만 사용합니다.

작업 진행 상황을 시각화해야 할 때는 `dashboards/task-events.jsonl`에 역할별 이벤트를 JSONL 한 줄 단위로 기록합니다. 이벤트 스키마는 `dashboards/task-event-schema.md`를 따르며, 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값은 기록하지 않습니다.

신규 작업 폴더에는 최소한 `README.md` 또는 Human Brief, 주요 산출물, 로컬 실행 방법, 검증 결과를 남깁니다. 공용 대시보드 파일처럼 중앙에서 유지되어야 하는 파일은 이동하지 않고, 작업 폴더에는 링크와 검증 증거를 보관합니다.

## Markdown 작성 언어 원칙

Jarvis 프로젝트의 에이전트 지침, 작업 요청, 분석 보고서, 회고, 운영 문서처럼 사용자가 직접 읽을 Markdown 파일은 가급적 한글로 작성합니다. 코드 식별자, 파일 경로, 명령어, API 이름, 고유명사, 원문 인용, 외부 문서 제목은 필요할 때 원문 표기를 유지할 수 있습니다.

## 필수 아키텍처

항상 다음 4단계 아키텍처를 보존합니다.

- SYS.01 Dream Team: 역할 기반 에이전트 팀
- SYS.02 Virtual Office: To/CC 커뮤니케이션과 작업 채널
- SYS.03 Agent Brain: 기억, 회고, 지혜 승격, 망각 체계
- SYS.04 Human Conductor: 인간의 비전, 최종 승인, 코칭, 리스크 승격

## 역할 라우팅

- Human Conductor: 비전, 최종 승인, 중대한 전략 결정
- Jarvis: 지휘관, 전략적 종합
- Jarvis Design Review Mode: 신규 MVP, 고위험 기능, 아키텍처 결정, Decision Log, SSOT, MVP 캡슐
- Friday: 프로젝트 매니저, 태스크 분해, Owner/CC 배정
- EVE: 리서치, 탐색, 자료 수집
- Joi: 디자인, UX, 프론트엔드 경험 — IA Brief 선행, 시각 구현은 `docs/design-taste-skill-guide.md`·`.agents/skills/`
- TARS: 엔지니어링, 구현, 기술 검증 — 랜딩·포트폴리오 시각 구현 시 taste-skill Primary Skill 적용
- C3PO: 카피, 커뮤니케이션, 현지화
- Data: 정량 분석, 세그먼트, 시뮬레이션, KPI 검증
- KITT/TRON: 법무, 보안, 개인정보, 릴리스 리스크 검토
- Diagnostic Agent: 드리프트, 의심스러운 완료 보고, 반복 실패 진단

## 사용자 상호작용 규칙

사용자는 다음처럼 간단한 요청만 입력해도 됩니다.

```text
유튜브 쇼핑몰 MVP 기획하고 랜딩 페이지 작업까지 진행해줘.
```

에이전트 팀은 이 요청을 해석해 Human Brief 초안을 자동으로 작성해야 합니다. 안전한 진행을 막는 정보가 빠진 경우에만 후속 질문을 합니다.

## 차단 리스크만 확인

일반적인 문서 작업, 내부 기획, 파일 수정, 비파괴적 분석, 합리적인 기본값 선택에는 일상적 승인을 요구하지 않습니다.

다음 항목은 실행 전에 사용자에게 확인하거나 Human Conductor에게 승격합니다.

- 기존 사용자 파일 삭제 또는 대량 이름 변경
- 외부 배포 또는 공개 릴리스
- 워크스페이스 밖으로 데이터 전송
- 비밀키, 인증 정보, 결제, 개인정보 처리
- 법무, 보안, 컴플라이언스 판단
- 프로젝트의 큰 방향 변경

## 완료 보고

의미 있는 작업이 끝나면 다음 내용을 보고합니다.

- 수행한 작업
- 변경한 파일
- 실제로 적용한 에이전트 역할
- 검증한 내용
- 남은 리스크 또는 다음 액션
