# 최신 YouTube 영상 근거 검색 보강 검증

## 1. 검증 대상

- 화면: `web/responsive-prototype/index.html`
- 스크립트: `web/responsive-prototype/app.js`
- 스타일: `web/responsive-prototype/styles.css`
- 데이터: `web/responsive-prototype/data/content-seed.js`

## 2. 반영 내용

- 검색 placeholder를 `지역, 음식, 최신 영상 근거를 검색`으로 조정했다.
- 탐색 정렬 옵션을 `최신 영상 근거순`으로 명확히 바꾸고 실제 정렬 이벤트를 연결했다.
- 결과 카드마다 `최신 영상 근거` 블록을 추가해 원천 영상 제목, 채널, 최신 순번, 에피소드, 재생 시간, 링크 전용 정책, 원본 영상 링크를 표시한다.
- 검색 대상에 콘텐츠 태그뿐 아니라 원천 영상 제목, raw title, 채널, source URL, `유튜브`, `동영상`, `최신 정보 업데이트` 계열 키워드를 포함했다.
- 검색 결과 0건일 때 이전 결과가 남지 않도록 빈 상태 문구를 표시한다.

## 3. 검증 결과

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| JS 문법 | Pass | `node --check web/responsive-prototype/app.js` |
| 최신 정보 업데이트 검색 | Pass | `최신 정보 업데이트` 검색 시 80건을 최신 원천 영상 순으로 정렬, top `sourceRank=1` |
| 한우 최신 검색 | Pass | `한우 최신` 검색 시 1건, top `sourceRank=1` |
| 썸네일 정책 | Pass | 기존대로 YouTube 썸네일은 렌더링하지 않고 원본 링크만 제공 |
| AI툴 in-app browser | 제한 | 현재 세션에서 `iab` browser 목록이 비어 있어 전용 in-app browser 검증은 불가 |

## 4. 판정

Pass. 최신성 키워드 검색 시 최신 YouTube 원천 영상에 근거한 콘텐츠가 결과 카드에서 직접 보이도록 보강했다. 단, 실제 장소 좌표, 영업시간, 가격, 최신 운영 정보는 아직 flat metadata 범위 밖이므로 후속 관광 데이터/CMS 검수 매칭이 필요하다.
