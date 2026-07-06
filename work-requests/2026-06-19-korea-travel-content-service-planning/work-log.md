# 업무 로그

## 메타데이터

- Task ID: `korea-travel-content-service-planning`
- Project: Jarvis
- Agent: Jarvis Team
- Role: 전략, 기획, IA, 기술 설계, 리스크 검토
- Started At: 2026-06-19
- Finished At: 2026-06-19
- Status: Done

## 입력

- 요청 요약: 유튜브 여행 프로그램 분석을 통한 외국인 대상 대한민국 여행정보 온라인 콘텐츠 서비스 전체 기획
- 참조 문서: `docs/README.md`, `templates/simple-start-request.md`, `skills/agent-team-orchestration/SKILL.md`, `skills/jarvis-design-review/SKILL.md`, `templates/ia-brief-template.md`
- 제약: MVP가 아닌 전체 서비스, 초기 한국어 콘텐츠, 추후 영어/일본어, 이미지 영역은 공통 배너 박스형 placeholder

## 실행

- 수행한 일:
  - Jarvis L2 + Design Review 트랙 선택
  - 작업 요청 시작 훅 실행
  - 유튜브 채널 공개 메타데이터 샘플링
  - 관광 시장 공개 자료 확인
  - Human Brief, 리서치, PRD, TRD, IA, User Flow, ERD, Design System, TASKS, AI 협업 가이드 작성
  - Risk Shield 검토 작성
  - 콘텐츠 관리 DB 효율화 전략 추가 작성
  - PRD, TRD, DB Design, TASKS, Risk Shield에 DB 운영 효율화 요구사항 반영
  - Trip Ontology Dashboard 기획안 추가 작성
  - PRD, TRD, IA, DB Design, TASKS, Risk Shield에 지식 그래프/온톨로지 운영 요구사항 반영
  - deliverables 폴더 최종 검토 수행
  - 온톨로지를 W0/W1 선행 트랙으로 재정렬하고 PRD, TRD, TASKS, User Flow, Design System, AI 협업 가이드를 보강
  - Supabase 프로젝트별 스키마 분리 운영 가이드 작성
  - TRD, DB Design, Content DB Strategy, TASKS, Coding Convention, Risk Shield에 `korea_travel_content` 전용 스키마와 RLS/Exposed schemas 기준 반영
- 사용한 도구:
  - PowerShell
  - `yt-dlp`
  - Web search/open
  - `apply_patch`
- 주요 판단:
  - 영상은 재사용 자산이 아니라 분석 출처로만 사용
  - 실제 이미지는 권리 확인 전 placeholder
  - 국적별 선호는 확정 사실이 아니라 추천 가설
  - 콘텐츠 DB는 정규화 원장과 JSONB staging, 검색 읽기 모델을 분리해 관리
  - 온톨로지 관계는 Relation Review 승인 전 공개 추천 근거로 사용하지 않음
  - 온톨로지 용어 사전과 관계 승인 기준을 먼저 확정한 뒤 CMS, 검색, 추천 구현으로 이어져야 함
  - Supabase 사용 시 `public` 대신 프로젝트 전용 schema를 사용하고, Data API expose와 RLS 정책을 같이 관리해야 함
- 우회 또는 피봇:
  - Codex Browser `iab`가 사용 불가해 대시보드 URL 보고 방식으로 대체

## 산출물

- 산출물: README와 8개 기본 기획 문서, 콘텐츠 DB 관리 전략, Trip Ontology Dashboard 기획안, 온톨로지 우선순위 최종 검토 문서, Supabase 스키마 분리 가이드, 리서치, 검증 문서
- 변경 파일: `work-requests/2026-06-19-korea-travel-content-service-planning/**`
- 검증 결과: `validate-jarvis-request.ps1` Pass

## 리스크

- 발견한 리스크:
  - 유튜브 썸네일/방송 이미지 저작권
  - 국적별 추천 고정관념
  - 실제 관광정보 최신성
  - 개인정보/예약/결제 확장 시 법무 검토 필요
  - 검색 인덱스 갱신 실패와 중복 병합 오판 가능성
  - AI 추출 온톨로지 관계 오류와 권리 리스크 영향 범위 누락 가능성
- 호출한 CC: Data, KITT/TRON, Diagnostic Agent
- 승격 여부: 외부 배포와 실제 이미지 사용 전 Human Conductor 승인 필요

## 다음

- 다음 액션:
  - 서비스명 확정
  - 초기 콘텐츠 50개 seed list 작성
  - 2025 외래관광객조사 PDF 상세 수치 추출
  - UI 와이어프레임 또는 정적 목업 착수
  - 콘텐츠 DB schema.sql 초안과 CMS 작업 큐 화면 설계
  - Trip Ontology 클래스/관계 사전과 그래프 projection 배치 설계
  - `relation-assertion-policy.md`와 `ontology-dashboard-wireframe.md` 작성
  - Supabase 실제 프로젝트에서 `korea_travel_content` 스키마 생성, Exposed schemas 등록, RLS 정책 작성
- 후속 담당자: Friday, Joi, TARS

## 2026-06-30 추가 검토: PC/MO 반응형 웹 최적화

- Status: Reviewed
- 실행 트랙: L1 표준
- 사용자 요청: `2026-06-19-korea-travel-content-service-planning` 폴더 내 작업 가능 여부와 PC/MO 최적화 검토
- 수행한 일:
  - 기존 요청 ID로 `start-jarvis-request.ps1`를 재실행해 진행 이벤트를 기록했다.
  - 작업 폴더 내 산출물과 실제 구현 파일 존재 여부를 확인했다.
  - PRD, TRD, IA, Design System, Coding Guide의 반응형 관련 기준을 점검했다.
  - `deliverables/13-responsive-pc-mo-review.md`에 PC/MO 작업 가능 여부, 보강 항목, 브레이크포인트, 화면별 최적화 방향, 검증 기준을 정리했다.
- 판단:
  - 작업 폴더 내 문서 보강과 정적 반응형 목업 생성은 즉시 가능하다.
  - 현재 폴더에는 실제 프론트엔드 앱 소스가 없으므로 구현형 PC/MO 최적화는 `web/` 정적 목업을 새로 만들거나 Next.js 앱 위치를 먼저 확정해야 한다.
- 제한:
  - 현재 세션에서 AI툴 in-app browser 목록이 비어 있어 대시보드 URL을 직접 열지는 못했다.
- 후속 담당자: Joi, TARS

## 2026-06-30 추가 구현: PC/MO 반응형 정적 목업

- Status: Done
- 실행 트랙: L1 표준
- 사용자 요청: 해당 PC/MO 최적화 건을 완료될 때까지 진행
- 수행한 일:
  - `web/responsive-prototype/` 하위에 정적 HTML/CSS/JS 목업을 생성했다.
  - 홈, 탐색 목록, 상세 화면을 구현했다.
  - 실제 이미지 대신 기존 권리 정책에 맞는 `이미지 준비중` 공통 배너 플레이스홀더를 적용했다.
  - 모바일 탐색 화면에는 필터 바텀시트를 적용했다.
  - 모바일 홈/상세에서 고정 액션바가 본문을 가리지 않도록 노출 범위를 조정했다.
  - Playwright와 로컬 Chrome으로 360, 390, 430, 768, 1024, 1280px 검증을 수행했다.
- 변경 파일:
  - `web/responsive-prototype/index.html`
  - `web/responsive-prototype/styles.css`
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/README.md`
  - `verification/responsive-verification.md`
  - `verification/responsive-screenshots/*`
- 검증 결과:
  - 홈/탐색/상세 모두 360~1280px에서 가로 스크롤 없음
  - 모바일 필터 바텀시트 열기/닫기 Pass
  - 상세 배너 모바일 최소 180px 이상 유지
  - 대표 PC/MO 스크린샷 육안 확인 완료
- 제한:
  - Admin/CMS와 Trip Ontology Dashboard 화면은 이번 목업 범위에 포함하지 않았다.
  - 실제 Next.js 앱 구현은 앱 위치와 라우팅 구조 확정 후 진행한다.
- 후속 담당자: Joi, TARS

## 2026-07-01 추가 구현: YouTube metadata DB refresh

- Status: Done
- 실행 트랙: L1 표준
- 사용자 요청: 유튜브 콘텐츠 메타데이터가 제대로 추출/반영되지 않았고 콘텐츠 품질과 수량이 부족하므로 메타 검색 추출, DB 작업, UI 반영 필요
- 수행한 일:
  - `python -m yt_dlp --flat-playlist --playlist-end 80 --dump-json`로 공식 채널 메타데이터 80건을 재추출했다.
  - `scripts/build-youtube-content-seed.py`를 추가해 raw JSONL을 정규화 seed DB로 변환했다.
  - `data/youtube-content-seed.json`, `data/youtube-content-seed.sql`, `web/responsive-prototype/data/content-seed.js`를 생성했다.
  - 목업 UI를 하드코딩 카드에서 seed DB 렌더링 구조로 변경했다.
  - 홈은 상위 6개, 탐색은 80개 전체, 상세는 선택 카드 기반 동적 갱신으로 반영했다.
  - YouTube 썸네일은 `reference-only`로만 보관하고 화면에는 placeholder를 유지했다.
- 변경 파일:
  - `research/youtube-metadata-raw.jsonl`
  - `research/youtube-metadata-summary.md`
  - `scripts/build-youtube-content-seed.py`
  - `data/youtube-content-seed.json`
  - `data/youtube-content-seed.sql`
  - `web/responsive-prototype/data/content-seed.js`
  - `web/responsive-prototype/index.html`
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`
  - `verification/youtube-db-refresh-verification.md`
  - `verification/youtube-db-refresh/*`
- 검증 결과:
  - 원천 영상 메타 80건 추출
  - 콘텐츠 후보 80건 정규화
  - 홈 카드 6건, 탐색 카드 80건 렌더링
  - 360, 390, 430, 768, 1024, 1280px 가로 스크롤 없음
  - 모바일 필터와 상세 동적 갱신 Pass
- 제한:
  - flat metadata 기반이라 실제 주소, 운영시간, 가격, 좌표는 아직 없다.
  - 후속으로 관광 데이터/API 또는 CMS 검수 데이터를 매칭해야 콘텐츠 원장 품질이 완성된다.

## 2026-07-01 추가 구현: 상태값 숫자 시각 처리

- Status: Done
- 실행 트랙: L0 경량
- 사용자 요청: 업데이트 중 상태값 `100%` 숫자를 더 시각적으로 처리 가능 여부 확인 및 반영
- 수행한 일:
  - 카드와 상세 화면의 품질 점수 표시를 원형 진행 링 기반 `quality-meter`로 교체했다.
  - 점수가 `100`인 경우 숫자 `100%` 대신 `완료` 라벨과 꽉 찬 링으로 표시되도록 처리했다.
  - 카드 상단 배지가 작은 화면에서 겹치지 않도록 줄바꿈을 허용했다.
- 변경 파일:
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`
- 검증 결과:
  - `node --check web/responsive-prototype/app.js` 통과
  - `score-badge`, `Q100` 직접 표시 제거 확인
- 제한:
  - 현재 세션에서 AI툴 in-app browser 목록이 비어 있어 대시보드 URL을 직접 열지는 못했다.

## 2026-07-01 추가 구현: 최신 YouTube 영상 근거 검색 보강

- Status: Done
- 실행 트랙: L0 경량
- 사용자 요청: 유튜브 최신 정보 업데이트 키워드 검색 시 최신 동영상 근거 콘텐츠도 결과에 나와야 하는지 확인 및 반영
- 수행한 일:
  - 검색 placeholder를 최신 영상 근거 탐색 의도에 맞게 조정했다.
  - 탐색 정렬의 `최신 검수순`을 `최신 영상 근거순`으로 바꾸고 실제 정렬 이벤트를 연결했다.
  - 검색 대상에 콘텐츠 태그뿐 아니라 원천 영상 제목, raw title, 채널, source URL, 최신/업데이트/동영상 계열 키워드를 포함했다.
  - `최신`/`업데이트`/`동영상` 키워드 검색 시 원천 영상 최신 순번을 우선 반영하도록 처리했다.
  - 결과 카드마다 `최신 영상 근거` 블록을 추가해 원천 영상 제목, 채널, 순번, 에피소드, 재생 시간, 링크 전용 정책, 원본 영상 링크를 표시했다.
  - 검색 결과 0건일 때 이전 결과가 남지 않도록 빈 상태를 추가했다.
- 변경 파일:
  - `web/responsive-prototype/index.html`
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`
  - `README.md`
  - `verification/evidence-manifest.md`
  - `verification/latest-youtube-search-verification.md`
- 검증 결과:
  - `node --check web/responsive-prototype/app.js` 통과
  - `최신 정보 업데이트` 검색 데이터 검증: 80건, top `sourceRank=1`
  - `한우 최신` 검색 데이터 검증: 1건, top `sourceRank=1`
- 제한:
  - 현재 세션에서 AI툴 in-app browser 목록이 비어 있어 전용 in-app browser 화면 검증은 수행하지 못했다.
  - 실제 장소 운영 정보의 최신성은 flat metadata만으로 확정할 수 없어 후속 관광 데이터/CMS 검수 매칭이 필요하다.

## 2026-07-01 추가 구현: 검색 관측 입구 보강

- Status: Done
- 실행 트랙: L1 표준
- 사용자 요청: `애정결핍` 키워드 입력 시 5일 전 동영상 정보가 존재하는데 근거 콘텐츠 및 관측 입구 등 관련 정보가 없다는 문제 제기
- 수행한 일:
  - YouTube 검색에서 `애정결핍` 관련 원천 영상이 관측됨을 확인했다.
  - 콘텐츠 후보 DB와 별도로 `queryObservations` seed를 추가했다.
  - `애정결핍` 관측값 1개, 관측 영상 3건을 `link-only` 정책으로 저장했다.
  - 검색 결과가 0건이어도 관측값이 있으면 `관측 입구` 카드가 표시되도록 `app.js`를 보강했다.
  - 관측 카드에 검색 원본, 원본 영상 링크, 채널, 재생 시간, 검토 상태, 콘텐츠화 검토 버튼을 표시했다.
  - SQL seed에 `youtube_query_observations` 테이블 초안을 추가했다.
- 변경 파일:
  - `scripts/build-youtube-content-seed.py`
  - `data/youtube-content-seed.json`
  - `data/youtube-content-seed.sql`
  - `research/youtube-metadata-summary.md`
  - `web/responsive-prototype/data/content-seed.js`
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`
  - `web/responsive-prototype/README.md`
  - `README.md`
  - `verification/evidence-manifest.md`
  - `verification/search-observation-entry-verification.md`
- 검증 결과:
  - `node --check web/responsive-prototype/app.js` 통과
  - `애정결핍` 검색 데이터 검증: 콘텐츠 후보 0건, 관측 입구 1개, 관측 영상 3건
- 제한:
  - YouTube 검색 결과의 업로드일은 `yt-dlp` flat/search 메타에서 `NA`로 반환되어, 화면에는 업로드일을 확정 노출하지 않았다.
  - `애정결핍`은 여행 콘텐츠 도메인 적합성이 확정되지 않은 관측 후보이므로 CMS/운영자 검토가 필요하다.

## 2026-07-01 추가 구현: 미등록 최신 검색어 관측 요청 fallback

- Status: Done
- 실행 트랙: L0 경량
- 사용자 요청: 다른 최신 영상도 반영되는지 확인
- 수행한 일:
  - 등록된 `queryObservations`가 없는 검색어도 빈 결과로 끝나지 않도록 `관측 요청` 카드를 추가했다.
  - 관측 요청 카드에 YouTube 최신 검색 원본 링크, `needs-source-refresh` 상태, refresh/API 연동 필요 문구를 표시했다.
  - favicon 404 콘솔 오류를 제거하기 위해 inline SVG favicon을 추가했다.
- 변경 파일:
  - `web/responsive-prototype/index.html`
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`
  - `README.md`
  - `verification/evidence-manifest.md`
  - `verification/search-observation-entry-verification.md`
- 검증 결과:
  - `node --check web/responsive-prototype/app.js` 통과
  - 브라우저 검증: `애정결핍`은 관측 영상 3개, `완전새키워드`는 관측 요청 1개 표시
  - 로컬 정적 서버 재접속 시 favicon 404 없음
- 제한:
  - 정적 목업은 임의 검색어의 YouTube 최신 영상을 실시간으로 가져오지 않는다.
  - 실제 자동 반영은 후속으로 YouTube Data API 또는 서버-side `yt-dlp` refresh job 연동이 필요하다.
