# 에피소딕 메모리: dashboard-group-reopen-status-realtime

## 기본 정보

- Date: 2026-05-22
- Agent: TARS
- Project: Jarvis
- Task ID: dashboard-group-reopen-status-realtime

## 회고

- 오늘 내가 맡은 일: 완료된 작업 그룹이 추가 작업으로 다시 열릴 때 대시보드 상태가 `진행`으로 돌아오게 만드는 일.
- 실제로 한 일: 이벤트 최신성 비교에 append 순서 tie-breaker를 추가하고, 동일 timestamp의 완료/진행 순서 케이스를 브라우저에서 검증했다.
- 어려웠던 지점: 기존 로직은 일반적인 timestamp 차이에서는 맞아 보였지만, 같은 timestamp 안에서 append 순서가 뒤집히는 경우에만 증상이 드러났다.
- 판단을 바꾼 순간: `sortedEvents()`가 timestamp만 비교하면 안정 정렬 때문에 먼저 append된 `Done`이 최신처럼 남을 수 있음을 확인한 순간.
- 인간 대표 또는 다른 에이전트에게 받은 피드백: 완료 이후 추가 작업은 반드시 `완료 -> 진행`으로 실시간 반영되어야 한다는 사용자 피드백.

## 학습

- 새로 배운 점: JSONL 기반 실시간 UI에서는 timestamp뿐 아니라 로그 라인 순서도 상태 머신의 일부로 취급해야 한다.
- 다음에 반복하지 말아야 할 실수: 완료 이벤트 보정 로직을 만들 때 같은 timestamp의 append 순서 케이스를 빼먹지 않는다.
- 다음에도 재사용할 수 있는 패턴: `timestamp + append index`를 공통 비교 함수로 두고 요청/에이전트/목록 정렬이 모두 같은 기준을 쓰게 한다.
- 지혜 승격 후보: 이벤트 로그 UI의 최신성 판단은 단일 시각 값보다 단조 증가하는 로그 순서를 함께 사용해야 한다.

## 기억 정책

- 장기 보존할 내용: `compareEventRecency` 패턴과 동일 timestamp 재진행 검증 케이스.
- 요약 후 소거할 내용: 브라우저 임시 평가 결과의 세부 런타임 출력.
- KITT/TRON 검토가 필요한 민감정보: 없음.
