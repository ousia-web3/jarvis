# 대시보드 폴더

이 폴더는 Jarvis Virtual Office와 작업 이벤트 시각화 자산을 보관합니다.

## 핵심 파일

- `agent-assignment-dashboard.html`: 에이전트 배정과 작업 이벤트를 보여주는 로컬 대시보드
- `agent-assignment-dashboard.md`: 대시보드 사용 설명
- `agent-assignment-data.json`: 에이전트, 채널, 샘플 요청 데이터
- `task-events.jsonl`: 요청별 작업 이벤트 로그
- `task-event-schema.md`: 이벤트 로그 스키마와 보안 금지 사항

## 운영 원칙

- 작업 이벤트는 JSONL 한 줄 단위로 append합니다.
- 비밀키, 개인정보, 계좌 정보, 실거래 주문 세부값은 기록하지 않습니다.
- 이벤트 로그가 커지면 월별 아카이브 정책을 검토합니다.
