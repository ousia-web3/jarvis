# Evidence Manifest

- Request ID: `korea-travel-content-service-planning`
- Date: 2026-06-19
- Owner: Friday

## 산출물

| 파일 | 목적 | Owner |
| --- | --- | --- |
| `human-brief.md` | 사용자 요청 정리 | Jarvis |
| `research/youtube-content-analysis.md` | 영상 콘텐츠 패턴 분석 | EVE |
| `research/tourism-market-notes.md` | 관광 시장 근거 | Data |
| `deliverables/01-prd.md` | 제품 요구사항 | Jarvis |
| `deliverables/02-trd.md` | 기술 요구사항 | TARS |
| `deliverables/03-ia-brief.md` | 정보설계 | Joi |
| `deliverables/04-user-flow.md` | 사용자 흐름 | Joi |
| `deliverables/05-database-design.md` | 데이터 모델 | TARS |
| `deliverables/06-design-system.md` | 디자인 시스템 | Joi |
| `deliverables/07-tasks.md` | 실행 태스크 | Friday |
| `deliverables/08-coding-convention-ai-guide.md` | 개발/AI 협업 기준 | TARS |
| `deliverables/09-content-db-management-strategy.md` | 콘텐츠 DB 운영 효율화 전략 | TARS |
| `deliverables/10-trip-ontology-dashboard-plan.md` | Trip Ontology Dashboard 기획안 | Joi, TARS |
| `deliverables/11-final-review-ontology-priority.md` | 산출물 최종 검토와 온톨로지 우선순위 재정렬 | Diagnostic Agent, Jarvis |
| `deliverables/12-supabase-schema-separation-guide.md` | Supabase 프로젝트별 스키마 분리와 개발자 연동 기준 | TARS, KITT/TRON |
| `deliverables/13-responsive-pc-mo-review.md` | PC/MO 반응형 웹 최적화 가능성 검토 | Joi, TARS |
| `research/youtube-metadata-raw.jsonl` | YouTube flat metadata 80건 원천 추출 | EVE |
| `research/youtube-metadata-summary.md` | YouTube metadata 정규화 요약 | EVE, Data |
| `data/youtube-content-seed.json` | 정규화 콘텐츠 seed DB | TARS |
| `data/youtube-content-seed.sql` | Supabase/PostgreSQL seed SQL 초안 | TARS |
| `web/responsive-prototype/` | 공개 웹 홈, 탐색, 상세 반응형 정적 목업 | Joi, TARS |
| `verification/responsive-verification.md` | PC/MO viewport 검증 기록 | TARS, Diagnostic Agent |
| `verification/youtube-db-refresh-verification.md` | YouTube metadata DB refresh 및 UI 반영 검증 | TARS, Diagnostic Agent |
| `verification/latest-youtube-search-verification.md` | 최신 YouTube 영상 근거 검색 보강 검증 | TARS, Diagnostic Agent |
| `verification/search-observation-entry-verification.md` | 콘텐츠 후보 미매칭 키워드의 YouTube 검색 관측 입구 검증 | TARS, Diagnostic Agent |
| `verification/risk-shield-review.md` | 리스크 검토 | KITT/TRON |

## 실행 명령

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId korea-travel-content-service-planning -Task "유튜브 여행프로그램 분석 기반 외국인 대상 대한민국 여행정보 온라인 콘텐츠 전체 서비스 기획"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId korea-travel-content-service-planning -Task "콘텐츠 관리 DB 효율화 방안 검토 및 기존 여행정보 서비스 기획 문서 업데이트"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId korea-travel-content-service-planning -Task "콘텐츠 지식 그래프 온톨로지 기반 trip_ontology_dashboard 기획안 추가 및 기존 여행정보 서비스 문서 업데이트"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId korea-travel-content-service-planning -Task "deliverables 폴더 최종 검토 및 온톨로지 우선순위 재정렬"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId korea-travel-content-service-planning -Task "Supabase 프로젝트별 스키마 분리 구조와 개발자 연동 규칙을 여행정보 서비스 기획 문서에 반영"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId 2026-06-19-korea-travel-content-service-planning -Task "기존 한국 여행 콘텐츠 서비스 기획 폴더 내 PC 및 MO 최적화(반응형 웹) 가능성 검토"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId 2026-06-19-korea-travel-content-service-planning -Task "PC/MO 반응형 웹 정적 목업 구현 및 검증 완료"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId 2026-06-19-korea-travel-content-service-planning -Task "유튜브 콘텐츠 메타데이터 재추출, 로컬 콘텐츠 DB 생성, 반응형 목업 데이터 품질 보강"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId 2026-06-19-korea-travel-content-service-planning -Task "최신 YouTube 키워드 검색 시 최신 영상 근거 콘텐츠 노출 보강"
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId 2026-06-19-korea-travel-content-service-planning -Task "애정결핍 키워드 최신 영상 근거 및 관측 입구 누락 보강"
python -m yt_dlp --flat-playlist --playlist-end 80 --dump-json "https://www.youtube.com/@hello1stkorea/videos"
python work-requests/2026-06-19-korea-travel-content-service-planning/scripts/build-youtube-content-seed.py
yt-dlp --flat-playlist --playlist-end 40 --print "%(playlist_index)02d`t%(title)s`t%(url)s`t%(duration_string)s" "https://www.youtube.com/@hello1stkorea/videos"
python -m yt_dlp --flat-playlist --playlist-end 8 --print "%(id)s`t%(title)s`t%(webpage_url)s`t%(duration_string)s`t%(channel)s`t%(upload_date)s" "https://www.youtube.com/results?search_query=%EC%95%A0%EC%A0%95%EA%B2%B0%ED%95%8D&sp=CAI%253D"
node --check work-requests/2026-06-19-korea-travel-content-service-planning/web/responsive-prototype/app.js
powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId korea-travel-content-service-planning
```

## 검증 결과

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| 대시보드 시작 훅 | Pass | URL 반환 및 이벤트 기록 |
| 채널 메타데이터 샘플링 | Pass | 40개 공개 영상 제목/URL/길이 확인 |
| 문서 산출물 | Pass | 작업 폴더 내 Markdown 산출물 작성 |
| Browser 열기 | 제한 | Codex Browser `iab`가 현재 세션에서 사용 불가 |
| 저작권 리스크 | Pass with Conditions | 이미지 placeholder 정책 적용 |
| Jarvis validate | Pass | 중앙 Work Log와 Episodic Memory 보강 후 모든 필수 게이트 통과 |
| 콘텐츠 DB 관리 방안 | Pass | 정규화 원장, JSONB staging, 검색 읽기 모델, 작업 큐, 중복 방지, 품질 점수 전략 반영 |
| Trip Ontology Dashboard | Pass | 온톨로지 클래스/관계, Graph Explorer, Relation Review, Coverage, Risk & Rights, Query Lab 기획 반영 |
| Deliverables 최종 검토 | Pass with Priority Reorder | 온톨로지를 W0/W1 선행 트랙으로 재정렬하고 누락된 User Flow, Design System, AI Guide 기준 보강 |
| Supabase 스키마 분리 | Pass with Conditions | `public` 사용 지양, `korea_travel_content` 전용 스키마, Exposed schemas, RLS, `db.schema` 연동 기준 반영 |
| PC/MO 반응형 검토 | Pass with Conditions | 구현 파일은 없으나 문서 보강과 정적 목업은 즉시 가능, 실제 앱 구현은 프론트엔드 위치 확정 필요 |
| PC/MO 정적 목업 | Pass | 홈, 탐색, 상세 화면을 `web/responsive-prototype/`에 구현 |
| 반응형 자동 검증 | Pass | 360, 390, 430, 768, 1024, 1280px에서 가로 스크롤 없음, 모바일 필터 동작 확인 |
| YouTube metadata 재추출 | Pass | `python -m yt_dlp`로 공식 채널 flat metadata 80건 추출 |
| Seed DB 생성 | Pass | JSON/SQL/목업 JS seed 생성, content item 80건 정규화 |
| Seed DB UI 반영 | Pass | 홈 6건, 탐색 80건, 상세 동적 갱신 렌더링 확인 |
| 최신 영상 근거 검색 | Pass | `최신 정보 업데이트` 검색은 최신 원천 영상 순번을 우선 반영, `한우 최신`은 sourceRank 1 영상 1건 확인 |
| 검색 관측 입구 | Pass | `애정결핍`은 콘텐츠 후보 0건, 관측 입구 1개, 관측 영상 3건 확인 |
| 미등록 최신 검색어 | Pass | `완전새키워드`는 콘텐츠 후보 0건, 관측 영상 0건, 관측 요청 1개 확인 |

## 한계

- YouTube 공개 메타데이터와 웹 문서 기반의 1차 기획이다.
- 2025 외래관광객조사 최종 보고서 상세 표는 PDF 추출 전이라 수치 반영이 제한적이다.
- 실제 UI 구현과 화면 검증은 이번 범위에 포함하지 않았다.

## 남은 리스크

- 이미지 라이선스 확보
- 국적별 추천 표현의 편향 가능성
- 지도/예약 API 약관
- 다국어 번역 품질
- 검색 인덱스 갱신 실패, 중복 병합 오판, 품질 점수 산식 편향
- 온톨로지 과설계, AI 추출 관계 오류, 근거 없는 추천 관계 노출
- Supabase Exposed schemas 누락, RLS 정책 미정 상태의 CRUD 권한 과다 부여

## 재현 방법

```powershell
cd c:\Users\HANA\Desktop\gemini\jarvis
powershell -ExecutionPolicy Bypass -File scripts/validate-jarvis-request.ps1 -RequestId korea-travel-content-service-planning
```
