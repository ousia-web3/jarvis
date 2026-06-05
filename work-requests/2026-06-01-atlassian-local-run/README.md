# 아틀라시안 로컬 실행

## 개요

`atlassian-knowledge-graph/` 하위 프로젝트의 로컬 실행 요청이다.

## 기준 URL

- Jarvis 운영 대시보드: `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html`
- Atlassian Knowledge Graph: `http://127.0.0.1:8822`

## 실행 기준

```powershell
cd atlassian-knowledge-graph
python -m unittest discover -s tests -v
python -m atlassian_kg.cli serve --port 8822
```

## 검증 기록

검증 결과는 `verification.md`에 정리한다.

