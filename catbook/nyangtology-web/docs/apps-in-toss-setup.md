# 냥톨로지 AppsInToss WebView 연동 가이드

> 앱 리소스 프로젝트 폴더: `catbook/nyangtology-web`
> 확인일: 2026-07-14
> 트랙: 기존 Web 프로젝트를 AppsInToss WebView 미니앱으로 패키징

토스 앱 내 미니앱으로 `nyangtology-web`을 띄우기 위한 로컬 설정과 출시 전 게이트입니다. Phase 1은 read-only 비게임 서비스이며, 사용자의 건강·행동 맥락을 진단하지 않고 관찰·기록·상담 준비 안내로 제한합니다.

## 공식 기준

- AI 개발 절차: https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html
- 기존 Web 프로젝트 SDK 연동: https://developers-apps-in-toss.toss.im/tutorials/webview.html
- API & SDK 한 눈에 보기: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0/overview.html
- WebView 속성 제어: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%86%8D%EC%84%B1.html
- 토스앱 테스트하기: https://developers-apps-in-toss.toss.im/development/test/toss.html
- 미니앱 출시: https://developers-apps-in-toss.toss.im/development/deploy.html
- 비게임 출시 가이드(냥톨로지 필수 기준): https://developers-apps-in-toss.toss.im/checklist/app-nongame.html
- 게임 출시 가이드(공통 항목 교차 확인용): https://developers-apps-in-toss.toss.im/checklist/app-game.html
- 릴리즈 노트: https://developers-apps-in-toss.toss.im/release-note.html

릴리즈 노트 확인 기준으로 2026년 7월 2일 제품 업데이트에 콘솔 MCP가 추가되었지만, 현재 콘솔 MCP는 Claude만 지원하고 Codex 지원은 준비 중입니다. 이 저장소에서는 Codex가 앱인토스 콘솔 작업을 직접 수행했다는 전제로 기록하지 않습니다.

## 현재 상태

| 항목 | 현재값 |
| --- | --- |
| 프로젝트 폴더 | `catbook/nyangtology-web` |
| 앱인토스 SDK | `@apps-in-toss/web-framework` 2.10.4 설치됨 |
| 설정 파일 | `granite.config.ts` 존재 |
| `appName` 가정값 | `nyangtology` |
| 앱 이름 | `냥톨로지 고집사` |
| 아이콘 | `https://nyangtology.vercel.app/gojipsa-icon-512.png` |
| 권한 | `permissions: []` |
| 패키징 명령 | `npm run ait:build` (`ait build`) |
| 최근 패키징 결과 | `nyangtology.ait` 10.50MiB, v0.1.0 첫 출시 후보 |
| 배포 명령 | `npx ait deploy` 계열. API 키가 필요하므로 Human 승인 전 실행 금지 |

`appName`, `displayName`, `icon`은 앱인토스 콘솔에 등록한 값과 반드시 일치해야 합니다. 현재 `brand.icon`은 공개 웹에 배포된 정적 아이콘 URL을 사용합니다. 콘솔에서 별도 업로드 URL을 발급받았다면 그 값으로 교체합니다.

## 사전 준비

1. [앱인토스 콘솔](https://developers-apps-in-toss.toss.im/prepare/console-workspace.md)에서 워크스페이스와 미니앱을 등록합니다.
2. 콘솔의 `appName`을 `granite.config.ts`의 `appName`과 동일하게 맞춥니다.
3. 콘솔에 앱 아이콘을 업로드한 뒤 URL이 필요한 경우 `granite.config.ts`의 `brand.icon`에 반영합니다.
4. [샌드박스 앱](https://developers-apps-in-toss.toss.im/development/test/sandbox.html)을 설치합니다.

## 설치와 초기화

SDK가 없는 환경에서는 아래 명령을 사용합니다. 현재 저장소에는 이미 설치되어 있습니다.

```powershell
cd catbook/nyangtology-web
npm install @apps-in-toss/web-framework
npx ait init
```

`granite.config.ts`가 이미 존재하는 경우 `npx ait init`을 다시 실행하기 전에 기존 설정을 백업하고, 생성 결과가 현재 Next.js 구조를 덮어쓰지 않는지 확인합니다.

## 로컬 명령

| 명령 | 설명 |
| --- | --- |
| `npm run dev -- --hostname 0.0.0.0 --port 3000` | 일반 Next.js 개발 서버. 실기기 접근을 위해 모든 인터페이스에 바인딩 |
| `npm run dev:device` | 샌드박스 실기기 테스트용 개발 서버 |
| `npm run ait:console-values` | 앱인토스 콘솔에 입력된 값과 대조할 로컬 기준값 출력 |
| `npm run test:apps-in-toss` | AppsInToss WebView 준수 가드 점검 |
| `npm run build` | Next.js 빌드 |
| `npm run ait:build` | 앱인토스 배포용 `.ait` 아티팩트 빌드 |

실기기에서 PC의 개발 서버에 접근하려면 `AIT_WEB_HOST=<PC LAN IP>`를 지정하고 샌드박스 앱의 서버 주소도 같은 IP로 맞춥니다. `granite.config.ts`의 기본값은 `localhost`이며, 실기기 테스트 때만 환경변수로 덮어씁니다.

## 콘솔 값 동기화

앱인토스 콘솔 MCP는 공식 릴리즈 노트 기준으로 Codex 직접 조작을 전제로 하지 않습니다. 따라서 이 저장소에서는 콘솔을 직접 수정했다는 기록을 남기지 않고, 아래 기준값을 콘솔 화면과 수동 대조합니다.

```powershell
npm run ait:console-values
```

현재 로컬 기준값은 다음과 같습니다.

| 콘솔 항목 | 로컬 기준값 | 파일 |
| --- | --- | --- |
| `appName` | `nyangtology` | `granite.config.ts` |
| 앱 표시명 | `냥톨로지 고집사` | `granite.config.ts` |
| 브랜드 색상 | `#3182f6` | `granite.config.ts` |
| 앱 아이콘 URL | `https://nyangtology.vercel.app/gojipsa-icon-512.png` | `granite.config.ts` |
| 권한 | `[]` | `granite.config.ts` |
| WebView overScroll | `never` | `granite.config.ts` |

콘솔 화면에서 읽은 값을 환경변수로 넣어 자동 비교할 수도 있습니다.

```powershell
$env:APPS_IN_TOSS_APP_NAME="nyangtology"
$env:APPS_IN_TOSS_DISPLAY_NAME="냥톨로지 고집사"
$env:APPS_IN_TOSS_PRIMARY_COLOR="#3182f6"
$env:APPS_IN_TOSS_ICON="https://nyangtology.vercel.app/gojipsa-icon-512.png"
npm run ait:console-values
```

## AIT 정적 패키징 방식

`npm run ait:build`는 `scripts/run-apps-in-toss-build.mjs`를 통해 실행합니다. 이 래퍼는 앱인토스 패키징 전 다음 처리를 수행합니다.

- `AIT_STATIC_EXPORT=1`, `NEXT_PUBLIC_AIT_STATIC_EXPORT=1`을 설정해 Next.js `output: 'export'` 빌드로 전환합니다.
- Next 정적 export와 충돌하는 `app/api`를 빌드 중에만 임시 이동한 뒤 즉시 복구합니다.
- `public/images/**/*.png` 원본 대형 이미지는 빌드 중에만 제외하고, 앱 안에서는 WebP 참조를 사용합니다.
- 이전 `.next`, `out`, `nyangtology.ait`를 삭제하고 새 산출물만 패키징합니다.

정적 export 상태에서는 `/ask`, `/search`가 서버 API 대신 클라이언트의 read-only ontology resolver를 사용합니다. 일반 Next.js 실행에서는 기존 API route가 유지됩니다.

## 샌드박스 테스트

1. PC와 실기기를 같은 네트워크에 연결합니다.
2. PC LAN IP를 확인합니다. 이번 로컬 확인값은 `192.168.82.199`입니다.
3. 개발 서버를 실행합니다.

```powershell
cd catbook/nyangtology-web
$env:AIT_WEB_HOST="192.168.82.199"
npm run dev:device
```

4. 실기기 브라우저에서 `http://192.168.82.199:3000` 접근 여부를 먼저 확인합니다.
5. 샌드박스 앱에서 개발 서버 주소를 같은 IP/포트로 설정합니다.
6. `intoss://nyangtology` 딥링크로 진입합니다.
7. 홈, 탐색, 검색, 질문, 컨셉 상세, 시나리오 상세, 안전 안내, 뒤로가기, 스크롤, 키보드 입력, pull-to-refresh를 확인합니다.

정식 출시 전 QR 테스트에서는 콘솔 업로드 후 생성되는 `intoss-private://...` 테스트 스킴을 사용합니다. 검토 요청은 테스트를 최소 1회 완료한 뒤 진행합니다.

## 정책 체크리스트

- iframe 사용 금지. YouTube 영상 콘텐츠 예외가 있더라도 냥톨로지 Phase 1 UI는 외부 참고 영상 링크와 iframe을 노출하지 않습니다.
- WebView 핀치줌 비활성화. `app/layout.tsx`의 viewport에 `initialScale: 1`, `maximumScale: 1`, `userScalable: false`를 유지합니다.
- `granite.config.ts`의 `webViewProps`에는 스크롤·미디어 UX에 직접 영향을 주는 값을 명시합니다.
- Phase 1은 read-only 비게임 서비스입니다. Toss 로그인, 사용자 정보, 결제, 위치, 저장소 권한을 쓰기 전에는 `permissions: []`를 유지합니다.
- 광고는 아래 인앱 광고 적용 범위에 한해 사용자 액션 이후에만 호출합니다. 광고 SDK가 지원되지 않거나 광고 그룹 ID가 비어 있으면 결과 안내를 막지 않습니다.
- 건강 관련 화면은 진단·처방·치료 단정을 하지 않고 관찰·기록·상담 준비 안내로 제한합니다.
- 앱 번들은 압축 해제 기준 100MB 이하를 목표로 합니다. 대용량 이미지·영상은 번들에 넣지 않고 WebP/AVIF 최적화와 lazy loading을 우선합니다.
- 라이브 환경은 HTTPS만 전제로 합니다. 외부 API가 생기면 실제 서비스 Origin `https://<appName>.apps.tossmini.com`와 QR 테스트 Origin `https://<appName>.private-apps.tossmini.com`를 CORS 허용 목록에 반영합니다.

## 인앱 광고 적용 범위

공식 기준은 통합 광고와 WebView 배너 광고를 분리해서 적용합니다.

광고 횟수, 화면별 배치, 테스트 ID, QR 검증, 운영 전환, AIT 보존 기준은 전용 문서인 [`toss-in-app-ads-guide.md`](./toss-in-app-ads-guide.md)를 단일 운영 기준으로 사용합니다.

- 통합 광고: `IntegratedAd`의 `loadFullScreenAd`/`showFullScreenAd` 흐름을 사용합니다. 결과를 보기 위한 명시 버튼을 누른 뒤 호출하며, 질문 결과와 상황 상세 진입 게이트에만 씁니다.
- WebView 배너 광고: 목록·상세 하단의 보조 슬롯이 필요할 때만 별도 작업으로 검토합니다. 결과 제공을 막는 게이트 용도로 쓰지 않습니다.
- React Native 배너 광고: 현재 `nyangtology-web`은 Next.js WebView 앱이므로 적용 대상이 아닙니다.

현재 허용 정책은 다음과 같습니다.

| 콘텐츠 | 무료 기준 | 광고 호출 시점 | 결과 제공 |
| --- | --- | --- | --- |
| 우리 고양이, 왜 이럴까? 질문 | 하루 기준 결과 2회 | 3번째 질문 결과부터 `광고 보고 결과 보기` 버튼 이후 | 광고 종료, 실패, 미지원 모두 결과 제공 시도 |
| 상황별 궁금증 | 하루 기준 상황 상세 2개 | 3번째 상황 카드 진입부터 `광고 보고 바로 보기` 버튼 이후 | 광고 종료, 실패, 미지원 모두 페이지 이동 |

적용 제외 범위는 안전 안내(`/safety`), 직접 URL 진입, 건강 이상·응급 상황 안내입니다. 보호자에게 필요한 안전 정보는 광고로 막지 않습니다.

로컬 기본값은 비활성화입니다.

```powershell
NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED=0
NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID=
```

Toss 콘솔에서 광고 그룹 ID를 발급받고 샌드박스 실기기 테스트를 진행할 때만 다음처럼 활성화합니다.

```powershell
$env:NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED="1"
$env:NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID="<콘솔 광고 그룹 ID>"
npm run dev:device
```

관련 공식 문서는 다음을 확인합니다.

- 통합 광고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/IntegratedAd.html
- WebView 배너 광고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/BannerAd.html
- React Native 배너 광고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/RN-BannerAd.html

### 배너 광고 구현 및 빌드 설정

배너 광고는 홈의 주요 질문 목록 아래, 개념 상세 하단, 상황 상세 하단처럼 사용자가 스크롤해서 소비하는 고정 콘텐츠 구간에만 배치합니다. 전면형 광고를 미리 로드하는 `/ask`, `/explore`와 안전 안내(`/safety`), 인트로·로딩·팝업에는 배치하지 않습니다. 초기 운영은 하나의 배너 광고 그룹 ID를 세 위치가 함께 사용합니다.

`TossBannerAd`는 `TossAds.initialize`를 앱 세션에서 한 번만 실행하고, `TossAds.attachBanner`로 너비 100%, 높이 96px의 빈 컨테이너에 광고를 연결합니다. 광고 재고가 없거나 렌더링에 실패하면 영역을 접고, 화면을 벗어날 때 `destroy()`를 호출합니다.

로컬 기본값은 비활성화입니다.

```powershell
NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED=0
NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID=
```

테스트 AIT는 공식 테스트 ID를 빌드 시점에 주입해 생성합니다. 샌드박스 앱은 광고를 지원하지 않으므로, 생성한 AIT를 콘솔에 등록한 뒤 QR 테스트로 확인합니다.

```powershell
$env:NEXT_PUBLIC_NYANGTOLOGY_AD_GATE_ENABLED="1"
$env:NEXT_PUBLIC_AIT_INTEGRATED_AD_GROUP_ID="ait.dev.43daa14da3ae487b"
$env:NEXT_PUBLIC_NYANGTOLOGY_BANNER_AD_ENABLED="1"
$env:NEXT_PUBLIC_AIT_BANNER_AD_GROUP_ID="ait-ad-test-banner-id"
npm run ait:build
```

주의: `npm run ait:build`는 현재 기존 `nyangtology.ait`를 삭제한 뒤 같은 경로에 새 파일을 생성합니다. 기존 AIT 보존 승인이 없는 상태에서는 이 명령을 실행하지 않습니다. 새 테스트·운영 AIT가 필요하면 전용 가이드의 AIT 보존 절차에 따라 기존 파일을 유지하고 새 산출물을 별도 파일명으로 관리합니다.

## TDS

1차는 기존 UI를 유지합니다. TDS(Toss Design System) WebView 전면 적용은 별도 작업으로 진행합니다. TDS를 도입할 때는 React 버전 호환성과 `@toss/tds-mobile`, `@toss/tds-mobile-ait`, `@emotion/react` 의존성을 별도 검증합니다.

```powershell
npm install @toss/tds-mobile @toss/tds-mobile-ait @emotion/react@^11
```

## 출시 전 게이트

- `npm run test:apps-in-toss`
- `npm run lint`
- `npm run build`
- `npm run ait:build`
- 샌드박스 앱 실기기 진입 확인
- 콘솔 QR 테스트 최소 1회
- [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.html) 전체 체크리스트 확인 — 냥톨로지 Primary Gate
- [게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-game.html)의 공통 접속·UX·보안·광고 항목 교차 확인 — 게임 전용 항목은 비적용
- 공개 출시, 콘솔 업로드, API 키 사용은 Human Conductor 승인 후 진행

## 첫 출시 후보 절차

토스앱 테스트 가이드 기준으로 첫 출시 후보는 다음 순서로 진행합니다.

1. 샌드박스 앱에서 개발 서버 테스트를 완료합니다.
2. `npm run ait:build`로 최신 `.ait` 번들을 생성합니다.
3. `.ait` 파일 크기가 압축 해제 기준 100MB 이하인지 확인합니다.
4. Human Conductor 승인 후 앱인토스 콘솔의 `앱 출시` 메뉴에서 `.ait`를 업로드합니다.
5. 콘솔에서 생성된 테스트용 QR 코드 또는 `intoss-private://...` 스킴으로 토스앱 최종 테스트를 진행합니다.
6. QR 테스트는 토스앱 로그인, 워크스페이스 멤버, 만 19세 이상 조건을 만족해야 합니다.
7. 검토 요청은 토스앱 테스트를 최소 1회 완료한 뒤 진행합니다.
8. `intoss://` 스킴은 정식 출시 이후에만 접근 가능하므로 출시 전 테스트에는 사용하지 않습니다.

CLI 업로드는 API 키가 필요하므로 승인 전 실행하지 않습니다.

```powershell
npx ait deploy --api-key <API_KEY>
```

업로드 후 발급되는 `_deploymentId`는 테스트 스킴의 필수 파라미터입니다. 테스트 결과 evidence에는 QR 테스트 일시, 기기 OS, 테스트 스킴의 `_deploymentId`, 통과/실패 항목을 남깁니다.
