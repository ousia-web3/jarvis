# 토스 비게임 미니앱 상단·하단 가이드 재검토

> requestId: `nyangtology-toss-miniapp-guide-compliance`  
> 대상: `catbook/nyangtology-web`  
> 검토일: 2026-07-14  
> 실행 트랙: L1 표준  
> 판정: **Needs Work — 현재 상태를 완전 준수로 볼 수 없음**

## 1. 결론

현재 구현은 Apps in Toss SDK와 비게임 기본 내비게이션 설정, 4개 탭 수, 핀치줌 차단, 일반 모바일 브라우저의 상·하단 고정 동작은 갖추고 있다. 그러나 출시 전 수정이 필요한 명시적 미준수 항목이 남아 있다.

1. 하단 탭바가 화면 좌우 끝에 붙는 전체폭 바여서 토스가 요구하는 플로팅 탭바 형태가 아니다.
2. 내비게이션에 사용하는 브랜드 로고가 512×512px이고 둥근 아이콘 형태여서 600×600px 각진 정사각형 로고 기준을 충족하지 않는다.
3. 리스트형 배너 광고 슬롯이 모바일 `.shell` 안에 있어 뷰포트보다 24px 좁다. 광고 가이드의 화면 전체 너비 기준을 충족하지 않는다.
4. 토스 기본 비게임 내비게이션 아래에 자체 브랜드 헤더가 한 번 더 고정될 수 있다. 이는 자체 뒤로가기 중복처럼 명시된 금지 조항은 아니지만, 이중 상단 바가 되는지 AIT QR 실기기 확인과 축소 여부 결정이 필요하다.
5. Safe Area CSS는 선언되어 있으나 고정 하단 공간 계산에 `safe-area-inset-bottom`이 반영되지 않고, 토스 SDK의 실제 inset을 포함한 실기기 검증도 없다.

따라서 기존 `npm run test:apps-in-toss`의 Pass만으로 상단·하단 가이드 준수를 선언하면 안 된다.

## 2. 조항별 판정

| 영역 | 공식 기준 | 판정 | 구현 근거 |
| --- | --- | --- | --- |
| 상단 유형 | Apps in Toss 비게임 내비게이션 바 사용 | Pass(정적) | SDK `defineConfig` 사용. 현재 SDK 2.10.4의 기본값은 `webViewProps.type: 'partner'`이며 `withBackButton: true`, `withTitle: true`다. `granite.config.ts:8-30` |
| 상단 뒤로가기 | 토스 뒤로가기와 자체 뒤로가기 중복 금지 | Pass(정적) | 자체 `SiteHeader`에는 브랜드 홈 링크와 PC 메뉴만 있고 자체 뒤로가기 버튼은 없다. `components/site-header.tsx:4-20` |
| 상단 브랜드명 | 콘솔과 `brand.displayName`의 국문 이름 일치 | 확인 불가 | 코드 값은 `냥톨로지 고집사`다. 국문 요건은 충족하지만 콘솔 실제값은 확인하지 못했다. `granite.config.ts:10-13` |
| 상단 브랜드 로고 | 600×600px 각진 정사각형, 둥근 형태 금지, 배경 필수 | **Fail** | `brand.icon`이 가리키는 로컬 원본은 512×512px이고 둥근 앱 아이콘 형태다. `granite.config.ts:13`, `public/gojipsa-icon-512.png` |
| 상단 공통 기능 | 뒤로가기·더보기·닫기 정상 동작, 최초 화면 뒤로가기 시 종료 | 확인 불가 | SDK 기본 UI는 정적으로 확인했으나 콘솔 QR 실기기에서 동작을 검증하지 못했다. |
| 자체 상단 헤더 | 토스 공통 내비게이션과 혼동 없는 구조 | Needs Work | 모든 화면에 자체 `SiteHeader`가 있고 모바일에서 61px sticky 브랜드 바가 유지된다. 토스 네이티브 바 아래에 브랜드명·로고가 중복될 수 있다. `app/layout.tsx:46`, `app/globals.css:1696-1720` |
| 하단 탭 수 | 탭 2~5개 | Pass | 홈·질문·궁금증·안전 4개. `components/bottom-tab.tsx:5-11` |
| 하단 탭 형태 | 탭을 쓰면 토스 플로팅 형태 필수 | **Fail** | `.bottomTab`이 `left: 0; right: 0; bottom: 0`인 화면 전체폭 고정 바다. `app/globals.css:1063-1073` |
| 하단 터치 영역 | 모바일에서 충분한 터치 영역 | Pass | 각 탭 `min-height: 48px`. `app/globals.css:1083-1092` |
| 하단 선택 상태 | 현재 탭을 인지할 수 있는 상태 | Needs Work | 경로 기반 활성 스타일과 `aria-current`가 없고 hover 스타일만 있다. `components/bottom-tab.tsx:3-13`, `app/globals.css:1094-1098` |
| Safe Area | 상태바·홈 인디케이터가 콘텐츠를 가리지 않도록 inset 반영 | Partial | CSS `env(safe-area-inset-top/bottom)`은 선언되어 있다. 그러나 `--fixed-footer-space`는 74px 고정이고 SDK `SafeAreaInsets` 실기기 값은 검증하지 않았다. `app/globals.css:1047`, `1072`, `1698-1700`, `1711` |
| 배너 위치 | 스크롤 화면의 상단·중앙·하단 빈 영역에 배치 가능 | Pass(정적) | 홈 질문 목록 다음, 개념·상황 상세 하단에만 배치된다. 인트로·로딩·모달에는 없다. `app/page.tsx:124-128`, 상세 페이지의 `TossBannerAd` |
| 배너 크기 | 리스트형 너비는 화면 너비, 고정형 높이는 96px 권장 | **Fail** | 높이는 96px이나 `width: 100%`가 모바일 `viewport - 24px`인 `.shell` 내부 기준이라 화면 전체 너비가 아니다. `app/globals.css:441-448`, `1770-1773` |

## 3. 공식 근거

- [비게임 출시 가이드](https://developers-apps-in-toss.toss.im/checklist/app-nongame.html): 비게임 내비게이션, 뒤로가기·더보기·닫기, 플로팅 탭바, 광고 위치·스크롤 화면 점검
- [내비게이션 바 설정](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/UI/NavigationBar.html): 비게임 기본 바, 커스터마이징, 홈·액세서리 버튼
- [미니앱 브랜딩 가이드](https://developers-apps-in-toss.toss.im/design/miniapp-branding-guide.html): 600×600px 각진 로고, 콘솔·config 일치, 플로팅 탭바와 2~5개 탭
- [Safe Area](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%ED%99%94%EB%A9%B4%20%EC%A0%9C%EC%96%B4/safe-area.html): 상태바·홈 인디케이터 inset 반영
- [인앱 광고 개발 가이드](https://developers-apps-in-toss.toss.im/ads/develop.html): 리스트형 배너 전체 너비, 96px 높이, 허용 화면·위치

## 4. 실행 검증

| 검증 | 결과 | 해석 |
| --- | --- | --- |
| `npm run test:apps-in-toss` | Pass | 기존 정적 검사는 통과하지만 로고 규격·플로팅 탭바·배너 너비·Safe Area 높이를 검사하지 않는다. |
| `npm run lint` | Pass | 현재 소스 정적 분석 통과. |
| `npm run build` | Pass | 126개 정적 페이지 생성 통과. AIT는 재생성하지 않았다. |
| `npm run test:e2e` | Pass, 8/8 | 일반 Chromium 기능·레이아웃 회귀 테스트 통과. 토스 네이티브 UI와 실기기 Safe Area는 범위 밖이다. |
| `npx playwright test tests/e2e/phase1.spec.ts --grep "mobile sticky header sits flush"` | Pass, 1/1 | 390×844 일반 Chromium에서 상단 헤더와 하단 탭이 화면 끝에 붙는 현재 동작을 확인했다. 이 결과는 플로팅 탭바 준수가 아니라 오히려 전체폭 고정 구현의 증거다. |
| 390×844 모바일 홈·상세 렌더 | Captured | `mobile-top-bottom-current.png`, `mobile-detail-top-bottom-current.png` |
| 로고 픽셀 확인 | Fail | `public/gojipsa-icon-512.png`는 512×512px. |
| 토스 콘솔 QR 실기기 | Pending | 네이티브 바, X/더보기/뒤로가기, Dynamic Island, 홈 인디케이터, 실제 광고 노출은 미확인. |

## 5. 수정 우선순위

1. **P0:** `BottomTab`을 토스 플로팅 형태로 변경하고 경로 기반 활성 상태를 추가한다.
2. **P0:** 콘솔·`brand.icon`에 사용할 600×600px 각진 정사각형 로고를 제작·교체한다.
3. **P1:** AIT 환경에서 자체 `SiteHeader`를 제거하거나 비고정 콘텐츠 헤더로 축소해 네이티브 바와 중복되지 않게 한다.
4. **P1:** 리스트형 배너 컨테이너를 뷰포트 전체 너비로 분리한다.
5. **P1:** 하단 고정 공간 계산에 실제 Safe Area inset을 포함하고, 대표 기기 QR 테스트를 수행한다.
6. **P1:** 자동 준수 검사에 플로팅 탭바·로고 크기·배너 너비·Safe Area 정적 가드를 추가한다.

## 6. 검토 제한

- 제품 코드와 AIT 파일은 수정하지 않았다.
- Apps in Toss 콘솔 로그인·업로드·공개 검토 요청은 수행하지 않았다.
- 일반 Chromium 렌더는 토스 네이티브 내비게이션과 실제 Safe Area를 재현하지 않는다.
