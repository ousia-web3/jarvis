# Jarvis 파일 관리 정책

이 문서는 Jarvis 프로젝트에서 파일을 어디에 두고, 무엇을 원본으로 보고, 어떤 산출물을 임시물이나 증거로 다룰지 정하는 기준입니다.

## 목적

- 원본 문서와 생성물이 검색에서 섞이지 않게 한다.
- 작업 요청별 증거를 남기되 저장소가 불필요하게 커지지 않게 한다.
- 대형 PDF, 추출 이미지, 브라우저 스냅샷, 로그 파일의 보관 기준을 명확히 한다.
- 삭제, 이동, 대량 이름 변경은 Human Conductor 승인 후 진행한다.

## 파일 분류

| 분류 | 대표 위치 | 설명 | 기본 처리 |
| --- | --- | --- | --- |
| 살아있는 운영 문서 | `README.md`, `docs/`, `agents/`, `architecture/`, `templates/`, `skills/` | 사람이 직접 읽고 계속 갱신하는 원본 문서 | 한글 우선, 링크 최신화 |
| 실행 스크립트 | `scripts/` | 요청 시작, 검증, 완료, 점검 자동화 | 변경 후 최소 실행 검증 |
| 대시보드 원본 | `dashboards/*.html`, `dashboards/*.json`, `dashboards/*.md` | Virtual Office와 이벤트 표시 원본 | 직접 편집 가능 |
| 이벤트 로그 | `dashboards/task-events.jsonl` | 작업 요청별 역할 이벤트 | append 중심, 월별 아카이브 검토 |
| 작업 요청 기록 | `work-requests/YYYY-MM-DD-slug/` | Human Brief, 산출물, 검증 증거 | 요청별 README 필수 |
| Agent Brain | `memory/` | 업무 로그, 에피소딕 메모리, 지혜 후보 | 과거 이력 보존 우선 |
| 추출 보존 자료 | `docs/opendataloader-extract/` | 별도 보관된 원본 PDF에서 추출한 이미지, JSON, Markdown | 일상 편집 대상 아님 |
| 브라우저 검증 산출물 | `.playwright-mcp/` | 브라우저 스냅샷, 콘솔 로그, 임시 복사본 | `.gitignore` 대상, 필요한 것만 evidence로 복사 |
| 임시 로그 | `tmp/` | 로컬 서버 stdout/stderr 등 | `.gitignore` 대상, 필요한 것만 evidence로 복사 |

## 루트 검색 규칙

일반 검색은 생성물과 분리된 하위 프로젝트를 제외하고 실행한다.

```powershell
rg "검색어" -g "!stock-auto-trader/**" -g "!tmp/**" -g "!work-requests/**/evidence/**"
```

브라우저 스냅샷까지 제외하려면 `.gitignore`를 따르는 기본 `rg`를 사용한다. 반드시 포함해야 할 때만 `rg --no-ignore`를 사용한다.

## `.playwright-mcp/` 처리

- `.playwright-mcp/`는 원본 문서 폴더가 아니라 브라우저 검증 도구 산출물이다.
- 이 폴더 안에 있는 Markdown, YAML, 로그는 원본으로 인용하지 않는다.
- 장기 보관할 필요가 있는 화면 스냅샷이나 콘솔 로그는 해당 작업의 `work-requests/YYYY-MM-DD-slug/evidence/`로 복사한 뒤, 복사본을 증거로 참조한다.
- `.playwright-mcp/` 자체는 `.gitignore`에 포함한다.

## `tmp/` 처리

- `tmp/`는 로컬 서버 로그와 임시 실행 결과를 담는다.
- `tmp/*.log`는 장기 보관 대상이 아니다.
- 장애 재현에 필요한 로그만 작업 요청 `evidence/`로 복사한다.
- 로그 초기화 또는 삭제는 사용자 승인 후 별도 정리 작업으로 수행한다.

## 원본 PDF와 추출물

- 원본 `AI_에이전트_팀_아키텍처.pdf`는 프로젝트 밖에 별도 보관한다.
- 프로젝트 안에서는 `docs/opendataloader-extract/`만 추출 보존 자료로 유지한다.
- `docs/opendataloader-extract/`는 별도 보관된 PDF에서 추출한 Markdown, JSON, 이미지 보존 자료다.
- 이 자료는 일상 편집 대상이 아니며, 파생 설명은 `docs/`의 살아있는 운영 문서에 작성한다.
- 향후 이동이 필요하면 `docs/archive/` 또는 `docs/source/`로 옮기는 별도 작업 요청을 만들고 링크 영향도를 검증한다.

## 작업 요청 폴더 기준

모든 의미 있는 신규 요청 폴더는 다음 최소 구조를 가진다.

```text
work-requests/
  YYYY-MM-DD-request-slug/
    README.md
    evidence/
```

- `README.md`에는 Human Brief 초안, To/CC, 주요 산출물, 검증 결과를 남긴다.
- `evidence/`는 실제 검증 증거가 있을 때 사용한다.
- 증거가 없거나 보존하지 않는 경우에도 README에 “증거 없음” 또는 “중앙 로그 참조”를 명시한다.
- 스크린샷, HTML 덤프, 대형 로그는 꼭 필요한 것만 보관한다.
- 빈 `outputs/`가 생기면 `outputs/README.md`로 의도를 설명하거나 별도 승인 후 정리한다.

## 작업 요청 건강도 점검

다음 스크립트로 작업 요청 폴더의 README, evidence, 대형 증거 파일을 점검한다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-work-requests.ps1
```

Markdown 표로 보고 싶으면 다음 옵션을 쓴다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-work-requests.ps1 -Markdown
```

이슈 코드는 Windows PowerShell 인코딩 흔들림을 줄이기 위해 ASCII로 출력한다.

- `missing-readme`: 요청 폴더에 README가 없음
- `empty-evidence`: evidence 폴더는 있지만 파일이 없음
- `empty-outputs`: outputs 폴더는 있지만 파일이 없음
- `large-evidence`: evidence 크기가 기준값을 초과함

## Joi 표기 원칙

- 활성 운영 문서와 신규 작업에서는 `Joi` 단일 표기를 사용한다.
- 과거 evidence에 남은 병기 표기는 스냅샷 성격이면 보존할 수 있다.
- 과거 작업 README나 업무 로그처럼 텍스트 기록의 의미가 바뀌지 않는 경우에는 `Joi`로 정규화할 수 있다.

## 금지와 승인 기준

다음 작업은 사용자의 명시 승인 또는 Human Conductor 승격 후 진행한다.

- 기존 사용자 파일 삭제
- 대량 이름 변경
- `docs/opendataloader-extract/` 같은 원본/추출 보존 자료 이동
- `work-requests/`의 증거 파일 삭제
- 외부 저장소 업로드 또는 공개 배포
- 개인정보, 비밀키, 계좌 정보가 포함될 수 있는 파일 처리

## 유지보수 체크리스트

- 새 루트 폴더를 추가하면 `README.md`, `docs/README.md`, `docs/project-user-manual.html`에 반영했는가?
- 새 운영 문서를 추가하면 `docs/README.md`와 매뉴얼 주요 파일 링크에 연결했는가?
- 새 스크립트를 추가하면 `scripts/README.md`와 매뉴얼 운영 훅에 반영했는가?
- 브라우저 검증 결과를 남길 때 `.playwright-mcp/` 원본이 아니라 작업 요청 evidence를 참조했는가?
- 작업 완료 전 `scripts/validate-jarvis-request.ps1`로 게이트를 확인했는가?
