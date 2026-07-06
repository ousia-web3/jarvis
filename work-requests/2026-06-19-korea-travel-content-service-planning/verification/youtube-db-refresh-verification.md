# YouTube Metadata DB Refresh Verification

## 1. 검증 대상

- 원천: `https://www.youtube.com/@hello1stkorea/videos`
- 추출 파일: `research/youtube-metadata-raw.jsonl`
- 정규화 DB:
  - `data/youtube-content-seed.json`
  - `data/youtube-content-seed.sql`
  - `web/responsive-prototype/data/content-seed.js`
- 반영 화면: `web/responsive-prototype/index.html`

## 2. 추출 결과

| 항목 | 결과 |
| --- | --- |
| 추출 도구 | `python -m yt_dlp 2026.06.09` |
| 추출 명령 | `python -m yt_dlp --flat-playlist --playlist-end 80 --dump-json "https://www.youtube.com/@hello1stkorea/videos"` |
| 원천 영상 메타 | 80건 |
| 정규화 콘텐츠 후보 | 80건 |
| 썸네일 정책 | `reference-only`, 화면 미사용 |
| 이미지 UI | `placeholder`만 사용 |

## 3. 콘텐츠 타입 분포

| 타입 | 수량 |
| --- | --- |
| 음식 | 31 |
| 영상 영감 | 33 |
| 지역 | 10 |
| 관광지 | 6 |

## 4. UI 반영 검증

| Viewport | 홈 카드 | 탐색 카드 | 가로 스크롤 | 상세 갱신 | 필터 |
| --- | --- | --- | --- | --- | --- |
| 360px | 6 | 80 | Pass | Pass | Pass |
| 390px | 6 | 80 | Pass | Pass | Pass |
| 430px | 6 | 80 | Pass | Pass | Pass |
| 768px | 6 | 80 | Pass | Pass | Pass |
| 1024px | 6 | 80 | Pass | Pass | Pass |
| 1280px | 6 | 80 | Pass | Pass | Pass |

## 5. 검증 증거

- `verification/youtube-db-refresh/youtube-db-refresh-check.json`
- `verification/youtube-db-refresh/youtube-db-responsive-check.json`
- `verification/youtube-db-refresh/youtube-home-390.png`
- `verification/youtube-db-refresh/youtube-explore-filter-390.png`
- `verification/youtube-db-refresh/youtube-detail-390.png`
- `verification/youtube-db-refresh/youtube-home-1280.png`

## 6. 판정

Pass. 기존 하드코딩 카드 중심 목업을 원천 YouTube 메타데이터 80건 기반 seed DB 렌더링 구조로 교체했다. 다만 flat metadata 기반이므로 실제 장소 좌표, 운영시간, 가격, 상세 설명은 후속 CMS 검수/관광 데이터 매칭이 필요하다.

