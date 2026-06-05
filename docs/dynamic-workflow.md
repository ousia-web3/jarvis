# Jarvis Dynamic Workflow

## 목적

Dynamic Workflow는 Jarvis의 기존 역할 기반 에이전트 팀을 유지하면서, 큰 작업을 작은 Task Graph로 나누고 필요한 순간에만 동적 Worker를 생성해 병렬 실행, 독립 검증, 수정 루프, 최종 집계를 수행하는 운영 레이어다.

기존 에이전트 이름은 바꾸지 않는다. Jarvis, Friday, TARS, Data, KITT/TRON 같은 고정 에이전트는 책임과 의사결정 라인이고, 동적 Worker는 특정 태스크를 처리하는 일회성 실행 단위다.

```text
Jarvis = Master Planner / Aggregator
Friday = Task Graph Manager
TARS = Engineering Lead / Fixer Lead
Data = Verification Lead
KITT/TRON = Risk Gate

worker-task-001 = 일회성 실행 단위
verifier-task-001 = 일회성 검증 단위
fixer-task-001 = 실패 태스크 수정 단위
```

## 4단계 레벨

| 레벨 | 이름 | 구현 상태 | 핵심 산출물 |
| --- | --- | --- | --- |
| L1 | Task Graph | 적용 | `task-graph.json` |
| L2 | Dynamic Worker Manifest | 적용 | `worker-manifest.json`, `packets/*.context.md` |
| L3 | Parallel Executor | 적용 | `run-dynamic-workflow.ps1`, `results/*.result.json` |
| L4 | Verifier / Fixer / Aggregator | 적용 | `verification/`, `fixes/`, `aggregation/aggregate-report.md` |

## 실행 흐름

```text
1. Jarvis가 목표, 금지선, 성공 기준을 정한다.
2. Friday가 작업을 Task Graph로 쪼갠다.
3. 각 task는 최소 컨텍스트 패킷과 worker spec을 받는다.
4. Parallel Executor가 worker를 병렬 실행한다.
5. Verifier가 worker result와 expectedOutputs를 독립 검증한다.
6. 실패가 있으면 Fixer 단계가 수정 노트를 만들거나 명시된 fixer command를 실행한다.
7. Aggregator가 전체 결과를 `aggregate-report.md`로 모은다.
8. Jarvis가 완료 보고와 Human Conductor 승격 여부를 판단한다.
```

## 파일 구조

동적 워크플로우는 작업 요청 폴더 아래에 보관한다.

```text
work-requests/YYYY-MM-DD-request-slug/
  dynamic-workflow/
    task-graph.json
    worker-manifest.json
    packets/
      task-001.context.md
    results/
      task-001.result.json
    verification/
      verification-report.json
      verification-report.md
    fixes/
      fix-task-001.md
    aggregation/
      aggregate-report.md
```

## 주요 스크립트

### 새 워크플로우 생성

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-dynamic-workflow.ps1 `
  -RequestId "example-request" `
  -Goal "100개 파일 리팩터링" `
  -Task "파일 그룹 A 리팩터링","파일 그룹 B 리팩터링","테스트 실행"
```

### 병렬 실행과 검증

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-dynamic-workflow.ps1 `
  -RequestId "example-request" `
  -MaxParallel 4
```

기본 실행은 외부 AI CLI나 임의 명령을 호출하지 않고 로컬 worker result를 생성한다. task 또는 worker에 `command`를 넣은 뒤 실제 명령 실행을 원할 때만 `-AllowCommands`를 사용한다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-dynamic-workflow.ps1 `
  -RequestId "example-request" `
  -MaxParallel 4 `
  -AllowCommands
```

## 안전 규칙

- Worker command 실행은 기본 차단한다.
- `-AllowCommands`를 쓰더라도 삭제, 대량 이동, 외부 전송, 배포, 비밀키/개인정보 처리는 Human Conductor 확인 대상이다.
- Worker는 자기 task의 context packet과 expectedOutputs만 받는 것을 원칙으로 한다.
- CC와 verifier에는 전체 원문 대신 필요한 요약과 결과 경로만 전달한다.
- 실패가 생기면 Fixer가 조용히 덮어쓰기보다 `fixes/`에 수정 근거와 남은 위험을 남긴다.

## 이벤트 확장 필드

`dashboards/task-events.jsonl`에는 기존 필드에 더해 다음 필드를 선택적으로 기록할 수 있다.

| 필드 | 예시 | 설명 |
| --- | --- | --- |
| `workflowId` | `DWF-example-request` | 동적 워크플로우 식별자 |
| `workflowStage` | `parallel-execution` | `task-graph`, `worker-manifest`, `parallel-execution`, `verification`, `fixer`, `aggregation` 중 하나 |
| `taskId` | `task-001` | Task Graph의 태스크 식별자 |
| `workerId` | `worker-task-001` | 동적 worker 식별자 |
| `workerType` | `Implementer` | `Implementer`, `Verifier`, `Fixer`, `Aggregator` |
| `dynamicLevel` | `L4` | 적용된 Dynamic Workflow 레벨 |

## PULM 요약

| PULM | 내용 |
| --- | --- |
| P, Previous | Jarvis는 고정 역할 이벤트 오케스트레이션과 대시보드 시각화 중심이었다. |
| U, Upgrade | Task Graph, Worker Manifest, Parallel Executor, Verifier/Fixer/Aggregator 루프를 추가했다. |
| L, Latest | 기존 에이전트 이름은 유지하고, task별 worker 인스턴스를 작업 요청 폴더 안에서 동적으로 관리한다. |
| M, Manual | `new-dynamic-workflow.ps1`로 생성하고 `run-dynamic-workflow.ps1`로 실행/검증/집계한다. |
