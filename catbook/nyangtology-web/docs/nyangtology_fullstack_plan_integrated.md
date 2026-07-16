# 냥톨로지 풀스택 서비스 통합 기획서

> **버전:** v1.0  
> **문서 목적:** MVP가 아닌 전체 서비스 기준의 풀스택 서비스 기획, 아키텍처, 기능, DB/API, 관리자, AI/RAG, 운영 로드맵 통합 정리  
> **서비스 방향:** 고양이를 진단하는 앱이 아니라, 집사가 더 잘 관찰하고 기록하도록 돕는 지식그래프 기반 반려묘 케어 플랫폼  
> **실행 분해 문서:** [00-decision-log.md](./00-decision-log.md) · [01-prd.md](./01-prd.md) · [07-tasks.md](./07-tasks.md) (Phase별)

---

## 0. Executive Summary

**냥톨로지**는 고양이 행동·환경·건강 관찰·집사 행동을 온톨로지/지식그래프로 연결하고, 집사별 기록을 바탕으로 맞춤형 돌봄 가이드와 콘텐츠를 제공하는 풀스택 서비스다.

핵심 구조는 다음과 같다.

```text
사용자 질문
→ 고양이 신호 매칭
→ 욕구/상태 해석
→ 환경 요소 점검
→ 집사 행동 제안
→ 기록 저장
→ 패턴 분석
→ 콘텐츠/체크리스트/상담 메모 추천
→ 다시 지식그래프 개선
```

즉, 냥톨로지는 단순 콘텐츠 앱이 아니라 **질문, 관찰, 기록, 콘텐츠, 관리자 생성도구가 연결된 순환형 지식 서비스**다.

---

## 1. 서비스 정의

### 1.1 한 줄 정의

**냥톨로지 = 고양이 행동을 정답으로 단정하지 않고, 집사가 관찰할 순서로 바꿔주는 지식그래프 기반 반려묘 케어 플랫폼**

### 1.2 핵심 가치

| 구분 | 내용 |
|---|---|
| 문제 | 초보 집사는 고양이 행동을 단정하거나 인터넷 검색으로 불안해진다. |
| 해결 | 행동을 신호·환경·관찰·집사 행동으로 구조화한다. |
| 차별점 | 답변 중심이 아니라 온톨로지 기반 탐색과 기록 중심이다. |
| 안전 기준 | 건강 관련 내용은 진단·처방이 아니라 관찰·기록·상담 준비로 제한한다. |
| 확장성 | 사용자 기록이 다시 지식그래프·콘텐츠·추천으로 연결된다. |

### 1.3 서비스 핵심 카피

> **고양이 행동을 정답으로 단정하지 않고, 집사가 관찰할 순서로 바꿔드립니다.**

또는

> **고양이 신호를 읽고, 집사의 행동으로 바꾸는 지식 지도.**

---

## 2. 사용자 및 사용 시나리오

### 2.1 핵심 사용자

| 사용자 | 주요 니즈 |
|---|---|
| 초보 집사 | 고양이 행동이 무슨 뜻인지 알고 싶다. |
| 다묘 집사 | 놀이인지 싸움인지, 합사 문제인지 알고 싶다. |
| 노묘 집사 | 느린 변화, 식욕, 물, 화장실 변화를 기록하고 싶다. |
| 보호자 가족 | 가족끼리 돌봄 기록을 공유하고 싶다. |
| 콘텐츠 운영자 | 원고를 카드뉴스, 숏폼, 웹페이지로 재활용하고 싶다. |
| 수의/행동 전문가 협업자 | 보호자 기록을 구조화해서 상담 품질을 높이고 싶다. |

### 2.2 대표 사용자 시나리오

#### 시나리오 A. 고양이가 숨어요

```text
사용자 입력: 고양이가 숨어요

서비스 흐름:
1. signal:hiding 매칭
2. need:safety 연결
3. environment:hideout 연결
4. action:context_record 제안
5. 물·화장실 접근성 확인 안내
6. 행동 일기로 저장
```

#### 시나리오 B. 밥을 안 먹어요

```text
사용자 입력: 밥을 안 먹어요

서비스 흐름:
1. health:appetite_change 매칭
2. environment:food_place 확인
3. action:vet_notes 제안
4. 언제부터 / 무엇이 / 얼마나 세 줄 메모 생성
5. 필요 시 상담 준비 안내
```

#### 시나리오 C. 놀이인지 싸움인지 모르겠어요

```text
사용자 입력: 놀이인지 싸움인지 모르겠어요

서비스 흐름:
1. signal:fight_or_play 매칭
2. 서로 번갈아 추격하는지 확인
3. 소리와 털 세움 확인
4. 끝난 뒤 회복 시간 확인
5. 한쪽만 계속 도망가면 공간 분리 제안
```

---

## 3. 전체 서비스 구성

### 3.1 서비스 모듈

```text
냥톨로지 서비스
├─ 사용자 앱 / 모바일 웹
│  ├─ 고양이 신호 번역기
│  ├─ 집 안 환경 점검
│  ├─ 고양이 프로필
│  ├─ 행동 일기
│  ├─ 건강 관찰
│  ├─ 병원 상담용 세 줄 메모
│  ├─ 노묘 케어 모드
│  ├─ 다묘·합사 모드
│  ├─ 오늘의 챕터
│  └─ 카드뉴스/콘텐츠 피드
│
├─ AI/RAG 레이어
│  ├─ 질문 의도 분류
│  ├─ 온톨로지 노드 매칭
│  ├─ 안전 필터
│  ├─ 답변 생성
│  └─ 콘텐츠 추천
│
├─ 온톨로지/지식그래프
│  ├─ Scenario
│  ├─ CatSignal
│  ├─ Need
│  ├─ EnvironmentElement
│  ├─ HealthObservation
│  ├─ CareAction
│  ├─ SafetyRisk
│  ├─ Chapter
│  └─ Source
│
└─ 관리자 CMS
   ├─ 노드/엣지 관리
   ├─ 원고 챕터 관리
   ├─ 카드뉴스 생성
   ├─ 숏폼 대본 생성
   ├─ 안전 필터 검사
   └─ 발행 관리
```

---

## 4. 사용자 서비스 상세 기능

## 4.1 고양이 신호 번역기

사용자가 자연어로 입력하면 내부 온톨로지 노드에 매칭한다.

### 입력 예시

```text
고양이가 갑자기 뛰어요
고양이가 숨어요
하악질을 해요
놀이인지 싸움인지 모르겠어요
물을 갑자기 많이 마셔요
밥을 안 먹어요
```

### 출력 구성

| 영역 | 내용 |
|---|---|
| 가능한 신호 | 매칭된 CatSignal 또는 HealthObservation |
| 관찰 포인트 | observe 항목 |
| 관련 환경 | 물그릇, 화장실, 숨을 곳, 이동장 등 |
| 집사 행동 | 멈춤, 거리 두기, 위치 조정, 기록하기 |
| 기록 안내 | 전후 맥락 기록 또는 세 줄 메모 |
| 관련 원고 | 챕터 추천 |
| 관련 카드 | 카드뉴스 추천 |

### 예시 출력

```text
질문: 고양이가 숨어요

가능한 신호:
- 숨기 / 숨어 있기

관찰할 것:
- 새 환경 여부
- 숨은 위치의 안정성
- 식욕/배변 동반 변화

집사 행동:
- 억지로 꺼내지 않기
- 나올 길 열어두기
- 물과 화장실 접근성 확인하기
```

---

## 4.2 집 안 환경 점검

고양이 문제를 고양이 성격으로만 보지 않고, 집 안 구조를 점검한다.

### 점검 항목

| 영역 | 체크 |
|---|---|
| 숨을 곳 | 억지로 꺼내지 않아도 되는 공간이 있는가 |
| 물그릇 | 여러 지점에 있는가 |
| 밥자리 | 사람 동선에서 떨어져 있는가 |
| 화장실 | 위치·청결·개수·접근성이 괜찮은가 |
| 이동장 | 평소 열려 있는 작은 방처럼 쓰이는가 |
| 문·창문 | 방묘·탈출 위험이 점검되어 있는가 |
| 위험물 | 작은 물건, 끈, 문틈, 창문 위험이 제거되어 있는가 |

### 결과 예시

```text
우리집 안심 점수: 72점

개선 우선순위:
1. 물그릇 위치 추가
2. 이동장 상시 개방
3. 화장실 접근 동선 점검
```

---

## 4.3 고양이 프로필

고양이별 기록과 추천을 개인화하기 위한 기본 단위다.

### 입력 항목

| 항목 | 예시 |
|---|---|
| 이름 | 츄르 |
| 나이 | 5살 |
| 성별 | 암컷 |
| 묘종 | 코숏 / 브리티시숏헤어 등 |
| 성격 태그 | 조심스러움, 창가 선호, 낯가림 |
| 주요 이슈 | 숨기, 식욕 변화, 물그릇 위치 |
| 다묘 여부 | 단묘 / 다묘 |
| 노묘 여부 | 나이 기준 또는 직접 설정 |

---

## 4.4 행동 일기

매일 짧게 기록하고 패턴을 만든다.

### 입력 구조

```text
오늘 행동: 숨어 있음
전후 맥락: 손님 방문 후
동반 변화: 밥은 먹음, 화장실 정상
집사 행동: 숨을 곳 유지, 억지로 꺼내지 않음
회복 시간: 2시간 후 나옴
```

### 분석 예시

```text
오늘은 '새 환경/소리 후 숨기' 패턴으로 보입니다.
다음에도 손님 방문 전후로 숨을 곳과 물·화장실 동선을 확인해보세요.
```

---

## 4.5 병원 상담용 세 줄 메모

건강 관련 기능은 진단이 아니라 상담 준비로 제한한다.

### 입력

| 항목 | 예시 |
|---|---|
| 언제부터 | 어제 저녁부터 |
| 무엇이 | 밥을 절반만 먹고 숨어 있음 |
| 얼마나 | 평소보다 활력이 줄고 물도 덜 마심 |

### 출력

```text
1. 언제부터: 어제 저녁부터
2. 무엇이: 밥을 절반만 먹고 숨어 있음
3. 얼마나: 평소보다 활력이 줄고 물도 덜 마심
```

### 확장 기능

- 사진 첨부
- 영상 첨부
- 화장실 기록 첨부
- PDF 생성
- 가족 공유
- 병원 상담용 링크 생성

---

## 4.6 노묘 케어 모드

`노묘의 느린 변화`를 중심으로 장기 관찰 모드를 제공한다.

### 체크 항목

```text
□ 점프 높이가 낮아짐
□ 잠자리가 바뀜
□ 화장실 접근을 망설임
□ 식욕이 변함
□ 물 마시는 양이 변함
□ 느려짐을 나이 탓으로만 넘기지 않았는가
```

### 결과

- 주간 변화 요약
- 세 줄 메모 자동 초안
- 관련 챕터 추천
- 집 안 동선 개선 제안

---

## 4.7 다묘·합사 모드

다묘 가정에서 놀이와 싸움, 합사 진행을 기록한다.

### 기능

| 기능 | 설명 |
|---|---|
| 놀이 vs 싸움 체크 | 추격 방향, 소리, 털 세움, 회복 시간 확인 |
| 합사 단계 기록 | 냄새 교환, 문 너머 식사, 분리 공간 |
| 첫째 스트레스 기록 | 숨기, 식욕 변화, 화장실 변화 |
| 공간 분리 타이머 | 회복 시간 확보 |
| 관계 리포트 | 주간 다묘 상호작용 요약 |

### 놀이 vs 싸움 판별 기준

| 관찰 포인트 | 놀이에 가까움 | 갈등에 가까움 |
|---|---|---|
| 추격 방향 | 서로 번갈아 추격 | 한쪽만 계속 도망 |
| 소리·몸 상태 | 비교적 조용하고 금방 멈춤 | 큰 소리, 털 세움, 긴장 지속 |
| 끝난 뒤 반응 | 다시 가까이 있거나 금방 회복 | 한쪽이 숨고 오래 회복 못함 |

---

## 4.8 오늘의 챕터 / 원고 읽기

내부 원고의 7개 파트, 42개 챕터를 모바일 매거진 형태로 제공한다.

### 파트 구성

| 파트 | 제목 | 방향 |
|---|---|---|
| Part 1 | 웃다가 배우는 고양이 생활 | 생활 |
| Part 2 | 집 안에 놓는 안심 | 환경 |
| Part 3 | 마음의 속도를 맞추는 일 | 관계 |
| Part 4 | 몸이 보내는 작은 알림 | 건강 관찰 |
| Part 5 | 같이 산다는 것의 거리 | 다묘·합사 |
| Part 6 | 오래 같이 살기 위한 책임 | 안전·노묘 |
| Part 7 | 고양이라는 종을 더 정확히 보기 | 지식 |

### 콘텐츠 포맷

```text
오늘의 챕터
제목: 이동장은 감옥이 아니라 방이어야 한다
요약: 이동장은 병원 가는 날만 등장하면 공포가 된다.
집사 행동: 평소 열어두고 담요·냄새·보상 경험 만들기
체크: 우리집 이동장은 지금 어디에 있나요?
```

---

## 4.9 카드뉴스 / 이미지 카드

서비스 내 공유형 콘텐츠다.

### 카드 유형

- 초보 집사 준비 카드
- 행동 신호 카드
- 건강 관찰 카드
- 다묘 관계 카드
- 노묘 케어 카드
- 병원 상담 메모 카드
- 집 안 환경 체크 카드

### 공유 기능

```text
이미지 저장
카카오톡 공유
인스타 스토리 공유
PDF 저장
보호자 가족에게 공유
```

---

## 4.10 콘텐츠 추천

사용자 기록을 기반으로 관련 챕터와 행동을 추천한다.

### 예시

```text
최근 기록:
- 숨기 3회
- 손님 방문 후 회복 2시간
- 밥은 정상

추천 콘텐츠:
1. 소파 밑 38센티미터
2. 이름을 부르지 않는 인사
3. 같은 방에 머무는 신뢰

추천 집사 행동:
1. 숨을 곳 유지
2. 물·화장실 동선 확인
3. 전후 맥락 기록
```

---

# 5. 관리자 서비스

## 5.1 관리자 대시보드

```text
관리자 대시보드
├─ 온톨로지 노드 관리
├─ 온톨로지 관계 관리
├─ 원고 챕터 관리
├─ 콘텐츠 근거 관리
├─ 카드뉴스 생성
├─ 숏폼 대본 생성
├─ 안전 필터 검사
├─ 사용자 기록 통계
└─ 발행 관리
```

---

## 5.2 온톨로지 관리자

### 관리 대상

| 타입 | 설명 |
|---|---|
| Scenario | 초보자 질문 입구 |
| CatSignal | 보호자가 눈으로 보는 행동 신호 |
| Need | 신호 뒤에 있을 수 있는 욕구/상태 |
| EnvironmentElement | 집 안 환경 요소 |
| HealthObservation | 진단이 아닌 건강 관찰 항목 |
| CareAction | 집사가 할 수 있는 행동 |
| SafetyRisk | 안전/윤리 리스크 |
| Topic | 콘텐츠 주제 |
| BookPart | 원고 파트 |
| Chapter | 원고 챕터 |
| Source | 근거 콘텐츠 메타 |

---

## 5.3 콘텐츠 생성 관리자

내부 노드와 원고를 기반으로 다양한 콘텐츠를 생성한다.

| 생성물 | 예시 |
|---|---|
| 카드뉴스 | “숨을 곳 먼저” |
| 모바일 글 | 챕터형 웹페이지 |
| 숏폼 대본 | 15초 릴스 대본 |
| 썸네일 문구 | “하악질은 나쁜 성격이 아닙니다” |
| FAQ | 초보 집사 질문 답변 |
| 푸시 알림 | “오늘은 물그릇 위치를 확인해보세요” |

---

## 5.4 안전 필터 관리자

건강 관련 표현은 반드시 제한한다.

### 금지 표현

```text
진단합니다
치료하세요
약을 먹이세요
병명은 OOO입니다
정상입니다
문제없습니다
이 약을 쓰세요
```

### 허용 표현

```text
관찰해보세요
기록해보세요
반복되면 상담 준비가 필요합니다
언제부터·무엇이·얼마나 달라졌는지 정리하세요
집사가 확인할 수 있는 변화입니다
```

---

# 6. 전체 기술 아키텍처

## 6.1 추천 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | Next.js / React |
| Mobile UI | PWA 우선, 추후 앱 전환 |
| Backend | Next.js API Routes 또는 NestJS |
| DB | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Vector Search | pgvector |
| Graph Data | PostgreSQL nodes/edges + RDF export |
| AI Layer | OpenAI API / 내부 RAG |
| Admin | Next.js Admin Dashboard |
| Hosting | Vercel |
| Batch/Worker | Supabase Edge Functions / Trigger.dev |
| Analytics | PostHog / Supabase logs |
| Styling | Tailwind CSS + Framer Motion |
| Monitoring | Sentry / Vercel Analytics |

---

## 6.2 전체 아키텍처

```text
[Mobile Web / PWA]
        ↓
[Next.js Frontend]
        ↓
[API Layer]
        ├─ Auth API
        ├─ Cat Profile API
        ├─ Ask API
        ├─ Log API
        ├─ Vet Note API
        ├─ Recommendation API
        └─ Admin API
        ↓
[Service Layer]
        ├─ Ontology Resolver
        ├─ Safety Filter
        ├─ RAG Answer Generator
        ├─ Recommendation Engine
        └─ Content Generator
        ↓
[Data Layer]
        ├─ Supabase PostgreSQL
        ├─ pgvector
        ├─ Storage
        └─ Audit Logs
        ↓
[Admin / CMS]
```

---

# 7. 데이터베이스 설계

## 7.1 users

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nickname text,
  created_at timestamptz default now()
);
```

## 7.2 cats

```sql
create table cats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  name text not null,
  birth_year int,
  sex text,
  breed text,
  is_senior boolean default false,
  personality_tags jsonb default '[]',
  created_at timestamptz default now()
);
```

## 7.3 ontology_nodes

```sql
create table ontology_nodes (
  id uuid primary key default gen_random_uuid(),
  node_id text unique not null,
  class_id text not null,
  label text not null,
  summary text,
  beginner text,
  observe jsonb default '[]',
  keywords jsonb default '[]',
  medical boolean default false,
  evidence_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 7.4 ontology_edges

```sql
create table ontology_edges (
  id uuid primary key default gen_random_uuid(),
  source_node_id text not null,
  target_node_id text not null,
  relation_id text not null,
  label text,
  confidence text,
  safety text,
  created_at timestamptz default now()
);
```

## 7.5 scenarios

```sql
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  scenario_id text unique not null,
  label text not null,
  description text,
  start_node_ids jsonb default '[]',
  created_at timestamptz default now()
);
```

## 7.6 care_logs

```sql
create table care_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  cat_id uuid references cats(id),
  log_type text,
  observed_signal text,
  context_before text,
  context_after text,
  appetite_status text,
  water_status text,
  litter_status text,
  energy_status text,
  care_action text,
  memo text,
  created_at timestamptz default now()
);
```

## 7.7 health_observations

```sql
create table health_observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  cat_id uuid references cats(id),
  observation_type text,
  started_at_text text,
  what_changed text,
  degree_text text,
  attachments jsonb default '[]',
  consult_ready boolean default false,
  created_at timestamptz default now()
);
```

## 7.8 memo_templates

```sql
create table memo_templates (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  fields jsonb default '[]',
  output_format text,
  created_at timestamptz default now()
);
```

## 7.9 generated_contents

```sql
create table generated_contents (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  source_node_id text,
  title text,
  body text,
  prompt text,
  status text default 'draft',
  created_by uuid,
  created_at timestamptz default now()
);
```

## 7.10 content_assets

```sql
create table content_assets (
  id uuid primary key default gen_random_uuid(),
  generated_content_id uuid references generated_contents(id),
  asset_type text,
  file_url text,
  thumbnail_url text,
  created_at timestamptz default now()
);
```

## 7.11 safety_audits

```sql
create table safety_audits (
  id uuid primary key default gen_random_uuid(),
  content_id uuid,
  input_text text,
  output_text text,
  risk_level text,
  blocked_terms jsonb default '[]',
  result text,
  created_at timestamptz default now()
);
```

---

# 8. API 설계

## 8.1 사용자 API

### 질문 입력

```http
POST /api/ask
```

Request:

```json
{
  "cat_id": "cat_123",
  "question": "고양이가 숨어요"
}
```

Response:

```json
{
  "scenario": "숨어요",
  "matched_nodes": [
    "signal:hiding",
    "environment:hideout",
    "need:safety",
    "action:context_record"
  ],
  "answer": {
    "summary": "숨는 행동은 겁쟁이 판정이 아니라 안전한 방, 냄새, 시간, 선택권의 문제일 수 있습니다.",
    "observe": ["새 환경 여부", "숨은 위치의 안정성", "식욕/배변 동반 변화"],
    "care_action": "억지로 꺼내지 말고 물과 화장실 접근성을 확인하세요."
  }
}
```

---

### 세 줄 메모 생성

```http
POST /api/vet-note
```

Request:

```json
{
  "cat_id": "cat_123",
  "when": "어제 저녁부터",
  "what": "밥을 절반만 먹음",
  "degree": "평소보다 활력이 줄었음"
}
```

Response:

```json
{
  "memo": "1. 언제부터: 어제 저녁부터\n2. 무엇이: 밥을 절반만 먹음\n3. 얼마나: 평소보다 활력이 줄었음"
}
```

---

### 행동 기록 저장

```http
POST /api/logs
```

Request:

```json
{
  "cat_id": "cat_123",
  "signal": "숨기",
  "context_before": "손님 방문",
  "context_after": "2시간 뒤 나옴",
  "care_action": "숨을 곳 유지"
}
```

---

### 맞춤 추천

```http
GET /api/recommendations?cat_id=cat_123
```

Response:

```json
{
  "recommended_chapters": [
    "소파 밑 38센티미터",
    "이름을 부르지 않는 인사",
    "고양이가 나를 좋아한다는 증거"
  ],
  "recommended_actions": [
    "숨을 곳 유지",
    "물·화장실 동선 확인",
    "전후 맥락 기록"
  ]
}
```

---

### 환경 점검 저장

```http
POST /api/environment-check
```

Request:

```json
{
  "cat_id": "cat_123",
  "hideout": true,
  "multiple_water_stations": false,
  "quiet_food_place": true,
  "litter_accessible": true,
  "carrier_open": false,
  "door_window_checked": true
}
```

Response:

```json
{
  "score": 72,
  "priorities": [
    "물그릇 위치 추가",
    "이동장 상시 개방"
  ]
}
```

---

## 8.2 관리자 API

```http
GET    /api/admin/nodes
POST   /api/admin/nodes
PATCH  /api/admin/nodes/:id
DELETE /api/admin/nodes/:id

GET    /api/admin/edges
POST   /api/admin/edges
PATCH  /api/admin/edges/:id
DELETE /api/admin/edges/:id

GET    /api/admin/chapters
POST   /api/admin/chapters

POST   /api/admin/generate-card
POST   /api/admin/generate-script
POST   /api/admin/generate-faq
POST   /api/admin/safety-check
POST   /api/admin/publish-content
```

---

# 9. AI / RAG 설계

## 9.1 핵심 원칙

AI가 자유롭게 답하지 않고, 반드시 내부 온톨로지 구조를 통과한다.

```text
사용자 질문
→ 의도 분류
→ 관련 Scenario 검색
→ 관련 Node 검색
→ Edge 관계 조회
→ 안전 필터 적용
→ 답변 생성
```

## 9.2 답변 생성 규칙

```text
1. 내부 노드 기반으로만 답변
2. 건강 관련은 진단·처방 금지
3. 관찰 항목 우선
4. 집사 행동 제안
5. 기록 양식 제공
6. 필요 시 전문가 상담 준비 표현
```

## 9.3 RAG 검색 순서

```text
1. Scenario label 검색
2. CatSignal / HealthObservation 검색
3. EnvironmentElement / Need 연결
4. CareAction 연결
5. Chapter 연결
6. Source metadata 연결
7. 안전 규칙 적용
```

## 9.4 답변 템플릿

```text
[요약]
이 행동은 OOO로 단정하기보다, OOO 관찰이 필요합니다.

[관찰할 것]
- A
- B
- C

[집사 행동]
- X
- Y

[기록]
언제부터 / 무엇이 / 얼마나 달라졌는지 적어보세요.
```

---

# 10. 프론트엔드 화면 설계

## 10.1 모바일 IA

```text
홈
├─ 질문하기
├─ 오늘의 체크
├─ 내 고양이
├─ 행동 일기
├─ 세 줄 메모
├─ 원고 읽기
├─ 카드뉴스
└─ 설정
```

## 10.2 주요 화면

### 홈

- 고양이 프로필 카드
- “오늘 어떤 행동이 있었나요?” 입력창
- 빠른 질문 버튼
- 오늘의 체크
- 추천 콘텐츠

### 질문 결과

```text
[질문] 고양이가 숨어요

[가능한 신호]
숨기 / 숨어 있기

[관찰할 것]
- 새 환경 여부
- 숨은 위치의 안정성
- 식욕/배변 동반 변화

[집사 행동]
억지로 꺼내지 말고 나올 길, 물, 화장실 접근성을 확인하세요.

[기록하기]
전후 맥락 기록하기
```

### 행동 일기

```text
오늘의 행동
□ 숨었어요
□ 하악질했어요
□ 갑자기 뛰었어요
□ 밥을 안 먹었어요
□ 물이 달라졌어요
□ 화장실이 달라졌어요

전후 맥락
[입력]

집사 행동
[선택]

저장
```

### 건강 관찰

```text
건강 관찰은 진단이 아니라 기록입니다.

관찰 항목
- 구토
- 식욕 변화
- 음수 변화
- 배변·배뇨 변화
- 체중 변화
- 그루밍 변화
- 노묘 변화

[세 줄 메모 만들기]
```

### 관리자

```text
관리자 대시보드
├─ 온톨로지 노드
├─ 관계 Edge
├─ 원고 챕터
├─ 콘텐츠 근거
├─ 카드뉴스 생성
├─ 숏폼 대본 생성
├─ 안전 필터 검사
└─ 발행 관리
```

---

# 11. 콘텐츠 파이프라인

```text
내부 원고 / 영상 메타
        ↓
노드 추출
        ↓
관계 생성
        ↓
안전 필터
        ↓
온톨로지 저장
        ↓
카드뉴스 / 웹페이지 / 답변 / 숏폼 대본 생성
```

## 11.1 콘텐츠 재활용 예시

```text
노드: signal:hissing
→ FAQ 답변
→ 카드뉴스
→ 숏폼 대본
→ 행동 일기 태그
→ 원고 챕터 연결
```

---

# 12. 보안 / 개인정보 / 안전 정책

## 12.1 개인정보

| 항목 | 처리 |
|---|---|
| 사용자 이메일 | 인증용 |
| 고양이 프로필 | 사용자별 비공개 |
| 행동 일기 | 기본 비공개 |
| 건강 관찰 | 민감 기록으로 별도 보호 |
| 첨부 사진/영상 | Storage 접근 제어 |
| 공유 링크 | 만료 시간 설정 권장 |

## 12.2 RLS 정책

Supabase 사용 시 Row Level Security 적용.

```sql
alter table cats enable row level security;
alter table care_logs enable row level security;
alter table health_observations enable row level security;
```

기본 원칙:

```text
본인 user_id와 연결된 데이터만 읽기/쓰기 가능
관리자는 별도 role 기반 접근
공유 링크는 제한된 read token 기반
```

## 12.3 안전 정책

- 건강 관련 결과는 “진단”으로 표현하지 않는다.
- 약물, 처방, 치료법을 직접 제안하지 않는다.
- 반복·심화되는 변화는 “상담 준비”로 안내한다.
- 위급 가능성이 있는 표현은 전문가 상담 안내를 우선한다.
- AI 답변은 안전 필터 로그에 남긴다.

---

# 13. BM / 수익 모델

## 13.1 무료

- 기본 신호 번역
- 초보 집사 준비 10가지
- 일부 카드뉴스
- 세 줄 메모 기본형
- 일부 원고 챕터

## 13.2 유료 구독

| 기능 | 설명 |
|---|---|
| 행동 일기 무제한 | 고양이별 장기 기록 |
| 패턴 리포트 | 주간/월간 행동 변화 요약 |
| 노묘 모드 | 노묘 변화 체크 |
| 다묘 모드 | 합사·싸움 기록 |
| PDF 리포트 | 병원 상담용 정리본 |
| 카드 저장 | 이미지 카드 저장/공유 |
| 가족 공유 | 가족 구성원 공동 기록 |

## 13.3 B2B

| 상품 | 대상 |
|---|---|
| 동물병원 상담 전 문진 링크 | 동물병원 |
| 반려동물 콘텐츠 API | 콘텐츠 플랫폼 |
| 카드뉴스/숏폼 생성 SaaS | 펫 브랜드 / 미디어 |
| 교육 콘텐츠 패키지 | 보호자 교육 기관 |
| 행동 기록 리포트 | 전문가 상담 연계 |

---

# 14. 운영 지표

## 14.1 사용자 지표

| 지표 | 의미 |
|---|---|
| 질문 입력 수 | 핵심 사용량 |
| 기록 저장 수 | 재방문/습관화 |
| 세 줄 메모 생성 수 | 건강 관찰 가치 |
| 고양이 프로필 생성 수 | 개인화 전환 |
| 카드 공유 수 | 콘텐츠 확산 |
| 주간 활성 사용자 | 서비스 유지력 |

## 14.2 콘텐츠 지표

| 지표 | 의미 |
|---|---|
| 많이 검색된 신호 | 콘텐츠 우선순위 |
| 많이 저장된 챕터 | 원고 가치 |
| 카드 공유율 | SNS 확산성 |
| 질문 미매칭률 | 온톨로지 보강 필요 |
| 안전 필터 차단률 | 위험 답변 관리 |

---

# 15. 개발 로드맵

## Phase 1. 기반 구축

- Supabase DB 설계
- 온톨로지 노드/엣지 적재
- 사용자/고양이 프로필
- 질문 검색 API
- 모바일 웹 기본 UI

## Phase 2. 사용자 기능

- 신호 번역기
- 초보 집사 준비 10가지
- 세 줄 메모
- 행동 일기
- 원고 챕터 뷰어

## Phase 3. 개인화

- 고양이별 패턴 분석
- 추천 챕터
- 추천 집사 행동
- 노묘 모드
- 다묘 모드

## Phase 4. 관리자

- 노드/엣지 관리
- 원고 관리
- 카드뉴스 생성
- 숏폼 대본 생성
- 안전 필터 검사

## Phase 5. 확장

- PWA 앱화
- PDF 리포트
- 병원 상담 공유
- 가족 계정
- 유료 구독
- API 상품화

---

# 16. 권장 개발 순서

MVP가 아니라 전체 서비스 기준이라도, 개발은 아래 순서가 안정적이다.

```text
1. 온톨로지 DB 적재
2. 질문 → 노드 매칭 API
3. 사용자/고양이 프로필
4. 행동 일기
5. 세 줄 메모
6. 원고 챕터 뷰어
7. 추천 엔진
8. 관리자 CMS
9. 콘텐츠 생성 도구
10. 유료화/공유/리포트
```

---

# 17. 최종 서비스 구조 요약

```text
냥톨로지
= 사용자용 고양이 신호 번역 앱
+ 집사 기록/패턴 관리
+ 건강 관찰 세 줄 메모
+ 원고 기반 콘텐츠 플랫폼
+ 관리자용 카드뉴스/숏폼 생성 CMS
+ 내부 온톨로지 API
```

핵심은 하나다.

> **고양이를 진단하는 서비스가 아니라, 집사가 더 잘 관찰하게 만드는 서비스.**

냥톨로지는 고양이 행동을 단정하지 않는다.  
대신 행동을 신호로 읽고, 신호를 환경과 연결하고, 집사가 할 수 있는 다음 행동과 기록으로 바꾼다.

그 기록은 다시 지식그래프를 보강하고, 다음 집사에게 더 나은 질문의 길을 열어준다.

---

## 부록 A. 핵심 내부 개념 예시

| 클래스 | 예시 |
|---|---|
| Scenario | 숨어요, 밥을 안 먹어요, 갑자기 뛰어요 |
| CatSignal | 우다다, 하악질, 숨기, 눈인사 |
| Need | 안전감, 거리 요청, 에너지 배출 |
| EnvironmentElement | 숨을 곳, 물그릇, 화장실, 이동장 |
| HealthObservation | 식욕 변화, 음수 변화, 배변·배뇨 변화, 구토 |
| CareAction | 전후 맥락 기록, 세 줄 메모, 천천히 소개하기 |
| SafetyRisk | 실종·탈출, 자가진단·처방 단정 |
| Chapter | 42개 원고 챕터 |
| Source | 영상/숏폼 공개 메타 기반 근거 |

---

## 부록 B. 금지/허용 답변 톤

### 금지

```text
이건 병입니다.
OOO 치료를 하세요.
OOO 약을 먹이세요.
정상입니다.
문제없습니다.
```

### 허용

```text
이 변화는 기록해볼 필요가 있습니다.
언제부터, 무엇이, 얼마나 달라졌는지 정리해보세요.
반복되거나 동반 변화가 있으면 상담 준비가 필요합니다.
집에서 먼저 확인할 수 있는 관찰 항목은 다음과 같습니다.
```
