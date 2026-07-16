# Design System — 냥톨로지 풀스택 서비스

> requestId: `2026-07-08-nyantology-novice-owner-web-service`  
> **통합 SSOT**: [nyangtology_fullstack_plan_integrated.md](./nyangtology_fullstack_plan_integrated.md) §4.8·§4.9·§10  
> Primary Skill: `high-end-visual-design` + nyantology-intro 토큰  
> Owner: Joi · CC: TARS, C3PO

---

## 1. 디자인 방향

- **서비스 카피**: "고양이 행동을 정답으로 단정하지 않고, 집사가 관찰할 순서로 바꿔드립니다." (통합 §1.3)
- **한 줄 톤**: 따뜻한 고급 편집형 케어 매거진 — 고집사가 차분히 옆에서 설명
- **Skill Archetype**: `high-end-visual-design` 중 **Editorial Luxury + Asymmetrical Bento**. MO는 1열 스택으로 강제 collapse.
- **피할 것**: 보라 SaaS 그라데이션, OLED 테크 글래스, 의료 앱형 전면 경고, 진단·처방 연상 일러스트
- **레퍼런스**: `work-requests/2026-07-07-nyantology-intro-page/artifacts/nyantology-intro-minimal.html`의 고집사 톤을 고급 편집형으로 확장

---

## 2. Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `--bg` | `#faf8f2` | 페이지 배경 |
| `--paper` | `#fffdf8` | 섹션 |
| `--surface` | `#ffffff` | 카드 |
| `--tray` | `#f3efe5` | 카드 outer shell |
| `--hairline` | `rgba(33, 53, 46, 0.11)` | premium hairline |
| `--ink` | `#1e2521` | 제목 |
| `--text` | `#343c37` | 본문 |
| `--muted` | `#656d67` | 보조 |
| `--deep` | `#21352e` | CTA, GNB |
| `--line` | `#eaeaea` | 구분선 |

**Semantic (class 배지)**

| Class | BG | FG | Node class |
| --- | --- | --- | --- |
| scenario | `#e5eff4` | `#315d74` | Scenario |
| signal | `#e8f1ea` | `#2f5d50` | CatSignal |
| health | `#f7e6e2` | `#9a443a` | HealthObservation |
| action | `#fbf1d6` | `#8a5b1f` | CareAction |
| need | `#efe9f7` | `#5b4b8a` | Need |

**Safety banner**: `--health` 배경 + 좌측 4px `#9a443a` border. 아이콘 ⚠ 최소 사용.

---

## 3. Typography

| Role | Font | Size (MO / PC) | Weight |
| --- | --- | --- | --- |
| Display | `--serif` Noto Serif KR + Source Serif 4 | 32 / 64 | 600 |
| H1 | `--sans` Plus Jakarta Sans + Apple SD Gothic Neo | 24 / 34 | 800 |
| H2 | `--sans` | 18 / 22 | 600 |
| Body | `--sans` | 16 / 17 | 400 |
| Caption | `--sans` | 13 / 14 | 400 |
| Mono | `--mono` | 12 | 400 (version) |

- 한 줄 헤드라인: 문구 길이·font-size 동시 조정 (`nowrap` 단독 금지)
- line-height body: 1.68

---

## 4. Spacing & Layout

| Token | Value |
| --- | --- |
| page max | 1160px (PC), 430px logical (MO) |
| section gap | 64px MO / 112px PC |
| card padding | 22px MO / 28px PC |
| card radius | 28px outer / 22px inner |
| grid gap | 18px MO / 24px PC |

**Grid**

- 홈 Scenario: MO 1col → tablet 2col → PC 3col
- 근거 리스트: MO stack → PC 2col (optional)
- 고급 섹션: PC는 8:4 또는 7:5 asymmetrical split 허용, MO는 `grid-template-columns: 1fr`

**Premium Surface**

- 주요 카드·패널은 outer shell (`--tray`, hairline, 6~8px padding) + inner core (`--surface`, inset highlight) 느낌을 갖는다.
- 납작한 `1px solid #ddd` 카드와 강한 drop shadow는 금지한다.
- CTA는 pill 형태를 기본으로 하고, 화살표/외부 이동 아이콘은 별도 원형 island 안에 넣는다.

---

## 5. Components

### 5-1. ScenarioCard

- 홈·탐색·관련 목록에서는 이미지 미노출
- label (H2), summary 2줄 clamp
- class badge `시나리오`
- nested surface, soft ambient shadow
- hover: transform/opacity 기반의 미세한 lift, no scale bounce

### 5-2. CheckList (checks[])

- numbered circles, read-only
- 고집사 intro 1줄 위

### 5-3. ConceptCard (linked)

- 탐색·관련 목록에서는 이미지 미노출, 상세 진입 후 대표 이미지 제공
- class badge color
- label + 1-line summary
- chevron →

### 5-4. SafetyBanner

- sticky top below header when `medical || health class`
- copy: "관찰·기록·상담 준비 안내입니다. 진단이나 치료를 대체하지 않습니다."
- link: `/safety`

### 5-5. EvidenceRow

- title 2-line clamp
- badges: shorts | video, topics[]
- external link icon
- no inline iframe MVP

### 5-6. GojipsaNote

- left border `--deep`
- italic serif 1 sentence

### 5-7. Mobile BottomTab

- **Phase 1**: 홈, 탐색, 안전
- **Phase 2+**: 홈, 일기, 내 고양이, 더보기
- fixed to viewport; **no backdrop-filter ancestor**

### 5-8. AskResultBlock (Phase 2, §4.1)

- summary → observe list → care_action → 기록 CTA
- RAG 답변 템플릿 §9.4 레이아웃

### 5-9. DiaryForm (Phase 2, §4.4)

- 행동 칩 다중 선택 → 전후 맥락 textarea → 집사 행동 select

### 5-10. VetNoteForm (Phase 2, §4.5)

- 3필드: 언제/무엇/얼마나 — 건강 관찰 상단 disclaimer

### 5-11. ChapterReader (Phase 2, §4.8)

- MO 매거진: Part 7 / Chapter 42 — serif title, 집사 행동·체크 블록

### 5-12. ContentCard (Phase 2, §4.9)

7종: 초보준비·행동신호·건강관찰·다묘·노묘·상담메모·환경체크 — **Codex `brandkit` / `imagegen-frontend-web`**

---

## 6. Motion

- transition: 560~720ms `cubic-bezier(0.32, 0.72, 0, 1)` (transform, opacity, color, border)
- no autoplay carousel
- prefers-reduced-motion: disable transitions
- 스크롤 진입 모션은 `IntersectionObserver` 또는 CSS entry class만 사용한다. `scroll` 이벤트 상시 리스너 금지.

---

## 7. Accessibility

- contrast ≥ 4.5:1 body on `--bg`
- focus ring: 2px `--deep` offset 2px
- touch target ≥ 44px
- safety banner `role="alert"`

---

## 8. Pre-flight (TARS/Joi)

- [ ] Generic purple gradient hero — **금지**
- [ ] Banned font stack(Inter, Roboto, Arial, Open Sans, Helvetica) — **금지**
- [ ] Flat 1px gray card / harsh dark shadow — **금지**
- [ ] Default `linear` / `ease-in-out` motion — **금지**
- [ ] Health page without banner — **금지**
- [ ] Mobile tab under filtered ancestor — **검증**

---

## 9. 관련 콘텐츠 이미지 — Codex/Cursor 이미지 스킬

SSOT: `docs/design-taste-skill-guide.md` · Decision **D-13** · TASK **TASK-035**

### 9-1. 언제 이미지 스킬을 쓰는가

| 조건 | 사용 | 미사용 |
| --- | --- | --- |
| Hero·랜딩·소개 섹션에 **제작 일러스트/배경** 필요 | ✅ | — |
| PRD **IMG-** 항목 또는 Joi UX Brief에 이미지 요건 명시 | ✅ | — |
| Codex/Cursor에서 **시각 품질이 핵심**인 UI 구현 | ✅ `image-to-code` | — |
| 외부 참고 영상 썸네일·링크 | — | ✅ 미제공 안내 |
| Safety 배너·아이콘 | — | ✅ CSS/semantic color |
| Scenario/Concept/Chapter 이미지 | 상세 대표 이미지에서 ✅ `cat-first-v5` 86종 매니페스트 | 홈·탐색·관련 목록 카드에서는 미사용 |

### 9-2. 스킬 선택 (Friday Primary Skill)

| Skill ID | Owner | 용도 |
| --- | --- | --- |
| `imagegen-frontend-web` | Joi | PC 가로 섹션 comp — **섹션당 1장** |
| `imagegen-frontend-mobile` | Joi | 390px 앱형 화면 comp |
| `image-to-code` | TARS | 생성 이미지 분석 후 구현 (Codex image-first) |
| `brandkit` | Joi | 고집사 키트, OG, 정체성 보드 |
| `high-end-visual-design` | Joi → TARS | 이미지 없는 컴포넌트·토큰·모션 구현 |

실행 전 **반드시** `.agents/skills/<skill-id>/SKILL.md` 전문을 읽는다.

### 9-3. 냥톨로지 웹 아트 디렉션

- 팔레트: §2 Color Tokens (`--bg`, `--deep`, semantic class colors)
- 톤: 따뜻한 편집형, 고집사는 **친근·비단정** (수의사 가운·청진기 금지)
- 고양이: `docs/12-cat-first-v5-cat-cast-content-map.md`의 14묘 캐스트를 사용하고, 품종을 행동 원인처럼 표현하지 않는다.
- 스타일: 수채 동화책 표현을 사용하지 않는 초기 2000년대 일본 극장용 2D 고양이 판타지 애니메이션 감성. 특정 기존 캐릭터·장면·프로덕션 디자인은 복제하지 않는다.
- 구도: 동일 콘텐츠의 기존 이미지를 카메라 거리·배경 원근 레퍼런스로 고정한다. 확대 클로즈업, 지나친 줌아웃, 긴 복도·강한 소실점은 금지한다.
- 채색: 따뜻한 차콜 선, 넓은 무광 셀 컬러, 단순한 셀 그림자, 불투명하고 부드러운 배경. 수채 번짐·종이결·파스텔·3D·CGI·포토리얼은 금지한다.
- 안전: 공포·아픔·공격성을 과장하지 않고, 사람 손과 얼굴은 고양이보다 시각적으로 우선하지 않는다.
- 텍스트 in-image: 최소 (한국어 UI는 코드에서 렌더)

프롬프트 SSOT는 `docs/11-cat-first-v5-image-prompt-guide.md`, 자산 SSOT는 `lib/content-image-manifest.ts`다.

노출 정책은 **목록 텍스트 전용, 상세 대표 이미지 전용**이다. 홈의 많이 묻는 궁금증, `/explore`의 상황·행동 신호, 상세 하단 관련 카드는 이미지를 렌더링하지 않는다. 시나리오·개념·챕터 상세 상단에서만 대표 이미지와 `AI 생성` 배지를 표시한다.

### 9-4. 워크플로

```text
Joi: IMG-xx 요건 + 섹션 목록
  → imagegen-frontend-web (섹션별 N장)
  → Human/Joi Design Read 승인
  → TARS: image-to-code 또는 high-end-visual-design 구현
  → artifacts/images/ 저장 + Work Log 링크
```

**Jarvis invoke 예시** (`docs/design-taste-skill-guide.md`):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "2026-07-08-nyantology-novice-owner-web-service" `
  -Agent "Joi" `
  -Skill "imagegen-frontend-web" `
  -Task "냥톨로지 웹 홈 Hero + about 섹션 comp (섹션당 1장)" `
  -Channel "design" `
  -RiskLevel "Low" `
  -Cc "TARS","C3PO"
```

### 9-5. 산출물·검증

| 항목 | 규칙 |
| --- | --- |
| 원본 저장 | `artifacts/images/cat-first-v2/source-png/{home,scenarios,concepts,chapters}/` |
| 배포본 저장 | `public/images/v2/{home,scenarios,concepts,chapters}/*.webp` |
| 파일명 | 홈·시나리오·개념은 `{slug}`, 챕터는 `chapter-{NN}` |
| 검증 | Design System 토큰 일치, MO 390 가독성, pre-flight §8 |
| 추후 PR | 생성 프롬프트 요약 + 이미지 경로 + contact sheet + 화면 스크린샷 |
