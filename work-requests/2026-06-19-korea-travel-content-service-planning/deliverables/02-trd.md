# TRD: 기술 요구사항과 아키텍처

## 1. 아키텍처 목표

- 공개 웹에서 콘텐츠를 빠르게 탐색한다.
- 운영자는 콘텐츠, 태그, 출처, 이미지 상태, 번역 상태를 안전하게 관리한다.
- 영상 분석 결과와 여행정보를 분리해 저작권 리스크를 낮춘다.
- 다국어, 지도, 검색, 추천, 분석 확장을 전제로 설계한다.

## 2. 권장 구성

```text
Public Web
  -> Content API
  -> Search API
  -> Recommendation API

Admin CMS
  -> Content Management
  -> Source/Rights Review
  -> Translation Workflow
  -> Trip Ontology Dashboard

Data Layer
  -> PostgreSQL + PostGIS
  -> Read Model Tables
  -> Graph Projection Tables
  -> Search Index
  -> Cache
  -> Object Storage
  -> Analytics Store

Ingestion
  -> YouTube metadata collector
  -> Staging tables
  -> Editorial tagging
  -> Tourism data import
  -> Review queue
```

## 3. 기술 스택 옵션

| 영역 | Option A | Option B | Option C | 권장 |
| --- | --- | --- | --- | --- |
| 프론트엔드 | Next.js | Nuxt | SvelteKit | Next.js |
| DB | Supabase PostgreSQL + 프로젝트 전용 schema | 자체 PostgreSQL + PostGIS | MySQL | Supabase 사용 시 `korea_travel_content` 전용 schema |
| 검색 | Meilisearch | OpenSearch | DB full-text | 초기 Meilisearch, 대규모 OpenSearch |
| CMS | 자체 Admin | Headless CMS | Notion/Airtable | 자체 Admin 또는 Headless CMS 혼합 |
| 지도 | Google Maps | Naver/Kakao | Mapbox | 해외 사용성은 Google, 국내 보강은 추상화 |
| 이미지 저장 | S3 호환 Object Storage | CMS Asset | 로컬 | Object Storage |

## 4. 주요 모듈

| 모듈 | 책임 |
| --- | --- |
| Content API | 지역, 음식, 관광지, 코스, 영상 영감 조회 |
| Search API | 통합 검색, 필터, 정렬 |
| Recommendation API | 국적/동행/관심사 기반 추천 |
| Admin CMS | 콘텐츠 작성, 태깅, 검수, 권리 상태 관리 |
| Ingestion Worker | 유튜브 메타데이터와 관광 공공데이터 수집 |
| Translation Workflow | 한국어 원문에서 영문/일문 번역 상태 관리 |
| Image Slot Manager | 이미지 플레이스홀더와 실제 이미지 교체 관리 |
| Analytics | 조회, 저장, 필터 사용, 추천 클릭 이벤트 집계 |
| Content DB Manager | canonical key, 작업 큐, 품질 점수, 검색 문서 갱신 관리 |
| Ontology Graph Manager | 온톨로지 클래스/관계, relation assertion, 그래프 품질 진단 관리 |
| Trip Ontology Dashboard | 그래프 탐색, 관계 검수, 커버리지, 권리 영향 분석 UI |

## 5. 데이터 흐름

1. 운영자가 유튜브 영상 URL 또는 공개 메타데이터를 등록한다.
2. 시스템이 제목, URL, 에피소드, 영상 ID를 저장한다.
3. 운영자가 국적, 동행, 지역, 음식, 관광지, 스타일 태그를 검수한다.
4. 여행정보 카드와 영상 영감 카드가 연결된다.
5. 승인된 콘텐츠는 `content_search_documents` 읽기 모델과 Search Index로 비동기 반영된다.
6. 공개 웹은 사용자 필터에 따라 읽기 모델과 Search Index에서 콘텐츠를 검색/추천한다.
7. 행동 데이터는 추천 가중치와 콘텐츠 품질 리포트에 반영된다.

## 6. API 초안

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/v1/contents` | 콘텐츠 목록 |
| GET | `/api/v1/contents/{id}` | 콘텐츠 상세 |
| GET | `/api/v1/regions` | 지역 트리 |
| GET | `/api/v1/foods` | 음식 목록/필터 |
| GET | `/api/v1/attractions` | 관광지 목록/필터 |
| GET | `/api/v1/video-inspirations` | 영상 영감 카드 |
| POST | `/api/v1/recommendations` | 추천 요청 |
| GET | `/api/v1/courses/{id}` | 추천 코스 상세 |
| POST | `/api/admin/contents` | 콘텐츠 생성 |
| PATCH | `/api/admin/image-slots/{id}` | 이미지 상태 변경 |
| GET | `/api/admin/review-tasks` | 콘텐츠 검수/권리/번역 작업 큐 |
| GET | `/api/admin/duplicate-candidates` | 중복 후보 목록 |
| POST | `/api/admin/duplicate-candidates/{id}/merge` | 중복 후보 병합 |
| POST | `/api/admin/search-documents/rebuild` | 검색 읽기 모델 재생성 |
| GET | `/api/admin/ontology/nodes` | 온톨로지 그래프 노드 검색 |
| GET | `/api/admin/ontology/edges` | 온톨로지 그래프 관계 검색 |
| GET | `/api/admin/ontology/path` | 노드 간 경로 탐색 |
| GET | `/api/admin/ontology/relation-assertions` | 관계 후보 검수 큐 |
| PATCH | `/api/admin/ontology/relation-assertions/{id}` | 관계 후보 승인/반려/보류 |
| GET | `/api/admin/ontology/quality-findings` | 고아 노드, 누락 관계, 권리 영향 진단 |

## 7. 비기능 요구사항

| ID | 요구사항 |
| --- | --- |
| NFR-001 | 공개 페이지 LCP 2.5초 이하 목표 |
| NFR-002 | 검색 결과 500ms 이하 목표 |
| NFR-003 | 모바일 우선 반응형 |
| NFR-004 | 이미지 없을 때도 레이아웃 흔들림 없음 |
| NFR-005 | 모든 이미지 슬롯은 대체 텍스트를 가진다 |
| NFR-006 | 콘텐츠 출처와 권리 상태를 감사 가능하게 보관 |
| NFR-007 | 다국어 필드는 원문과 번역 상태를 분리 |
| NFR-008 | 개인정보 수집 기능은 별도 동의와 보관 정책 필요 |
| NFR-009 | 공개 검색은 운영 DB 복잡 조인 대신 읽기 모델과 Search Index를 사용 |
| NFR-010 | CMS 목록, 작업 큐, 중복 후보 화면은 페이지네이션과 필터 인덱스를 필수 적용 |
| NFR-011 | 검색 인덱스 갱신 지연과 재검수 기한 초과를 운영 알림으로 추적 |
| NFR-012 | Trip Ontology Dashboard는 W1에서 PostgreSQL graph projection으로 시작하고, 복잡한 path query가 필요해지면 그래프 DB 전환을 검토 |
| NFR-013 | 추천/권리/출처 관계는 `Evidence` 또는 운영자 승인 로그 없이 공개 추천 근거로 사용할 수 없음 |
| NFR-014 | Supabase 사용 시 신규 앱 테이블은 `public`이 아니라 프로젝트 전용 schema에 생성하고 Data API Exposed schemas에 등록한다 |

## 8. 보안과 권리 관리

- 유튜브 영상은 링크와 공개 메타데이터만 저장한다.
- 썸네일 URL은 참조만 가능하며, 직접 저장/재배포는 금지한다.
- 실제 이미지 등록 시 라이선스 유형, 출처, 만료일, 사용 범위를 기록한다.
- 관리자 작업은 감사 로그로 보관한다.
- 회원 기능 도입 전까지 개인화는 쿠키/세션 최소 범위 또는 비회원 저장으로 설계한다.

## 9. 추천 로직 초안

```text
score =
  nationalityWeight
  + companionWeight
  + interestWeight
  + seasonWeight
  + contentQualityWeight
  + behaviorFeedbackWeight
  - riskPenalty
```

- 초기에는 운영자 큐레이션과 규칙 기반 가중치를 사용한다.
- 추천 이유를 사용자에게 표시한다.
- 국적별 추천은 "이 국적은 이걸 좋아한다"가 아니라 "비슷한 여행 맥락에서 많이 추천되는 콘텐츠"로 표현한다.

## 10. 관측성과 운영

- 콘텐츠 최신성 검수 주기: 90일 기본
- 운영시간/가격/예약 필요 정보는 외부 링크와 최종 확인일을 저장
- 이벤트: 검색, 필터, 상세 조회, 저장, 공유, 지도 열기, 영상 링크 클릭
- 리스크 알림: 권리 상태 미확인 이미지, 만료 라이선스, 오래된 운영시간
- DB 운영 알림: 검색 문서 갱신 실패, 중복 후보 장기 미처리, review task SLA 초과, 품질 점수 급락
- 그래프 운영 알림: 고아 노드 증가, 근거 없는 추천 관계, 권리 리스크 영향 콘텐츠, relation assertion 장기 미처리

## 11. 콘텐츠 DB 관리 전략

상세 전략은 `deliverables/09-content-db-management-strategy.md`를 기준으로 한다.

- 정규화 원장: 공개 기준이 되는 지역, 음식, 관광지, 영상, 이미지, 번역, 출처는 별도 테이블로 관리한다.
- JSONB staging: 원천 수집 payload, 영상 추출 임시 태그, 운영자 메모처럼 구조가 변하는 데이터는 JSONB로 보관하고 검수 후 표준 테이블로 승격한다.
- 읽기 모델: 공개 검색과 추천은 `content_search_documents`, `recommendation_features` 같은 읽기 모델을 사용한다.
- 중복 방지: 원천별 canonical key를 두고 병합 후보를 CMS에서 처리한다.
- 품질 점수: 필수 필드, 출처, 최신성, 권리 안전성, 번역 상태, 사용자 반응을 점수화한다.

## 12. Trip Ontology Dashboard

상세 기획은 `deliverables/10-trip-ontology-dashboard-plan.md`를 기준으로 한다.

- W1은 `trip_graph_nodes`, `trip_graph_edges`, `trip_ontology_terms`, `trip_relation_assertions`, `trip_graph_quality_findings` 같은 PostgreSQL projection 테이블로 시작한다.
- 핵심 화면은 Overview, Graph Explorer, Ontology Map, Relation Review, Coverage, Risk & Rights, Query Lab이다.
- 유튜브/AI 추출 관계는 곧바로 공개 추천에 쓰지 않고 Relation Review에서 승인한 뒤 표준 관계로 승격한다.
- 권리 상태가 `blocked`인 이미지 또는 출처 누락 관계는 Risk & Rights 그래프에서 영향 범위를 추적한다.

## 13. Ontology First 구현 순서

온톨로지는 별도 후속 기능이 아니라 콘텐츠 DB, 검색, 추천, 권리 검수의 선행 기준으로 둔다.

1. `trip_ontology_terms`에 핵심 클래스와 관계 키를 먼저 등록한다.
2. `Region`, `Food`, `Attraction`, `VideoInspiration`, `TravelerSegment`, `ImageAsset`, `Source`, `Evidence`의 canonical key 규칙을 확정한다.
3. `trip_relation_assertions` 승인 상태와 `Evidence` 필수 조건을 CMS 공개 조건에 연결한다.
4. `trip_graph_nodes`와 `trip_graph_edges` projection을 W1에서 구현하고, 전용 그래프 DB 도입은 Query Lab 성능 병목이 확인될 때 재검토한다.
5. 검색 facet, 추천 이유, 권리 영향 분석은 모두 승인된 ontology relation만 사용한다.

## 14. Supabase 스키마 분리 운영

상세 절차는 `deliverables/12-supabase-schema-separation-guide.md`를 기준으로 한다.

- 권장 스키마명은 `korea_travel_content`이다.
- Supabase `public` 스키마는 기본 기능과 공용 확장 외 신규 앱 테이블 생성에 사용하지 않는다.
- 관리자 SQL은 `CREATE SCHEMA`, `GRANT USAGE`, default privileges, RLS 활성화 순서로 실행한다.
- Supabase Dashboard의 Data API `Exposed schemas`에 `korea_travel_content`를 등록해야 한다. 누락 시 `PGRST106` 오류가 발생할 수 있다.
- Next.js 클라이언트는 `createClient(url, key, { db: { schema: "korea_travel_content" } })`로 연결하고, 코드에서는 `.from("content_items")`처럼 테이블명만 사용한다.
- SQL Editor, migration, raw SQL에서는 `korea_travel_content.content_items`처럼 항상 스키마명을 명시한다.
- 클라이언트에는 publishable key 또는 anon key만 사용하고 service role key는 서버 전용으로 분리한다.
