# 작업 로그

## 2026-05-28

- 신규 하위 프로젝트 `atlassian-knowledge-graph/` 생성
- 폴더 내 `.env` 생성 및 Atlassian API 환경변수 연동
- 대화에 노출된 토큰 원문은 저장하지 않음
- Python 표준 라이브러리 기반 백엔드 API 서버 구현
- Confluence Cloud REST API v2 클라이언트 구현
- SQLite 지식 그래프 저장소 구현
- 페이지/링크/헤딩/키워드/아이디어 파생 데이터 생성 구현
- HTML/CSS/JS 대시보드 구현
- 샘플 데이터 동기화 모드 구현
- unittest 기반 검증 추가

## 2026-05-28 추가 개선

- 두 루트 페이지만 보이는 문제를 보정하기 위해 하위 콘텐츠 수집 방식을 재설계
- `pages/{id}/descendants` 단독이 아니라 `direct-children` 기반 BFS 재귀 순회 적용
- `page`, `folder`, `database`, `whiteboard`, `embed` 타입을 하위 컨테이너로 연결
- 페이지 타입은 본문 조회, 컨테이너 타입은 그래프 노드와 부모 관계로 보존
- `CONFLUENCE_MAX_ITEMS` 환경변수 추가
- 샘플 데이터를 10개 콘텐츠와 130개 엣지로 확장
- 그래프를 정적 배치에서 force layout 기반 인터랙티브 Canvas로 변경
- 줌, 팬, 노드 드래그, 검색, 엣지 필터, 밀도 조절, 노드 상세 패널 추가

## 2026-05-28 접근성/온톨로지 개선

- `configs/ontology.v1.json` 추가
- `Risk`, `Metric`, `DataAsset`, `Process`, `TrainingModule`, `System`, `WorkIdea` 의미 클래스 추가
- `HAS_RISK`, `HAS_METRIC`, `USES_DATA`, `SUPPORTED_BY_SYSTEM`, `SUGGESTS_IDEA`, `REQUIRES_APPROVAL` 의미 관계 생성
- 그래프 API를 `overview`, `semantic`, `full` 모드로 분리
- 기본 그래프에서 키워드 노드를 숨기고 업무 의미 관계를 우선 표시
- `/api/hub` 추가
- 첫 화면에 실제 위키 미연동 경고, 바로 시작, 업무 아이디어, 리스크/주의, 지표/품질, 카테고리 트리 추가
- 근거 문장 추출을 문장 단위로 개선

## 보안 판단

- `.env`에 Atlassian 계정 이메일과 API 토큰을 적용했다.
- 계정 비밀번호는 저장하지 않았다.
- 대화에 토큰과 비밀번호가 노출됐으므로 검증 후 토큰 재발급과 비밀번호 변경을 권장한다.
- 앱 기본값은 `ALLOW_EXTERNAL_LLM=false`이며 외부 LLM 전송 코드는 구현하지 않았다.
- Confluence API는 읽기 전용 조회만 수행한다.

## 2026-05-28 실제 Atlassian 동기화

- Confluence API `descendant_depth` 제한에 맞춰 `CONFLUENCE_DESCENDANT_DEPTH=10`으로 보정
- API 연결 reset에 대비해 재시도 로직 추가
- 동기화 성공 시 기존 샘플 페이지를 삭제하고 실제 페이지 테이블로 교체하도록 수정
- 지정 루트 2개 기준 실제 접근 가능한 콘텐츠 동기화 성공
  - 콘텐츠: 76개
  - 페이지: 65개
  - 폴더: 11개
  - 업무 아이디어: 112개
  - 전체 관계: 1,227개
  - 누락 관계 엔드포인트: 0개
- 그래프 모드별 결과
  - `overview`: 76 nodes / 75 edges
  - `semantic`: 204 nodes / 369 edges
  - `full`: 849 nodes / 1,227 edges

## 2026-05-28 카드 대시보드 레이아웃 정리

- 대시보드 카드/패널 간격 기준을 CSS 변수로 통일
- 상단 상태 카드, 업무 탐색 허브, 카테고리 트리, 그래프 영역, 하단 카드 리스트의 섹션 간격을 정렬
- 상단 상태 카드와 하단 허브 카드의 4개 열 폭/좌표를 동일하게 맞춤
- 카드 내부 padding, 패널 헤더 높이, 리스트 여백을 동일한 기준으로 보정
- 데스크톱 기준 카드 gap 16px, 섹션 gap 18px 확인
- 모바일 기준 카드/섹션 gap 16px 확인
- 2048px 화면 기준 상단/하단 카드 x좌표, 폭, 오른쪽 경계 차이 0px 확인
- Playwright 렌더링 검증에서 콘솔 오류와 카드 텍스트 넘침 없음 확인
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/layout-desktop.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/layout-mobile.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/layout-card-columns-aligned.png`

## 2026-05-28 동기화 경고 빈 영역 제거

- 빈 노란 영역은 토큰 미설정/샘플 데이터 상태를 알리는 `syncWarning` 경고 영역이었다.
- 실제 동기화가 정상일 때는 숨겨져야 했지만 `.notice { display: flex; }`가 `hidden` 속성을 덮어 빈 박스가 표시됐다.
- `[hidden] { display: none !important; }` 규칙을 추가해 정상 상태에서는 완전히 제거되도록 수정
- 경고를 숨길 때 기존 메시지 HTML도 비우도록 보정
- Playwright 렌더링 검증:
  - `warningHidden=true`
  - `warningDisplay=none`
  - `warningHeight=0`
  - 콘솔 오류 0건
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/layout-sync-warning-hidden.png`

## 2026-05-28 사내망 배포

- 사내망 접근 URL을 `http://192.168.82.199:8822`로 구성
- `.env`의 `APP_HOST`를 `0.0.0.0`으로 변경하고 `APP_PUBLIC_BASE_URL` 추가
- 일반 사용자 배포 모드에서 `ENABLE_MANUAL_SYNC=false`, `ENABLE_SAMPLE_LOAD=false` 적용
- 서버 API에서 `POST /api/sync`, `POST /api/sample` 비활성화 처리
- 프론트엔드에서 동기화/샘플 버튼 숨김 처리
- 재시작용 `scripts/deploy-intranet.ps1` 추가
- `.env`, DB, 로그를 추적하지 않도록 `.gitignore` 추가
- 기존 `127.0.0.1:8822` 서버를 종료하고 `0.0.0.0:8822` 서버로 교체
- Windows 방화벽 인바운드 규칙 추가
  - 규칙명: `Atlassian Knowledge Graph Intranet 8822`
  - 프로필: Domain, Private
  - 포트: TCP 8822
  - 원격 주소: LocalSubnet
- 검증:
  - `http://192.168.82.199:8822/api/health`: 200
  - `http://192.168.82.199:8822`: 화면 렌더링 성공
  - `POST /api/sync`: 403
  - `POST /api/sample`: 403
  - UI 동기화/샘플 버튼 숨김
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/intranet-url-dashboard.png`

## 2026-05-28 회의록 학습카드 HTML 교육 페이지

- 실제 위키 동기화 데이터에서 회의록 페이지를 확인
  - `[메가존] 회의록`
  - `2026-01-28 회의록`
  - `2026-02-03 회의록`
  - `2026-02-05 회의록`
  - `2026-02-25 회의록`
  - `2026-03-03 회의록`
  - `2026-03-09 회의록`
- 신규 담당자가 회의록 기반으로 지식그래프 POC 흐름을 이해할 수 있는 로컬 HTML 교육 페이지 추가
  - `web/training/meeting-minutes.html`
- AI 교육 카드 첫 항목에 `회의록 기반 신규 담당자 학습카드` 추가
- 카드에서 로컬 학습 페이지 링크와 원본 위키 링크를 제공하도록 렌더링 개선
- 사내망 서버 재시작 후 검증
  - `/api/training` 첫 카드 ID: `training:meeting-minutes-onboarding`
  - 로컬 학습 페이지: `http://192.168.82.199:8822/training/meeting-minutes.html`
  - 학습 페이지 응답: 200
  - 타임라인 항목: 6개
  - 원본 위키 링크: 7개
  - 콘솔 오류 0건
  - 카드/학습 페이지 텍스트 넘침 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/training-card-meeting-minutes-link.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/meeting-minutes-training-page.png`

## 2026-05-28 학습 매뉴얼 순수 매뉴얼형 수정

- 학습 페이지를 회의 기록 열람 페이지가 아니라 신규 담당자용 순수 학습 매뉴얼로 재구성
- 기존 로컬 페이지 경로를 `web/training/kg-poc-manual.html`로 변경
- 카드 제목을 `지식그래프 학습 매뉴얼`로 변경
- `학습 페이지 열기` 링크에 `target="_blank"`와 `rel="noreferrer"` 적용
- 매뉴얼 페이지에서 날짜 타임라인 UI 제거
- 매뉴얼 페이지의 표시 문구에서 `회의록`, `타임라인`, 날짜 표현 제거
- 원천 자료 링크 텍스트를 `원천 자료 A~G`로 단순화
- 사내망 서버 재시작 후 검증
  - 매뉴얼 페이지 응답: 200
  - 카드 로컬 링크: `/training/kg-poc-manual.html`
  - 카드 링크 target: `_blank`
  - 매뉴얼 단계 카드: 6개
  - 원천 자료 링크: 7개
  - 날짜/타임라인 UI: 0개
  - 금지 표현 노출: 0개
  - 콘솔 오류: 0건
  - 텍스트 넘침: 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/training-card-manual-newtab.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/kg-poc-manual-page.png`

## 2026-05-28 일반 사용자 질문형 검색 UX 개선

- 우선순위 작업으로 일반 사용자가 그래프를 먼저 해석하지 않아도 질문으로 진입할 수 있는 검색 영역 추가
- 백엔드에 `GET /api/search?q=...` 추가
  - 위키 페이지 본문/헤딩/제목 기반 근거 문서 랭킹
  - 관련 개념 노드, 업무 아이디어, 로컬 학습 매뉴얼을 함께 반환
  - 외부 LLM 전송 없이 SQLite에 저장된 내부 데이터만 사용
- 프론트엔드 상단에 `Knowledge Assistant` 검색 섹션 추가
  - 추천 질문 버튼
  - 요약 답변
  - 관련 학습 매뉴얼
  - 근거 문서
  - 업무 아이디어
- 하단 교육/아이디어 카드의 긴 시스템 식별자 문자열이 모바일에서 넘치지 않도록 줄바꿈 보정
- 사내망 서버 재시작 후 검증
  - 내부 URL: `http://192.168.82.199:8822`
  - `/api/search?q=Neptune`: 200
  - 검색 결과 근거 문서: 6건
  - 학습 매뉴얼 링크: `/training/kg-poc-manual.html`
  - 학습 매뉴얼 링크 target: `_blank`
  - 추천 질문: 5개
  - 데스크톱/모바일 텍스트 넘침: 0건
  - 콘솔 오류: 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/user-search-home.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/user-search-results.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/user-search-desktop-final.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/user-search-mobile-final.png`

## 2026-05-28 업무 아이디어 중복 영역 정리

- 사용자 피드백에 따라 상단 허브와 하단 상세 카드에 `업무 아이디어`가 중복 노출되던 구조를 정리
- 상단 허브 두 번째 카드를 `업무 아이디어`에서 `핵심 개념`으로 변경
- 백엔드 `/api/hub`에 `topConcepts` 추가
  - 의미 그래프의 개념 노드 중 `Risk`, `Metric`, `WorkIdea`를 제외
  - 연결 수가 높은 개념을 우선 표시
- 하단 `업무 아이디어`는 상세 목록 역할로 유지
- 사내망/로컬 서버 재시작 후 검증
  - 상단 허브 제목: `바로 시작`, `핵심 개념`, `리스크/주의`, `지표/품질`
  - 하단 상세 제목: `AI 교육 카드`, `업무 아이디어`
  - `#hubIdeas` 제거 확인
  - `#hubConcepts` 카드 6개 노출 확인
  - 데스크톱/모바일 텍스트 넘침: 0건
  - 콘솔 오류: 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/hub-ideas-dedup-desktop.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/hub-ideas-dedup-mobile.png`

## 2026-05-28 연결 컨텐츠 기준 타이틀 수정

- 대시보드가 Atlassian/Confluence 전체 컨텐츠 지식그래프로 오해되지 않도록 상단 타이틀 범위 수정
- 변경 전:
  - `Confluence Knowledge Graph`
  - `Atlassian Knowledge Graph`
- 변경 후:
  - 브라우저 title: `연결 위키 컨텐츠 지식그래프`
  - 상단 보조 타이틀: `Connected Wiki Content`
  - 상단 메인 타이틀: `연결 위키 컨텐츠 지식그래프`
- 검증:
  - 로컬 HTML 응답에서 신규 타이틀 확인
  - 화면 렌더링 기준 기존 문구 노출 0건
  - 콘솔 오류 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/title-connected-content.png`

## 2026-05-28 신뢰도/커버리지/자동갱신/사용 가이드 개선

- 검색 결과 신뢰도 개선
  - `/api/search` 근거 문서에 `confidenceScore`, `confidenceLabelKo`, `matchReasons` 추가
  - 답변 요약에 상위 근거 기반 신뢰도 표시 추가
  - 근거 문서 카드에 제목/헤딩/본문/원본 링크 매칭 근거 노출
- 콘텐츠 커버리지 리포트 추가
  - 신규 API: `GET /api/coverage`
  - 루트 페이지 반영 수, 수집 콘텐츠 수, 본문 커버리지, 관계 무결성, 의미 그래프 규모, 업무 아이디어 수 표시
  - 루트별 하위 콘텐츠 수와 품질 체크 상태 표시
- 자동 갱신/스케줄링 기반 추가
  - 신규 API: `GET /api/scheduler`
  - `.env` 설정값 `AUTO_SYNC_ENABLED`, `AUTO_SYNC_INTERVAL_MINUTES` 추가
  - 기본 안전값은 비활성화이며, 활성화 시 서버 실행 중 읽기 전용 Atlassian 동기화를 주기적으로 예약
- 임직원용 사용 가이드 강화
  - 처음 온 담당자, 기획/업무 담당자, 데이터/검색 담당자, 개발/운영 담당자별 시작 카드 추가
  - 각 카드 버튼이 역할별 추천 질문을 검색창에 연결
- 검증:
  - `/api/search?q=Neptune`: 200, 첫 근거 신뢰도 `높음`
  - `/api/coverage`: 200, 페이지 76개, 루트 2개 반영, 누락 관계 엔드포인트 0개
  - `/api/scheduler`: 200, 기본 상태 `disabled`, 간격 360분
  - 데스크톱/모바일 사용 가이드 카드 4개
  - 데스크톱/모바일 커버리지 지표 6개, 품질 체크 4개
  - 데스크톱/모바일 텍스트 넘침 0건
  - 콘솔 오류 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/confidence-coverage-guide-desktop.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/confidence-coverage-guide-mobile.png`

## 2026-05-28 버튼 없는 동적 지식그래프 처리

- 별도 수동 동기화 버튼 없이 지식그래프가 자동 상태를 보여주도록 동적 갱신 흐름 적용
- `.env` 공개 설정값 적용
  - `AUTO_SYNC_ENABLED=true`
  - `AUTO_SYNC_INTERVAL_MINUTES=360`
  - `AUTO_SYNC_RUN_ON_STARTUP=true`
- 서버 스케줄러 개선
  - 서버 시작 직후 백그라운드 읽기 전용 Atlassian 동기화 실행
  - 이후 360분 주기로 자동 갱신 예약
  - `/api/health`, `/api/scheduler`에 시작 시 실행 여부와 동적 모드 상태 노출
- 프론트엔드 개선
  - 수동 동기화/샘플 버튼은 운영 설정 기준으로 숨김 유지
  - 상단에 펄스형 `Dynamic Graph` 상태 스트립 추가
  - 마지막 반영 시각, 다음 갱신 시각, 화면 자동 확인 주기 표시
  - 화면이 30초마다 `/api/health`, `/api/scheduler`를 확인하고 새 동기화 이력이 감지되면 그래프/카드/커버리지 데이터를 자동 재로딩
- 검증:
  - 서버 재시작 후 `/api/scheduler`: `enabled=true`, `runOnStartup=true`, `status=waiting`
  - 시작 시 자동 동기화 완료: `Atlassian API 동기화 완료`, 페이지 76개
  - 수동 버튼 숨김: `#sampleBtn.hidden=true`, `#syncBtn.hidden=true`
  - 동적 상태 표시: `최신 위키 컨텐츠 기준으로 반영 완료 · 360분 주기`
  - 그래프 캔버스 렌더링: nonblank pixel 샘플 31398
  - 데스크톱/모바일 텍스트 넘침: 0건
  - 콘솔 오류: 0건
  - 단위 테스트 7개 통과
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/dynamic-graph-live-desktop.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/dynamic-graph-live-mobile.png`

## 2026-05-28 수동 위키 업데이트 방식 복원

- 사용자 피드백에 따라 `Dynamic Graph` 라이브 상태 영역은 화면에서 숨기고 자동 갱신 기능을 비활성화
- 운영 방식 변경
  - 상단 버튼 텍스트를 `위키 업데이트`로 변경
  - 버튼 클릭 시 `POST /api/sync`를 호출해 Atlassian 읽기 전용 동기화 실행
  - 동기화 완료 후 대시보드 데이터를 다시 불러오도록 유지
- `.env` 공개 설정값 변경
  - `ENABLE_MANUAL_SYNC=true`
  - `ENABLE_SAMPLE_LOAD=false`
  - `AUTO_SYNC_ENABLED=false`
  - `AUTO_SYNC_RUN_ON_STARTUP=false`
- 프론트엔드 변경
  - `Dynamic Graph` 섹션 `hidden`, `aria-hidden=true` 처리
  - 30초 자동 폴링 시작 호출 제거
  - 커버리지 패널 상태 문구를 자동 갱신 비활성화 대신 `수동 업데이트 방식`으로 표시
  - 업데이트 중 버튼 문구를 `업데이트 중`으로 전환
- 검증:
  - 단위 테스트 7개 통과
  - 서버 재시작 후 `/api/health`: `manualSyncEnabled=true`, `autoSyncEnabled=false`, `autoSyncRunOnStartup=false`
  - `/api/scheduler`: `enabled=false`, `status=disabled`, `mode=manual`, `runOnStartup=false`, `autoReloadHint=false`
  - `위키 업데이트` 버튼 노출 확인
  - 버튼 클릭 시 `/api/sync`: 200, `Atlassian API 동기화 완료`, 페이지 76개
  - 업데이트 중 버튼 문구: `업데이트 중`
  - `Dynamic Graph` 화면 노출: 0건
  - 샘플 버튼 숨김 유지
  - 데스크톱/모바일 텍스트 넘침: 0건
  - 콘솔 오류: 0건
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/manual-wiki-update-button-desktop.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/manual-wiki-update-button-mobile.png`

## 2026-05-28 사내망 URL 위키 업데이트 버튼 비활성화

- 사내망 URL `http://192.168.82.199:8822/`로 접속한 일반 사용자가 `위키 업데이트`를 실행하지 못하도록 제한
- `.env` 공개 설정값 추가
  - `MANUAL_SYNC_ALLOWED_HOSTS=localhost,127.0.0.1,::1`
- 백엔드 변경
  - 요청 `Host` 헤더 기준으로 수동 동기화 허용 여부 판단
  - 허용되지 않은 접속 URL에서 `POST /api/sync` 호출 시 403 반환
  - `/api/health`에 `manualSyncAllowed`, `manualSyncAllowedHosts` 노출
- 프론트엔드 변경
  - `manualSyncEnabled=true`여도 `manualSyncAllowed=false`이면 버튼은 노출하되 disabled 처리
  - 비활성 버튼 title: `위키 업데이트는 로컬 관리자 접속에서만 사용할 수 있습니다.`
- 검증:
  - 단위 테스트 7개 통과
  - 로컬 관리자 URL `/api/health`: `manualSyncAllowed=true`
  - 사내망 URL `/api/health`: `manualSyncAllowed=false`
  - 사내망 URL `POST /api/sync`: 403
  - 사내망 화면 `위키 업데이트` 버튼: 노출, disabled=true
  - 로컬 화면 `위키 업데이트` 버튼: 노출, disabled=false
  - `Dynamic Graph` 화면 노출: 0건
  - 데스크톱 텍스트 넘침: 0건
  - 콘솔 오류: 0건
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/wiki-update-internal-access-state.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/wiki-update-local-access-state.png`

## 2026-05-28 사내망 URL 위키 업데이트 버튼 숨김 처리

- 사용자 요청에 따라 사내망 URL `http://192.168.82.199:8822/` 접속 시 `위키 업데이트` 버튼을 비활성화 표시가 아니라 숨김 처리로 변경
- 백엔드 Host 제한은 유지
  - 사내망 URL `POST /api/sync`: 403 유지
  - 로컬 관리자 URL은 수동 업데이트 가능
- 프론트엔드 변경
  - `manualSyncEnabled=false` 또는 `manualSyncAllowed=false`이면 `#syncBtn.hidden=true`
  - 허용된 로컬 관리자 접속에서는 `#syncBtn.hidden=false`
- 검증:
  - 단위 테스트 7개 통과
  - 서버 재시작 후 사내망 URL `/api/health`: `manualSyncAllowed=false`
  - 서버 재시작 후 로컬 URL `/api/health`: `manualSyncAllowed=true`
  - 사내망 URL `POST /api/sync`: 403 유지
  - 사내망 화면 `#syncBtn.hidden=true`, 레이아웃 노출 false
  - 로컬 화면 `#syncBtn.hidden=false`, 레이아웃 노출 true
  - 샘플 버튼 숨김 유지
  - `Dynamic Graph` 화면 노출: 0건
  - 데스크톱 텍스트 넘침: 0건
  - 콘솔 오류: 0건
- 검증 스크린샷:
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/wiki-update-internal-hidden.png`
  - `work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/wiki-update-local-visible.png`
