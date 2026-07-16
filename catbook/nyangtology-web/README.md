# 냥톨로지 웹

고양이를 진단하는 앱이 아니라, 보호자가 낯선 행동을 **관찰 순서와 상담 준비 메모**로 바꿔 볼 수 있게 돕는 지식그래프 기반 반려묘 케어 웹입니다.

Phase 1은 로그인 없이 탐색하는 read-only 모바일 웹 MVP입니다. 11개 시나리오, 자연어 검색, 개념 상세, 안전 안내, 질문 메모 정리 화면을 제공합니다. 온톨로지 데이터는 웹서비스 폴더 안의 `ontology_runtime/content` graph snapshot을 Node/TypeScript 런타임에서 읽고, 사용자 화면에서는 외부 참고 영상 링크를 노출하지 않습니다.

## 핵심 정보

| 항목 | 내용 |
| --- | --- |
| 서비스명 | 냥톨로지 |
| 성격 | 반려묘 행동 관찰 도우미, 비진단 안내 서비스 |
| 대상 | 초보 집사, 다묘/노묘 보호자, 고양이 행동을 기록하고 싶은 보호자 |
| 현재 범위 | Phase 1 read-only 탐색 MVP |
| 프론트엔드 | Next.js App Router, React, TypeScript |
| 데이터 | `ontology_runtime/content` graph snapshot + `lib/ontology.ts` |
| 안전 정책 | 진단·처방·치료 단정 금지, 관찰·기록·상담 준비 중심 |
| 실행 상태 | `app/`, `components/`, `lib/`, `bridge/`, `tests/e2e/` 구현됨 |

## AppsInToss 미니앱 개발 기준

이 프로젝트의 앱 리소스 폴더는 `catbook/nyangtology-web`입니다. Toss 미니앱 작업은 [AppsInToss WebView 연동 가이드](./docs/apps-in-toss-setup.md)를 먼저 확인하고 진행합니다.

- `@apps-in-toss/web-framework`와 `granite.config.ts`가 적용되어 있습니다.
- 콘솔 `appName`, 앱 이름, 아이콘 URL은 `granite.config.ts`와 반드시 일치해야 합니다.
- WebView 심사 리스크를 줄이기 위해 핀치줌 비활성화 viewport와 iframe 미사용 원칙을 유지합니다.
- 광고는 Toss 콘솔 광고 그룹 ID가 준비된 뒤, 질문/상황 결과 3번째부터 명시적 사용자 액션으로 통합 광고를 호출하는 범위만 허용합니다. 기본값은 비활성화입니다.
- 로컬 준수 점검은 `npm run test:apps-in-toss`로 수행합니다.
- 앱인토스 콘솔 업로드, API 키 사용, 공개 출시는 Human Conductor 승인 후 진행합니다.

## GitHub 소개 문구

```text
냥톨로지는 고양이의 낯선 행동을 진단하지 않고, 보호자가 무엇을 관찰하고 어떻게 상담을 준비하면 좋을지 안내하는 지식그래프 기반 모바일 웹입니다.
```

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 홈 | 고집사 안내, 검색 진입, 인기 질문, How it helps, 안전 메모 |
| 시나리오 탐색 | `/explore`에서 `갑자기 뛰어요`, `토했어요`, `화장실이 달라졌어요` 같은 11개 상황별 상세 진입 |
| 개념 상세 | 행동 신호, 욕구, 집에서 할 일, 건강 관찰, 안전 리스크 연결 |
| 질문하기 | 자연어 질문을 온톨로지 노드에 매칭하고 관찰 포인트와 기록 가이드를 반환 |
| 검색 | 시나리오와 개념을 read-only로 검색 |
| 안전 안내 | 비진단 원칙, 하지 않는 것, 상담 전에 적어둘 메모 안내 |
| 소개 | 서비스 목적과 MCP/온톨로지 기반 구조 안내 |
| 모바일 UI | 하단 탭, 모바일 제목 맞춤, 즉시 전환 로딩 오버레이 |

## 화면과 라우트

| Route | 용도 |
| --- | --- |
| `/` | 홈, 고집사 안내, 검색, 인기 질문, How it helps, 안전 메모 |
| `/ask` | 질문 입력과 상담 메모 정리 |
| `/explore` | 시나리오/개념 탐색 |
| `/search?q=` | 검색 결과 |
| `/scenarios/[slug]` | 시나리오 상세 |
| `/concepts/[slug]` | 개념 상세 |
| `/about` | 서비스 소개 |
| `/safety` | 안전·이용 안내 |

## API

| API | 설명 |
| --- | --- |
| `GET /api/health` | 서비스 상태 |
| `GET /api/stats` | 온톨로지 요약 통계 |
| `GET /api/scenarios` | 시나리오 목록 |
| `GET /api/scenarios/[slug]` | 시나리오 상세 |
| `GET /api/concepts/[slug]` | 개념 상세 |
| `GET /api/concepts/[slug]/evidence` | 내부 근거 메타 조회. 사용자 화면에서는 외부 영상 링크 미노출 |
| `GET /api/search?q=` | 검색 |
| `POST /api/ask` | 질문을 온톨로지 기반 관찰 안내로 변환 |

## 콘텐츠 정책

- 냥톨로지는 질병명, 진단, 처방, 치료를 단정하지 않습니다.
- 건강 관련 맥락은 관찰할 항목과 전문가 상담 준비 메모로만 안내합니다.
- YouTube/Source 메타는 온톨로지 검증과 내부 근거용으로 유지하지만, 사용자 화면에는 참고 영상 링크를 제공하지 않습니다.
- `/safety` 페이지는 안전 안내 자체이므로 자기참조 안전 배너를 노출하지 않습니다.
- `SafetyBanner`는 건강 관찰 또는 안전 리스크가 연결된 상세 페이지에서만 사용합니다.

## 데이터와 MCP 관계

`nyangtology-web`은 보호자용 웹 UI이고, 배포 시에는 웹 폴더 내부의 `ontology_runtime/`을 함께 올리는 standalone 구조입니다. `../mcp`는 원본 MCP 작업 산출물이지만, GitHub/Vercel 배포 런타임은 외부 `catbook/mcp` 폴더나 Python 실행 파일에 의존하지 않습니다.

| 폴더 | 역할 |
| --- | --- |
| `nyangtology-web/` | 보호자용 Next.js 웹, API, UI, 문서 |
| `ontology_runtime/` | 웹 배포에 포함되는 read-only SQLite/RDF/SPARQL 콘텐츠 스냅샷과 Python store |
| `lib/ontology.ts` | 웹 API에서 내부 `ontology_runtime` graph snapshot을 읽는 Node/TypeScript resolver |
| `bridge/ontology_bridge.py` | 로컬 비교·후속 검증용 Python bridge. Vercel 웹 런타임에서는 호출하지 않음 |

## 로컬 실행

```powershell
cd catbook\nyangtology-web
npm install
npm run dev -- --hostname 127.0.0.1 --port 3010
```

브라우저에서 엽니다.

```text
http://127.0.0.1:3010
```

웹 런타임은 Node/TypeScript resolver를 사용하므로 Vercel 배포에는 Python 실행 파일이 필요하지 않습니다. Python bridge를 로컬 비교용으로 직접 실행해야 할 때만 `PYTHON` 환경 변수를 지정합니다.

```powershell
$env:PYTHON="C:\Path\To\python.exe"
npm run dev
```

## 검증

```powershell
npm run lint
npm run test:ontology
npm run build
npm run test:e2e
```

전체 CI 성격의 로컬 검증:

```powershell
npm run ci
```

Playwright는 기본적으로 `PORT=3005`에서 `next start`를 띄워 검증합니다. 이미 실행 중인 서버를 쓰려면 `PLAYWRIGHT_BASE_URL`을 지정할 수 있습니다.

```powershell
$env:PLAYWRIGHT_BASE_URL="http://127.0.0.1:3010"
npm run test:e2e
```

## 프로젝트 구조

```text
catbook/nyangtology-web/
├── app/                         # Next.js App Router pages and API routes
│   ├── api/                     # stats, scenarios, concepts, search, ask, health
│   ├── ask/                     # 질문하기 화면
│   ├── concepts/[slug]/         # 개념 상세
│   ├── scenarios/[slug]/        # 시나리오 상세
│   ├── safety/                  # 안전·이용 안내
│   └── page.tsx                 # 홈
├── artifacts/images/            # Cat-first V5 생성 원본 PNG, 프롬프트, contact sheet, QA 증거
├── bridge/                      # Local comparison Python ontology bridge
├── components/                  # UI components
├── docs/                        # PRD, TRD, IA, design system, task docs
├── lib/                         # ontology resolver, schemas, sanitizing, badges
├── ontology_runtime/             # standalone 배포용 ontology snapshot과 Python store
│   ├── content/                  # SQLite, RDF/OWL/SHACL, graph JSON, SPARQL presets
│   ├── ontology_store.py
│   └── safety.py
├── public/
│   ├── images/brand/            # 서비스에서 직접 쓰는 브랜드 이미지
│   ├── images/scenarios/        # 서비스에서 직접 쓰는 시나리오 이미지
│   ├── gojipsa-icon-256.png     # PWA/icon asset
│   └── manifest.webmanifest     # PWA manifest
├── scripts/                     # ontology hash check
├── tests/e2e/                   # Playwright tests
├── .env.example                 # local environment sample
├── next.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

## 이미지 파일 위치

현재 서비스에 실제로 적용된 이미지는 `artifacts/`가 아니라 `public/images/` 아래에 있습니다. `artifacts/images/`는 향후 AI 생성 원본, 프롬프트, 후보안을 보관하기 위한 작업 폴더이며, 현재는 안내 README만 있고 이미지 파일은 없습니다.

| 구분 | 경로 | 용도 |
| --- | --- | --- |
| 현재 적용 브랜드 이미지 | `public/images/brand/` | 헤더 로고와 fallback 브랜드 이미지. 현재 `nyangtology-grid-logo.png`, `nyangtology-grid-logo-128.webp` 보관 |
| 현재 적용 시나리오 이미지 | `public/images/scenarios/`, `public/images/v2/scenarios/` | 시나리오 카드와 상세 화면에서 직접 로드하는 최적화 WebP. Cat-first 승인 자산은 V2 경로로 단계 전환 |
| 앱 아이콘 | `public/gojipsa-icon-256.png`, `public/gojipsa-icon-512.png` | PWA, favicon, app icon 계열 |
| AI 생성 원본/후보 | `artifacts/images/` | 프롬프트, 생성 후보, 편집 전 원본, 비교용 시안 보관 |

현재 시나리오 이미지 매핑은 `lib/scenario-assets.ts`에서 관리합니다.

| 시나리오 slug | 서비스 URL | 파일 위치 |
| --- | --- | --- |
| `sudden-run` | `/images/v2/scenarios/sudden-run.webp` | `public/images/v2/scenarios/sudden-run.webp` |
| `grooming` | `/images/scenarios/grooming.webp` | `public/images/scenarios/grooming.webp` |
| `second-cat` | `/images/scenarios/second-cat.webp` | `public/images/scenarios/second-cat.webp` |
| `not-eating` | `/images/scenarios/not-eating.webp` | `public/images/scenarios/not-eating.webp` |
| `hungry` | `/images/scenarios/hungry.webp` | `public/images/scenarios/hungry.webp` |
| `hiding` | `/images/scenarios/hiding.webp` | `public/images/scenarios/hiding.webp` |
| `food-type` | `/images/scenarios/food-type.webp` | `public/images/scenarios/food-type.webp` |
| `danger` | `/images/scenarios/danger.webp` | `public/images/scenarios/danger.webp` |
| `vomiting` | `/images/scenarios/vomiting.webp` | `public/images/scenarios/vomiting.webp` |
| `hissing` | `/images/scenarios/hissing.webp` | `public/images/scenarios/hissing.webp` |
| `litter` | `/images/scenarios/litter.webp` | `public/images/scenarios/litter.webp` |

예를 들어 `http://127.0.0.1:3010/concepts/health-litter-change`는 개념 전용 이미지를 따로 갖지 않고, 연결된 `scenario:litter`의 이미지를 재사용합니다.

```text
public/images/scenarios/litter.webp
public/images/scenarios/litter.png
```

이미지 운영 규칙:

- 앞으로 새 AI 생성 이미지를 만들면 `artifacts/images/{asset-slug}/` 아래에 프롬프트, 원본 이미지, 후보안을 먼저 보관합니다.
- 실제 화면에서 사용하는 최적화 이미지만 `public/images/brand/` 또는 `public/images/scenarios/`로 복사합니다.
- Next.js 화면에서는 Cat-first V5 매니페스트의 `public` 기준 URL을 사용합니다. 예: `/images/v2/scenarios/vomiting.webp`
- AI 생성 이미지가 사용자 화면에 노출되는 경우 `AI 생성` 배지를 유지합니다.
- YouTube/Source 썸네일을 AI로 재생성하거나 외부 참고 영상처럼 오인되게 배치하지 않습니다.
- V5 프롬프트는 `docs/11-cat-first-v5-image-prompt-guide.md`, 고양이 캐스트와 86종 배정은 `docs/12-cat-first-v5-cat-cast-content-map.md`, 런타임 자산은 `lib/content-image-manifest.ts`를 SSOT로 사용합니다.

## 기획 문서

| 문서 | 역할 |
| --- | --- |
| [통합 기획서](./docs/nyangtology_fullstack_plan_integrated.md) | 전체 서비스 비전과 Phase 계획 |
| [Decision Log](./docs/00-decision-log.md) | 주요 제품·기술 결정 |
| [PRD](./docs/01-prd.md) | 제품 요구사항 |
| [TRD](./docs/02-trd.md) | 기술 설계 |
| [IA Brief](./docs/03-ia-brief.md) | 정보 구조와 라우팅 |
| [User Flow](./docs/04-user-flow.md) | 사용자 흐름 |
| [Database Design](./docs/05-database-design.md) | 데이터 모델 방향 |
| [Design System](./docs/06-design-system.md) | 시각·컴포넌트 원칙 |
| [TASKS](./docs/07-tasks.md) | 구현 태스크 |
| [Coding Guide](./docs/08-coding-convention-ai-guide.md) | 코드 작성 기준 |
| [Cat-first 비주얼 전면 교체 TASKS](./docs/09-cat-first-visual-overhaul-tasks.md) | 품종·캐릭터 다양화, 이미지 manifest와 카드 UI 전환 계획 |
| [Cat-first V5 전체 비주얼 PRD](./docs/10-cat-first-v5-full-visual-prd.md) | 86종 이미지 생성·UI 반영 범위, 정책, 완료 기준 |
| [Cat-first V5 이미지 프롬프트](./docs/11-cat-first-v5-image-prompt-guide.md) | 기존 콘텐츠 원근 유지, 2D 셀 애니메이션 스타일, 안전 가드레일 |
| [Cat-first V5 14묘 캐스트·콘텐츠 맵](./docs/12-cat-first-v5-cat-cast-content-map.md) | 고양이 품종·모색·나이와 홈·시나리오·개념·챕터 배정 |
| [토스 비게임 상단·하단 가이드 감사](./docs/top-bottom-guide-audit-2026-07-14.md) | Apps in Toss 상단 내비게이션·하단 탭바·Safe Area·배너 준수 검토 |

## 로드맵

| Phase | 내용 |
| --- | --- |
| 1 | SQLite bridge 기반 read-only 모바일 탐색 MVP |
| 2 | Auth, 고양이 프로필, 행동 일기, 세 줄 상담 메모, 챕터 뷰어 |
| 3 | 추천, 환경 점검, 노묘/다묘 모드, pgvector RAG |
| 4 | Admin CMS, 카드뉴스/숏폼 대본 생성, safety-check |
| 5 | PWA 고도화, PDF 리포트, 가족 공유, 구독/B2B |

## 배포 메모

- 권장 호스팅: Vercel
- Phase 1은 read-only 웹이므로 서버 저장소, 인증, 사용자 개인정보 저장이 없습니다.
- 광고 게이트는 `NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED=1` 및 `NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID`가 준비된 환경에서만 활성화합니다.
- 공개 전에는 `/safety`, 건강 관련 상세 페이지, `/api/ask` 응답 카피를 재검증해야 합니다.
- 온톨로지 스냅샷이 갱신되면 웹과 MCP를 함께 검증해야 합니다.

## 현재 상태 요약

- Next.js App Router 기반 UI와 API 구현 완료
- MCP SQLite snapshot을 읽는 Python bridge 연결
- Source/YouTube 사용자 노출 차단 정책 적용
- 모바일 제목 맞춤, 하단 탭, 로딩 오버레이, 안전 안내 화면 적용
- 로컬 lint/build/e2e 검증 체계 포함
