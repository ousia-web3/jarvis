# 아키텍처 계약

## 목적

4개의 SYS 계층은 입력과 출력이 서로 이어질 때만 실제 운영 체계로 작동합니다. 이 문서는 각 계층이 무엇을 받아 무엇을 넘겨야 하는지 정의합니다.

## SYS.01 Dream Team 계약

입력:
- 사용자 요청 또는 Human Brief
- 제약 조건, 리스크 신호, 목표 산출물

출력:
- Owner(To)
- CC 검토자
- 예상 산출물
- 역할별 품질 기준

필수 필드:
- `requestId`
- `owner`
- `cc`
- `riskLevel`
- `definitionOfDone`

다음 계층으로 전달:
- SYS.02 Virtual Office의 배정 및 메시지 라우팅 데이터
- Friday 태스크 분해

## SYS.02 Virtual Office 계약

입력:
- Owner(To), CC, 작업 요약, 채널, 상태

출력:
- `dashboards/task-events.jsonl` 이벤트
- 요청 상태 타임라인
- 검토 및 승격 이력

필수 필드:
- `timestamp`
- `requestId`
- `agent`
- `assignment`
- `status`
- `task`
- `channel`

다음 계층으로 전달:
- SYS.03 Agent Brain의 원천 업무 로그 자료
- SYS.04 Human Conductor의 감사 표면

## SYS.03 Agent Brain 계약

입력:
- 작업 이벤트
- Work Log
- Episodic Memory
- 검증 증거
- 리스크 검토

출력:
- 지혜 후보
- 지혜 레지스트리 항목
- 소거 대기열 항목
- 격리 항목
- 갱신된 운영 규칙

지혜 항목의 필수 필드:
- `Wisdom ID`
- `Source Tasks`
- `Observed Pattern`
- `Abstract Principle`
- `When to Apply`
- `When Not to Apply`
- `Owner`
- `Review Date`

다음 계층으로 전달:
- SYS.01 역할 및 라우팅 개선
- SYS.02 게이트와 대시보드 개선
- 리스크가 높을 때 SYS.04 승인 판단

## SYS.04 Human Conductor 계약

입력:
- 의사결정 요청
- 리스크 검토
- 대안
- 증거
- 추천안

출력:
- 승인, 반려, 보류
- 조건
- 결정 기록

필수 필드:
- `Decision ID`
- `Request ID`
- `Decision`
- `Approver`
- `Rationale`
- `Conditions`
- `Timestamp`

다음 계층으로 전달:
- `decisions/approval-ledger.md`
- 릴리스 게이트
- 향후 전략 제약 조건

## 계층 전체 Done 계약

요청은 아래 조건을 만족할 때만 닫을 수 있습니다.

1. 해당 요청의 이벤트가 최소 1개 이상 있어야 한다.
2. 최신 이벤트가 `Done`이어야 한다.
3. Owner(To) 신호가 있어야 한다.
4. High/Critical 리스크 요청은 KITT/TRON 또는 Human Conductor 검토가 있어야 한다.
5. 검증 증거가 있거나 검증이 필요 없는 이유가 문서화되어야 한다.
6. Work Log와 Episodic Memory 기록이 있거나 초안이 생성되어야 한다.
