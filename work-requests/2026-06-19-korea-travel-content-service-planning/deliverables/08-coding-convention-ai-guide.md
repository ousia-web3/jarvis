# Coding Convention & AI Collaboration Guide

## 1. 적용 범위

향후 실제 구현에 들어갈 때 적용할 개발/AI 협업 기준이다. 현재 요청에서는 코드 구현 없이 서비스 기획 문서까지만 작성했다.

## 2. 권장 레포 구조

```text
apps/
  web/
  admin/
packages/
  ui/
  domain/
  config/
  analytics/
services/
  content-api/
  ingestion-worker/
docs/
  product/
  architecture/
  content-ops/
```

## 3. 도메인 네이밍

- `Region`: 행정구역 또는 여행권역
- `Food`: 메뉴/음식 개념
- `FoodPlace`: 실제 음식점 또는 먹을 수 있는 장소
- `Attraction`: 관광지/체험지
- `VideoInspiration`: 영상 기반 영감 카드
- `ImageSlot`: 이미지가 들어갈 위치와 권리 상태
- `TravelerSegment`: 국적/권역/동행/관심사 세그먼트

## 4. 개발 원칙

- 도메인 로직은 UI에서 분리한다.
- 추천 점수 계산은 테스트 가능한 순수 함수로 둔다.
- 콘텐츠 권리 상태와 공개 상태는 별도 필드로 관리한다.
- 이미지가 없을 때도 카드와 상세 레이아웃이 깨지지 않아야 한다.
- 다국어 필드는 원문과 번역을 분리하고, 번역 누락 시 한국어 fallback 정책을 명시한다.

## 5. 테스트 기준

- 콘텐츠 공개 조건 테스트:
  - 출처 없음이면 공개 불가
  - 상세 페이지 이미지 슬롯 없음이면 공개 불가
  - `blocked` 이미지가 연결되면 공개 불가
- 추천 테스트:
  - 추천 이유가 비어 있으면 노출 불가
  - 국적/권역만으로 단정 문구 생성 금지
- UI 테스트:
  - 모바일/데스크톱에서 배너 비율 유지
  - 긴 한국어 제목 2줄 처리
  - 이미지 placeholder 상태 텍스트 표시

## 6. AI 협업 규칙

- AI는 유튜브 원본 영상이나 썸네일을 재배포용 자산으로 저장하지 않는다.
- AI가 생성한 국적별 선호는 `가설`로 표시하고 Data 검토를 거친다.
- AI가 만든 음식/관광 설명은 운영자 검수를 거쳐 공개한다.
- AI 번역은 C3PO 또는 현지화 리뷰 후 공개한다.
- 개인정보, 예약/결제, 외부 배포는 Human Conductor 승인 전 실행하지 않는다.

## 7. 콘텐츠 작성 규칙

- 단정 대신 설명형 문장을 쓴다.
  - 권장: "가족 여행자에게 이동 부담이 낮은 코스입니다."
  - 금지: "가족은 무조건 좋아합니다."
- 국적 추천은 이유를 함께 쓴다.
  - 예: "짧은 일정과 음식 탐색을 선호하는 여행자에게 적합합니다."
- 음식 정보에는 재료, 맵기, 주문 난이도, 알레르기 주의를 포함한다.
- 운영시간, 가격, 예약 정보는 마지막 확인일을 표시한다.

## 8. PR/리뷰 체크리스트

- [ ] PRD 식별자와 코드/테스트 이름이 연결되는가
- [ ] 이미지 슬롯 상태가 누락되지 않았는가
- [ ] 권리 상태가 공개 조건에 반영되는가
- [ ] 국적/동행 추천 문구가 고정관념을 만들지 않는가
- [ ] 한국어/영어/일본어 확장 필드가 깨지지 않는가
- [ ] 접근성 대체 텍스트가 있는가
- [ ] 온톨로지 관계가 `Evidence`와 승인 상태를 갖는가
- [ ] 승인되지 않은 relation assertion이 공개 추천 이유에 쓰이지 않는가

## 9. 온톨로지 구현/AI 작성 규칙

- 클래스 키는 PascalCase(`TravelerSegment`, `VideoInspiration`)로, 관계 키는 camelCase(`recommendedFor`, `featuresFood`, `hasEvidence`)로 표기한다.
- `recommendedFor`, `inspiredByVideo`, `hasRightsPolicy`는 공개 추천 또는 권리 판단에 영향을 주므로 `Evidence`와 승인 로그 없이는 public API에 노출하지 않는다.
- AI는 관계 후보를 만들 수 있지만, 공식 관계로 승격하지 않는다. 공식 승격은 Relation Review의 운영자 승인 이벤트로만 처리한다.
- 음식/관광/지역 설명이 온톨로지 관계를 근거로 사용할 때는 사용자 화면에 단정형 문구가 아니라 설명 가능한 추천 이유로 표시한다.
- graph projection은 원장 테이블에서 재생성 가능해야 하며, projection 테이블을 단일 진실 공급원으로 취급하지 않는다.

## 10. Supabase 연동 규칙

- 프로젝트 전용 스키마 기본값은 `korea_travel_content`이다.
- Supabase client는 반드시 `db.schema` 옵션을 지정한다.

```ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key, {
  db: { schema: "korea_travel_content" },
});
```

- 애플리케이션 코드에서는 `.from("content_items")`처럼 스키마 prefix 없이 테이블명만 사용한다.
- SQL Editor, migration, raw SQL에서는 `korea_travel_content.content_items`처럼 스키마를 명시한다.
- `public` 스키마에는 신규 앱 테이블을 만들지 않는다.
- 클라이언트에는 publishable key 또는 anon key만 사용하고, service role key는 서버 전용 환경 변수로 분리한다.
- RLS가 활성화되지 않은 테이블은 public client에서 접근하지 않는다.
