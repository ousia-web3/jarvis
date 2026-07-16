# Decision Log — 냥톨로지 풀스택 서비스

> requestId: `2026-07-08-nyantology-novice-owner-web-service`  
> **통합 비전 SSOT**: [nyangtology_fullstack_plan_integrated.md](./nyangtology_fullstack_plan_integrated.md) v1.0

## 서비스 한 줄 (통합 기획 반영)

**고양이를 진단하는 앱이 아니라, 집사가 더 잘 관찰하고 기록하도록 돕는 지식그래프 기반 반려묘 케어 플랫폼**

## MVP 캡슐 (Phase 1 — read-only 탐색)

초보집사가 브라우저에서 11개 Scenario 질문으로 진입해, 연결된 CatSignal·CareAction을 **비진단·read-only** 정책 하에 탐색한다. Source 메타는 내부에 유지하되 사용자 화면의 참고 영상은 미제공 안내로 처리한다.

## 순환 구조 (Full Service — Phase 2+)

```text
질문 → 신호 매칭 → 관찰·행동 제안 → 기록 저장 → 패턴 분석 → 콘텐츠 추천 → 온톨로지 개선
```

---

| ID | 항목 | 선택 | 근거(1줄) | 영향(1줄) | 대안(1줄) | 보류안 |
| --- | --- | --- | --- | --- | --- | --- |
| D-01 | 서비스명 | **냥톨로지** (웹·앱 공통) | 통합 기획·MCP 브랜드 일치 | 고집사는 캐릭터/톤만 | 냥톨로지 웹 (별칭) | — |
| D-02 | MVP 진입 UX | **Scenario 11종 + 자연어 검색** | 통합 §4.1 신호 번역기 1단계 | Phase 1은 구조화 탐색 | POST /api/ask RAG | Phase 2 ask API |
| D-03 | 온톨로지 SSOT | **MCP SQLite 스냅샷 → PG 동기화** | MCP 검증 완료; Full은 PG 적재 | Phase 1 read SQLite; Phase 2+ sync | PG 단독 구축 | — |
| D-04 | 백엔드 (Full) | **Next.js API + Supabase PostgreSQL** | 통합 §6.1 | Auth·로그·RLS 일원화 | NestJS 분리 | — |
| D-04a | 백엔드 (MVP) | **Next.js + Python ontology_store bridge** | MCP safety 재사용 | Phase 1만; PG 선행 불필요 | — | — |
| D-05 | 프론트 | **Next.js App Router, PWA 우선** | 통합 §6.1·§10 | MO 웹 → 추후 앱 | RN 네이티브 | Phase 5 |
| D-06 | 사용자 데이터 | **Phase 1 무로그인 → Phase 2 Supabase Auth** | 통합 §7·§12 RLS | cats, care_logs 단계 도입 | 익명만 영구 | — |
| D-07 | AI/RAG | **Phase 1 제외 → Phase 2+ 온톨로지 통과 RAG** | 통합 §9: 노드 기반만 | safety_audits 로그 | 자유 생성 LLM | — |
| D-08 | 근거 | **Source 메타 내부 유지 + 사용자 UI 미제공** | 검수 결과 외부 참고 영상 영역 제공 제한 | API/ontology 근거 메타는 보존하되 콘텐츠 페이지에는 미제공 안내만 표시 | YouTube 공개 메타 노출 | — |
| D-09 | Safety | **HealthObservation 배너 + 금지/허용 톤** | 통합 §5.4·부록 B | admin safety-check 연동 | — | — |
| D-10 | Design | **high-end-visual-design + 통합 카피** | Editorial Luxury 기반의 따뜻한 고급 편집형 UI | 카드뉴스·챕터 MO 매거진도 같은 프리미엄 톤 유지 | minimalist-ui | — |
| D-11 | Hosting | **Vercel + Supabase** | 통합 §6.1 | Edge/Trigger.dev Phase 4 | — | — |
| D-12 | SSOT ID | **EPIC/FEAT/REQ/TASK** | Jarvis 표준 | PRD↔TASKS | — | — |
| D-13 | 이미지 | **Cat-first V5 86종 + Codex imagegen** | 기존 동일 콘텐츠의 카메라 거리·배경 원근을 유지한 2D 일본 극장용 고양이 판타지 애니메이션 감성 | `lib/content-image-manifest.ts`와 `docs/11~12`를 SSOT로 사용하며 홈·탐색·관련 목록은 텍스트 전용, 상세 대표 이미지에서만 노출 | 수채 동화책·2.5D·3D 렌더링 | — |
| D-14 | Admin CMS | **Phase 4 — 노드/콘텐츠/발행** | 통합 §5 | 별도 /admin | — | — |
| D-15 | BM | **Freemium → 구독·B2B** | 통합 §13 | Phase 5 | — | — |
| D-16 | Vector | **pgvector (Phase 3+)** | RAG·추천 | Supabase extension | Pinecone | — |
| D-17 | 개발 순서 | **통합 §16 10단계** | 온톨로지→ask→프로필→일기… | 07-tasks Phase 매핑 | — | — |
| D-18 | Repo 폴더 | **`catbook/nyangtology-web/` 신규** | `catbook/web/`는 기존 ontology-3d 시각화 전용 | 기획·Next.js 구현 분리 | 같은 web/ 혼재 | — |

## Open Questions

1. **OQ-01**: MVP 공개 범위 — 스테이징 vs 공개 랜딩?
2. **OQ-02**: Phase 1 Python bridge vs Phase 2부터 PG-only resolver?
3. **OQ-03**: 참고 영상/YouTube 사용자 제공 정책? → 현재 검수 기준은 미제공.
4. **OQ-04**: Supabase 프로젝트 신규 vs testify 공유? (Human Conductor)

## Top Risks

| ID | 리스크 | 완화 |
| --- | --- | --- |
| RISK-01 | 건강 콘텐츠 자가 진단 | POL + safety_audits + C3PO |
| RISK-02 | SQLite↔PG drift | sync job + ontology hash CI |
| RISK-03 | RAG hallucination | 노드 기반만, §9.2 규칙 |
| RISK-04 | PII(일기·건강) | RLS, §12 |

## 문서 계층

| 문서 | 역할 |
| --- | --- |
| `nyangtology_fullstack_plan_integrated.md` | Full service 비전·상세 SSOT |
| `01-prd.md` ~ `08-*.md` | MVP~Phase별 실행용 분해 |
