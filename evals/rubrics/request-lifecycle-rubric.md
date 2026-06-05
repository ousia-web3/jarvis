# 요청 생명주기 루브릭

| 게이트 | 점수 |
| --- | ---: |
| 접수 이벤트가 기록됨 | 1 |
| Human Brief 또는 README가 있음 | 1 |
| Jarvis 전략이 있음 | 1 |
| Friday 분해 또는 To/CC가 있음 | 1 |
| 실행 이벤트가 있음 | 1 |
| 필요한 경우 리스크 검토가 있음 | 1 |
| 검증 증거가 있음 | 1 |
| Work Log가 있음 | 1 |
| Episodic Memory가 있음 | 1 |
| 최신 요청 이벤트가 Done임 | 1 |

게이트 상태의 1차 기준은 `scripts/validate-jarvis-request.ps1 -RequestId <id>` 실행 결과입니다.
