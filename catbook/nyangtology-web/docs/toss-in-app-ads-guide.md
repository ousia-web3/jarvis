# 냥톨로지 Toss 인앱광고 운영 가이드

## 문서 목적

이 문서는 냥톨로지 Apps in Toss WebView 미니앱의 인앱광고 구현, 노출 규칙, 환경 변수, 테스트, AIT 산출물 관리 기준을 한곳에 정리한 운영 기준서다. Toss의 일반 정책과 냥톨로지 앱이 직접 결정하는 규칙을 구분하며, 광고 코드나 AIT를 변경하기 전에 이 문서를 먼저 확인한다.

- 대상 앱: `catbook/nyangtology-web`
- SDK: `@apps-in-toss/web-framework` 2.10.4
- 적용 유형: 전면형 광고, WebView 리스트형 배너 광고
- 기준일: 2026-07-14
- 관련 설정 문서: [`apps-in-toss-setup.md`](./apps-in-toss-setup.md)

## 현재 상태 요약

| 항목 | 현재 상태 |
| --- | --- |
| 전면형 코드 | 구현됨 |
| 배너 코드 | 구현됨 |
| 전면형 횟수 | 질문·상황 각각 하루 2회 무료, 3회차부터 매번 광고 시도 |
| 횟수 저장소 | 기기 WebView `localStorage` |
| 로그인·Toss 서버 카운터 | 사용하지 않음 |
| 광고 실패 시 | 콘텐츠 결과 또는 페이지 이동을 계속 시도 |
| 현재 AIT | 테스트 광고 ID가 포함된 로컬 산출물 |
| 운영 광고 ID | 미적용 |
| 콘솔 QR 실기기 검증 | 별도 수행 필요 |

현재 AIT는 운영 수익용이 아니다. 운영 광고 그룹 ID를 넣은 별도 AIT를 만들고 콘솔 QR 테스트와 릴리스 검증을 완료하기 전까지 운영 광고가 적용됐다고 판단하지 않는다.

## 책임 구분

### 냥톨로지 앱이 결정하는 항목

- 광고를 배치할 화면과 위치
- 전면형 광고를 호출할 사용자 행동과 횟수
- 질문·상황 카운터의 분리와 날짜 초기화
- 광고 로드 실패·미지원 상황의 콘텐츠 제공 방식
- 테스트 ID와 운영 ID를 넣어 빌드할 시점

### Toss SDK와 광고 네트워크가 처리하는 항목

- 광고 요청, 수신, 노출 시도와 실제 노출
- Toss Ads 또는 Google AdMob 등 광고 네트워크 선택
- 광고 재고 없음(`onNoFill`)과 렌더 실패 처리 이벤트
- 노출·클릭·수익 집계
- 배너 광고의 SDK 기본 자동 갱신

Toss 정책이 냥톨로지의 “하루 2회 무료” 규칙을 대신 적용하지 않는다. 해당 횟수는 앱 코드에서 정한다. Toss 콘솔의 사용자당 일 평균 노출 횟수는 운영 결과를 분석하는 지표이며 앱의 횟수 제한 설정값이 아니다.

## 전면형 광고

### 구현 파일

- 횟수·카운터: [`lib/ad-gate.ts`](../lib/ad-gate.ts)
- 광고 로드·표시: [`lib/apps-in-toss-integrated-ad.ts`](../lib/apps-in-toss-integrated-ad.ts)
- 질문 흐름: [`components/ask-panel.tsx`](../components/ask-panel.tsx)
- 상황 흐름: [`components/ad-gated-scenario-link.tsx`](../components/ad-gated-scenario-link.tsx)

### 현재 노출 횟수

`AD_GATE_FREE_RESULT_LIMIT` 값은 `2`다.

| 이용 순서 | 질문 결과 | 상황 상세 이동 |
| --- | --- | --- |
| 1회차 | 광고 없음 | 광고 없음 |
| 2회차 | 광고 없음 | 광고 없음 |
| 3회차 | 광고 시도 | 광고 시도 |
| 4회차 이후 | 매번 광고 시도 | 매번 광고 시도 |

“광고 시도”는 실제 노출 성공을 보장하지 않는다. 광고가 로드되지 않거나 표시가 실패해도 현재 구현은 질문 결과를 제공하거나 상황 페이지로 이동한다.

### 카운터 저장 규칙

| 구분 | `localStorage` 키 |
| --- | --- |
| 질문 | `nyangtology:ad-gate:ask` |
| 상황 | `nyangtology:ad-gate:scenario` |

- 질문과 상황 카운터는 서로 영향을 주지 않는다.
- 저장 값은 `{ date, count }` 형식이다.
- 저장된 날짜가 오늘과 다르면 조회 시 `count=0`으로 판단한다.
- 자정에 타이머로 데이터를 삭제하지 않는다. 날짜 변경 후 첫 조회에서 논리적으로 초기화되고, 다음 이용 기록 시 오늘 날짜로 덮어쓴다.
- `localStorage` 삭제, WebView 데이터 초기화 또는 앱 재설치가 발생하면 카운터도 초기화될 수 있다.
- 로그인 사용자 ID, Toss 사용자 키, 서버 데이터베이스를 사용하지 않는다.

### 호출 흐름

1. `/ask` 또는 `/explore` 진입 시 전면형 광고를 미리 로드한다.
2. 무료 횟수가 남아 있으면 광고 없이 결과를 제공하고 카운터를 1 증가시킨다.
3. 무료 횟수를 소진했으면 광고 안내 UI를 먼저 표시한다.
4. 사용자가 광고 보기 버튼을 누르면 `showFullScreenAd`를 호출한다.
5. 광고 종료·보상 이벤트 또는 표시 실패 후 결과 제공이나 페이지 이동을 계속한다.
6. 광고 처리 후 다음 광고를 다시 미리 로드한다.

현재 구현은 `dismissed`와 `userEarnedReward`를 모두 완료 신호로 처리하며, 표시 실패 결과도 사용자 흐름을 막지 않는다. 따라서 엄격한 리워드 지급 흐름이 아니라 전면형 광고와 실패 허용형 콘텐츠 게이트에 가깝다. 리워드형으로 운영할 경우에는 `userEarnedReward` 이벤트가 발생했을 때만 보상을 제공하도록 별도 변경해야 한다.

### 환경 변수

```dotenv
NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED=0
NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID=
```

두 조건이 모두 충족돼야 전면형 광고 게이트가 활성화된다.

- `NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED=1`
- `NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID`에 유효한 광고 그룹 ID 존재

## WebView 배너 광고

### 구현 파일과 위치

- 공통 컴포넌트: [`components/toss-banner-ad.tsx`](../components/toss-banner-ad.tsx)

| 화면 | 배치 위치 | placement 값 |
| --- | --- | --- |
| 홈 | 주요 질문 목록 아래 | `home-questions` |
| 개념 상세 | 관련 콘텐츠 하단 | `concept-detail` |
| 상황 상세 | 관련 콘텐츠 하단 | `scenario-detail` |

배너를 배치하지 않는 화면은 `/ask`, `/explore`, `/safety`, 인트로, 로딩, 팝업이다. `/ask`와 `/explore`는 전면형 광고를 미리 로드하므로 배너와 분리한다.

### 동작 규칙

- `TossAds.initialize`는 앱 세션에서 한 번만 실행한다.
- `TossAds.attachBanner`로 빈 DOM 컨테이너에 광고를 부착한다.
- 컨테이너는 너비 `100%`, 높이 `96px`을 사용한다.
- 광고 재고 없음이나 렌더 실패 시 배너 영역을 숨긴다.
- 컴포넌트가 화면에서 제거되면 `destroy()`를 호출한다.
- 앱 코드에서 수동 새로고침을 추가하지 않는다.

Toss 공식 문서 기준으로 배너는 렌더링 후 10초 이상 경과하거나 화면 visibility가 `false`에서 `true`로 바뀔 때 SDK가 자동 갱신한다. 화면의 50% 이상이 1초 이상 보이면 `onAdViewable` 기준의 수익 노출로 집계된다.

### 환경 변수

```dotenv
NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED=0
NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID=
```

두 조건이 모두 충족돼야 배너 부착을 시도한다.

- `NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED=1`
- `NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID`에 유효한 광고 그룹 ID 존재

## 광고 정책 기준

- 서비스 진입 직후 전체 화면을 막는 광고를 배치하지 않는다.
- 광고와 콘텐츠를 혼동시키거나 광고 클릭을 유도하는 문구·UI를 만들지 않는다.
- SDK의 클릭·노출 이벤트나 기본 자동 갱신 동작을 변조하지 않는다.
- 같은 화면에 동일 형식 광고 슬롯을 2개 이상 배치하지 않는다.
- 광고를 버튼, 카드 등 상호작용 요소와 겹치거나 오클릭이 발생할 정도로 가깝게 두지 않는다.
- 안전 안내, 건강 이상·응급 정보, 인증·결제 흐름은 광고로 막지 않는다.
- 과도한 노출로 정상적인 서비스 이용을 방해하지 않는다.
- 개발·검증 중에는 반드시 테스트 ID를 사용한다. 운영 ID로 테스트하지 않는다.

현재 “3회차부터 매번 전면형 광고 시도” 규칙은 앱 코드의 정책이며 Toss가 자동으로 빈도를 낮춰준다고 가정하면 안 된다. 운영 전에는 콘솔의 사용자당 일 평균 노출 횟수와 이탈률을 확인하고 필요하면 쿨다운, 세션 최대 횟수 또는 매 N회 노출 방식으로 조정한다.

## 테스트 광고 ID

Toss 공식 개발 문서가 현재 안내하는 테스트 ID는 다음과 같다.

| 유형 | 테스트 ID |
| --- | --- |
| 전면형 | `ait-ad-test-interstitial-id` |
| 리워드 | `ait-ad-test-rewarded-id` |
| WebView 리스트형 배너 | `ait-ad-test-banner-id` |
| WebView 피드형 배너 | `ait-ad-test-native-image-id` |

2026-07-14에 생성된 현재 AIT에는 전면형 예제 ID `ait.dev.43daa14da3ae487b`와 리스트형 배너 테스트 ID `ait-ad-test-banner-id`가 포함돼 있다. 전면형 예제 ID는 공식 FAQ에도 예시로 표시되지만, 다음 테스트 빌드에서는 공식 문서의 최신 테스트 섹션을 다시 확인한다.

샌드박스 앱은 인앱광고를 지원하지 않는다. AIT를 Apps in Toss 콘솔 테스트 버전에 등록하고 QR 코드로 실기기 검증을 진행한다.

## AIT 생성과 보존 원칙

### 필수 원칙

1. 기존 AIT 삭제·덮어쓰기·이름 변경은 Human Conductor의 명시적 승인 없이 수행하지 않는다.
2. 테스트 AIT와 운영 AIT는 목적과 생성 시각이 드러나는 별도 파일명으로 보관한다.
3. 새 AIT를 만들기 전에 기존 AIT의 경로, 크기, 수정 시각, SHA-256을 기록한다.
4. 새 산출물 검증이 끝날 때까지 기존 AIT를 유지한다.
5. 콘솔 업로드와 공개 릴리스는 별도 승인을 받은 뒤 수행한다.

### 현재 빌드 스크립트 주의사항

`npm run ait:build`가 실행하는 [`scripts/run-apps-in-toss-build.mjs`](../scripts/run-apps-in-toss-build.mjs)는 빌드 전에 루트의 `nyangtology.ait`를 삭제한다. 따라서 기존 AIT를 유지해야 하는 상황에서는 이 명령을 바로 실행하지 않는다.

새 광고 AIT가 필요할 때는 먼저 다음 중 하나를 승인받아야 한다.

- 빌드 스크립트에 별도 출력 경로 옵션을 추가한다.
- 독립된 임시 작업 복사본에서 AIT를 빌드한 뒤 새 파일만 가져온다.
- 기존 AIT의 검증 가능한 사본을 만든 뒤 빌드하고, 새 결과물을 별도 이름으로 옮긴 후 기존 파일을 복원한다.

권장 파일명 예시는 다음과 같다.

```text
artifacts/ait/nyangtology-20260714-before-ads.ait
artifacts/ait/nyangtology-20260714-ads-test.ait
artifacts/ait/nyangtology-20260714-ads-production.ait
```

현재 스크립트가 삭제형 동작을 유지하는 동안에는 사용자가 “새 AIT 생성”을 요청해도 “기존 AIT 교체”로 해석하지 않는다.

## 테스트 및 출시 체크리스트

### 정적 확인

- [ ] 네 가지 광고 환경 변수가 빌드 목적에 맞는 값인지 확인
- [ ] 테스트 빌드에는 테스트 ID만 포함됐는지 확인
- [ ] 운영 빌드에는 승인된 운영 광고 그룹 ID만 포함됐는지 확인
- [ ] 질문·상황 카운터가 서로 다른 `localStorage` 키를 사용하는지 확인
- [ ] 배너가 홈·개념 상세·상황 상세에 각각 1개만 있는지 확인
- [ ] `/ask`, `/explore`, `/safety`, 로딩·팝업에 배너가 없는지 확인
- [ ] AIT 생성 전 기존 AIT 보존 승인을 받았는지 확인

### QR 실기기 확인

- [ ] 질문 1·2회는 광고 없이 결과 표시
- [ ] 질문 3·4회는 각각 광고 안내와 광고 표시 시도
- [ ] 상황 1·2회는 광고 없이 이동
- [ ] 상황 3·4회는 각각 광고 안내와 광고 표시 시도
- [ ] 질문 카운터가 상황 카운터에 영향을 주지 않음
- [ ] 날짜 변경 또는 테스트 데이터 변경 후 카운터 초기화 확인
- [ ] 광고 재고 없음·로드 실패·표시 실패 시 콘텐츠 흐름 유지
- [ ] 홈·개념 상세·상황 상세 배너 렌더링과 스크롤 확인
- [ ] 배너 클릭 후 복귀, 앱 백그라운드·포어그라운드 전환 확인
- [ ] 뒤로가기와 페이지 이동이 정상 동작하는지 확인
- [ ] 구형·최신 Android와 iOS에서 광고 로드 이벤트 확인

### 운영 전 확인

- [ ] 운영 광고 그룹 ID 반영
- [ ] 운영 AIT를 테스트 AIT와 다른 파일명으로 보관
- [ ] 크기·수정 시각·SHA-256 기록
- [ ] 사용자당 일 평균 노출 횟수와 광고 노출 비중 모니터링 계획 확정
- [ ] 과도한 전면형 노출 여부 검토
- [ ] 콘솔 업로드와 공개 릴리스 승인

## 알려진 제한과 후속 결정

- 현재 카운터는 로컬 저장소 기반이므로 여러 기기·재설치·데이터 삭제 상황에서 사용자별 횟수가 일관되지 않을 수 있다.
- 현재 전면형 광고 실패 시에도 콘텐츠를 제공한다. 유료·리워드 보상처럼 엄격한 완료 검증이 필요한 구조에는 그대로 사용하면 안 된다.
- 현재 3회차부터 모든 후속 행동에 전면형 광고를 시도한다. 운영 지표를 보기 전까지 적정 빈도로 확정된 정책으로 간주하지 않는다.
- 실제 광고 노출·클릭·뒤로가기·수익 집계는 로컬 정적 검사만으로 완료할 수 없으며 콘솔 QR 실기기 검증이 필요하다.
- 공식 문서에는 특정 Android 버전에서 배너와 전면형 광고를 동시에 로드할 때 이벤트가 누락될 수 있는 문제 해결 안내가 있다. 현재는 `/ask`·`/explore`와 배너 화면을 분리하지만 QR 테스트에서 다시 확인한다.

## 공식 문서

- [인앱 광고 소개](https://developers-apps-in-toss.toss.im/ads/intro.html)
- [인앱 광고 개발 및 정책](https://developers-apps-in-toss.toss.im/ads/develop.html)
- [전면형·리워드 광고 API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/IntegratedAd.html)
- [WebView 배너 광고 API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/BannerAd.html)
- [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.html) — 냥톨로지 필수 검수 기준
- [게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-game.html) — 공통 광고·UX 항목 교차 확인용

## 변경 관리

다음 항목을 변경하면 이 문서도 같은 작업에서 갱신한다.

- `AD_GATE_FREE_RESULT_LIMIT`
- 질문·상황 카운터 키 또는 저장 방식
- 광고 실패 시 콘텐츠 제공 정책
- 배너 배치 화면이나 슬롯 수
- 광고 SDK 버전
- 테스트·운영 광고 그룹 ID 관리 방식
- AIT 출력 경로와 보존 방식
