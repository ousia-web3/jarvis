# 냥톨로지 Cat-first 비주얼 전면 교체 TASKS

> 상태: V5 로컬 생성·반영·검증 완료 — 배포 대기  
> 작성일: 2026-07-15  
> requestId: `nyangtology-content-review`  
> 실행 트랙: L2 풀 — 86개 이미지·manifest·상세 중심 이미지 UI·검증 실행  
> Owner(To): Joi, TARS  
> CC: Friday, C3PO, KITT/TRON, Jarvis  
> 최종 승인: Human Conductor

## 0. 2026-07-16 로컬 완료 현황

| 영역 | 완료 결과 |
| --- | --- |
| 이미지 | 홈 6 + 시나리오 11 + 개념 27 + 챕터 42 = 86종 생성·WebP 반영 |
| 원근·스타일 | 기존 동일 콘텐츠의 카메라 위치·배경 거리를 기준으로 V5 적용, 수채 동화책·3D 표현 제외 |
| 캐스트 | 14 Cat ID와 86종 배정을 `docs/12`에 기록 |
| 런타임 | `lib/content-image-manifest.ts` 86개 unique ID, missing 0, 한글 alt 86/86 |
| UI | 홈·탐색·관련 목록은 텍스트 전용, 시나리오·개념·챕터 상세 대표 이미지에만 V5 경로 반영 |
| 이미지 QA | 1024×1024 86/86, unique hash 86/86, 180KB 초과 0, 250KB 초과 0 |
| 회귀 검증 | TypeScript, ESLint, production build, Apps-in-Toss, ontology, Playwright E2E 12개 통과 |
| 배포 | Git commit·GitHub·Vercel은 사용자 후속 요청까지 미수행 |

## 1. 아이디어 검토 결론

**전면 교체를 권장한다.** 냥톨로지의 실용 정보는 신뢰의 바닥을 만들지만, 사용자가 앱을 다시 열게 만드는 첫 인상은 고양이여야 한다. 현재의 차분한 편집형 일러스트는 정보 전달에는 무리가 없지만, 고양이의 얼굴·표정·품종 차이가 약하고 사람과 실내 배경의 비중이 커서 “압도적으로 귀여운 고양이 앱”이라는 제품 인상이 부족하다.

이번 업그레이드는 단순 파일 교체가 아니라 다음 세 항목을 하나의 범위로 본다.

1. 기존 콘텐츠 이미지 80종을 Cat-first V2 아트로 교체한다.
2. 품종, 모색, 나이, 체형, 표정이 반복되지 않도록 고양이 캐릭터 체계를 만든다.
3. 이미지 매핑 구조는 전체 자산을 추적하되, 홈·탐색·관련 목록은 텍스트만 제공하고 상세 대표 이미지에 시각 정보를 집중한다.

단, 건강·안전 콘텐츠는 귀여운 표현 때문에 긴급성이나 관찰 포인트가 약해지지 않도록 별도 규칙을 적용한다.

## 2. 현재 상태 감사

### 2-1. 자산 인벤토리

| 구분 | 콘텐츠 수 | 현재 배포 파일 | 확인 결과 |
| --- | ---: | ---: | --- |
| 시나리오 | 11 | PNG 11 + WebP 11 | 경로 누락 없음 |
| 주요 개념 | 27 | PNG 27 + WebP 27 | 경로 누락 없음 |
| 챕터 | 42 | PNG 42 + WebP 42 | 경로 누락 없음 |
| 합계 | 80 | PNG 80 + WebP 80 | WebP 80개 해시 중 중복 파일 없음 |

현재 PNG 원본은 약 146.5MB, WebP 배포본은 약 4.7MB다. V2에서는 원본 PNG를 `artifacts/`에 보관하고 `public/`에는 최적화 배포본만 두는 구조를 권장한다.

### 2-2. 발견된 문제

| 영역 | 현재 상태 | 문제 |
| --- | --- | --- |
| 고양이 다양성 | 회색 태비, 치즈 태비, 턱시도 계열이 반복됨 | 품종·모색·체형 차이가 약하고 여러 카드가 같은 고양이처럼 보임 |
| 주인공 비중 | 사람, 가구, 방 배경이 큰 장면이 다수 | 작은 카드에서 고양이 얼굴과 표정이 먼저 읽히지 않음 |
| 아트 톤 | 베이지·저채도·유사 구도 반복 | 차분하지만 기억에 남는 “귀여움 피크”가 부족함 |
| 홈 노출 | `quickQuestions` 6개가 텍스트 카드 | 첫 화면에서 고양이 앱이라는 인상이 약함 |
| 탐색 노출 | `ScenarioCard`는 이미지 미사용 | 핵심 11개 상황이 이미지 자산을 갖고도 텍스트 카드로 표시됨 |
| 관련 카드 노출 | `ConceptCard`는 `Scenario` 클래스만 이미지 표시 | 개념 이미지 27종과 챕터 이미지 42종이 상세 진입 전에는 충분히 활용되지 않음 |
| 이미지 정보 | `scenario-assets.ts`에 경로와 `alt`만 하드코딩 | 품종, 캐릭터, 모색, 나이, 표정, 초점, 버전, 프롬프트 추적 정보가 없음 |
| 대체 텍스트 | 챕터 42종이 `Nyangtology chapter NN cover illustration` | 한글 서비스의 접근성 설명으로 부족하며 장면 정보도 없음 |
| 설계 정합성 | `06-design-system.md` §9-1은 Scenario/Concept 카드 이미지 미사용으로 정의 | 현재 구현 및 Cat-first 방향과 충돌하므로 D-13 개정이 선행되어야 함 |

## 3. Cat-first V2 제품 원칙

### 3-1. 우선순위

- 일반 콘텐츠 카드: **고양이 매력 80 / 상황 설명 15 / 사람·배경 5**
- 건강·안전 카드: **고양이 매력 55 / 관찰 맥락 35 / 안전 단서 10**
- 사용자는 0.5초 안에 고양이의 얼굴, 몸짓 또는 발을 먼저 인지해야 한다.
- 비안전 카드의 90% 이상에서 고양이가 프레임의 65% 이상을 차지한다.
- 사람은 필요한 경우에만 손, 무릎, 실루엣 수준으로 제한하고 고양이보다 크게 표현하지 않는다.

### 3-2. 확정 아트 디렉션 — Cat-first V5

- 스타일: 초기 2000년대 일본 손그림 극장판 고양이 판타지의 깨끗하고 가벼운 2D 셀 애니메이션 언어. 기존 캐릭터·프레임·프로덕션 디자인은 복제하지 않는다.
- 선·채색: 얇은 웜 차콜 선, 넓은 무광 셀 색면, 단일 그림자, 불투명하게 칠한 생활 배경.
- 구도: 기존 동일 콘텐츠 이미지의 카메라 위치·배경 원근 거리·주요 사물 크기를 유지하고 고양이 캐릭터만 V5로 교체한다.
- 금지: 수채화, 동화책 워시, 종이결, 파스텔 초크, 3D, CGI, 실사, 현대 키아트 광택, 과장된 광각·긴 복도·거대 얼굴 클로즈업.
- 사람: 필요한 경우 손·무릎·등·옆모습으로 단순화하고 고양이보다 먼저 읽히지 않게 한다.
- 텍스트: 이미지 내부에 넣지 않고 UI에서 렌더링한다.
- 카드 원본: 정사각 PNG를 보관하고 1024×1024 WebP를 배포 후보로 사용한다.

### 3-3. 금지 항목

- 사람 얼굴이나 실내 인테리어가 고양이보다 먼저 보이는 구도
- 한 배치에서 같은 회색 태비·치즈 태비를 연속 배치
- 고양이 발가락·수염·꼬리·귀가 비정상적으로 합쳐지거나 늘어나는 생성 오류
- 아픈 고양이를 웃는 표정으로 표현하거나 구토·배변·통증을 희화화
- 특정 품종을 공격성, 게으름, 영리함 같은 행동 성격과 고정 연결
- 스코티시 폴드의 접힌 귀, 극단적 단두종 등 유전적 건강 문제를 귀여움 요소로 소비
- 수의사 가운, 청진기, 주사기 등 진단·치료를 연상시키는 연출
- YouTube 썸네일 또는 외부 저작물을 닮게 재생성

## 4. 냥톨로지 고양이 캐스트 초안

“품종별 다양성”은 품종명만 늘리는 방식이 아니라 **품종/믹스 + 모색 + 나이 + 털 길이 + 체형**을 함께 관리한다. 아래 14마리를 V2 기본 캐스트로 사용하고, 한 캐릭터가 전체 80장의 12%를 넘지 않게 한다.

| Cat ID | 외형 기준 | 나이·체형 | 대표 매력 포인트 |
| --- | --- | --- | --- |
| `CAT-01` | 도메스틱 숏헤어 삼색 | 아기·작음 | 동그란 이마, 짧은 앞발 |
| `CAT-02` | 도메스틱 숏헤어 치즈태비 | 성묘·통통 | 분홍 코, 말린 꼬리 |
| `CAT-03` | 도메스틱 숏헤어 턱시도 | 노묘·보통 | 흰 양말, 느긋한 눈 |
| `CAT-04` | 브리티시 숏헤어 블루 | 성묘·통통 | 큰 볼, 호박색 눈 |
| `CAT-05` | 러시안 블루 | 노묘·슬림 | 은회색 털, 초록 눈 |
| `CAT-06` | 랙돌 실 포인트 | 성묘·큰 체형 | 파란 눈, 폭신한 가슴털 |
| `CAT-07` | 메인쿤 브라운 태비 | 성묘·대형 | 귀 끝 털, 큰 앞발 |
| `CAT-08` | 노르웨이 숲 크림 화이트 | 아기·중형 | 목도리 털, 풍성한 꼬리 |
| `CAT-09` | 샴 실 포인트 | 성묘·슬림 | 큰 귀, 선명한 표정 |
| `CAT-10` | 벵갈 골든 | 성묘·근육형 | 로제트 무늬, 활기찬 자세 |
| `CAT-11` | 아비시니안 루디 | 성묘·슬림 | 큰 귀, 호기심 눈빛 |
| `CAT-12` | 터키시 앙고라 화이트 | 성묘·중형 | 긴 꼬리털, 오드아이 |
| `CAT-13` | 스핑크스 그레이 핑크 | 성묘·슬림 | 큰 귀, 주름과 담요 |
| `CAT-14` | 스코티시 스트레이트 실버 | 아기·통통 | 곧은 귀, 둥근 얼굴 |

도메스틱 숏헤어는 국내에서 흔히 “코리안 숏헤어”라고 부르지만 공인 품종명처럼 단정하지 않는다. 장면 배정은 행동 고정관념이 아니라 시각 다양성과 콘텐츠 맥락을 기준으로 한다.

## 5. 교체 범위와 파일 전략

### 5-1. 이미지 범위

| 우선순위 | 범위 | 수량 | 목적 |
| --- | --- | ---: | --- |
| P0 | 홈 많이 묻는 궁금증 | 6 | 자산·프롬프트 보존(현재 목록 UI에는 미노출) |
| P0 | 시나리오 | 11 | 상세 대표 이미지 전면 교체 |
| P1 | 주요 개념 | 27 | 행동·욕구·환경·건강 카드 다양화 |
| P1 | 챕터 | 42 | 전체 콘텐츠 이미지 톤 통일 |
| P2 | 홈 Hero·고집사·브랜드 | 별도 검토 | Cat-first 캐스트와 브랜드 일치 여부 확인 |

기존 80개 이미지는 모두 V2 신규 자산으로 교체한다. 홈 질문 6개는 별도 파생 자산으로 보존하되 현재 목록 UI에서는 렌더링하지 않는다. 추후 캠페인·상세형 콘텐츠에서 재사용할 때도 같은 manifest와 프롬프트 정책을 따른다.

### 5-2. 저장 원칙

```text
artifacts/images/cat-first-v2/
  character-bible/
  prompts/
  source-png/
  contact-sheets/
  qa/

public/images/v2/
  home/
  scenarios/
  concepts/
  chapters/
```

- V1 파일은 즉시 삭제하거나 덮어쓰지 않는다.
- V2는 새 경로로 배포해 캐시 충돌을 막고, 승인 전에는 manifest 전환만 되돌려 롤백할 수 있게 한다.
- 원본 PNG는 `artifacts/images/cat-first-v2/source-png/`에 보관한다.
- `public/images/v2/`에는 WebP 또는 AVIF 최적화본만 둔다.
- 공개 전 V1 PNG의 `public/` 제거 여부는 Human Conductor 승인 후 결정한다.

## 6. 이미지 정보 구조 전면 교체

현재 `lib/scenario-assets.ts`의 대형 하드코딩 객체는 V2의 품종·캐릭터·버전 관리에 부족하다. `lib/content-image-manifest.ts`를 새 SSOT로 만들고 기존 함수는 전환 기간에만 호환 어댑터로 유지한다.

```ts
type ContentImageAsset = {
  id: string;
  contentSlug: string;
  src: string;
  altKo: string;
  catIds: string[];
  breedLabelsKo: string[];
  coatLabelsKo: string[];
  ageStage: 'kitten' | 'adult' | 'senior';
  mood: string;
  focalPoint: { x: number; y: number };
  safetyCrop: 'center' | 'face' | 'full-body';
  generated: true;
  version: 'cat-first-v2';
  promptRef: string;
};
```

필수 규칙:

- `altKo`는 장면과 행동을 한글로 설명하며 “이미지” 같은 무의미한 표현을 쓰지 않는다.
- 품종명은 화면 장식용 라벨로 자동 노출하지 않는다. 접근성 설명에 꼭 필요한 경우에만 사용한다.
- `catIds`와 `breedLabelsKo`는 다양성 QA를 위한 내부 메타다.
- `focalPoint`는 PC/MO 크롭 시 얼굴이 잘리지 않게 `object-position`으로 전달한다.
- 모든 자산은 `promptRef`를 통해 프롬프트, 생성일, 후보안, 승인 기록을 추적한다.
- 현재 `AI 생성` 배지 정책을 유지한다.

## 7. 실행 TASK 백로그

| Task ID | Pri | 태스크 | Owner(To) | CC | 선행 | 산출물 | 완료 기준 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TASK-CATVIS-000` | P0 | Cat-first 방향 결정 및 D-13 개정 | Jarvis | Joi, TARS, Human | 사용자 아이디어 | `00-decision-log.md`, `06-design-system.md` 개정안 | Cat-first 자산 원칙과 목록 비노출·상세 노출 정책을 SSOT에 반영 |
| `TASK-CATVIS-010` | P0 | V1 자산·화면 기준선 동결 | TARS | Joi, Friday | 000 | 인벤토리 JSON, PC/MO 캡처, V1 archive manifest | 80개 참조·파일·해시·사용 route가 1:1 매핑되고 missing 0 |
| `TASK-CATVIS-020` | P0 | 캐릭터 바이블·다양성 매트릭스 확정 | Joi | C3PO, KITT/TRON | 000 | `character-bible.md`, 14묘 시트, 86장 배정표 | 품종/믹스·모색·나이·털 길이 분산, 단일 캐릭터 12% 이하 |
| `TASK-CATVIS-030` | P0 | V2 스타일 POC 12장 생성 | Joi | TARS, C3PO, Human | 020 | 후보 2안, 12장 contact sheet, 프롬프트 | Cat-first 점유율·품종 식별·표정·크롭 QA 통과 및 Human 승인 |
| `TASK-CATVIS-040` | P0 | 홈 6장 + 시나리오 11장 생성 | Joi | TARS, C3PO | 030 | V2 원본·WebP/AVIF 17장, manifest rows | 각 카드 장면이 의미와 일치하고 연속 카드 고양이 중복 없음 |
| `TASK-CATVIS-050` | P1 | 주요 개념 27장 생성 | Joi | TARS, KITT/TRON | 030 | V2 원본·WebP/AVIF 27장, manifest rows | 행동·건강·안전 의미 보존, 신체 오류 0, 안전 카드 별도 QA 통과 |
| `TASK-CATVIS-060` | P1 | 챕터 42장 생성 | Joi | C3PO, TARS | 030 | V2 원본·WebP/AVIF 42장, manifest rows | 챕터 의미와 장면 일치, 42장 스타일·캐릭터 분산 QA 통과 |
| `TASK-CATVIS-070` | P0 | 이미지 manifest·resolver 전환 | TARS | Joi, C3PO | 040 | `content-image-manifest.ts`, resolver, 테스트 | 86개 asset ID unique, missing 0, 한글 alt 100%, V1 fallback 가능 |
| `TASK-CATVIS-080` | P0 | 홈·탐색·관련 목록 이미지 비노출 | TARS | Joi, C3PO | 040, 070 | `app/page.tsx`, `ScenarioCard`, `ConceptCard`, CSS | 모든 목록 카드 이미지 0, 제목·요약·CTA 및 키보드·링크 동작 유지 |
| `TASK-CATVIS-090` | P1 | 상세 대표 이미지 전환 및 crop 보정 | TARS | Joi | 050~070 | 시나리오·개념·챕터 상세 route V2 적용 | 390/430/768/1280px에서 대표 이미지의 눈·귀·발이 잘리지 않고 CLS 증가 없음 |
| `TASK-CATVIS-100` | P0 | 접근성·안전·품종 표현 QA | C3PO, KITT/TRON | Joi, TARS | 040~090 | QA 체크리스트, 수정 목록 | 한글 alt, 품종 고정관념 금지, 건강·안전 희화화 0, AI 배지 유지 |
| `TASK-CATVIS-110` | P0 | 성능·회귀 검증 | TARS | Friday, Diagnostic | 070~100 | lint/build/e2e, 이미지 검사, PC/MO 스크린샷 | lint/build/e2e 통과, 404 이미지 0, WebP/AVIF 용량 기준 충족 |
| `TASK-CATVIS-120` | P0 | Preview 승인 및 단계적 전환 | Friday | Jarvis, Joi, TARS, Human | 110 | preview URL, before/after, rollback 메모 | Human 승인 후 manifest V2 전환; production 배포는 별도 승인 |

## 8. 태스크별 상세 완료 기준

### TASK-CATVIS-030 — 스타일 POC 게이트

- 12장은 서로 다른 Cat ID를 사용한다.
- 최소 구성: 얼굴 클로즈업 4, 전신 동작 4, 두 마리 상호작용 2, 건강·안전 맥락 2.
- 모든 후보는 같은 프롬프트 골격, 조명, 렌더링 질감을 사용한다.
- 고양이 얼굴이 썸네일 160px에서도 식별되어야 한다.
- POC 승인 전 나머지 74장을 대량 생성하지 않는다.

### TASK-CATVIS-080 — 목록 카드 UI

- 홈 `quickQuestions`: 질문 유형 → 제목 → 설명의 텍스트 카드로 제공한다.
- `ScenarioCard`: 상황 라벨 → 제목 → 한 줄 설명 → CTA 순서를 유지하고 이미지를 표시하지 않는다.
- `ConceptCard`: 탐색 및 상세 하단 관련 목록에서 이미지와 `AI 생성` 배지를 표시하지 않는다.
- 상세 route의 대표 이미지와 manifest 연결은 유지한다.
- 목록의 제목·요약·CTA가 누락되지 않아야 한다.
- `prefers-reduced-motion`과 키보드 focus ring을 유지한다.

### TASK-CATVIS-110 — 기술 검증

- 정적 검사: 모든 manifest `src`가 실제 파일과 일치하고 404가 없어야 한다.
- 메타 검사: `altKo`, `catIds`, `ageStage`, `version`, `promptRef` 누락이 없어야 한다.
- 다양성 검사: Cat ID별 사용 수와 연속 카드 중복을 자동 리포트한다.
- 용량 기준: 카드 배포본 1장당 권장 180KB 이하, 예외는 250KB 이하.
- 공개 `public/` 폴더에는 중복 PNG를 두지 않는다.
- 명령: `npm run lint`, `npm run build`, `npm run test:e2e`, `npm run test:apps-in-toss`.
- 화면: 390×844, 430×932, 768×1024, 1280×800 스크린샷을 비교한다.

## 9. 정량 승인 기준

| 지표 | 목표 |
| --- | ---: |
| V2 콘텐츠 이미지 | 기존 80종 전면 교체 |
| 홈 파생 이미지 | 6종 추가 |
| 최소 캐릭터 다양성 | 14 Cat ID |
| 단일 Cat ID 최대 점유 | 전체의 12% 이하 |
| 한글 대체 텍스트 | 100% |
| manifest 메타 완성도 | 100% |
| 이미지 missing/404 | 0 |
| 생성 신체 오류 | 0 |
| 비안전 카드 고양이 프레임 점유 | 90% 이상 카드에서 65% 이상 |
| 모바일 안전 크롭 통과 | 100% |
| 공개 PNG 중복본 | 0 |

## 10. 리스크와 가드레일

| 리스크 | 대응 |
| --- | --- |
| 귀여움이 안전 메시지를 약화 | 건강·안전 카드 별도 비율과 KITT/TRON 리뷰 적용 |
| 품종별 행동 고정관념 | 캐릭터 배정을 시각 분산 기준으로 하고 품종을 성격 설명에 사용하지 않음 |
| 86장 일괄 생성 후 방향 불일치 | 12장 POC Human 승인 게이트 후 배치 생성 |
| 생성 일관성 붕괴 | 캐릭터 바이블, seed/프롬프트 골격, 털·눈·체형 고정 속성 관리 |
| 이미지 번들 증가 | 원본은 artifacts, public은 최적화본만 유지 |
| CDN 캐시로 구버전 노출 | `/images/v2/` 경로와 manifest 버전 전환 사용 |
| 기존 링크·광고 게이트 회귀 | 카드 내부 이미지는 비상호작용 요소로 유지하고 E2E 재검증 |

## 11. 이번 문서의 Out of Scope

- 실제 이미지 86장 생성 및 교체
- 프로덕션 배포
- 고집사 로고·앱 아이콘 즉시 변경
- 온톨로지 콘텐츠 문장 또는 안전 정책 변경
- 품종 추천, 품종 진단, 사용자 고양이 품종 판별 기능

## 12. 권장 실행 순서

```text
Human 방향 확인
  → D-13/Design System 개정
  → V1 기준선·롤백 manifest
  → 14묘 캐릭터 바이블
  → 12장 POC 승인
  → 홈·시나리오 17장 + 카드 UI
  → 개념 27장
  → 챕터 42장
  → 접근성·안전·성능 QA
  → Preview 승인
  → Production 별도 승인
```

가장 먼저 체감 효과를 확인할 수 있는 최소 실행 단위는 `TASK-CATVIS-000`부터 `TASK-CATVIS-040`, `TASK-CATVIS-070`, `TASK-CATVIS-080`까지다. 이 단계만 완료해도 홈과 탐색 첫 화면에서 Cat-first 방향을 검증할 수 있으며, 개념·챕터 69장은 같은 기준으로 후속 배치할 수 있다.
## 2026-07-16 스타일 앵커 재보정 완료

사용자 첨부 기준 이미지처럼 보이도록 21개 이미지를 추가 보정했다. 기준 앵커는 `public/images/v2/scenarios/grooming.webp`이며, 프롬프트 버전은 `cat-first-v5-style-anchor-r1`로 기록한다.

보정 대상:

- `concepts/action-play-enrichment`
- `concepts/knowledge-breed-context`
- `concepts/signal-box-seeking`
- `concepts/context-guardian-absence`
- `concepts/health-senior-change`
- `chapters/chapter-04`
- `chapters/chapter-29`
- `concepts/signal-fight-or-play`
- `chapters/chapter-30`
- `chapters/chapter-14`
- `chapters/chapter-35`
- `concepts/need-predictable-routine`
- `concepts/need-scent-familiarity`
- `chapters/chapter-36`
- `concepts/risk-unsafe-touch`
- `concepts/signal-vocalization`
- `concepts/signal-biting`
- `concepts/action-consult-expert`
- `chapters/chapter-34`
- `chapters/chapter-16`
- `concepts/context-family-change`

보정 방식:

- 기존 생성본과 기준 앵커 이미지를 함께 참조해 장면 맥락은 유지하고 스타일만 정렬했다.
- 원본 PNG는 `artifacts/images/cat-first-v2/source-png/`에 유지하고, 배포본은 `public/images/v2/` WebP로 갱신했다.
- 교체 전 원본은 `artifacts/images/cat-first-v2/qa/style-anchor-correction-2026-07-16/before/`에 보관했다.
- 교체 후 검수본은 `artifacts/images/cat-first-v2/qa/style-anchor-correction-2026-07-16/after/`에 보관했다.

QA 결과:

- 보정 대상 누락: 0
- 보정 대상 public WebP 누락: 0
- 전체 public WebP 1024x1024 위반: 0
- 180KB 초과 WebP: 0
- 중복 해시는 `home`과 `home-v5` 보관본의 동일 이미지에서만 발생한다. 현재 목록 UI는 홈 질문 이미지를 렌더링하지 않으므로 배포 화면 영향은 없다.
- 검수 시트: `artifacts/images/cat-first-v2/qa/style-anchor-correction-2026-07-16/style-anchor-correction-after-contact-sheet.png`
- 전후 비교 시트: `artifacts/images/cat-first-v2/qa/style-anchor-correction-2026-07-16/style-anchor-correction-before-after-contact-sheet.png`
