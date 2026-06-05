# 업무 로그: Jarvis 개선 백로그 및 한글 MD 저장 원칙

## 메타데이터

- 작업 ID: `jarvis-improvement-backlog-korean-md-rule`
- 프로젝트: Jarvis
- 에이전트: Jarvis, TARS, Friday, KITT/TRON
- 역할: 문서 정리, 지침 반영, 운영 검증
- 시작 시각: 2026-05-22T08:51:00+09:00
- 완료 시각: 2026-05-22T08:55:00+09:00
- 상태: Done

## 입력

- 요청 요약: 개선해야 할 부분을 별도 Markdown으로 만들고, Jarvis 에이전트 관련 Markdown 저장 시 가급적 한글로 처리한다.
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`, `AGENTS.md`
- 제약: 내부 문서 작업만 수행하고, 삭제/배포/외부 전송은 하지 않는다.

## 실행

- 수행한 일:
  - 신규 작업 요청 폴더를 생성했다.
  - 대시보드 시작 훅을 실행하고 AI 브라우저 표면에서 대시보드를 열었다.
  - `docs/jarvis-agent-improvement-backlog.md`를 새로 작성했다.
  - `AGENTS.md`에 Markdown 작성 언어 원칙을 추가했다.
- 사용한 도구: PowerShell, Playwright 브라우저 표면, apply_patch
- 주요 판단: 사용자가 나중에 검토할 수 있도록 개선 항목은 즉시 실행 계획이 아니라 백로그 문서로 분리했다.
- 우회 또는 피봇: 첫 브라우저 호출은 닫힌 세션 때문에 실패했지만, 탭 목록 확인 후 새 탭으로 정상 열었다.

## 산출물

- 산출물:
  - `docs/jarvis-agent-improvement-backlog.md`
  - `work-requests/2026-05-22-jarvis-improvement-backlog-korean-md-rule/README.md`
  - `AGENTS.md`의 Markdown 작성 언어 원칙
- 변경 파일:
  - `AGENTS.md`
  - `docs/jarvis-agent-improvement-backlog.md`
  - `work-requests/2026-05-22-jarvis-improvement-backlog-korean-md-rule/README.md`
  - `memory/work-logs/2026-05-22-jarvis-improvement-backlog-korean-md-rule.md`
- 검증 결과: `validate-jarvis-request.ps1` 결과 `Pass`

## 리스크

- 발견한 리스크: 없음. 내부 문서 생성과 지침 보강만 수행했다.
- 호출한 CC: Friday, KITT/TRON
- 승격 여부: Low risk라 Human Conductor 승격 없음.

## 다음

- 다음 액션: 나중에 사용자가 백로그에서 우선순위를 선택하면 MCP 서버 설계나 요청 스키마 고정부터 진행한다.
- 후속 담당자: Jarvis, TARS
