# 에피소드 메모리: atlassian-local-run

## 기본 정보

- Date: 2026-06-01
- Agent: Jarvis / Friday / TARS / KITT/TRON / Diagnostic Agent
- Project: Atlassian Knowledge Graph
- Task ID: `atlassian-local-run`

## 회고

- 오늘 닿은 맞는 일: 짧은 요청을 기존 Jarvis 절차로 받아 하위 프로젝트 문서, 이전 로컬 실행 기록, 표준 실행 포트를 빠르게 연결했다.
- 실제로 한 일: 작업 폴더와 운영 이벤트를 남기고, 테스트 통과 후 8822 로컬 서버를 실행했다.
- 어려웠던 지점: Codex Browser `iab`가 현재 세션에 없고 Playwright MCP가 기존 프로필 잠금 상태라 시각 스크린샷은 만들지 못했다.
- 판단을 바꾼 순간: 실제 Atlassian 동기화는 토큰과 내부 위키 원문 리스크가 있으므로 기본 로컬 실행 검증에서 제외했다.

## 학습

- 다음에 반복하지 말아야 할 실수: `validate-jarvis-request.ps1`는 `-RequestId` 기준으로 실행해야 하며 `-RequestDir` 파라미터는 없다.
- 다음에도 재사용할 패턴: 로컬 실행 요청은 테스트, 포트 확인, 백그라운드 서버 실행, 핵심 API 카운트 검증 순서가 가장 깔끔하다.
- 지혜 승격 후보: AI툴 브라우저가 없는 세션에서는 URL 보고와 HTTP/API 검증을 기본 fallback으로 명시한다.

## 기억 정책

- 장기 보존할 내용: `atlassian-knowledge-graph` 표준 로컬 URL은 `http://127.0.0.1:8822`이고, 실행 명령은 `python -m atlassian_kg.cli serve --port 8822`이다.
- 요약 후 소거할 내용: 포트 PID와 일회성 브라우저 연결 오류는 장기 보존 대상이 아니다.
- KITT/TRON 검토 필요 민감정보: Atlassian 토큰, 이메일, 내부 위키 원문은 기록하지 않는다.

