# 외국인 대상 대한민국 여행정보 콘텐츠 서비스 기획

- requestId: `korea-travel-content-service-planning`
- 작성일: 2026-06-19
- 실행 트랙: L2 풀 + Jarvis Design Review Mode
- 대시보드: http://127.0.0.1:8787/dashboards/agent-assignment-dashboard.html
- 상태: 기획 초안 작성 완료, 사용자 검토 필요

## 요청 요약

`어서와 한국은 처음이지` 유튜브 채널과 외국인 방한 관광 수요를 참고해, 외국인이 한국 여행 정보를 수집할 수 있는 온라인 콘텐츠 서비스를 전체 서비스 관점에서 기획한다. 초기 콘텐츠 언어는 한국어이며, 이후 영어와 일본어 확장을 고려한다. 여행정보 특성상 시각 영역이 필요한 곳은 실제 이미지 대신 공통 배너 박스형 플레이스홀더로 표기한다.

## Agent Assignment Preview

요청: 유튜브 여행 프로그램 분석 기반 외국인 대상 대한민국 여행정보 온라인 콘텐츠 전체 서비스 기획  
To: Jarvis, Friday, Joi, TARS  
CC: EVE, Data, C3PO, KITT/TRON, Diagnostic Agent  
Risk: Medium  
Expected Outputs: Human Brief, 리서치 메모, PRD, TRD, IA, User Flow, ERD, Design System, TASKS, AI 협업 가이드, Risk Shield  
다음 액션: 사용자 검토 후 서비스명, 우선 언어, 지도/예약 연동 범위 확정

## 산출물

| 파일 | 목적 |
| --- | --- |
| `human-brief.md` | 사용자 원문 기반 Human Brief 초안 |
| `research/youtube-content-analysis.md` | 유튜브 콘텐츠 패턴 분석과 여행 분류 체계 |
| `research/tourism-market-notes.md` | 외국인 방한 관광 수요 근거 |
| `deliverables/00-decision-log.md` | 핵심 의사결정과 보류 항목 |
| `deliverables/01-prd.md` | 제품 요구사항 문서 |
| `deliverables/02-trd.md` | 기술 요구사항과 아키텍처 |
| `deliverables/03-ia-brief.md` | 정보설계, 사이트맵, 내비게이션 |
| `deliverables/04-user-flow.md` | 주요 사용자 흐름 |
| `deliverables/05-database-design.md` | 데이터 모델과 ERD |
| `deliverables/06-design-system.md` | 디자인 시스템과 이미지 플레이스홀더 규칙 |
| `deliverables/07-tasks.md` | 실행 태스크 |
| `deliverables/08-coding-convention-ai-guide.md` | 개발 컨벤션과 AI 협업 가이드 |
| `deliverables/09-content-db-management-strategy.md` | 콘텐츠 관리 DB 효율화 전략 |
| `deliverables/10-trip-ontology-dashboard-plan.md` | 콘텐츠 지식 그래프 온톨로지 기반 Trip Ontology Dashboard 기획안 |
| `deliverables/11-final-review-ontology-priority.md` | 산출물 최종 검토와 온톨로지 우선순위 재정렬 결과 |
| `deliverables/12-supabase-schema-separation-guide.md` | Supabase 프로젝트별 스키마 분리와 개발자 연동 가이드 |
| `deliverables/13-responsive-pc-mo-review.md` | PC/MO 반응형 웹 최적화 가능성 검토와 보강 기준 |
| `data/youtube-content-seed.json` | YouTube 메타데이터 기반 정규화 콘텐츠 seed DB |
| `data/youtube-content-seed.sql` | Supabase/PostgreSQL 반영용 seed SQL 초안 |
| `research/youtube-metadata-raw.jsonl` | YouTube 채널 flat metadata 80건 원천 추출물 |
| `research/youtube-metadata-summary.md` | 메타데이터 추출/정규화 요약 |
| `web/responsive-prototype/` | 홈, 탐색, 상세 PC/MO 반응형 정적 목업 |
| `verification/responsive-verification.md` | 반응형 목업 viewport 검증 결과 |
| `verification/youtube-db-refresh-verification.md` | YouTube metadata DB refresh 및 UI 반영 검증 |
| `verification/latest-youtube-search-verification.md` | 최신 YouTube 영상 근거 검색 보강 검증 |
| `verification/search-observation-entry-verification.md` | 콘텐츠 후보 미매칭 키워드의 YouTube 검색 관측 입구 검증 |
| `verification/risk-shield-review.md` | 법무, 저작권, 개인정보 리스크 검토 |
| `verification/evidence-manifest.md` | 실행 근거와 검증 기록 |
| `work-log.md` | 업무 로그 |
| `episodic-memory.md` | 에피소딕 메모리 |

## 적용한 에이전트 역할

- Jarvis: 전략, 범위, Decision Log
- Friday: 태스크 분해, Owner/CC 구조
- EVE: 유튜브/관광 시장 리서치
- Joi: IA, UX, 디자인 시스템
- TARS: TRD, 데이터 모델, 구현 가능성
- C3PO: 한국어 콘텐츠 라벨과 톤
- Data: 세그먼트, KPI, 데이터 근거 검토
- KITT/TRON: 저작권, 개인정보, 외부 공개 리스크
- Diagnostic Agent: 과잉 확정과 근거 부족 점검

## 추가 업데이트

- 2026-06-19: 콘텐츠 관리 DB 효율화 방안을 반영했다. 정규화 원장, JSONB staging, 검색 읽기 모델, CMS 작업 큐, 중복 방지 canonical key, 품질 점수, 권리/검수 상태 머신을 추가했다.
- 2026-06-19: 콘텐츠 지식 그래프/온톨로지 기반 `trip_ontology_dashboard` 기획안을 추가했다. Graph Explorer, Relation Review, Coverage, Risk & Rights, Query Lab과 온톨로지 클래스/관계/KPI를 반영했다.
- 2026-06-19: `deliverables/` 전체 최종 검토를 수행하고 온톨로지를 W0/W1 선행 트랙으로 재정렬했다. PRD, TRD, TASKS, User Flow, Design System, AI 협업 가이드에 Ontology First 기준을 반영했다.
- 2026-06-19: Supabase 프로젝트별 스키마 분리 구조를 반영했다. 권장 스키마명 `korea_travel_content`, Data API Exposed schemas 등록, RLS, 개발자 `db.schema` 연동 규칙을 추가했다.
- 2026-06-30: 기존 폴더 내 PC/MO 반응형 웹 최적화 가능성을 검토했다. 현재는 기획 문서 중심이라 문서 보강과 정적 목업은 즉시 가능하고, 실제 앱 구현은 프론트엔드 위치 확정 후 진행하는 것으로 정리했다.
- 2026-06-30: `web/responsive-prototype/`에 홈, 탐색, 상세 공개 웹 정적 목업을 구현했다. 360, 390, 430, 768, 1024, 1280px에서 가로 스크롤과 모바일 필터 동작을 검증했다.
- 2026-07-01: YouTube 공식 채널 flat metadata 80건을 재추출하고 정규화 seed DB(JSON/SQL)를 생성했다. 목업은 `web/responsive-prototype/data/content-seed.js`를 통해 홈 6개, 탐색 80개, 상세 동적 갱신 구조로 반영했다.
- 2026-07-01: 키워드 검색 결과에 `최신 영상 근거` 블록을 추가하고, `최신 정보 업데이트` 계열 검색어와 `최신 영상 근거순` 정렬이 원천 영상 최신 순번을 우선 반영하도록 보강했다.
- 2026-07-01: `애정결핍`처럼 콘텐츠 후보에는 없지만 YouTube 최신 검색 관측값이 있는 키워드를 위해 `queryObservations` seed와 `관측 입구` 카드를 추가했다.
- 2026-07-01: 아직 `queryObservations`에 없는 다른 최신 검색어는 실시간 자동 수집으로 확정 노출하지 않고, `관측 요청` 카드와 YouTube 검색 원본 링크로 refresh/API 연동 대상을 표시하도록 했다.

## 주요 출처

- YouTube 공식 채널: https://www.youtube.com/@hello1stkorea/videos
- MBC PLUS 프로그램 상세: https://www.mbcplus.com/web/program/contentList.do?programInfoSeq=62
- 대한민국 구석구석 여행기사: https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=77125d3c-a380-475f-a42a-d625c05164fe
- 한국관광 데이터랩: https://datalab.visitkorea.or.kr/datalab/portal/nat/getForTourForm.do
- 관광지식정보시스템 외래관광객조사 보고서 목록: https://know.tour.go.kr/stat/fReportsOfForeignerDis19Re.do
- 한국문화관광연구원 2024 외래관광객조사 주요 결과: https://www.kcti.re.kr/web/board/boardContentsView.do?LISTOP=&board_id=14&contents_id=969e40a59b534173bb2911c714ae929d&email=&emailAes=&miv_pageNo=&miv_pageSize=&mode=W&searchkey=ALL&searchtxt=&secretBoard_yn=&titname=&total_cnt=

## 검증

- `yt-dlp --flat-playlist --playlist-end 40 --print ... https://www.youtube.com/@hello1stkorea/videos`
- `python -m yt_dlp --flat-playlist --playlist-end 80 --dump-json "https://www.youtube.com/@hello1stkorea/videos"`
- `python work-requests/2026-06-19-korea-travel-content-service-planning/scripts/build-youtube-content-seed.py`
- `powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId korea-travel-content-service-planning`
- `web/responsive-prototype/index.html`을 로컬 Chrome/Playwright로 열어 PC/MO viewport 검증
