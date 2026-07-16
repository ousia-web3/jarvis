# Coding Convention & AI Collaboration Guide — 냥톨로지 풀스택

> requestId: `2026-07-08-nyantology-novice-owner-web-service`  
> **통합 SSOT**: [nyangtology_fullstack_plan_integrated.md](./nyangtology_fullstack_plan_integrated.md)  
> Owner: TARS · CC: Jarvis, KITT/TRON

---

## 1. Repo 구조 (권장)

```
catbook/
├── mcp/                    # 온톨로지 SSOT (MCP)
├── web/                    # ontology.html · ontology-3d (시각화만, 레거시)
└── nyangtology-web/        # 풀스택 서비스 (본 프로젝트)
    ├── README.md
    ├── docs/
    ├── artifacts/
    ├── app/                # (구현 예정) Next.js
    ├── components/
    ├── lib/
    └── bridge/             # ontology_store wrapper
```

- **금지**: nyangtology-web에서 ontology SQL duplicate
- **권장**: `bridge/` → `../mcp/ontology_store.py`
- **주의**: `catbook/web/`와 혼동 금지 (D-18)

---

## 2. 언어·런타임

| Layer | Stack | Version |
| --- | --- | --- |
| Frontend | TypeScript strict | TS 5.x |
| Framework | Next.js App Router | 15.x |
| UI | React | 19.x |
| Backend bridge | Python | 3.11+ |
| Package manager | pnpm | 9.x |
| DB (Phase 2+) | Supabase PostgreSQL + RLS | — |
| Styling (Phase 2+) | Tailwind CSS | 통합 §6.1 |
| Vector (Phase 3+) | pgvector | service layer only |

---

## 3. Naming

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| node id | ontology SSOT 그대로 | `scenario:sudden_run` |
| URL slug | kebab-case suffix | `sudden-run` |
| React component | PascalCase | `ScenarioCard.tsx` |
| API route | kebab plural | `/api/scenarios` |
| CSS module | camelCase class | `.scenarioCard` |
| Event (analytics) | snake_case | `concept_evidence_click` |

---

## 4. TypeScript

- `strict: true`, `noImplicitAny`
- API response: **Zod** schema validate at boundary
- 공유 types: `lib/types.ts` ← OpenAPI or zod infer
- `any` 금지 (eslint error)

```typescript
// lib/types.ts — 예시
export interface ScenarioSummary {
  id: string;       // scenario:sudden_run
  slug: string;     // sudden-run
  label: string;
  summary: string;
  checks: string[];
}
```

---

## 5. Python bridge

- MCP `safety.py` 결과를 **변형하지 않고** JSON 전달
- 새 query logic 추가 금지 — `ontology_store` public API만
- subprocess로 `server.py` MCP 호출 **금지** (latency)

```python
# bridge/handlers/scenarios.py — 패턴
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "mcp"))
from ontology_store import OntologyStore  # noqa: E402
```

---

## 6. Safety 코드 규칙 (필수)

1. `HealthObservation`, `SafetyRisk` 응답 → `SafetyBanner` 필수
2. UI copy에 "진단", "치료", "병명 확정" **금지**
3. `meta.safety[]` empty on health pages → CI fail
4. C3PO review 없이 safety copy merge **금지**

---

## 7. API conventions

- JSON envelope: `{ data, meta }`
- Errors: `{ error: { code, message } }`
- Version header: `X-Ontology-Version`
- Pagination: `?page=1&limit=20`
- Cache-Control on GET public content

---

## 8. Frontend

- Server Components default; client only for search input, tabs
- Images: YouTube thumbnail `img.youtube.com` hotlink 금지 — 참고 영상은 미제공 안내로 처리
- Links external: `target="_blank" rel="noopener noreferrer"`
- i18n: MVP `lang=ko` only

## 8-1. AppsInToss WebView 준수

- 앱 리소스 프로젝트 폴더는 `catbook/nyangtology-web`로 고정한다.
- Toss 미니앱 관련 작업 전 `docs/apps-in-toss-setup.md`를 확인한다.
- `@apps-in-toss/web-framework`, `granite.config.ts`, `npm run ait:build` 기준을 유지한다.
- `app/layout.tsx`의 viewport는 `initialScale: 1`, `maximumScale: 1`, `userScalable: false`를 유지한다.
- 런타임 UI에서 iframe을 사용하지 않는다. YouTube 예외가 있더라도 냥톨로지는 참고 영상 링크와 iframe을 사용자 화면에 노출하지 않는다.
- Toss 로그인, 사용자 정보, 결제, 광고, 위치, 저장소 권한은 Human Brief와 KITT/TRON 검토 없이 추가하지 않는다.
- 앱인토스 콘솔 업로드, API 키 사용, 공개 출시는 Human Conductor 승인 후 진행한다.
- 변경 후 `npm run test:apps-in-toss`를 실행한다.

---

## 9. Testing

| Type | Tool | Min coverage |
| --- | --- | --- |
| Unit | Vitest | slug, safety trigger |
| API contract | Vitest + fixtures from smoke_test | stats, sudden_run |
| E2E | Playwright | primary flow |
| a11y | axe-playwright | safety pages |

Fixtures: `catbook/mcp/smoke_test.py` output snapshot commit.

---

## 10. Git·PR

- Branch: `feat/nyangtology-web-task-0xx-short-name`
- PR title: `[TASK-0xx] verb object`
- PR body: REQ/FEAT link, screenshot 390+1440, safety checklist
- 1 PR ≈ 1 TASK (400 LOC guideline)

---

## 11. AI Agent (Cursor) 협업

### 11-1. 세션 시작

1. Read `catbook/nyangtology-web/docs/07-tasks.md`
2. Pick **one** TASK-0xx In Progress
3. Run MCP `catbook_ontology_stats` if data shape unclear

### 11-2. Agent may

- Implement assigned TASK scope
- Add tests for changed behavior
- Update TASK status in PR description

### 11-3. Agent must not

- Expand to Phase 2 (auth, chat, CMS) without Human Brief
- Bypass `safety.py`
- Deploy production (TASK-042 Human gate)
- Commit secrets, `.env`

### 11-4. Prompt template

```text
TASK-0xx 구현. SSOT: catbook/nyangtology-web/docs/02-trd.md API, 06-design-system.md.
ontology는 catbook/mcp/ontology_store 재사용. safety 배너 필수.
범위 외 코드 수정 금지.
```

### 11-5. 관련 콘텐츠 이미지 — Codex/Cursor 이미지 스킬

PRD **§6-1 IMG-xx** 또는 TASK-035가 있으면, 구현 전·병행하여 아래 스킬을 **SKILL.md 전문 읽기 후** 사용한다.

| 상황 | Skill | Agent |
| --- | --- | --- |
| 웹 섹션 comp·Hero·랜딩 visual | `imagegen-frontend-web` | Joi → TARS |
| 모바일 화면 comp | `imagegen-frontend-mobile` | Joi |
| comp → 코드 (Codex image-first) | `image-to-code` | TARS |
| OG·고집사 브랜드 보드 | `brandkit` | Joi |
| 토큰·컴포넌트·모션 only | `high-end-visual-design` | Joi → TARS |

**필수 규칙**

- `imagegen-frontend-web`: **한 섹션 = 한 장** (다중 섹션 단일 이미지 금지)
- 생성물 저장: `catbook/nyangtology-web/artifacts/images/`
- YouTube evidence 썸네일·외부 링크는 **사용자 UI에 노출하지 않음** (참고 영상 미제공 안내)
- 이미지 스킬 사용 시 Work Log에 Skill ID·섹션·파일 경로 기록

**이미지 작업 Prompt template**

```text
TASK-035 / IMG-01. Read .agents/skills/imagegen-frontend-web/SKILL.md first.
Design System catbook/nyangtology-web/docs/06-design-system.md 토큰 준수. 섹션: 홈 Hero only — 1 image.
고집사 톤, 비진단, warm monochrome. 산출: catbook/nyangtology-web/artifacts/images/home-hero/
```

**시각 구현 Prompt template**

```text
TASK-013 UI 구현. Read .agents/skills/high-end-visual-design/SKILL.md first.
Design System catbook/nyangtology-web/docs/06-design-system.md 준수.
Archetype: Editorial Luxury + Asymmetrical Bento, MO는 1열 collapse.
금지: 의료 앱 경고 톤, 보라 SaaS gradient, generic gray card, default ease motion.
```

---

## 12. Lint·Format

- ESLint: `@next/eslint-plugin-next` + typescript-eslint
- Prettier: singleQuote, trailingComma es5
- Python: ruff (mcp bridge files)
- pre-commit: lint + `python catbook/mcp/smoke_test.py` (if mcp touched)

---

## 13. Environment

```env
# catbook/nyangtology-web/.env.example
ONTOLOGY_CONTENT_ROOT=../mcp/content
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# NO secrets in MVP
```

---

## 14. Definition of Done (TASK 공통)

- [ ] REQ/FEAT id in PR
- [ ] Local dev verified
- [ ] Tests added/updated
- [ ] MO 390 + PC 1440 screenshot (UI tasks)
- [ ] Safety checklist (health-related)
- [ ] Work Log entry (meaningful tasks)
