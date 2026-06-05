# GitHub 초기 업로드 Human Brief

## 1. 프로젝트 선언

- 프로젝트명: Jarvis 프로젝트 GitHub 초기 업로드
- 사용자 원문 요청: "현재 프로젝트 폴더 jarvis 관련 자료 아래 깃허브 커밋 (업로드) 진행해 https://github.com/ousia-web3/jarvis"
- 한 줄 목표: 현재 `jarvis` 프로젝트 자료를 Git 저장소로 정리해 GitHub 원격 저장소에 커밋 및 업로드한다.
- 최종 결과: `https://github.com/ousia-web3/jarvis` 저장소에 초기 커밋이 올라가고, 로컬 저장소가 원격과 연결된다.

## 2. 성공 기준

- 로컬 폴더가 Git 저장소로 초기화되어 있다.
- 원격 `origin`이 `https://github.com/ousia-web3/jarvis.git`를 가리킨다.
- 임시 파일, 캐시, 로그, 비밀키 후보 파일은 커밋 대상에서 제외한다.
- 커밋 해시와 push 결과를 검증 기록에 남긴다.

## 3. 제약 및 리스크

- GitHub 업로드는 워크스페이스 밖으로 데이터를 전송하는 작업이므로 사용자 원문 요청을 명시적 승인으로 간주한다.
- 비밀키, 인증 정보, 개인정보, 브라우저 프로필 데이터는 업로드하지 않는다.
- `gh` CLI가 없으면 PR 생성은 생략하고 `git push` 중심으로 진행한다.
- 원격 인증이 실패하면 커밋까지만 완료하고 사용자에게 인증 필요 사항을 보고한다.

## 4. 역할 배정

- To: TARS - Git 초기화, 커밋, 원격 push, 검증
- CC: KITT/TRON - 비밀/개인정보 및 외부 업로드 리스크 검토
- CC: Friday - 작업 범위와 산출물 정리
- CC: Jarvis - 최종 종합 및 완료 보고

## 5. Agent Assignment Preview

- 요청 요약: Jarvis 프로젝트 폴더를 `ousia-web3/jarvis` GitHub 저장소에 초기 커밋으로 업로드
- To: TARS
- CC: KITT/TRON, Friday, Jarvis
- Risk: Medium - 외부 저장소 업로드 및 로컬 자료 공개 가능성
- Expected Outputs: Git 저장소 초기화, `.gitignore` 검토, 커밋, push 결과, 검증 증거
- 다음 액션: 대시보드 이벤트 기록 후 커밋 대상 점검 및 비밀 후보 검색

## 6. 검증 기록

- 대시보드 시작: `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html` 서버 응답 확인. AI 브라우저 `iab`는 현재 사용 불가라 URL 보고 대상으로 기록.
- Git 상태 확인: 루트 폴더가 Git 저장소가 아니어서 `main` 브랜치로 초기화하고 `origin`을 `https://github.com/ousia-web3/jarvis.git`로 연결.
- 비밀/임시 파일 점검: `atlassian-knowledge-graph/.env`에 실제 토큰이 있었으나 `.gitignore`로 제외됨을 `git check-ignore`와 staged 파일명 검색으로 확인.
- 제외 대상: `.env`, `.env.*`, `tmp/`, `.playwright-mcp/`, `test-results/`, 로그, PID/port, SQLite/DB, `node_modules/`, Python 캐시.
- 중첩 저장소 처리: `setlog-local-first-app`의 내부 `.git` 때문에 서브모듈로 들어가지 않도록 28개 파일을 일반 파일 모드로 인덱스에 등록.
- 스테이징 검증: staged 파일 531개, 서브모듈 모드 `160000` 없음, 민감 파일명 후보 없음.
- 커밋 및 push: 진행 중.
