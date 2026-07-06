# Supabase 프로젝트별 스키마 분리 운영 가이드

- 대상 프로젝트: 외국인 대상 대한민국 여행정보 콘텐츠 서비스
- 권장 스키마명: `korea_travel_content`
- 적용 위치: Supabase `PSL_Project` 또는 `PSL2_project`의 PostgreSQL
- 원칙: `public` 스키마는 사용을 지양하고, Git 프로젝트별 전용 스키마에 테이블과 view, function을 둔다.

## 1. 스키마 구조

```text
PSL_Project 또는 PSL2_project
└── PostgreSQL
    ├── public                 ← 기본 스키마, 신규 앱 테이블 생성 지양
    ├── skypulse               ← Git 프로젝트 전용 스키마
    ├── tour_editor_lite       ← Git 프로젝트 전용 스키마
    └── korea_travel_content   ← 본 여행정보 서비스 전용 스키마
```

## 2. 관리자 생성 절차

### 2.1 SQL Editor에서 스키마 생성

```sql
CREATE SCHEMA IF NOT EXISTS korea_travel_content;

GRANT USAGE ON SCHEMA korea_travel_content TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA korea_travel_content
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA korea_travel_content
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;
```

주의:
- 위 권한은 PostgREST 접근 가능성을 여는 기본 권한이다.
- 실제 데이터 공개 범위는 RLS 정책으로 제한한다.
- 운영자 전용 테이블은 기본 CRUD 권한을 부여하더라도 RLS에서 차단하거나 별도 role/service role 경로로만 접근하게 한다.

### 2.2 Data API Exposed schemas 등록

```text
Supabase Dashboard
→ Integrations
→ Data API
→ Settings
→ Exposed schemas
→ korea_travel_content 체크
→ Save
```

이 설정이 누락되면 클라이언트에서 `PGRST106` 오류가 발생할 수 있다.

### 2.3 테이블 생성과 RLS

모든 테이블 생성 SQL은 스키마를 명시한다.

```sql
CREATE TABLE IF NOT EXISTS korea_travel_content.content_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL,
  title_ko    text NOT NULL,
  data        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE korea_travel_content.content_items ENABLE ROW LEVEL SECURITY;
```

예시 공개 읽기 정책:

```sql
CREATE POLICY "published content is readable"
ON korea_travel_content.content_items
FOR SELECT
TO anon, authenticated
USING ((data->>'publish_state') = 'published');
```

예시 운영자 쓰기 정책은 인증/역할 모델이 확정된 뒤 추가한다. 회원/관리자 모델이 확정되기 전에는 쓰기 정책을 넓게 열지 않는다.

## 3. 요청자에게 전달할 정보

관리자는 스키마 생성 완료 후 개발자에게 아래 정보만 전달한다.

| 항목 | 값 |
| --- | --- |
| 스키마명 | `korea_travel_content` |
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` |
| Supabase Key | Pro: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, Free: `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

비밀키 또는 service role key는 클라이언트 앱에 전달하지 않는다.

## 4. 개발자 연동 방식

```ts
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key, {
  db: { schema: "korea_travel_content" },
});
```

코드에서는 스키마 prefix 없이 테이블명만 사용한다.

```ts
const { data, error } = await supabase
  .from("content_items")
  .select("*");
```

SQL Editor, migration, RPC, raw SQL에서는 반드시 스키마를 명시한다.

```sql
SELECT * FROM korea_travel_content.content_items;
```

## 5. 본 서비스 적용 범위

| 데이터 영역 | 배치 |
| --- | --- |
| 콘텐츠 원장 | `korea_travel_content.content_items`, `regions`, `foods`, `attractions` |
| 영상 영감 | `korea_travel_content.video_inspirations` |
| 이미지 권리 | `korea_travel_content.image_slots`, `sources` |
| 운영 큐 | `korea_travel_content.review_tasks`, `review_logs`, `duplicate_candidates` |
| 검색 읽기 모델 | `korea_travel_content.content_search_documents` |
| 추천 feature | `korea_travel_content.recommendation_features` |
| 온톨로지 | `korea_travel_content.trip_ontology_terms`, `trip_graph_nodes`, `trip_graph_edges`, `trip_relation_assertions`, `trip_graph_quality_findings` |

## 6. 체크리스트

- [ ] 스키마명이 snake_case ASCII인지 확인
- [ ] SQL Editor에서 `CREATE SCHEMA`와 default privileges 실행
- [ ] Data API Exposed schemas에 `korea_travel_content` 등록
- [ ] 테이블 생성 SQL에 `korea_travel_content.` prefix 사용
- [ ] 모든 공개/운영 테이블에 RLS 활성화
- [ ] public 읽기 정책과 admin 쓰기 정책을 분리
- [ ] 클라이언트 `createClient`에 `db.schema` 설정
- [ ] 코드에서는 `.from("table_name")`만 사용
- [ ] SQL 직접 실행과 migration에는 스키마명 명시
- [ ] publishable/anon key만 클라이언트 환경 변수에 사용
