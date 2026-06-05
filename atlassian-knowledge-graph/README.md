# 연결 위키 컨텐츠 지식그래프

지정된 Confluence 위키 페이지와 하위 콘텐츠를 수집해 로컬 지식 그래프, AI 교육 카드, 실무 업무 아이디어 대시보드로 보여주는 풀스택 앱입니다.

## 현재 구현 범위

- 폴더 내 `.env` 기반 Atlassian API 설정
- Confluence Cloud REST API v2 연동
- 루트 페이지 하위 콘텐츠 재귀 탐색
- Page, Folder, Database, Whiteboard, Embed 하위 컨테이너 연결
- 페이지 본문 저장 및 텍스트/링크/헤딩/키워드 추출
- SQLite 로컬 그래프 저장소
- 백엔드 API 서버
- 줌/팬/드래그/검색/밀도 조절 가능한 인터랙티브 그래프 대시보드
- 버튼 클릭으로 실행하는 수동 위키 업데이트
- 임직원용 업무 탐색 허브
- 온톨로지 v1 기반 의미 노드/관계 추출
- `overview`, `semantic`, `full` 그래프 모드
- 샘플 데이터 로드 모드
- 단위 테스트

## 폴더 구조

```text
atlassian-knowledge-graph/
  atlassian_kg/      # Python 백엔드 패키지
  web/               # 대시보드 프론트엔드
  data/              # SQLite DB와 샘플 데이터
  docs/              # 작업 기록과 운영 문서
  configs/           # 온톨로지 정의
  tests/             # 단위 테스트
  .env               # 로컬 환경변수
  env.template       # 비밀값 없는 환경변수 템플릿
  pyproject.toml
```

## 보안 먼저

대화에 노출된 Atlassian 토큰은 파일에 저장하지 않았습니다. 반드시 Atlassian에서 해당 토큰을 폐기하고 새 토큰을 발급한 뒤, 새 값만 `.env`의 `ATLASSIAN_API_TOKEN`에 입력하세요.

`.env`는 이 하위 프로젝트 실행을 위해 생성되어 있지만, 저장소에 공개하거나 공유하면 안 됩니다.

## 실행

이 폴더에서 실행합니다.

```powershell
python -m unittest discover -s tests -v
python -m atlassian_kg.cli init-db
python -m atlassian_kg.cli sync
python -m atlassian_kg.cli serve --port 8822
```

브라우저:

```text
http://127.0.0.1:8822
```

토큰 없이 화면과 그래프를 먼저 확인하려면 샘플 데이터를 넣습니다. 샘플 데이터는 두 루트 아래의 페이지, 폴더, 데이터베이스형 하위 카테고리까지 포함합니다.

```powershell
python -m atlassian_kg.cli sync --sample
python -m atlassian_kg.cli serve --port 8822
```

## API

- `GET /api/health`: 앱 상태와 설정 점검
- `GET /api/pages`: 수집된 페이지 목록
- `GET /api/graph`: 그래프 노드/엣지
- `GET /api/graph?mode=overview`: 문서 구조 중심 그래프
- `GET /api/graph?mode=semantic`: 업무 의미 중심 그래프
- `GET /api/graph?mode=full`: 키워드 포함 전체 그래프
- `GET /api/hub`: 임직원용 업무 탐색 허브 데이터
- `GET /api/search?q=...`: 질문형 검색 답변, 근거 문서, 관련 매뉴얼, 업무 아이디어
- `GET /api/coverage`: 루트/본문/관계/동기화 커버리지 리포트
- `GET /api/scheduler`: 자동 갱신 스케줄 상태
- `GET /api/training`: AI 교육 카드
- `GET /api/ideas`: 업무 아이디어 카드
- `POST /api/sync`: 실제 Atlassian API 동기화
- `POST /api/sample`: 샘플 데이터 로드

운영 기본값은 수동 업데이트 방식입니다. 로컬 관리자 접속(`localhost`, `127.0.0.1`)에서 상단 `위키 업데이트` 버튼을 누르면 읽기 전용 Atlassian 동기화를 실행하고, 완료 후 그래프와 카드 데이터를 다시 불러옵니다. 사내망 URL로 접속한 일반 사용자는 버튼이 비활성화되며, 직접 API 호출도 차단됩니다. 자동 갱신은 숨김/비활성화 상태로 둡니다.

```dotenv
ENABLE_MANUAL_SYNC=true
MANUAL_SYNC_ALLOWED_HOSTS=localhost,127.0.0.1,::1
AUTO_SYNC_ENABLED=false
AUTO_SYNC_INTERVAL_MINUTES=360
AUTO_SYNC_RUN_ON_STARTUP=false
```

## 데이터 모델

- `pages`: Confluence 페이지 본문, 버전, 부모 관계
- `pages.type`: `page`, `folder`, `database`, `whiteboard`, `embed`
- `edges`: 페이지-페이지, 페이지-개념 관계
- `concepts`: 키워드/개념 후보
- `ideas`: 실무 업무 아이디어 후보
- `sync_runs`: 동기화 이력

온톨로지 v1은 `configs/ontology.v1.json`에 있다. 기본 의미 클래스는 `Process`, `DataAsset`, `System`, `Metric`, `Risk`, `TrainingModule`, `WorkIdea`다.

모든 파생 데이터는 출처 페이지 ID와 근거 문장을 유지합니다.

## 운영 원칙

- 기본은 로컬 전용입니다.
- 외부 LLM 전송은 `.env`의 `ALLOW_EXTERNAL_LLM=false`가 기본값입니다.
- Confluence 문서를 수정하지 않습니다. 읽기 전용 API만 사용합니다.
- 내부 위키 원문은 승인 없이 외부로 전송하지 않습니다.

## 하위 콘텐츠 수집 방식

실제 Atlassian 동기화는 각 루트 페이지를 가져온 뒤 다음 순서로 진행합니다.

1. `pages/{id}/direct-children`으로 직접 하위 콘텐츠를 조회합니다.
2. 하위 콘텐츠가 `page`, `folder`, `database`, `whiteboard`, `embed`이면 해당 타입의 `direct-children`을 다시 조회합니다.
3. `page` 타입은 본문까지 조회하고, 컨테이너 타입은 그래프 노드와 부모 관계로 보존합니다.
4. `pages/{id}/descendants` 결과를 보조로 합쳐 직접 재귀에서 누락된 콘텐츠를 추가합니다.
5. `CONFLUENCE_MAX_ITEMS`를 넘기기 전까지 두 루트 아래 전체 콘텐츠를 순회합니다.
