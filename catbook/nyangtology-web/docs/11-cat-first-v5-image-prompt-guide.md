# Cat-first V5 전체 이미지 생성 프롬프트 가이드

> prompt set: `cat-first-v5-v3-depth-reference`  
> 생성 방식: built-in `image_gen`, 콘텐츠별 1회 호출  
> 핵심 불변 조건: 기존 동일 콘텐츠 이미지의 배경 원근 거리 유지

## 1. 입력 이미지 역할

- 각 `public/images/{scenarios,concepts,chapters}/*.png`는 **배경 거리·구도 레퍼런스**다.
- 기존 고양이의 품종·모색·사람 얼굴·렌더링 스타일을 그대로 복사하는 편집 타깃이 아니다.
- 유지: 카메라 위치, 배경까지의 거리, 바닥 원근, 주요 사물 크기, 장면의 의미.
- 변경: Cat ID, 모색·나이·체형, 선화·채색, 사람의 시각적 우선순위.

## 2. 공통 베이스 프롬프트

```text
Use case: illustration-story
Asset type: square editorial image for a Korean cat-behavior web card
Input image: composition and background-distance reference

Edit the supplied Nyangtology illustration while treating it as the strict camera-distance and spatial-depth reference. Preserve the same camera position, natural lens feeling, crop, floor recession, scale of the main props, and compact domestic background. Keep the narrative meaning of the source scene. Do not zoom out, reveal a wider room, add a long corridor, create a dramatic vanishing point, exaggerate wide-angle distortion, or introduce unrelated foreground framing.

Replace the cat identity with the assigned CAT ID and preserve its breed, coat, age, body type, eye color, and distinguishing features. The cat must remain the clear focal point and be readable from ears to paws whenever the source composition permits. If a person exists, simplify them to a calm hand, knees, shoulder, side view, or back view; keep the same spatial distance but do not let the human face dominate.

Style/medium: original early-2000s Japanese hand-drawn theatrical cat-fantasy animation feeling, using the clean, gentle, lightly comedic visual language associated with classic Japanese cat cinema without copying any existing character, production design, or film frame. Thin warm-charcoal outlines, appealing natural anatomy, broad matte cel colors, one simple cel-shadow shape, opaque softly painted background, restrained analogue warmth.

Constraints: square 1:1, no text inside the image, no logo, no signature, no watermark, no external copyrighted thumbnail resemblance.
Avoid: watercolor, storybook wash, paper grain, pastel chalk, 3D, CGI, photorealism, glossy modern anime key art, excessive individual fur strands, giant face-only close-up, tiny distant cat, fisheye, extra limbs, merged paws, duplicate ears, broken whiskers, extra or missing tail.
```

## 3. 장면 변수

각 자산은 공통 프롬프트 뒤에 다음 변수를 붙인다.

```text
Content slug: {slug}
Narrative: {title_or_behavior}
Assigned cat: {cat_id} — {breed_and_coat}, {age_and_body}, {eyes_and_signature}
Scene focus: {one_sentence_scene_focus}
Emotion: {neutral_behavioral_emotion}
Invariant props: {main_props_from_reference}
Safety rule: {normal | health | interaction | outdoor_rescue}
```

## 4. 카테고리 추가 가드레일

### 4-1. 건강·관찰

```text
Show a calm observation moment, not a diagnosis or treatment scene. No vomit, feces, urine, blood, syringe, stethoscope, white coat, pain spectacle, collapsed body, or falsely cheerful sick cat. Use subdued neutral emotion and preserve respectful distance.
```

적용: `not-eating`, `vomiting`, `litter`, `health-*`, 챕터 19~24, 34~35.

### 4-2. 거리 요청·접촉

```text
Show defensive uncertainty rather than aggression. Ears may turn sideways, body may lean back, and tail may stay low. No leap, chase, raised paw, exposed claws, dramatic fangs, attack, or cornered retreat route. Any human hand must be small, stopped, and safely separated.
```

적용: `hissing`, `signal-biting`, `signal-tail-ear-tension`, `risk-unsafe-touch`, 챕터 14·16·18.

### 4-3. 다묘 관계

```text
Keep both cats anatomically separate with clear silhouettes, individual tails, and an unobstructed route. Do not stage a fight. Use parallel observation, separated resting zones, scent exchange, or balanced play with no cat continuously pinned.
```

적용: `second-cat`, `signal-fight-or-play`, `need-scent-familiarity`, `action-separate-and-reset`, 챕터 25~30.

### 4-4. 놀이·우다다

```text
Use one readable action arc with all four limbs anatomically coherent. Keep toys secondary and safe; no string wrapped around the neck or limbs, no open window, and no dangerous collision. Preserve the reference room distance instead of turning the scene into a panoramic action shot.
```

적용: `sudden-run`, `action-play-enrichment`, 챕터 01·15·42, 홈 `갑자기 뛰어요`.

### 4-5. 실외·구조

```text
Keep the observer at a safe distance and avoid dramatic rescue handling. No bare-hand capture, chasing, traffic peril, open carrier trap spectacle, injury, or abandoned-kitten melodrama. The scene should communicate observe, assess, and contact help.
```

적용: `risk-unsafe-rescue`, 챕터 32.

## 5. 캐릭터 고정 문구

| Cat ID | 프롬프트 고정 문구 |
| --- | --- |
| CAT-01 | small calico domestic shorthair kitten, white chest, orange-and-black patches, round forehead, short front legs |
| CAT-02 | chubby adult orange-tabby domestic shorthair, pink nose, softly curled tail, amber eyes |
| CAT-03 | senior black-and-white tuxedo domestic shorthair, white chest and socks, relaxed yellow-green eyes |
| CAT-04 | chubby adult blue British Shorthair, dense round cheeks, amber eyes, straight ears |
| CAT-05 | slim senior Russian Blue, natural silver-gray coat, green eyes, dignified narrow face |
| CAT-06 | large adult seal-point Ragdoll, blue eyes, soft cream body, fluffy chest ruff |
| CAT-07 | large adult brown-tabby Maine Coon, tufted ears, broad paws, long plume tail |
| CAT-08 | cream-and-white Norwegian Forest kitten, medium fluffy body, neck ruff, plume tail |
| CAT-09 | slim adult seal-point Siamese, large ears, blue eyes, long dark tail |
| CAT-10 | athletic adult golden Bengal, clear rosette coat, green-gold eyes, muscular but natural body |
| CAT-11 | slim adult ruddy Abyssinian, warm ticked coat, large ears, curious gold eyes |
| CAT-12 | adult white Turkish Angora, medium body, long silky tail, one blue eye and one amber eye |
| CAT-13 | slim adult gray-pink Sphynx, large ears, natural skin folds, soft blanket used only when context fits |
| CAT-14 | chubby silver Scottish Straight kitten, straight ears, round face, pale green eyes |

## 6. 출력·저장·검수

- 원본: `artifacts/images/cat-first-v2/source-png/{home,scenarios,concepts,chapters}/`
- 배포본: `public/images/v2/{home,scenarios,concepts,chapters}/*.webp`
- contact sheet: `artifacts/images/cat-first-v2/contact-sheets/`
- QA: `artifacts/images/cat-first-v2/qa/` 및 work-request evidence
- 배포본: 1024×1024, 권장 180KB 이하, 최대 250KB 이하.
- 신체 오류, 잘못된 모색, 건강·안전 과장, 원근 거리 드리프트가 있으면 해당 자산만 단일 변경으로 재생성한다.
## 2026-07-16 스타일 앵커 보정 기준

이번 보정의 최종 기준 이미지는 `public/images/v2/scenarios/grooming.webp`이다. 이후 재생성 프롬프트는 `cat-first-v5-style-anchor-r1`로 기록하며, 아래 조건을 공통 게이트로 둔다.

- 기준 이미지를 스타일 앵커로 사용한다: 따뜻한 실내 자연광, 세밀한 웜 차콜 라인, 불투명한 셀 채색, 세이지 그린과 더스티 블루 포인트, 부드러운 단일 그림자 계열.
- "수채", "동화책", "종이 질감", "파스텔 워시", "납작한 베이지 단색" 느낌은 제외한다.
- 고양이는 중거리 구도에서 충분히 크게 보여야 한다. 배경 원근은 기존 생성 이미지와 같은 거리감으로 유지하고, 과한 광각이나 과한 클로즈업을 피한다.
- 사람은 손, 무릎, 옆모습 정도의 보조 요소로만 사용한다. 고양이보다 먼저 읽히면 재생성한다.
- 건강/안전 맥락은 진단, 치료, 공포, 공격, 경고 아이콘처럼 읽히지 않게 관찰과 돌봄 장면으로 처리한다.
- 이미지 내부에는 텍스트, 로고, 말풍선, 경고 아이콘, 효과선, 상징 마크를 넣지 않는다.

이번 보정에서 잘못된 예로 판정한 유형은 다음과 같다.

- 고양이보다 사람이나 실내 배경이 먼저 보이는 이미지
- 배경 원근이 지나치게 넓어져 고양이가 작아진 이미지
- 기존 기준보다 라인이 두껍거나 벡터처럼 보이는 이미지
- 베이지 톤이 평평하게 깔려 카드 간 깊이와 온기가 사라진 이미지
- 소리선, 위험 표시, 의료 상징처럼 콘텐츠 의미를 과장하는 이미지
