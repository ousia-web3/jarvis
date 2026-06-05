# Data/EVE 데이터·리서치 도구 운영 지침

## 목적

이 문서는 Data와 EVE가 사용자 행동 데이터, 봇 시뮬레이션, 영상 메타데이터를 다룰 때 참고하는 운영 기준이다. 기존 문서에 언급된 Microsoft Clarity, Google Tag Manager, yt-dlp, 500명 봇 페르소나, 영상 메타데이터 수집을 실제 작업에서 안전하게 사용할 수 있도록 역할, 태깅, 수집 범위, 리스크 게이트를 명확히 한다.

## 적용 범위

- Data: 행동 이벤트 설계, 봇 시뮬레이션 로그, KPI, 페르소나 분류, 태깅 스키마
- EVE: 공개 영상 메타데이터 수집 계획, 수집 범위, 출처와 한계 기록
- KITT/TRON: 개인정보, 추적 동의, 플랫폼 약관, 저작권, 외부 공개 리스크 검토
- Friday: To/CC 배정, 산출물과 완료 기준 관리

## 도구별 위치

| 도구 | 담당 | 용도 | 기본 상태 |
| --- | --- | --- | --- |
| Microsoft Clarity | Data | 행동 분석, heatmap/session replay, custom tag 기반 세그먼트 분석 | 실제 사이트 적용 전 KITT/TRON 검토 필요 |
| Google Tag Manager | Data, TARS | dataLayer 이벤트와 Clarity/분석 태그 발화 관리 | 운영 사이트 적용 전 동의/태그 검토 필요 |
| yt-dlp | EVE | 공개 영상 메타데이터 수집과 리서치 입력 생성 | 다운로드보다 메타데이터 우선, 약관 검토 필요 |
| 봇 시뮬레이션 | Data | 실제 사용자 데이터 없이 페르소나별 행동 가설 검증 | 실제 사용자 데이터와 반드시 분리 |

## 공통 원칙

- 실제 사용자 행동 추적, 외부 플랫폼 데이터 수집, 공개 배포는 KITT/TRON을 CC로 포함한다.
- 개인정보, 계정 정보, 결제 정보, 민감 입력값, 실사용자 식별자는 수집하지 않는다.
- 봇 시뮬레이션 데이터와 실제 사용자 데이터는 저장소, 태그, 세션 식별자를 분리한다.
- 수집 속도와 건수는 목표가 아니라 안전 한도와 플랫폼 정책 안에서 정한다.
- `초당 100편`, `1,686편` 같은 수치는 원본 가이드의 예시/벤치마크 후보로만 취급하고, 운영 SLA로 쓰지 않는다.
- 실험 결과는 전환율 확정값이 아니라 UX/카피/상품 가설 검증 입력으로만 사용한다.

## Microsoft Clarity와 GTM 지침

### 사용 조건

Clarity 또는 GTM을 실제 사이트에 적용하려면 다음이 먼저 필요하다.

- 사이트 소유권과 적용 환경 확인
- 개인정보 처리방침 또는 사이트 고지 문구 검토
- 쿠키/추적 동의 방식 확인
- 민감 입력 영역 masking 확인
- 봇 시뮬레이션과 실제 사용자 세션 분리
- KITT/TRON의 `Pass` 또는 `Pass with Changes`

### Data의 설계 책임

Data는 다음을 설계한다.

- 어떤 행동 이벤트를 남길지
- 이벤트별 필수 속성
- Clarity custom tag key/value 규칙
- GTM `dataLayer.push()` 이벤트명
- 봇 시뮬레이션 데이터와 실제 사용자 데이터 구분 규칙
- 분석에 쓰지 않을 금지 필드

### GTM dataLayer 이벤트 예시

```html
<script>
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "jarvis_persona_event",
  jarvis_request_id: "youtube-shop-pilot",
  simulation_run_id: "sim-2026-05-22-001",
  is_bot_simulation: true,
  persona_type: "value_seeker",
  event_name: "cta_click",
  page_type: "landing",
  cta_id: "primary_offer",
  drop_reason: null
});
</script>
```

### Clarity custom tag 예시

Clarity custom tag는 분석 필터로 쓸 최소값만 보낸다.

```html
<script>
if (window.clarity) {
  clarity("set", "jarvis_request_id", "youtube-shop-pilot");
  clarity("set", "is_bot_simulation", "true");
  clarity("set", "persona_type", "value_seeker");
  clarity("set", "simulation_run_id", "sim-2026-05-22-001");
}
</script>
```

### 금지 필드

다음 값은 GTM, Clarity, JSONL, work request evidence 어디에도 기록하지 않는다.

- 이름, 이메일, 전화번호, 주소
- 계정 ID, 고객 ID, 주문 ID 원문
- 결제 정보, 계좌 정보, 인증 토큰
- 자유 입력창 원문
- 개인을 재식별할 수 있는 세션 조합
- 외부 서비스 비밀키 또는 project secret

## 봇 시뮬레이션 이벤트 스키마

봇 시뮬레이션은 실제 사용자를 대신하는 합성 데이터다. Data는 모든 봇 이벤트에 `is_bot_simulation: true`를 포함한다.

```json
{
  "schema_version": "1.0",
  "request_id": "youtube-shop-pilot",
  "simulation_run_id": "sim-2026-05-22-001",
  "persona_id": "bot-0001",
  "persona_type": "value_seeker",
  "session_id": "synthetic-session-0001",
  "is_bot_simulation": true,
  "event_time": "2026-05-22T10:00:00+09:00",
  "event_name": "cta_click",
  "page_type": "landing",
  "page_variant": "A",
  "content_topic": "youtube-commerce",
  "product_category": "digital_tool",
  "price_sensitivity": "high",
  "trust_barrier": "low_social_proof",
  "cta_id": "primary_offer",
  "conversion_stage": "consideration",
  "drop_reason": null
}
```

### 표준 이벤트명

- `landing_view`
- `hero_scroll`
- `cta_click`
- `product_detail_view`
- `cart_add_intent`
- `checkout_intent`
- `drop_off`
- `trust_signal_view`
- `copy_objection_detected`

### 페르소나 유형

- `skeptic`
- `trend_watcher`
- `value_seeker`
- `change_seeker`
- `founder_operator`

## yt-dlp 운영 지침

### EVE의 기본 원칙

EVE는 yt-dlp를 "영상 다운로드 도구"가 아니라 "공개 메타데이터 수집 보조 도구"로 우선 취급한다. 영상 파일, 오디오 파일, 자막 전문, 댓글 전문 수집은 기본 범위가 아니다.

### 사용 전 체크

- 수집 대상 URL이 공개 자료인지 확인한다.
- 플랫폼 약관, robots/접근 제한, 저작권 리스크를 확인한다.
- 영상 파일 다운로드가 필요한 경우 Human Conductor와 KITT/TRON 승인을 받는다.
- 수집 목적, 범위, 예상 건수, 실패 처리 방식을 Friday 태스크에 명시한다.
- API 키, 로그인 세션, 쿠키 파일, 계정 우회는 사용하지 않는다.

### 메타데이터 우선 명령 예시

아래 명령은 운영 전 예시이며, 실제 실행 전 KITT/TRON 검토가 필요하다.

```powershell
yt-dlp --skip-download --dump-json "https://www.youtube.com/watch?v=VIDEO_ID" > metadata.jsonl
```

재생목록이나 대량 수집은 한 번에 크게 돌리지 않고 샘플 검증 후 단계적으로 늘린다.

```powershell
yt-dlp --skip-download --flat-playlist --dump-json "https://www.youtube.com/playlist?list=PLAYLIST_ID" > playlist-metadata.jsonl
```

### EVE 메타데이터 출력 필드

EVE는 가능한 경우 다음 필드만 분석 입력으로 넘긴다.

- `video_id`
- `webpage_url`
- `title`
- `channel`
- `channel_id`
- `upload_date`
- `duration`
- `view_count`
- `like_count`
- `comment_count`
- `categories`
- `tags`
- `description_summary`
- `source_query`
- `collected_at`
- `collection_limit`
- `known_limitations`

`description` 전체 원문은 기본 저장하지 않는다. 필요한 경우 요약 또는 키워드 추출 결과만 남긴다.

### 수집 속도와 건수

- `1,686편`과 `초당 100편`은 원본 가이드의 시나리오 예시로만 본다.
- 운영 작업에서는 플랫폼 정책, 네트워크 안정성, 실패율, 재시도 비용, 차단 위험을 기준으로 별도 한도를 정한다.
- 대량 수집은 `샘플 10개 -> 소규모 배치 -> 전체 배치` 순서로 검증한다.
- 실패한 URL, 제외한 URL, 중복 제거 기준을 함께 남긴다.

## KITT/TRON 리스크 게이트

다음 조건 중 하나라도 있으면 KITT/TRON 검토가 필수다.

- 실제 사이트에 Clarity 또는 GTM을 삽입한다.
- 실제 사용자 세션, heatmap, session replay, cookie, device 정보가 수집된다.
- 외부 플랫폼에서 100개 이상 URL을 배치 수집한다.
- 영상/자막/댓글/이미지 등 저작권 대상 콘텐츠를 저장한다.
- 로그인, 쿠키, 인증 세션, 우회 접근이 필요하다.
- 수집 결과를 외부 공개 자료나 고객 보고서에 사용한다.

KITT/TRON 판정 전에는 문서 설계와 로컬 샘플 검토까지만 진행한다.

## 산출물 형식

### Data 행동 분석 설계

```text
Data Behavior Tracking Plan

Request ID:
Site / Environment:
Is Real User Tracking:
Consent / Disclosure Status:
Event Names:
Required Properties:
Forbidden Properties:
Bot Separation Rule:
Clarity Tags:
GTM Triggers:
KPI Mapping:
Limitations:
KITT/TRON Decision:
```

### EVE 영상 메타데이터 수집 계획

```text
EVE Video Metadata Collection Plan

Research Question:
Source URLs / Queries:
Collection Tool:
Metadata Fields:
Collection Limit:
Rate / Batch Plan:
Excluded Data:
Storage Path:
Known Limitations:
Platform / Copyright Risk:
KITT/TRON Decision:
```

## 참고 출처

- Microsoft Clarity custom tags: https://learn.microsoft.com/en-us/clarity/filters/custom-tags
- Microsoft Clarity consent management: https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-management
- Microsoft Clarity masking: https://learn.microsoft.com/en-gb/clarity/setup-and-installation/clarity-masking
- Google Tag Manager data layer: https://developers.google.com/tag-platform/tag-manager/datalayer
- Google Tag Manager tags: https://support.google.com/tagmanager/answer/3281060
- yt-dlp official README: https://github.com/yt-dlp/yt-dlp/blob/master/README.md
