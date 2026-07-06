# Trip Ontology Dashboard 기획안

## 1. 목적

`trip_ontology_dashboard`는 여행 콘텐츠 DB를 단순 목록으로 관리하는 것을 넘어, `지역`, `음식`, `관광지`, `영상`, `국적/권역`, `동행 유형`, `여행 스타일`, `이미지/출처/권리`의 관계를 지식 그래프와 온톨로지로 시각화하고 검수하는 운영 대시보드다.

이 대시보드는 다음 질문에 답해야 한다.

- 어떤 영상이 어떤 지역, 음식, 관광지, 여행 스타일을 만들었는가?
- 특정 국적/동행 유형 추천이 어떤 근거 관계를 갖는가?
- 특정 지역의 콘텐츠 커버리지는 음식/관광지/영상/이미지 관점에서 충분한가?
- 권리 미확인 이미지나 출처가 그래프 어디에 영향을 주는가?
- 콘텐츠 추천과 검색 facet이 표준 taxonomy와 어긋나지 않는가?

## 2. 사용자와 사용 시나리오

| 사용자 | 목표 | 주요 화면 |
| --- | --- | --- |
| 콘텐츠 운영자 | 영상에서 추출한 후보 태그를 표준 온톨로지에 연결 | 관계 검수 큐, 노드 상세 |
| 여행 큐레이터 | 국적/동행/스타일별 추천 근거를 확인 | 추천 근거 그래프, 세그먼트 맵 |
| 데이터 관리자 | 중복 노드, 고아 노드, 누락 관계를 정리 | 품질 진단, 중복 후보 |
| 리스크 검토자 | 권리/출처/개인정보 리스크 영향 범위 확인 | 권리 영향 그래프 |
| 기획자 | 지역/음식/관광지 커버리지와 콘텐츠 공백 확인 | 커버리지 대시보드 |

## 3. 온톨로지 범위

### 핵심 클래스

| 클래스 | 설명 | 예 |
| --- | --- | --- |
| `TripContent` | 공개 콘텐츠 공통 부모 | 하동 녹차밭 소개 |
| `Region` | 행정구역/여행권역 | 서울, 강릉, 하동 |
| `Place` | 실제 장소 | 최참판댁, 화개장터 |
| `Attraction` | 관광지/체험 | 녹차밭 체험, e스포츠 체험 |
| `Food` | 음식/메뉴 | 짜장면, 게장, 닭발 |
| `FoodCategory` | 음식 업종/분류 | 한식 고기, 해산물, 시장 음식 |
| `VideoInspiration` | 유튜브 영상 기반 영감 | EP.431 하동 여행 영상 |
| `TravelerSegment` | 국적/권역/동행/관심사 세그먼트 | 일본, 친구, 가족, 한류 팬 |
| `TravelStyle` | 여행 스타일 | 미식, 자연, 역사, 한류, 도전형 |
| `Course` | 추천 코스 | 하동 1박 2일 로컬 코스 |
| `ImageAsset` | 실제 이미지 또는 placeholder 슬롯 | hero_banner |
| `Source` | 출처 | YouTube URL, 관광공사, 지자체 |
| `RightsPolicy` | 권리/라이선스 상태 | link-only, public_license |
| `Evidence` | 추천/관계 근거 | 영상 제목, 외래관광객조사, 운영자 검수 |

### 핵심 관계

| 관계 | 의미 |
| --- | --- |
| `inRegion` | 콘텐츠/장소가 지역에 속함 |
| `nearRegion` | 지역 또는 장소가 여행권역상 인접 |
| `featuresFood` | 영상/코스/장소가 음식을 포함 |
| `featuresAttraction` | 영상/코스가 관광지를 포함 |
| `inspiredByVideo` | 여행 콘텐츠가 영상에서 영감을 받음 |
| `recommendedFor` | 콘텐츠가 특정 여행자 세그먼트에 추천됨 |
| `hasTravelStyle` | 콘텐츠가 여행 스타일을 가짐 |
| `hasImageSlot` | 콘텐츠가 이미지 슬롯을 가짐 |
| `hasRightsPolicy` | 이미지/영상/출처가 권리 상태를 가짐 |
| `hasEvidence` | 추천/관계가 근거를 가짐 |
| `hasRisk` | 노드/관계가 리스크를 가짐 |
| `partOfCourse` | 장소/음식/관광지가 코스에 포함됨 |
| `sameAsCandidate` | 중복 후보 관계 |

## 4. 그래프 데이터 모델

운영 DB는 정규화 원장으로 유지하고, 그래프는 조회/검수용 projection으로 운영한다.

```text
PostgreSQL 원장
  -> ontology_projection_worker
  -> trip_graph_nodes
  -> trip_graph_edges
  -> Graph API
  -> trip_ontology_dashboard
```

권장 projection 테이블:

| 테이블 | 목적 |
| --- | --- |
| `trip_graph_nodes` | 콘텐츠, 지역, 음식, 장소, 세그먼트, 출처 노드 |
| `trip_graph_edges` | 노드 간 관계와 근거 |
| `trip_ontology_terms` | 클래스, 속성, 관계 정의 |
| `trip_relation_assertions` | 운영자가 승인/반려할 관계 주장 |
| `trip_graph_quality_findings` | 고아 노드, 중복, 누락, 리스크 진단 결과 |

## 5. 대시보드 IA

```text
Trip Ontology Dashboard
├── Overview
│   ├── 그래프 건강도
│   ├── 콘텐츠 커버리지
│   └── 리스크 요약
├── Graph Explorer
│   ├── 노드 검색
│   ├── 관계 탐색
│   └── 1-hop / 2-hop / Path 보기
├── Ontology Map
│   ├── 클래스/관계 사전
│   ├── Taxonomy Tree
│   └── 변경 이력
├── Relation Review
│   ├── 영상 추출 관계 후보
│   ├── 추천 근거 후보
│   └── 승인/반려 큐
├── Coverage
│   ├── 지역별 커버리지
│   ├── 음식/관광지 커버리지
│   └── 국적/동행 세그먼트 커버리지
├── Risk & Rights
│   ├── 권리 미확인 노드
│   ├── 출처 누락 관계
│   └── 영향 범위 그래프
└── Query Lab
    ├── 자연어 질문
    ├── Graph Query 템플릿
    └── 결과 저장
```

## 6. 핵심 화면 기획

### 6.1 Overview

주요 지표:

- 전체 노드 수, 전체 관계 수
- 고아 노드 수
- 출처 없는 관계 수
- 권리 미확인 이미지 영향 콘텐츠 수
- 지역/음식/관광지 커버리지
- 추천 근거가 부족한 세그먼트 수

### 6.2 Graph Explorer

기능:

- 노드 유형 필터: 지역, 음식, 관광지, 영상, 세그먼트, 코스, 출처
- 관계 필터: 추천, 영감, 포함, 근거, 권리, 중복 후보
- 노드 상세 패널: 기본 정보, 연결 콘텐츠, 출처, 권리 상태, 품질 점수
- Path Finder: 예) `멕시코 여행자 -> K-드라마 -> 홍대 -> 길거리 공연 -> 음식`

### 6.3 Relation Review

운영자가 AI/영상 분석 결과를 표준 온톨로지에 승격하는 화면이다.

| 필드 | 설명 |
| --- | --- |
| 후보 관계 | `VideoInspiration featuresFood Food` |
| 신뢰도 | 추출 confidence |
| 근거 | 제목, 설명, 운영자 메모 |
| 영향 | 연결될 콘텐츠와 추천 코스 |
| 액션 | 승인, 반려, 보류, 표준 태그 매핑 |

### 6.4 Coverage

콘텐츠 공백을 찾는다.

- 지역별: 관광지 있음/음식 없음/영상 없음/이미지 없음
- 세그먼트별: 일본 친구 여행 추천은 충분하지만 부모 동반 추천이 부족함
- 음식별: 메뉴 설명은 있으나 알레르기/맵기 정보 누락
- 영상별: 태그 후보는 있으나 표준 노드 연결 미완료

### 6.5 Risk & Rights

권리와 출처 리스크를 그래프로 본다.

- `ImageAsset blocked`가 연결된 콘텐츠 목록
- 유튜브 `link-only` 관계가 실제 이미지 사용으로 오해될 수 있는 노드
- 출처가 1개뿐인 추천 관계
- 만료 예정 라이선스가 영향을 주는 코스와 상세 페이지

### 6.6 Query Lab

초기에는 템플릿형 질의를 제공하고, 이후 자연어 질의를 붙인다.

질의 예:

```text
Q1. 하동과 연결된 음식, 관광지, 영상 영감, 권리 미확인 이미지를 보여줘.
Q2. 가족 여행자에게 추천되지만 이동 난이도 근거가 없는 콘텐츠는?
Q3. 영상에서는 등장했지만 표준 관광지 노드와 연결되지 않은 후보는?
Q4. 일본어 번역이 없고 검색 노출이 높은 음식 콘텐츠는?
Q5. 권리 상태가 blocked인 이미지가 영향을 주는 코스는?
```

## 7. 기술 아키텍처

```text
Content DB
  - content_items
  - regions
  - foods
  - attractions
  - video_inspirations
  - image_slots
  - sources
  - review_tasks

Ontology Projection
  - term mapper
  - relation assertion builder
  - graph quality checker

Graph Store
  Option A: PostgreSQL edge tables
  Option B: Neo4j
  Option C: RDF triple store

Graph API
  - node search
  - edge query
  - path query
  - quality findings

Dashboard UI
  - graph visualization
  - coverage tables
  - review queue
  - query lab
```

## 8. 그래프 저장소 옵션

| 옵션 | 장점 | 단점 | 권장 단계 |
| --- | --- | --- | --- |
| PostgreSQL edge table | 현재 DB와 통합 쉽고 운영 단순 | 복잡한 path query 한계 | W1 |
| Neo4j | 관계 탐색과 path query 강함 | 별도 운영 필요 | W2 이후 |
| RDF triple store | OWL/RDF/SPARQL 표준 적합 | 팀 학습 비용 높음 | 온톨로지 공개/연계 단계 |

권장: W1은 PostgreSQL projection으로 시작하고, 그래프 질의가 핵심 운영 도구가 되면 Neo4j 또는 RDF triple store를 검토한다.

## 9. 데이터 품질 규칙

- 공개 콘텐츠는 최소 1개 이상의 `Evidence` 관계를 가져야 한다.
- `recommendedFor` 관계는 반드시 `hasEvidence` 또는 운영자 승인 로그를 가져야 한다.
- `ImageAsset`이 `blocked`이면 연결 콘텐츠의 공개 상태를 재검수 큐로 보낸다.
- `VideoInspiration`은 직접 이미지 자산으로 연결하지 않고 `Source`와 `Evidence`로만 연결한다.
- `sameAsCandidate` 관계는 운영자 승인 전 자동 병합하지 않는다.
- 고아 노드는 7일 이상 방치되면 작업 큐로 이동한다.

## 10. KPI

| 지표 | 정의 |
| --- | --- |
| Graph Completeness | 필수 관계를 충족한 콘텐츠 비율 |
| Evidence Coverage | 추천 관계 중 근거가 연결된 비율 |
| Orphan Node Count | 관계 없는 노드 수 |
| Risk Impact Count | 권리/출처 리스크가 연결된 공개 콘텐츠 수 |
| Review Throughput | 관계 후보 승인/반려 처리량 |
| Query Success Rate | 운영자가 원하는 그래프 질의에 답한 비율 |

## 11. 출시 단계

| Wave | 범위 | 산출물 |
| --- | --- | --- |
| W1 | Ontology dictionary, PostgreSQL graph projection, Overview, Relation Review | 기본 운영 가능 |
| W2 | Graph Explorer, Coverage, Risk impact graph | 검수/기획 고도화 |
| W3 | Query Lab, 자연어 질의, 추천 근거 자동 설명 | 분석 자동화 |
| W4 | RDF/OWL export, 외부 관광 지식그래프 연계 | 생태계 확장 |

## 12. 리스크와 완화

| 리스크 | 영향 | 완화 |
| --- | --- | --- |
| 온톨로지 과설계 | 운영자가 입력을 포기 | W1은 필수 클래스/관계만 사용 |
| AI 추출 관계 오류 | 잘못된 추천/검색 | Relation Review 승인 큐 필수 |
| 국적별 추천 편향 | 브랜드 신뢰 하락 | Evidence와 대체 코스 표시 |
| 그래프 저장소 운영 복잡도 | 비용 증가 | PostgreSQL projection으로 시작 |
| 권리 관계 누락 | 이미지/영상 저작권 리스크 | Rights graph와 공개 차단 규칙 적용 |

