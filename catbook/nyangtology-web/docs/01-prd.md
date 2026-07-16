# PRD — 냥톨로지 풀스택 서비스 (반려모 초보집사)

> requestId: `2026-07-08-nyantology-novice-owner-web-service`  
> SSOT: EPIC-#, FEAT-#, REQ-#  
> **통합 비전**: [nyangtology_fullstack_plan_integrated.md](./nyangtology_fullstack_plan_integrated.md)  
> MVP 캡슐: [README.md](../README.md)

---

## 1. 개요

### 1-1. 목적

냥톨로지 온톨로지·지식그래프를 기반으로, 초보집사가 **관찰·기록·콘텐츠·추천**까지 이어지는 풀스택 반려묘 케어 플랫폼의 제품 요구사항을 정의한다. 본 PRD는 통합 기획서를 **Phase별 실행 스펙**으로 분해한 문서다.

### 1-2. 배경·문제

| 문제 | 현재 | 냥톨로지 해결 |
| --- | --- | --- |
| 행동 단정 | 검색·SNS 단편 답 | 신호→환경→관찰→집사 행동 구조 |
| 불안 | 건강 신호 오해 | 비진단·기록·상담 준비 |
| 단절 | 콘텐츠와 일상 분리 | 기록→패턴→챕터·카드 추천 순환 |
| 도구 부재 | MCP는 Agent 전용 | 모바일 웹·PWA 보호자 UI |

MCP SSOT: 956 노드, 11 Scenario, 42 Chapter, 1304 Source, 4 safety rules.

### 1-3. 핵심 카피

> **고양이 행동을 정답으로 단정하지 않고, 집사가 관찰할 순서로 바꿔드립니다.**

### 1-4. 관련 문서

- [통합 기획서](./nyangtology_fullstack_plan_integrated.md) — Full service SSOT
- [Decision Log](./00-decision-log.md) · [TRD](./02-trd.md) · [IA](./03-ia-brief.md) · [TASKS](./07-tasks.md)
- `catbook/mcp/service-definition.md` · `ontology-analysis.md`

---

## 2. 범위

### 2-1. 대상 시스템 / 도메인

| 모듈 | 설명 | Phase |
| --- | --- | --- |
| 사용자 앱 (MO Web/PWA) | 신호 번역·일기·메모·챕터·카드 | 1~3 |
| AI/RAG 레이어 | 의도→노드→안전→답변·추천 | 2~3 |
| 온톨로지/지식그래프 | Scenario~Source 11 class | 1~ |
| 관리자 CMS | 노드·원고·카드·발행 | 4 |
| 냥톨로지 MCP | Agent read-only (동일 SSOT) | 현재 |

### 2-2. Phase 1 — MVP (In Scope, P0)

| ID | 영역 |
| --- | --- |
| REQ-001 | 홈: Scenario 11 + 검색 + 고집사 (통합 §4.1 1단계) |
| REQ-002 | 시나리오/신호 상세: checks, observe, 연결 개념 |
| REQ-003 | 개념 상세: beginner, neighborhood, keywords |
| REQ-004 | 근거: Source 메타 내부 유지, 사용자 UI 참고 영상 미제공 |
| REQ-005 | Safety 배너·/safety (통합 §12.3) |
| REQ-006 | /about, MCP 안내 |
| REQ-007 | MO 우선 반응형 PWA-ready |
| REQ-008 | SEO·OG |

### 2-3. Phase 2 — 사용자 기능 (통합 §15 Phase 2)

| ID | 영역 |
| --- | --- |
| REQ-101 | POST `/api/ask` — 자연어→노드 매칭 답변 |
| REQ-102 | Supabase Auth + 고양이 프로필 (`cats`) |
| REQ-103 | 행동 일기 (`care_logs`) — 통합 §4.4 |
| REQ-104 | 세 줄 메모 (`health_observations`) — §4.5 |
| REQ-105 | 원고 챕터 뷰어 42 — §4.8 |
| REQ-106 | 초보 집사 준비 10가지 |

### 2-4. Phase 3 — 개인화 (통합 §15 Phase 3)

| ID | 영역 |
| --- | --- |
| REQ-201 | GET `/api/recommendations` — 기록 기반 추천 §4.10 |
| REQ-202 | 집 안 환경 점검 + 안심 점수 — §4.2 |
| REQ-203 | 노묘 케어 모드 — §4.6 |
| REQ-204 | 다묘·합사 모드 — §4.7 |
| REQ-205 | pgvector RAG 검색 — §9.3 |

### 2-5. Phase 4 — 관리자 (통합 §5)

| ID | 영역 |
| --- | --- |
| REQ-301 | Admin: nodes/edges/chapters CRUD |
| REQ-302 | 카드뉴스·숏폼 대본 생성 — §5.3 |
| REQ-303 | safety-check·발행 — §5.4 |
| REQ-304 | 콘텐츠 파이프라인 — §11 |

### 2-6. Phase 5 — 확장·BM (통합 §13·§15 Phase 5)

유료 구독, PDF 리포트, 가족 공유, B2B API, 네이티브 앱 — Human Conductor 별도 PRD.

### 2-7. MVP 제외 (Phase 1 Out of Scope)

- Auth, 프로필, 일기, ask RAG, Admin, 유료, 푸시
- 온톨로지 편집·임의 SPARQL
- YouTube 임베드·재호스팅·외부 참고 영상 링크 노출

---

## 3. 주요 내용 · 개선 사항

### 3-1. EPIC-1 — 초보집사 질문 탐색 (FEAT-scenario-home)

**요약**: 보호자가 일상 한국어 질문으로 서비스에 진입한다.

**상세**

- FEAT-scenario-home-01: 11 Scenario를 카드 그리드로 노출 (label, summary 1줄)
- FEAT-scenario-home-02: 검색창 — `catbook_search_nodes` class=Scenario 우선
- FEAT-scenario-home-03: 인기 질문 Top 10 (README 예시 질문表 재사용)
- FEAT-scenario-home-04: 고집사 환영 메시지 + "진단이 아닌 관찰 도우미" 고지

**완료 기준**: 홈에서 임의 Scenario 3종 클릭 시 상세 URL 도달, 검색 "하악" 시 관련 Scenario 1건 이상

### 3-2. EPIC-2 — 맥락·근거 탐색 (FEAT-scenario-detail, FEAT-concept-detail, FEAT-evidence)

**요약**: 시나리오→신호→근거로 2~3클릭 탐색.

**상세**

- FEAT-scenario-detail-01: checks[] 체크리스트 UI (읽기 전용, 저장 없음)
- FEAT-scenario-detail-02: STARTS_WITH 엣지로 연결된 CatSignal, Need, CareAction, HealthObservation 카드
- FEAT-concept-detail-01: beginner, observe[], keywords, evidence_count
- FEAT-evidence-01: Source/evidence 메타는 내부 API와 ontology 검증용으로 유지
- FEAT-evidence-02: 콘텐츠 페이지의 참고 영상 영역은 검수 정책에 따라 **미제공 안내**만 표시

**완료 기준**: `scenario:sudden_run` 상세에서 signal:zoomies가 노출되고, 개념 상세의 참고 영상 영역은 외부 링크 없이 미제공 안내로 표시된다.

### 3-3. EPIC-3 — 안전·신뢰 (FEAT-safety, FEAT-trust)

**요약**: 비진단 정책을 UI·카피·법무 페이지로 고정.

**상세**

- FEAT-safety-01: `medical: true` 또는 class HealthObservation/SafetyRisk 시 상단 sticky 배너
- FEAT-safety-02: CONSULT_WHEN 관계가 있으면 "전문가 상담 준비" CTA (예약 아님)
- FEAT-trust-01: `/about`, `/safety` 정적 페이지
- FEAT-trust-02: ontology schema_version, content snapshot date footer

**완료 기준**: health:litter_change 상세에서 safety 배너 + safety note 문구 표시

### 3-4. EPIC-4 — 운영·확장 (FEAT-ops) — Phase 1

- FEAT-ops-01~03: health, snapshot header, Vercel preview (기존)

### 3-5. EPIC-5 — 신호 번역기 (Phase 2, REQ-101)

통합 §4.1. POST `/api/ask` — summary, observe, care_action, matched_nodes, related chapters/cards.

**2026-07-08 구현 메모**: 현재 `/api/ask`는 사용자 저장 없이 SQLite ontology bridge를 호출하는 read-only 선구현이다. 응답은 프론트엔드 관례에 맞춰 `scenario`, `matchedNodes`, `answer.summary`, `answer.observe`, `answer.careActions`, `answer.recordGuide`, `answer.safetyNote`를 제공한다. 고양이 프로필, 행동 기록 저장, RAG 답변 고도화는 Phase 2 최종 범위로 남긴다.

### 3-6. EPIC-6 — 기록·프로필 (Phase 2, REQ-102~104)

- FEAT-cat-profile: cats 테이블, 성격 태그 §4.3
- FEAT-care-log: 행동 일기 §4.4
- FEAT-vet-note: 세 줄 메모 §4.5

### 3-7. EPIC-7 — 콘텐츠 소비 (Phase 2~3)

- FEAT-chapter-reader: 7 Part / 42 Chapter MO 매거진 §4.8
- FEAT-card-feed: 카드뉴스 7종 §4.9 — Codex `imagegen-frontend-web` / `brandkit`

### 3-8. EPIC-8 — 개인화·환경 (Phase 3)

- FEAT-env-check: 안심 점수 §4.2
- FEAT-senior-mode / FEAT-multi-cat: §4.6·§4.7
- FEAT-recommend: §4.10

### 3-9. EPIC-9 — Admin CMS (Phase 4)

통합 §5: ontology admin, content generator, safety-check, publish.

---

## 4. 정책 · 흐름도

### 4-1. 콘텐츠·Safety 정책

| 정책 ID | 내용 | REQ |
| --- | --- | --- |
| POL-01 | 진단·처방·치료 단정 금지 | REQ-005 |
| POL-02 | 건강 = 관찰·기록·상담 준비 | REQ-005, REQ-104 |
| POL-03 | Source 메타는 내부 유지, 사용자 화면의 YouTube 참고 영상 링크는 미제공 | REQ-004 |
| POL-04 | Phase 1: 익명 탐색 only | REQ-001 |
| POL-05 | 고집사 톤 — 단정 금지 | 전 Phase |
| POL-06 | AI/RAG는 내부 노드 통과만 | REQ-101, §9.1 |
| POL-07 | 금지/허용 답변 톤 — 통합 부록 B | Admin safety-check |

### 4-2. Full Service 흐름 (통합 §0)

```text
질문 → 신호 매칭 → 욕구/상태 → 환경 점검 → 집사 행동 → 기록 → 패턴 → 추천 → 그래프 개선
```

### 4-2a. Phase 1 MVP 흐름

```text
[유입] → [홈 Scenario/검색] → [상세 checks] → [신호 observe] → [참고 영상 미제공 안내]
  → (건강) Safety 배너 → /safety
```

### 4-3. 성공 지표

| 지표 | Phase | 목표 |
| --- | --- | --- |
| NS-01 시나리오→개념 상세 도달률 | 1 | ≥ 35% |
| NS-02 질문 입력 수 | 2+ | WAU 기준 |
| NS-03 기록 저장 수 | 2+ | habit |
| IN-01 홈→시나리오 CTR | 1 | ≥ 50% |
| IN-02 Safety 배너 정확도 | 1 | 100% |
| IN-03 질문 미매칭률 | 2+ | 온톨로지 보강 트리거 |
| IN-04 카드 공유 수 | 3+ | 확산 |

---

## 5. 특이사항

- MCP `catbook_search_nodes`는 기본적으로 Source 노드 제외 — 웹 검색 UX와 동일 정책 유지
- ontology 스냅샷 갱신 시 웹·MCP 동시 배포 필요 (RISK-02)
- 소개页 `nyantology-intro-minimal.html` 컬러·고집사 톤을 Design System에 계승

---

## 6. 디자인 시안 (UI 과제)

| 화면 | 설명 | 상태 |
| --- | --- | --- |
| 홈 | Scenario 카드 + 검색 + 고집사 hero | (초안) IA·Design System 참조 |
| 시나리오 상세 | checks, 연결 카드, safety | (초안) |
| 신호 상세 | observe chips, 참고 영상 미제공 안내 | (초안) |
| 모바일 | 하단 탭: 홈 / 탐색 / 안전 | (초안) |

시각 레퍼런스: `work-requests/2026-07-07-nyantology-intro-page/artifacts/nyantology-intro-minimal.html`

PC/모바일 와이어는 [06-design-system.md](./06-design-system.md), [03-ia-brief.md](./03-ia-brief.md) 참조.

### 6-1. 모바일 Design Read

**Design Read**: 냥톨로지는 진단 앱도, 귀여운 반려동물 쇼핑몰도 아니라 **초보 집사가 차분히 관찰 순서를 읽고 따라가는 따뜻한 고급 편집형 모바일 웹**으로 설계한다. `high-end-visual-design` 중 Editorial Luxury 방향을 적용하되, 과한 테크 글래스·네온·의료 경고 톤은 쓰지 않는다.

| 항목 | 방향 |
| --- | --- |
| Primary Skill | `high-end-visual-design` |
| 보조 Skill | Hero·모바일 comp 필요 시 `imagegen-frontend-mobile`, 브랜드/OG 필요 시 `brandkit` |
| 시각 톤 | 고급 편집 매거진 + 조용한 반려묘 케어 가이드 + 정교한 nested surface |
| 고집사 역할 | 수의사·진단자가 아니라 옆에서 관찰 순서를 정리해주는 안내자 |
| 핵심 감정 | 불안을 키우지 않고, "무엇을 먼저 관찰할지"를 차분히 알려주는 안도감 |

**모바일 화면 원칙**

- 배경은 따뜻한 오프화이트·종이 톤을 기본으로 한다.
- 제목과 핵심 문장은 짙은 녹흑색으로 잡고, 순검정·강한 원색은 피한다.
- Scenario, Signal, HealthObservation, CareAction, Need 구분은 연한 파스텔 배지로만 처리한다.
- 카드는 납작한 1px 박스가 아니라 outer shell + inner core 느낌의 nested surface로 만든다.
- 그림자는 강하게 띄우지 않고, 종이·트레이 같은 아주 부드러운 ambient shadow만 쓴다.
- 모션은 `cubic-bezier(0.32, 0.72, 0, 1)` 계열의 느린 transform/opacity 전환을 기본으로 한다.
- 건강·안전 맥락은 의료 앱처럼 위협적으로 보이지 않게 하되, SafetyBanner와 `/safety` 링크는 항상 명확해야 한다.

**모바일 첫 화면 권장 구조**

1. 상단: `냥톨로지` 로고 타입 + 검색 아이콘
2. Hero: "고양이 행동을 관찰 순서로 바꿔드립니다"
3. 검색 박스: "예: 밤마다 울어요"
4. Scenario 카드: 1열 스크롤, summary 2줄 제한
5. Bottom Tab: 홈 / 탐색 / 안전

**금지 방향**

- 보라색 SaaS 그라데이션, 네온, 3D glassmorphism
- 병원·의료 앱처럼 보이는 강한 경고 UI
- 과하게 귀엽거나 장난감 같은 펫앱 스타일
- 둥근 카드·큰 그림자·캐러셀 중심의 앱스토어식 UI
- generic 3-column Bootstrap 카드, 기본 `ease` 전환, 진한 drop shadow
- "진단", "처방", "치료"처럼 자가진단으로 오해될 수 있는 시각 언어

### 6-2. 관련 콘텐츠 이미지 생성 요건

아래 항목은 **Codex/Cursor 이미지 스킬**로 섹션별 레퍼런스를 만든 뒤 구현한다 (`docs/design-taste-skill-guide.md`, D-13).

| ID | 자산 | Skill | MVP |
| --- | --- | --- | --- |
| IMG-01 | 홈 Hero — 고집사 + Scenario 진입 | `imagegen-frontend-web` | P0 |
| IMG-02 | `/about` — 서비스·MCP 소개 섹션 | `imagegen-frontend-web` | P1 |
| IMG-03 | 모바일 홈·탭바 comp | `imagegen-frontend-mobile` | P1 |
| IMG-04 | OG / SNS 공유 1200×630 | `brandkit` | P1 |
| IMG-06 | 카드뉴스 템플릿 (7종) | `imagegen-frontend-web` + `brandkit` | Phase 2 |
| IMG-07 | 챕터 매거진 커버 | `imagegen-frontend-mobile` | Phase 2 |

**생성 규칙**

- `imagegen-frontend-web`: **섹션 1개 = 이미지 1장** (여러 섹션을 한 장에 압축 금지)
- 구현 단계: 생성 이미지 확정 후 `image-to-code`로 HTML/CSS 반영
- **금지**: YouTube `content_items` 썸네일 AI 재생성, 건강·진단 연상 의료 일러스트, 고양이 실사 manipulation

**산출물 경로**: `catbook/nyangtology-web/artifacts/images/{section-slug}/`
