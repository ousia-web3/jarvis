# 현재 프로젝트 구조 분석 및 개선점 정리

## Human Brief 초안

- 요청일: 2026-06-02
- 요청 슬러그: `project-structure-review`
- 사용자 원문: `현재 프로젝트 구조 분석해서 개선할 점 정리해줘.`
- 목표: Jarvis 프로젝트의 현재 디렉터리, 문서, 스크립트, 운영 자산 구조를 읽고 유지보수성, 실행성, 문서 품질, 운영 절차 관점의 개선점을 정리한다.
- 범위: 로컬 워크스페이스의 파일 구조와 주요 문서/설정 파일 분석. 코드 변경이나 대규모 리팩터링은 수행하지 않는다.
- 제외: 파일 삭제, 대량 이동, 외부 배포, 비밀키/개인정보 처리, 법무/보안 최종 판단.

## 적용 에이전트 역할

- Jarvis: 분석 방향과 우선순위 정리
- Friday: 조사 항목과 산출물 구조화
- EVE: 문서/구조 탐색
- TARS: 코드/스크립트/설정 관점 점검
- KITT/TRON: 운영 리스크와 안전 경계 검토
- Diagnostic Agent: 구조 드리프트와 반복 오류 가능성 진단

## 산출물

- `outputs/project-structure-review.md`: 프로젝트 구조 분석 및 개선 제안
- `evidence/structure-scan.md`: 조사 명령과 주요 증거 요약

## 로컬 실행/검증

- Jarvis 시작 훅: `powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId project-structure-review -Task "현재 프로젝트 구조 분석 및 개선점 정리"`
- 구조 조사: `rg --files`, 주요 문서/설정 파일 읽기, 디렉터리 분포 확인

## 검증 결과

- 시작 훅 1차 실행: `Path`/`PATH` 중복 환경 변수로 실패
- 시작 훅 재실행: 프로세스 환경 변수 정규화 후 성공, `dashboards/task-events.jsonl`에 `In Progress` 이벤트 기록
- 대시보드 URL 브라우저 확인: 반환 URL 접근 시 연결 거부. 서버 프로세스 유지/health check 개선 필요
- `scripts/audit-work-requests.ps1 -Markdown`: 총 60개 요청, 11개 Review 확인
- `stock-auto-trader`: `python -m unittest discover -s tests -v`, 19개 통과
- `atlassian-knowledge-graph`: `python -m unittest discover -s tests -v`, 7개 통과
- `setlog-local-first-app`: `npm run`으로 Expo 실행 스크립트 확인

## 주요 결론

- 루트는 Git 저장소가 아니며, `.gitignore`가 있어도 현재는 실제 추적 보호가 작동하지 않는다.
- 운영 코어와 하위 프로젝트 3개가 한 루트에 섞여 있어 루트 인덱스 보강이 필요하다.
- Jarvis 운영 문서와 스크립트는 좋은 기반이지만, 대시보드 시작 훅과 통합 검증 명령을 먼저 안정화하는 편이 효과가 크다.
