# 업무 로그: 하네스 에이전트 동향과 환경 분석

## 메타데이터

- 작업 ID: `harness-agent-trend-env-analysis`
- 프로젝트: Jarvis
- 에이전트: Jarvis, EVE, TARS, Data, KITT/TRON
- 역할: 전략 종합, 리서치, 환경 분석, 리스크 검토
- 시작 시각: 2026-05-22T08:37:00+09:00
- 완료 시각: 2026-05-22T08:50:00+09:00
- 상태: Done

## 입력

- 요청 요약: 요즘 유행하는 하네스 에이전트와 현재 환경을 분석한다.
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `agents/00-agent-management-index.md`, `AGENTS.md`
- 제약: 최신 동향은 웹으로 확인한다. 외부 배포, 비밀정보, 개인정보, 실거래 주문은 다루지 않는다.

## 실행

- 수행한 일:
  - Jarvis start hook 실행 및 대시보드 URL 확인.
  - 작업 요청 폴더와 Human Brief 초안 작성.
  - 공식 문서 기반으로 OpenAI Agents SDK, MCP, LangGraph, ADK, A2A, CrewAI, AutoGen, Pydantic AI Harness, LlamaIndex, Mastra, Vercel AI SDK, smolagents를 조사.
  - 현재 로컬 저장소 구조, 대시보드, 이벤트 로그, 메모리, 하위 Python 프로젝트를 분석.
  - `stock-auto-trader` 단위 테스트 실행.
- 사용한 도구: PowerShell, web research, Playwright browser surface, unittest
- 주요 판단: Jarvis는 이미 운영형 meta-harness이며, 외부 프레임워크는 대체재가 아니라 실행 계층으로 붙이는 편이 좋다.
- 우회 또는 피봇: Codex Browser의 Node REPL 도구가 노출되지 않아 대시보드 열기는 사용 가능한 Playwright 브라우저 표면으로 대체했다.

## 산출물

- 산출물:
  - `work-requests/2026-05-22-harness-agent-trend-env-analysis/README.md`
  - `work-requests/2026-05-22-harness-agent-trend-env-analysis/outputs/harness-agent-environment-analysis.md`
  - `work-requests/2026-05-22-harness-agent-trend-env-analysis/references/source-notes.md`
  - `work-requests/2026-05-22-harness-agent-trend-env-analysis/evidence/stock-auto-trader-unittest.txt`
- 변경 파일: 위 산출물 및 이 작업 로그
- 검증 결과: `stock-auto-trader` 테스트 12개 통과

## 리스크

- 발견한 리스크: 향후 MCP/tool write 기능 도입 시 권한, 승인, 감사 로그가 필요하다. 현 루트는 Git 저장소가 아니어서 변경 이력 관리가 약하다.
- 호출한 CC: Data, KITT/TRON, Diagnostic Agent
- 승격 여부: Low risk라 Human Conductor 승격 없음.

## 다음

- 다음 액션: Jarvis 로컬 MCP 서버 설계 또는 typed request lifecycle schema 설계.
- 후속 담당자: TARS, Data, KITT/TRON
