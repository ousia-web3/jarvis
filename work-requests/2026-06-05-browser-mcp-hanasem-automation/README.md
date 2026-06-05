# 브라우저 MCP 기반 하나샘 품의서 자동화 개선 검토

## Human Brief

- 요청일: 2026-06-05
- 요청 슬러그: `browser-mcp-hanasem-automation`
- 사용자 요청: 브라우저 MCP가 설치되어 있는지 확인하고, 이를 활용해 하나샘 자동화, 특히 품의서 생성/임시저장 실패 문제를 개선할 방법을 검토한다.
- 대상 참고 프로젝트: `C:\Users\HANA\Desktop\gemini\testing`

## Agent Assignment Preview

- To: TARS
- CC: Jarvis, Friday, KITT/TRON, Diagnostic Agent
- Risk: Medium
- Expected Outputs: 브라우저 MCP 설치/호출 확인, 현재 실패 흐름 요약, 개선 적용안, 남은 리스크
- 다음 액션: 기존 CDP 기반 하나샘 자동화는 유지하고, 브라우저 MCP를 보조 관제/검증 레이어로 붙이는 방안을 우선 검토한다.

## 확인 결과

### 설치 및 호출 가능 여부

- Codex Browser 플러그인 파일은 설치되어 있다.
  - 확인 경로: `C:\Users\HANA\.codex\plugins\cache\openai-bundled\browser\26.519.80914\scripts\browser-client.mjs`
  - `Test-Path` 결과: `True`
- 현재 세션에 실제 노출된 브라우저 MCP 표면은 `mcp__playwright`이다.
  - 확인된 도구: `browser_tabs`, `browser_run_code_unsafe`, `browser_evaluate`, `browser_resize`
- Browser 스킬의 `iab` 런타임이 요구하는 Node REPL `js` 도구는 현재 세션에서 노출되지 않았다.
  - 따라서 이번 세션 기준으로는 `iab` 직접 제어가 아니라 Playwright MCP 제어가 가능한 상태로 본다.

### 동작 확인

- Jarvis 대시보드 열기 성공
  - URL: `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html`
  - 제목: `Jarvis Agent Assignment Dashboard`
- 로컬 품의서 UI 열기 성공
  - URL: `http://127.0.0.1:3000/expense-approval`
  - 제목: `품의서 작성 — 설정 기반 첨부 연동`
  - 관측된 주요 영역: `품의서 목록`, `증적 추출 확인`, `초안 검토 및 하나샘 입력`
- 로컬 서버 상태 확인
  - `GET /api/health`: `ok=true`, `port=3000`

## 현재 하나샘 실패 흐름 요약

- 2026-06-05 08:52 실행:
  - preset: `nc-yuseong-rent-firmbanking`
  - 결과: 실패
  - 실패 단계: 문서번호 확인
  - 문서번호 확정: `false`
- 2026-06-05 09:11 실행:
  - preset: `nc-yuseong-rent-firmbanking`
  - 결과: 실패
  - 실패 단계: 문서번호 확인
  - 핵심 흐름:
    - 본문 필수값 검증은 통과했다.
    - 세금계산서 반영 검증은 통과했다.
    - 임시저장 readiness는 `ready=true`였다.
    - `EdsInsert` 이후 `HANA Exception`이 발생했다.
    - 자동화가 임시함 문서번호 동기화를 시도했지만 현재 저장 문서 row를 확정하지 못했다.

## 판단

브라우저 MCP는 설치/호출 가능하지만, 현재 하나샘 자동화의 핵심 실행 브라우저는 `testing` 프로젝트의 Chrome CDP 포트 `9223` 기반이다. 따라서 지금 당장 브라우저 MCP만으로 기존 자동화 엔진을 대체하는 것보다, 다음처럼 역할을 나누는 편이 안전하다.

1. 기존 `automation_engine.py`는 계속 실행 엔진으로 둔다.
2. 브라우저 MCP는 로컬 UI/로그/결과 API를 관찰하는 보조 관제층으로 붙인다.
3. 실패 시 MCP가 화면 상태, 버튼 상태, 임시함 목록 표시, 콘솔 오류, 로컬 API 응답을 빠르게 수집한다.
4. 실서비스 하나샘 저장/상신을 직접 누르는 동작은 사용자 승인 없이는 하지 않는다.

## 개선 적용안

### 1. MCP 관제 모드 추가

- 로컬 UI에 `관제 모드` 또는 `진단 보기`를 추가한다.
- 자동화 실행 중 다음 정보를 화면에 노출하면 MCP가 안전하게 읽을 수 있다.
  - 현재 단계
  - 현재 preset
  - 마지막 실패 단계
  - 마지막 `EdsInsert` 판정
  - 임시함 검색 후보 수
  - 문서번호 확정 여부
  - 민감값 제거된 trace 파일 링크

### 2. 임시함 문서번호 확정 로직 강화

최근 실패는 버튼 클릭 자체보다 `임시함 row 확정 실패`가 핵심이다. 개선 우선순위는 다음이다.

- 제목 검색 결과에서 `current=1`인 후보를 버리지 말고, 작성일/작성자/문서유형/금액 또는 conversation id 대응값으로 2차 매칭한다.
- 검색어 없는 임시함 목록에서 최근 row 후보를 캡처하고, 실패 evidence에 row text를 민감값 제거 후 저장한다.
- `HANA Exception after EdsInsert`가 발생했더라도 실제 임시저장 row가 생기는 케이스와 생기지 않는 케이스를 분리한다.
- 실패 응답에는 `candidateCounts`뿐 아니라 `bestCandidateReason`, `rejectedReasons`를 남긴다.

### 3. 세금계산서 저장 직전 불변 조건 게이트

저장 직전 다음 값을 한 번에 검증하는 `pre-submit invariant`를 별도 함수로 고정한다.

- `cmd=EdsInsert`
- `tmpSaveYn=Y`
- `processEdiInsert=""`
- 세금계산서 거래처 선택/보내기 완료 플래그
- `conversationId`, `aprvNo` 보존
- 예산 hidden 값 복원 상태
- 본문 금액과 XML 금액 일치

이 게이트 결과를 MCP 관제 화면과 trace에 동일하게 노출하면, 브라우저 MCP가 재현 중 화면을 건드리지 않고도 실패 지점을 확인할 수 있다.

### 4. Browser MCP와 CDP 브라우저 연결 선택지

- 단기: 현재처럼 Playwright MCP는 로컬 앱 관찰/검증에 사용한다.
- 중기: MCP가 Chrome CDP `9223`에 attach할 수 있는 별도 진단 스크립트를 만든다.
- 장기: 하나샘 실행 브라우저, 로컬 UI, Jarvis 대시보드를 하나의 관제 플로우로 묶는다.

단, CDP attach는 실서비스 세션과 내부 업무 화면을 읽을 수 있으므로 민감정보 마스킹과 사용자 승인 게이트가 필요하다.

## 남은 리스크

- 브라우저 MCP가 있다고 해서 하나샘 서버의 `HANA Exception` 원인이 자동으로 해결되지는 않는다.
- 실제 하나샘 세션은 회사 내부 시스템과 사용자 인증을 포함하므로, 저장/상신/삭제/전송 동작은 명시 승인 후에만 진행해야 한다.
- 현재 실패는 “입력 전 준비 실패”보다 “저장 후 문서번호 확정 실패 또는 실제 저장 미생성” 쪽에 더 가깝다.

## 권장 다음 액션

1. `testing` 프로젝트에 읽기 전용 `GET /api/automation/latest-diagnostic` 엔드포인트를 추가한다.
2. `expense-approval` 화면에 민감값 제거된 진단 패널을 추가한다.
3. 임시함 후보 row 분석 결과를 구조화해 `bestCandidate`, `rejectedCandidates`로 저장한다.
4. 그 뒤 브라우저 MCP로 로컬 UI를 열어 실행 상태와 실패 증거를 자동 수집한다.
