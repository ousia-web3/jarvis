# Agent Assignment Preview

## 요청 요약

`atlassian-knowledge-graph/` 로컬 대시보드 서버를 실행하고 정상 응답을 검증한다.

## To

- Jarvis: 실행 기준과 완료 판단
- Friday: 작업 단계와 증거 정리
- TARS: 테스트, 서버 실행, API 검증

## CC

- KITT/TRON: 비밀값, 내부 위키 원문, 외부 전송 리스크 점검
- Diagnostic Agent: 포트 충돌, 서버 미기동, 과신 완료 보고 점검

## Risk

Low. 로컬 실행과 읽기 API 확인 중심이다. 실제 Atlassian 동기화는 비밀값/내부 데이터와 연결되므로 이번 기본 실행 검증 범위에서 제외한다.

## Expected Outputs

- 로컬 실행 URL
- 실행/검증 명령 기록
- 검증 결과와 남은 리스크

## 다음 액션

1. 테스트를 실행한다.
2. 8822 포트 상태를 확인한다.
3. 서버가 없으면 백그라운드로 실행한다.
4. `/api/health`, `/api/graph`, `/api/hub` 응답을 확인한다.

