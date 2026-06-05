# 검증 결과

## 실행 상태

- 실행 대상: `atlassian-knowledge-graph/`
- 실행 URL: `http://127.0.0.1:8822`
- 서버 상태: 8822 포트 리슨 중
- 서버 PID: `33520`
- 실행 로그:
  - `evidence/server.out.log`
  - `evidence/server.err.log`

## 검증 명령

```powershell
cd atlassian-knowledge-graph
python -m unittest discover -s tests -v
python -m atlassian_kg.cli serve --port 8822
```

## 검증 결과

- 단위 테스트: 7개 통과
- `GET /`: HTTP 200, 대시보드 타이틀 문자열 확인
- `GET /api/health`: HTTP 200
- `GET /api/graph`: `semantic` 모드 기준 노드 204개, 엣지 369개
- `GET /api/hub`: starter pages 6개, top ideas 8개, top concepts 8개, risk nodes 1개, metric nodes 1개
- `GET /api/training`: 카드 79개
- `GET /api/ideas`: 아이디어 114개
- `GET /api/coverage`: root pages 2개, quality checks 4개, issues 1개

## 브라우저/프리뷰

- Jarvis 운영 대시보드 URL: `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html`
- Codex Browser `iab`가 현재 세션에 노출되어 있지 않아 AI툴 브라우저 자동 오픈은 수행하지 못했다.
- Playwright MCP도 기존 브라우저 프로필 사용 중 오류로 시각 스크린샷을 생성하지 못했다.
- 대신 로컬 HTTP 응답과 API 카운트로 비파괴 검증을 완료했다.

## 리스크

- 실제 Atlassian 동기화는 수행하지 않았다.
- 비밀값, 내부 위키 원문, 개인정보는 출력하거나 작업 기록에 저장하지 않았다.
- 커버리지 리포트의 기존 이슈 1개는 `missingEndpoints`, `orphanPages` 범주이며 로컬 실행 자체를 막지는 않는다.

