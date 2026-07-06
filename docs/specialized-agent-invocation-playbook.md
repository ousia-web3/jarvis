# 전문 스킬 및 에이전트 호출 플레이북

## 목적

Jarvis가 모든 일을 직접 처리하면 전략, 실행, 검증, 리스크 판단이 한 흐름에 섞인다. 이 플레이북은 Jarvis를 지휘관으로 남기고, 실제 작업은 전문 스킬과 에이전트 호출로 분산하기 위한 운영 규칙이다.

## 기본 원칙

- Jarvis는 목표, 우선순위, 성공 기준, 위험 승격만 맡는다.
- Friday는 작업을 작게 쪼개 Owner(To), CC, 산출물, 검증 명령을 지정한다.
- 실무 에이전트는 자기 소유 파일과 역할 범위 안에서만 실행한다.
- Data, KITT/TRON, Diagnostic Agent는 실행자와 분리된 검증 레이어로 둔다.
- 중요한 호출은 `scripts/invoke-jarvis-agent.ps1`로 `dashboards/task-events.jsonl`에 남긴다.
- CC는 `cc` 배열뿐 아니라 `-Assignment CC` 별도 이벤트로도 남겨 대시보드에서 독립 검토가 보이게 한다.
- 작업 수가 많거나 파일/모듈별 병렬 실행이 유리하면 `docs/dynamic-workflow.md`와 `scripts/new-dynamic-workflow.ps1`를 사용해 Task Graph와 동적 Worker 계층으로 올린다.

## 호출 판단

전문 에이전트를 호출한다.

- 작업이 리서치, 구현, 데이터 검증, 리스크 검토처럼 성격이 명확히 갈라질 때
- Jarvis가 다음 결정을 내리기 전에 병렬 확인이 유용할 때
- 고위험 작업에서 실행자와 검토자를 분리해야 할 때
- 사용자 요청이 "전문 에이전트", "스킬", "병렬", "호출"을 명시할 때
- 사용자 요청이 "Dynamic Workflow", "동적 워크플로우", "워커", "병렬 실행", "Verifier/Fixer/Aggregator"를 명시할 때

Jarvis가 직접 처리한다.

- 1~2문장 답변으로 충분한 경우
- 바로 다음 행동이 외부 정보 없이 명확한 경우
- 분산 비용이 산출물보다 큰 경우
- 사용자 승인 없이 진행하면 안 되는 차단 리스크가 있는 경우

## 스킬/에이전트 매트릭스

| 작업 유형 | Owner(To) | CC | 사용 스킬/문서 | 채널 |
| --- | --- | --- | --- | --- |
| 전략 판단, 우선순위 | Jarvis | Friday, KITT/TRON | `jarvis-command-protocol.md` | `strategy` |
| 태스크 분해, 일정, 책임 배정 | Friday | Jarvis | `friday-task-breakdown-template.md` | `ops` |
| 시장/고객/경쟁 리서치 | EVE | Data, KITT/TRON | 리서치 브리프, 출처 기록 | `research` |
| 데이터 분석, 시뮬레이션, KPI | Data | Jarvis, KITT/TRON | `data-analysis-pipeline.md` | `analysis` |
| 구현, 테스트, 스크립트, 랜딩·포트폴리오 시각 구현 | TARS | Data, KITT/TRON, Joi | 개발 체크리스트, `docs/design-taste-skill-guide.md`, `.agents/skills/design-taste-frontend/SKILL.md` | `implementation` |
| UX/UI/프론트엔드 경험, IA, Design QA | Joi | C3PO, TARS | `templates/ia-brief-template.md`, `docs/design-taste-skill-guide.md`, 사용자 흐름 | `design` |
| 기존 화면 시각 리디자인 | Joi | TARS, C3PO | `.agents/skills/redesign-existing-projects/SKILL.md` | `design` |
| 브랜드 키트·아이덴티티 보드 | Joi | C3PO | `.agents/skills/brandkit/SKILL.md` | `design` |
| 문구, 보고, 현지화 | C3PO | Jarvis, KITT/TRON | 완료 보고, 카피 템플릿 | `copy` |
| 보안, 개인정보, 금융 리스크 | KITT/TRON | Human Conductor | `risk-shield.md` | `risk` |
| 반복 실패, 과신, 완료 보고 의심 | Diagnostic Agent | Jarvis | `drift-diagnosis-checklist.md` | `diagnostic` |

상세 매트릭스는 `docs/agent-skill-call-matrix.md`를 기준으로 한다.

## 고위험 금융/AI 트레이딩 작업 분리

금융, 자동매매, 실시간 데이터, 목표 수익률, API 연결이 등장하면 다음 분리를 기본값으로 둔다.

- Jarvis: 목표와 금지선 정의
- Friday: 단계 분해와 작업 격리
- EVE: 공식 출처와 시장 케이스 확인
- Data: 시뮬레이션, 백테스트, 실패 사유 분석
- TARS: paper/replay 코드만 구현
- KITT/TRON: 실거래, 비공식 API, 보장 표현, 개인정보/계좌 접근 차단
- Diagnostic Agent: "반드시 성공" 같은 과신 표현과 오라클 누수 점검

상세 프로토콜은 `docs/high-risk-finance-ai-trading-protocol.md`를 기준으로 한다.

## 호출 이벤트 표준

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "stock-market-issue-goal-scenario-test" `
  -Agent "Data" `
  -Skill "simulation-validation" `
  -Task "45거래일 +25% 시나리오 실패/성공 경계 검증" `
  -Channel "analysis" `
  -RiskLevel "High" `
  -Cc "KITT/TRON","Diagnostic Agent" `
  -Outputs "work-requests/.../verification.md"
```

이벤트에는 `skill`, `cc`, `delegationType` 필드를 추가로 남긴다. 기존 대시보드는 표준 필드만 사용해도 표시되고, 확장 UI는 추가 필드를 활용할 수 있다.

CC가 독립 검토자라면 다음처럼 별도 이벤트를 추가한다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "stock-market-issue-goal-scenario-test" `
  -Agent "KITT/TRON" `
  -Assignment CC `
  -Skill "risk-review" `
  -Task "독립 리스크 검토" `
  -Channel risk `
  -RiskLevel High
```

## 호출 절차

1. Jarvis가 목표와 차단 리스크를 정한다.
2. Friday가 작업을 병렬 가능 단위로 나눈다.
3. 각 작업에 Owner(To), CC, 사용 스킬, 산출물, 검증 명령을 지정한다.
4. `invoke-jarvis-agent.ps1`로 호출 이벤트를 남긴다.
5. Owner가 실행하고 CC는 요약 컨텍스트만 검토한다.
6. Data/KITT/TRON/Diagnostic Agent가 검증 이벤트를 남긴다.
7. Jarvis가 종합하고 Human Conductor 승인 필요 여부를 판단한다.

## Dynamic Workflow 승격 절차

1. Jarvis가 Dynamic Workflow 사용 여부를 결정한다.
2. Friday가 `task-graph.json`으로 L1 Task Graph를 만든다.
3. `new-dynamic-workflow.ps1`가 L2 Worker Manifest와 context packet을 생성한다.
4. `run-dynamic-workflow.ps1`가 L3 Parallel Executor로 worker result를 만든다.
5. Data와 Diagnostic Agent가 L4 Verifier 단계에서 worker result와 expectedOutputs를 확인한다.
6. 실패가 있으면 TARS Fixer가 `fixes/`에 수정 근거와 재작업 대상을 남긴다.
7. Jarvis Aggregator가 `aggregation/aggregate-report.md`로 결과를 모은다.

## 완료 기준

- `dashboards/task-events.jsonl`에 Jarvis, Friday, 최소 1개 실무 Owner, 최소 1개 검증/리스크 CC 이벤트가 존재한다.
- 작업 요청 폴더에 Human Brief, Agent Assignment Preview, 검증 기록이 존재한다.
- 고위험 작업은 KITT/TRON 이벤트 없이 완료하지 않는다.
- 코드 변경은 테스트 명령과 결과를 함께 기록한다.
