# 구조 조사 증거

## 실행 개요

- 조사일: 2026-06-02
- 작업 요청: `project-structure-review`
- 범위: Jarvis 루트, 운영 문서, 스크립트, 대시보드, 작업 요청 저장소, 하위 프로젝트 3개
- 제외/주의: 파일 삭제, 대량 이동, 민감정보 내용 열람은 하지 않음

## 주요 명령과 결과

### 작업 시작 훅

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId project-structure-review -Task "현재 프로젝트 구조 분석 및 개선점 정리"
```

- 1차 실행 결과: 실패
- 실패 원인: 현재 PowerShell 프로세스 환경에 `Path`와 `PATH`가 동시에 존재해 `Start-Process`에서 `Item has already been added. Key in dictionary: 'Path' Key being added: 'PATH'` 발생
- 환경 변수 정규화 후 재실행: 성공
- 반환 URL: `http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html`
- 브라우저 확인: Playwright 표면에서 URL 접근 시 `ERR_CONNECTION_REFUSED`
- 추가 확인: 직접 백그라운드 서버 시작도 이 실행 환경에서는 부모 명령이 자식 서버 프로세스를 붙잡고 타임아웃되는 패턴 확인

### 파일 분포

명령:

```powershell
rg --files -g '!work-requests/**' -g '!tmp/**' -g '!**/__pycache__/**' -g '!**/.expo/**' -g '!**/node_modules/**'
```

- 핵심 파일 수: 355개
- 상위 분포:
  - `memory`: 111
  - `docs`: 56
  - `stock-auto-trader`: 55
  - `atlassian-knowledge-graph`: 30
  - `setlog-local-first-app`: 26
  - `scripts`: 13
  - `agents`: 12
  - `templates`: 12

확장자 분포:

- `.md`: 217
- `.py`: 42
- `.png`: 38
- `.ps1`: 14
- `.json`: 11
- `.ts`: 8
- `.html`: 6
- `.tsx`: 4

### 작업 요청 건강도

명령:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-work-requests.ps1 -Markdown
```

결과 요약:

- 총 요청 폴더: 60
- Review 요청: 11
- `missing-readme`: 3
- `empty-evidence`: 5
- `empty-outputs`: 1
- `large-evidence`: 3

### 테스트

`stock-auto-trader`:

```powershell
python -m unittest discover -s tests -v
```

- 결과: 19개 테스트 통과

`atlassian-knowledge-graph`:

```powershell
python -m unittest discover -s tests -v
```

- 결과: 7개 테스트 통과

`setlog-local-first-app`:

```powershell
npm run
```

- 결과: Expo 실행 스크립트 확인
- 별도 테스트 스크립트는 없음

## 구조상 관찰

- 루트는 Git 저장소가 아님: `git status --short`가 `fatal: not a git repository` 반환
- `.gitignore`는 존재하지만 Git 저장소가 아니라 실제 추적 보호로 작동하지 않음
- `setlog-local-first-app/node_modules`가 실제로 존재하며 대형 의존성 파일 다수 포함
- `atlassian-knowledge-graph/.env`가 존재함. 내용은 열람하지 않음
- `__pycache__`와 `.pyc` 파일이 여러 하위 프로젝트에 존재함
- 루트 README와 `docs/README.md`는 `stock-auto-trader`는 언급하지만 `atlassian-knowledge-graph`, `setlog-local-first-app`의 루트 수준 위치 설명은 부족함
- `docs/jarvis-agent-improvement-backlog.md`는 이미 P0로 루트 Git 저장소화, Jarvis 로컬 MCP 서버, 요청 상태 스키마 고정을 제안하고 있음
