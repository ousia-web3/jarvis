# PC/MO 반응형 목업 검증

## 1. 검증 대상

- 대상 파일: `web/responsive-prototype/index.html`
- 화면 범위: 홈, 탐색 목록, 상세
- 검증 일시: 2026-06-30
- 검증 도구: Playwright + 로컬 Chrome

## 2. 검증 결과

| Viewport | 홈 가로 스크롤 | 탐색 가로 스크롤 | 상세 가로 스크롤 | 모바일 필터 | 상세 배너 높이 |
| --- | --- | --- | --- | --- | --- |
| 360px | Pass | Pass | Pass | Pass | 249px |
| 390px | Pass | Pass | Pass | Pass | 272px |
| 430px | Pass | Pass | Pass | Pass | 302px |
| 768px | Pass | Pass | Pass | Pass | 397px |
| 1024px | Pass | Pass | Pass | Pass | 530px |
| 1280px | Pass | Pass | Pass | Pass | 666px |

## 3. 스크린샷 증거

대표 스크린샷:

- `verification/responsive-screenshots/home-390.png`
- `verification/responsive-screenshots/explore-filter-390.png`
- `verification/responsive-screenshots/detail-390.png`
- `verification/responsive-screenshots/home-1280.png`
- `verification/responsive-screenshots/explore-1280.png`
- `verification/responsive-screenshots/detail-1280.png`

전체 수치 결과:

- `verification/responsive-screenshots/responsive-check.json`

## 4. 확인 사항

- 모바일 홈의 제목 줄바꿈을 조정했다.
- 모바일 필터는 바텀시트로 열리고 닫힌다.
- 고정 하단 액션바는 탐색 화면에서만 노출해 홈/상세 본문을 가리지 않게 했다.
- 상세 배너는 실제 이미지 없이 `이미지 준비중` 상태와 고정 비율을 유지한다.
- 유튜브 썸네일 또는 방송 이미지를 저장하거나 재배포하지 않았다.

## 5. 남은 범위

- Admin/CMS, Trip Ontology Dashboard의 업무형 반응형 화면은 이번 목업 범위 밖이다.
- 실제 Next.js 앱 구현은 별도 앱 위치와 라우팅 구조가 확정된 뒤 진행한다.
