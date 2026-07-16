# 배포 후 전체 코드 리뷰 브리핑

- 작성일: 2026-07-09
- 대상: `catbook/nyangtology-web`
- 배포 기준: `https://nyangtology.vercel.app`
- GitHub 기준 커밋: `b389f1f Remove home quick scenario section`
- 리뷰 범위: Next.js App Router, API route, ontology resolver, UI component, e2e, 배포 상태, 문서 동기화

## 결론

배포를 즉시 되돌려야 할 Critical 이슈는 보이지 않습니다. `lint`, ontology gate, production build, phase1 e2e, 공개 URL smoke가 통과했고, 사용자 화면의 안전 안내와 외부 근거 미노출 정책도 유지되고 있습니다.

다만 공개 API 기준으로 다음 패치에서 우선 보정할 항목이 있습니다.

1. 검색 API와 검색 페이지에 쿼리 길이 제한이 없어 긴 입력이 약 20초 응답 지연을 만들 수 있습니다.
2. 상세 API의 없는 slug가 404 JSON 대신 500을 반환합니다.
3. `npm audit`에서 Next.js가 가져오는 `postcss@8.4.31` moderate advisory가 남아 있습니다.
4. `/api/health` 메타와 README/TASK 문서가 현재 구현 상태와 일부 어긋납니다.

## Findings

### P1. 검색 GET 쿼리 길이 제한 부재로 공개 API가 느린 경로에 노출됨

- 위치:
  - `components/search-box.tsx:13` 입력 필드에 `maxLength` 없음
  - `app/search/page.tsx:17` `q`를 trim만 하고 길이 제한 없이 `searchNodes` 호출
  - `app/api/search/route.ts:5` API도 `q`를 그대로 받음
  - `lib/ontology.ts:293`, `lib/ontology.ts:317` 검색 후보를 만들 때 graph nodes를 반복 순회
- 확인 결과:
  - `https://nyangtology.vercel.app/api/search?q=<화장실 1000회 반복>` 요청이 `200`을 반환했지만 약 `20,227ms` 소요
  - 현재 graph는 `3.86MB`, `956 nodes`, `4099 edges`라 운영 초기는 감당 가능하지만, 공개 엔드포인트로는 남용 여지가 있음
- 영향:
  - 긴 쿼리나 반복 요청이 서버리스 함수 시간을 잡아먹을 수 있음
  - 검색 UX도 긴 URL/긴 헤더 텍스트로 흔들릴 수 있음
- 권장 수정:
  - `/search`와 `/api/search` 모두 `q`를 `2~160자` 정도로 제한
  - `SearchBox`에 `maxLength={160}` 추가
  - API는 `zod`로 검증하고 초과 시 `400` 또는 `422` JSON 반환
  - 검색용 `searchableNodeText(node)`는 요청마다 재계산하지 말고 module load 시 node별 lowercase text를 인덱싱

### P1. 상세 API의 없는 slug가 500을 반환함

- 위치:
  - `app/api/scenarios/[slug]/route.ts:8`
  - `app/api/concepts/[slug]/route.ts:8`
  - `lib/ontology.ts:463` 없는 node는 `throw new Error`
- 확인 결과:
  - `/api/scenarios/not-a-real-slug` → `500`
  - `/api/concepts/not-a-real-slug` → `500`
  - `/api/concepts/not-a-real-slug/evidence` → `200`, `{ concept: null, items: [] }`
- 영향:
  - 없는 리소스가 서버 오류로 기록되어 모니터링 노이즈가 생김
  - 클라이언트가 404/empty 상태를 구분하기 어려움
  - evidence API와 상세 API의 계약이 불일치
- 권장 수정:
  - `getScenario`/`getConcept`에서 domain error를 구분하거나 API route에서 catch 처리
  - 없는 slug는 `404`와 `{ error: 'scenario_not_found' }` 또는 `{ error: 'concept_not_found' }` 반환
  - `/api/concepts/[slug]/evidence`도 같은 정책으로 맞출지 결정
  - API contract test에 invalid slug 케이스 추가

### P2. PostCSS moderate advisory가 남아 있음

- 위치:
  - `package.json:15` `next@15.5.20`
  - `package-lock.json:4203` Next 내부 dependency `postcss: 8.4.31`
  - `package-lock.json:4567` installed `postcss@8.4.31`
- 확인 결과:
  - `npm audit --omit=dev --audit-level=moderate` 실패
  - advisory: `postcss <8.5.10` XSS via unescaped `</style>`
  - npm의 자동 수정 안내는 breaking change를 포함하므로 바로 적용하기 위험함
- 영향:
  - 현재 앱은 사용자 CSS를 파싱/재직렬화하지 않아 실제 악용 가능성은 낮아 보임
  - 그래도 CI audit gate를 켜면 배포 파이프라인이 실패할 수 있음
- 권장 수정:
  - 별도 dependency patch 작업으로 분리
  - `next` 패치/마이너 업데이트 또는 `overrides`로 `postcss >= 8.5.10` 적용 가능성 검증
  - 적용 후 `npm run build`, `npm run test:e2e`, 공개 URL smoke 재검증

### P2. `/api/health` 메타가 실제 ontology 버전과 다름

- 위치:
  - `app/api/health/route.ts:10`
  - `app/api/stats/route.ts:5`
- 확인 결과:
  - `/api/health` → `ontologyVersion: null`, `snapshotDate: 2026-07-06`
  - `/api/stats` → `ontologyVersion: 2026-06-05.2`, `snapshotDate: 2026-07-06`
- 영향:
  - 운영 대시보드나 외부 smoke가 health만 보면 ontology 버전 확인이 불가능
  - 스냅샷 교체 시 health의 하드코딩 값이 stale해질 수 있음
- 권장 수정:
  - health route가 `getStats()`의 meta를 재사용하거나 `getRuntimeMeta()` 같은 작은 helper를 분리
  - health 응답에 `ontologyVersion`, `snapshotDate`, `nodeCount` 중 최소 2개를 포함

### P2. 구현 상태와 문서가 일부 드리프트됨

- 위치:
  - `README.md:30` 홈 설명에 `시나리오 카드`가 남아 있음
  - `README.md:43` `/` 설명도 `시나리오 진입` 중심으로 남아 있음
  - `docs/07-tasks.md:16` Phase 1 상태가 `대기`로 남아 있음
  - `docs/07-tasks.md:91` 홈 산출물에 `ScenarioCard`가 남아 있음
- 영향:
  - 신규 작업자가 현재 홈 구조를 잘못 이해할 수 있음
  - 이후 QA가 제거된 섹션을 누락으로 오판할 수 있음
- 권장 수정:
  - README 홈 설명을 `고집사 안내, 검색 진입, 인기 질문, How it helps, 안전 메모`로 갱신
  - TASK 문서 Phase 1 상태를 현재 구현/배포 상태에 맞춰 갱신
  - `상황별 카드`는 `/explore` 책임으로 명확히 분리

### P3. 테스트가 성공 경로 중심이라 API 방어 회귀를 잡기 어려움

- 위치:
  - `tests/e2e/phase1.spec.ts:3`
  - `tests/e2e/phase1.spec.ts:25`
  - `tests/e2e/phase1.spec.ts:41`
  - `tests/e2e/phase1.spec.ts:77`
- 현재 강점:
  - 시나리오 상세 → 개념 상세
  - 안전 CTA
  - 모바일 제목 한 줄
  - 카드 전환 로딩 오버레이
- 비어 있는 영역:
  - invalid slug API 404 계약
  - 검색 쿼리 길이 초과 계약
  - `/api/health`와 `/api/stats` 버전 일치
  - public URL smoke를 CI에서 자동 확인하는 단계
- 권장 수정:
  - Playwright APIRequestContext 또는 route handler 단위 테스트 추가
  - 최소 API contract: health, stats, search valid/invalid, scenario valid/invalid, concept valid/invalid

### P3. Ontology gate가 강력하지만 스냅샷 갱신 때 수동 수정 포인트가 큼

- 위치:
  - `scripts/check-ontology-hash.mjs:21`
  - `scripts/check-ontology-hash.mjs:23`
  - `scripts/check-ontology-hash.mjs:24`
- 현재 장점:
  - 날짜, sqlite hash, 주요 count, RDF status를 명확히 잠금
- 개선 여지:
  - ontology refresh 때 스크립트 상수 갱신을 잊으면 정상 스냅샷도 실패
  - 기대값을 별도 JSON manifest로 분리하면 코드 변경 없이 콘텐츠만 갱신 가능

## 검증 결과

| 항목 | 결과 |
| --- | --- |
| `npm run lint` | Pass |
| `npm run test:ontology` | Pass |
| `npm run build` | Pass |
| `npx playwright test tests/e2e/phase1.spec.ts --project=chromium` | 4 passed |
| 공개 URL smoke | `https://nyangtology.vercel.app` 200 |
| 제거 섹션 확인 | `How it helps` 유지, `상황별로 바로 보기`/`scenarioGrid` 미검출 |
| invalid scenario API | 500 확인 |
| invalid concept API | 500 확인 |
| invalid evidence API | 200 empty 확인 |
| 긴 검색어 API | 200, 약 20.2초 |
| Vercel error logs | 최근 1시간 error logs 없음 |
| `npm audit --omit=dev --audit-level=moderate` | Fail, PostCSS moderate advisory |

## 권장 작업 순서

1. P1 API hardening 패치
   - 검색 `q` 길이 제한
   - invalid slug 404 JSON 처리
   - API contract test 추가
2. P2 운영 메타 정리
   - `/api/health` ontology meta 동기화
   - README/TASK 문서 현재 상태 갱신
3. P2 dependency patch spike
   - Next/PostCSS advisory 대응 전략 검증
   - `overrides` 또는 Next 버전 업데이트 후보 테스트
4. P3 테스트 확장
   - API negative path
   - public deployment smoke
   - search latency guard

## 후속 적용 완료 — 2026-07-09

- P1 API hardening 적용:
  - `GET /api/search`에 2~160자 검색어 검증을 추가하고, 초과 입력은 `400` JSON으로 반환하도록 변경
  - `SearchBox`에 `maxLength=160` 적용
  - 검색 대상 노드 텍스트를 module load 시 캐시해 반복 문자열 조립 비용을 줄임
  - 없는 scenario/concept/evidence slug를 `404` JSON으로 통일
- P2 운영 메타·문서·의존성 적용:
  - `/api/health`가 `/api/stats`와 같은 ontology meta를 재사용하도록 변경
  - README와 `docs/07-tasks.md`의 홈/Phase 1 설명을 현재 구현 상태로 갱신
  - `postcss@8.5.10` npm override를 추가해 audit advisory를 해소
- P3 테스트 확장:
  - `tests/e2e/api-contract.spec.ts`를 추가해 검색 검증, invalid slug 404, health/stats meta 일치를 확인
  - 이번 후속 작업은 사용자가 Vercel 제외를 요청했으므로 새 production deployment와 public URL 재배포 smoke는 수행하지 않음
- 최종 검증:
  - `npm run lint` Pass
  - `npm run test:ontology` Pass
  - `npm audit --omit=dev --audit-level=moderate` Pass, 0 vulnerabilities
  - `npm run build` Pass
  - `npm run test:e2e` Pass, 7 tests

## 참고

- GitHub advisory: https://github.com/advisories/GHSA-qx2v-qp2m-jg93
- npm `next`: https://www.npmjs.com/package/next
- Next.js security update: https://nextjs.org/blog/security-update-2025-12-11
