# 검색 관측 입구 보강 검증

## 1. 검증 대상

- 키워드: `애정결핍`
- 데이터:
  - `data/youtube-content-seed.json`
  - `data/youtube-content-seed.sql`
  - `web/responsive-prototype/data/content-seed.js`
- 화면:
  - `web/responsive-prototype/app.js`
  - `web/responsive-prototype/styles.css`

## 2. 반영 내용

- `queryObservations` seed를 추가해 콘텐츠 후보 DB에 없는 최신 YouTube 검색 관측값도 보관한다.
- `애정결핍` 검색 관측값 1개와 관측 영상 3건을 `link-only` 정책으로 저장했다.
- 탐색 검색 결과가 0건이어도 관측값이 있으면 `관측 입구` 카드가 표시되도록 했다.
- 등록된 관측값이 없는 검색어도 빈 화면으로 끝나지 않도록 `관측 요청` 카드를 표시한다.
- 관측 카드에는 검색 원본, 원본 영상 링크, 채널, 재생 시간, 검토 상태, 콘텐츠화 검토 버튼을 표시한다.
- YouTube 썸네일은 기존 정책대로 렌더링하지 않는다.

## 3. 검증 결과

| 검증 | 결과 | 근거 |
| --- | --- | --- |
| JS 문법 | Pass | `node --check web/responsive-prototype/app.js` |
| Seed 관측값 | Pass | `queryObservationCount=1`, `애정결핍` 관측 entries 3건 |
| 검색 동작 | Pass | `애정결핍` 콘텐츠 후보 0건, 관측 입구 1개, 관측 영상 3건 |
| 미등록 검색어 | Pass | `완전새키워드` 콘텐츠 후보 0건, 관측 영상 0건, 관측 요청 1개 |
| 브라우저 검증 | Pass | 로컬 정적 서버 `http://127.0.0.1:8791/`에서 검색 결과 카운트와 카드 표시 확인 |
| 권리 정책 | Pass with Conditions | 원본 링크만 표시, 썸네일 미사용 |
| 도메인 적합성 | Needs Review | 여행 콘텐츠로 확정하기 전 CMS/운영자 검토 필요 |

## 4. 판정

Pass. `애정결핍`처럼 최신 YouTube 검색에는 존재하지만 여행 콘텐츠 후보로 아직 정규화되지 않은 키워드는 관측 입구와 근거 영상을 통해 후속 콘텐츠화 검토로 연결된다. 아직 관측 seed에 없는 다른 최신 검색어는 `관측 요청` 카드로 연결해 refresh/API 연동 대상임을 표시한다.
