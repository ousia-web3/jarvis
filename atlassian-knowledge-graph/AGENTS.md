# Atlassian Knowledge Graph 작업 지침

이 폴더는 루트 Jarvis 프로젝트 안에서 Confluence/Atlassian 위키 기반 지식 그래프 대시보드를 독립 관리하는 하위 프로젝트입니다.

## 시작 절차

1. 루트 `../AGENTS.md`와 `../docs/README.md`의 Jarvis 에이전트 팀 규칙을 따른다.
2. 이 폴더 안의 `README.md`와 `docs/work-log.md`를 먼저 확인한다.
3. Atlassian API, 로컬 DB, 대시보드 관련 코드는 이 폴더 안에서만 수정한다.
4. API 토큰, 내부 위키 원문, 개인정보, 외부 LLM 전송은 KITT/TRON 검토 대상이다.

## 기본 실행 위치

명령은 기본적으로 `atlassian-knowledge-graph/`에서 실행한다.

```powershell
python -m unittest discover -s tests -v
python -m atlassian_kg.cli init-db
python -m atlassian_kg.cli sync
python -m atlassian_kg.cli serve --port 8822
```

## 역할 분장

- Jarvis: 전략 기준과 승격 판단
- Friday: 태스크 분해와 진행 관리
- EVE: 위키 구조 탐색과 자료 수집 기준
- Data: 그래프 품질, 요약/아이디어 지표 검증
- TARS: 코드 구현과 테스트
- Joi: 대시보드 UX/UI
- KITT/TRON: API 토큰, 내부 위키, 외부 전송 리스크 검토
- Diagnostic Agent: 과신, 드리프트, 허위 완료 보고 점검

## 금지 사항

- 노출된 토큰 원문 저장
- 승인 없는 외부 공개 또는 배포
- 승인 없는 내부 위키 원문 외부 LLM 전송
- 로그/대시보드 이벤트에 API 토큰, 이메일, 개인정보 기록
- Confluence 페이지 자동 수정 또는 삭제
