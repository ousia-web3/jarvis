# 업무 로그: 외국인 대상 대한민국 여행정보 콘텐츠 서비스 기획

## 메타데이터

- Task ID: `korea-travel-content-service-planning`
- Project: Jarvis
- Agent: Jarvis Team
- Role: 전략, 기획, IA, 기술 설계, 리스크 검토
- Started At: 2026-06-19
- Finished At: 2026-06-19
- Status: Done

## 실행 요약

- 사용자 요청을 L2 + Design Review 트랙으로 분류했다.
- `work-requests/2026-06-19-korea-travel-content-service-planning/` 폴더를 만들고 Human Brief, 리서치, 8개 설계 문서, 검증 문서를 작성했다.
- `어서와 한국은 처음이지` 유튜브 채널 공개 메타데이터 40개를 샘플링해 음식, 지역, 동행, K-콘텐츠, 관광 스타일 축으로 변환했다.
- 실제 이미지는 권리 확인 전까지 공통 배너 placeholder로 표기하도록 설계했다.
- Data와 KITT/TRON 관점에서 국적별 추천 편향과 저작권 리스크를 조건부 통과로 정리했다.
- 추가 요청에 따라 콘텐츠 관리 DB 효율화 전략을 보강했다.
- 정규화 원장, JSONB staging, 검색 읽기 모델, CMS 작업 큐, canonical key, 품질 점수, 중복 병합 정책을 반영했다.
- 추가 요청에 따라 콘텐츠 지식 그래프/온톨로지 기반 `trip_ontology_dashboard` 기획안을 보강했다.
- Graph Explorer, Relation Review, Coverage, Risk & Rights, Query Lab, 온톨로지 클래스/관계, 그래프 품질 지표를 반영했다.
- 추가 요청에 따라 `deliverables/` 전체를 최종 검토하고 온톨로지를 W0/W1 선행 트랙으로 재정렬했다.
- PRD, TRD, TASKS, User Flow, Design System, AI 협업 가이드에 Ontology First 기준과 관계 승인/근거 규칙을 반영했다.
- 추가 요청에 따라 Supabase 프로젝트별 스키마 분리 구조를 반영했다.
- `korea_travel_content` 전용 schema, Data API Exposed schemas, RLS, Supabase JS `db.schema` 연동 기준을 문서화했다.

## 산출물

- `work-requests/2026-06-19-korea-travel-content-service-planning/README.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/research/youtube-content-analysis.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/01-prd.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/02-trd.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/03-ia-brief.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/09-content-db-management-strategy.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/10-trip-ontology-dashboard-plan.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/11-final-review-ontology-priority.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/deliverables/12-supabase-schema-separation-guide.md`
- `work-requests/2026-06-19-korea-travel-content-service-planning/verification/risk-shield-review.md`

## 검증

- 시작 훅 실행: Pass
- 유튜브 공개 메타데이터 샘플링: Pass
- 문서 생성: Pass
- 보고용 validate: 1차 Needs Work 후 중앙 메모리 보강, DB 관리 전략과 Trip Ontology Dashboard 업데이트 후 Pass. 온톨로지 우선순위 최종 검토 반영 후 재검증 Pass. Supabase 스키마 분리 반영 후 재검증 Pass

## 남은 액션

- 서비스명과 브랜드 톤 확정
- 초기 콘텐츠 50개 seed list 작성
- 2025 외래관광객조사 PDF 상세 수치 추출
- UI 와이어프레임 또는 정적 목업 착수
- 콘텐츠 DB `schema.sql` 초안과 CMS 작업 큐/중복 병합 화면 설계
- Trip Ontology 클래스/관계 사전, relation assertion 정책, graph projection 기본 스키마, Ontology Dashboard W1 와이어프레임 설계
- Supabase 실제 관리자 작업: `korea_travel_content` schema 생성, Exposed schemas 등록, RLS 정책 작성
