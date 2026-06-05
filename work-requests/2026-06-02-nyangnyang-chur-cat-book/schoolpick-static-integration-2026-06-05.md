# SchoolPick Catbook 정적 페이지 안전 반영 기록

## 작업 요약

- 대상 저장소: `https://github.com/ousia-web3/schoolpick`
- 작업 브랜치: `codex/catbook-static-pages`
- 커밋: `194a63b1687aacf1f12c0b61defe76396f2c94ff`
- 추가 경로: `public/catbook/**`
- 예상 공개 경로: `https://schoolpick.vercel.app/catbook/web/index.html`

## 기존 서비스 보호

- 기존 `master` 브랜치에는 직접 푸시하지 않았다.
- 기존 SchoolPick 소스, 라우팅, `vercel.json`은 수정하지 않았다.
- `catbook` 전용 정적 파일만 `public/catbook/**` 하위에 추가했다.
- Vercel production 배포 또는 promote 작업은 실행하지 않았다.
- GitHub PR은 커넥터 권한 문제로 자동 생성하지 못했으며, 브랜치만 푸시했다.

## 검증 결과

- `npm run build` 성공.
- 로컬 preview에서 다음 경로가 모두 `200`으로 응답했다.
  - `/`
  - `/catbook/web/index.html`
  - `/catbook/web/manuscript.html`
  - `/catbook/web/production-process-manual.html`
  - `/catbook/web/nyangnyang-chur-landing-standalone.html`
  - `/catbook/web/styles.css`
  - `/catbook/web/script.js`
- 모바일 폭 `390px` Playwright 순회에서 기존 홈과 Catbook 페이지 렌더링을 확인했다.
- `/catbook/web/index.html`에서 우클릭 방지 이벤트가 동작함을 확인했다.
- `AI 생성` 워터마크와 드래그 방지 코드는 `public/catbook/web` 내부에 포함되어 있음을 확인했다.

## 다음 액션

- GitHub에서 아래 링크로 PR을 열고 검토 후 병합한다.
- `https://github.com/ousia-web3/schoolpick/pull/new/codex/catbook-static-pages`
- 병합 후 Vercel 자동 배포가 완료되면 `https://schoolpick.vercel.app/catbook/web/index.html`에서 실제 공개 경로를 확인한다.
