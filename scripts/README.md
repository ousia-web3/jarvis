# 스크립트 폴더

이 폴더는 Jarvis 운영 훅과 점검 자동화를 보관합니다.

## 주요 스크립트

- `start-jarvis-request.ps1`: 신규 요청의 대시보드 서버와 첫 이벤트를 준비합니다.
- `start-dashboard.ps1`: 대시보드 로컬 서버를 시작하거나 재사용합니다.
- `invoke-jarvis-agent.ps1`: 전문 스킬/에이전트 호출 이벤트를 대시보드 JSONL에 기록합니다.
- `new-dynamic-workflow.ps1`: 작업 요청 폴더 아래에 Task Graph, Worker Manifest, context packet을 생성합니다.
- `run-dynamic-workflow.ps1`: Dynamic Workflow worker를 병렬 실행하고 Verifier/Fixer/Aggregator 보고서를 생성합니다.
- `validate-jarvis-request.ps1`: 요청 상태 머신 게이트 통과 여부를 검증합니다.
- `close-jarvis-request.ps1`: 완료 이벤트, Work Log, Episodic Memory 생성을 돕습니다.
- `promote-wisdom.ps1`: 반복 교훈을 지혜 후보 또는 지혜 레지스트리로 기록합니다.
- `purge-memory.ps1`: 망각 큐와 보존 정책을 점검합니다.
- `audit-work-requests.ps1`: 작업 요청 폴더의 README, evidence, 대형 증거 파일을 점검합니다.

## 실행 원칙

스크립트 변경 후에는 가능한 한 해당 스크립트를 한 번 실행해 출력 형식을 검증합니다.

Dynamic Workflow 스크립트는 기본적으로 외부 AI CLI나 임의 명령을 실행하지 않습니다. task 또는 worker에 `command`를 넣고 실제 명령 실행이 필요할 때만 `run-dynamic-workflow.ps1 -AllowCommands`를 사용합니다.
