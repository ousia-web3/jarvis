# TASKS

## 0. Ontology First 선행 트랙

사용자 요청에 따라 온톨로지 영역을 최우선 작업 순서로 둔다. 아래 태스크가 끝나기 전에는 CMS, 검색, 추천 구현을 확정하지 않는다.

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-ONT-001 | Trip Ontology 클래스/관계 사전 확정 | TARS | EVE, C3PO, Data | trip-ontology-terms.md | Region, Food, Attraction, VideoInspiration, TravelerSegment, Source, Evidence 핵심 용어와 관계 키 확정 |
| TASK-ONT-002 | 관계 승인 상태와 Evidence 규칙 확정 | KITT/TRON | TARS, Data, Friday | relation-assertion-policy.md | 근거 없는 `recommendedFor`, 권리 미확정 이미지 영향 관계가 공개 추천에 쓰이지 않음 |
| TASK-ONT-003 | Graph projection 기본 스키마 확정 | TARS | Data | graph-projection-spec.md | `trip_graph_nodes`, `trip_graph_edges`, `trip_relation_assertions`, `trip_graph_quality_findings` 필드와 갱신 규칙 확정 |
| TASK-ONT-004 | Trip Ontology Dashboard W1 화면 정의 | Joi | TARS, Friday, KITT/TRON | ontology-dashboard-wireframe.md | Overview, Graph Explorer, Relation Review, Coverage, Risk & Rights 기본 화면 정의 |
| TASK-ONT-005 | 온톨로지 품질 게이트 검증 | Diagnostic Agent | Jarvis, Data, KITT/TRON | ontology-first-review.md | PRD/TRD/DB/TASKS/User Flow/Design System/AI Guide 간 우선순위 충돌 없음 |

## 1. 운영 원칙

- 전체 서비스 청사진을 기준으로 하되, 실제 개발은 Wave 단위로 진행한다.
- 각 태스크는 Owner(To)와 CC를 가진다.
- 외부 공개, 이미지 사용, 개인정보, 예약/결제는 Human Conductor 승인 전 차단한다.
- W0 Ontology First 선행 트랙 완료 전에는 추천 로직, 검색 facet, CMS 공개 조건을 확정하지 않는다.
- Supabase를 사용할 경우 모든 테이블 생성 태스크는 `public`이 아니라 프로젝트 전용 스키마 `korea_travel_content`를 기준으로 작성한다.

## 1.5 Supabase 스키마 분리 선행 작업

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-INFRA-001 | Supabase 스키마명 확정 | Jarvis | TARS, Human Conductor | Decision update | `korea_travel_content` 또는 실제 Git 프로젝트명 기반 schema 확정 |
| TASK-INFRA-002 | 관리자 스키마 생성 SQL 실행 | TARS | KITT/TRON | supabase-schema.sql | `CREATE SCHEMA`, `GRANT USAGE`, default privileges 적용 |
| TASK-INFRA-003 | Data API Exposed schemas 등록 | TARS | Friday | 운영 체크리스트 | Supabase Dashboard에서 schema 체크 후 `PGRST106` 방지 |
| TASK-INFRA-004 | RLS 기본 정책 설계 | KITT/TRON | TARS, Data | rls-policy.md | 공개 읽기와 운영자 쓰기 정책 분리 |
| TASK-INFRA-005 | 개발자 연동 가이드 배포 | TARS | C3PO | supabase-client-guide.md | `createClient`의 `db.schema` 설정과 env key 이름 확정 |

## 2. Wave 1: 서비스 골격

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-001 | 서비스명/브랜드 방향 확정 | Jarvis | C3PO, Human Conductor | Decision update | 서비스명, 톤, 금지 표현 확정 |
| TASK-002 | 콘텐츠 분류 체계 확정 | EVE | Data, Joi | taxonomy.md | 국적, 동행, 지역, 음식, 관광지 태그 확정 |
| TASK-003 | DB 스키마 상세화 | TARS | Data, KITT/TRON | schema.sql 또는 ERD | 주요 엔티티와 권리 상태 포함, Supabase 물리 스키마는 `korea_travel_content` 사용 |
| TASK-004 | IA 와이어프레임 작성 | Joi | TARS, C3PO | wireframe.md/html | 홈, 탐색, 상세, 영상 영감 구조 |
| TASK-005 | 공통 배너 컴포넌트 설계 | Joi | TARS, KITT/TRON | component spec | placeholder 상태와 대체 텍스트 포함 |
| TASK-006 | CMS 요구사항 상세화 | TARS | Friday, KITT/TRON | admin-prd.md | 콘텐츠/출처/이미지/검수 관리 가능 |
| TASK-007 | 콘텐츠 DB 운영 전략 상세화 | TARS | Data, Friday, KITT/TRON | content-db-management-strategy.md | 정규화, staging, 검색 읽기 모델, 작업 큐, 중복 방지 포함 |
| TASK-008 | CMS 작업 큐와 중복 병합 UX 설계 | Joi | TARS, Friday | admin-workflow.md | 검수/권리/번역/중복 후보 처리 흐름 정의 |
| TASK-009 | Trip Ontology Dashboard 기획 | Joi | TARS, Data, KITT/TRON | trip-ontology-dashboard-plan.md | Overview, Graph Explorer, Relation Review, Coverage, Risk & Rights, Query Lab 정의 |
| TASK-010 | Trip Ontology 클래스/관계 사전 초안 | TARS | EVE, C3PO, Data | trip-ontology-terms.md | Region, Food, Attraction, Video, Segment, Source, Evidence 핵심 클래스와 관계 정의 |

## 3. Wave 2: 탐색과 코스

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-101 | 검색/필터 API 설계 | TARS | Data | api-spec.md | 지역/음식/관광지/영상 통합 검색 |
| TASK-102 | 추천 규칙 설계 | Data | Jarvis, C3PO | recommendation-rules.md | 추천 이유와 고정관념 방지 문구 포함 |
| TASK-103 | 코스 빌더 UX 설계 | Joi | TARS | flow + UI spec | 코스 담기, 저장, 공유 흐름 |
| TASK-104 | 관광정보 상세 템플릿 작성 | C3PO | EVE, Joi | content-template.md | 지역/음식/관광지 표준 원고 구조 |
| TASK-105 | 초기 콘텐츠 50개 기획 | EVE | Data, C3PO | seed-content-plan.md | 국적/동행/지역/음식 균형 |

## 4. Wave 3: 다국어와 운영

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-201 | 다국어 필드와 번역 워크플로우 | TARS | C3PO | i18n-spec.md | ko/en/ja 상태 관리 |
| TASK-202 | 영문/일문 용어집 | C3PO | Joi | glossary.md | 메뉴, 버튼, 여행 용어 |
| TASK-203 | 분석 이벤트 설계 | Data | TARS | analytics-spec.md | KPI와 이벤트 연결 |
| TASK-204 | 콘텐츠 검수 운영 매뉴얼 | Friday | KITT/TRON | ops-manual.md | 90일 검수, 권리 상태, 출처 정책 |
| TASK-205 | 검색 읽기 모델과 인덱스 운영 설계 | TARS | Data | search-index-ops.md | 재색인, 실패 알림, facet 품질 기준 정의 |
| TASK-206 | 콘텐츠 품질 점수 산식 검증 | Data | C3PO, KITT/TRON | quality-score-spec.md | 필수 필드, 출처, 권리, 최신성, 번역 품질 반영 |
| TASK-207 | 그래프 projection 고도화/배치 운영 설계 | TARS | Data | graph-projection-ops.md | W0 기본 projection 이후 대량 갱신, 실패 재처리, 성능 기준 정의 |
| TASK-208 | Relation Review 운영 고도화 | Friday | Joi, KITT/TRON | relation-review-ops.md | W1 승인 흐름 이후 SLA, 담당자 라우팅, 반복 오류 처리 기준 |

## 5. Wave 4: 파트너와 확장

| Task ID | 태스크명 | Owner(To) | CC | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- |
| TASK-301 | 지도/예약/제휴 옵션 평가 | Jarvis | TARS, KITT/TRON | options.md | 비용, 약관, 해외 접근성 비교 |
| TASK-302 | 지자체/파트너 캠페인 모델 | Jarvis | Data, C3PO | partner-model.md | 광고 표기와 편집 독립성 규칙 |
| TASK-303 | 이미지 소싱 운영 체계 | KITT/TRON | Joi, Friday | image-rights-policy.md | 공공누리/직접촬영/스톡 정책 |
| TASK-304 | 개인화 기능 개인정보 설계 | KITT/TRON | TARS | privacy-design.md | 저장/로그인/동의/삭제 정책 |

## 6. 검증 태스크

| Task ID | 태스크명 | Owner(To) | CC | 완료 기준 |
| --- | --- | --- | --- | --- |
| TASK-QA-001 | 저작권 검토 | KITT/TRON | Friday | 무단 이미지 사용 없음 |
| TASK-QA-002 | 데이터 근거 검토 | Data | EVE | 국적/동행 추천 근거와 가설 구분 |
| TASK-QA-003 | IA 검수 | Joi | TARS | 사이트맵과 User Flow 일치 |
| TASK-QA-004 | 문서 일관성 검토 | Diagnostic Agent | Jarvis | PRD/TRD/IA/ERD 식별자 충돌 없음 |
| TASK-QA-005 | 온톨로지 리스크 검토 | KITT/TRON | Data, TARS | 근거 없는 추천 관계와 권리 리스크 관계 차단 |
