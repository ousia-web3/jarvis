# Work Log: Data/EVE 데이터·리서치 도구 운영 지침 업데이트

## 메타데이터

- Task ID: `update-data-research-tooling-guidelines`
- Project: Jarvis
- Agent: Data, EVE, KITT/TRON, Friday, Jarvis
- Role: 데이터 지침 작성, 리서치 수집 기준 정리, 리스크 게이트 보강
- Started At: 2026-05-22T10:30:00+09:00
- Finished At: 2026-05-22T10:45:00+09:00
- Status: Done

## 입력

- 요청 요약: 기존에 언급만 있던 Clarity/GTM, yt-dlp, 봇 시뮬레이션, 영상 메타데이터 수집 개선 내용을 운영 지침으로 업데이트한다.
- 참조 문서: `agents/data.md`, `agents/eve.md`, `agents/kitt-tron.md`, `docs/data-analysis-pipeline.md`, `docs/bot-simulation-design.md`, `docs/risk-shield.md`
- 외부 참고: Microsoft Clarity 공식 문서, Google Tag Manager 공식 문서, yt-dlp 공식 README
- 제약: 실제 추적 코드 삽입, 외부 수집 실행, 영상 다운로드, 배포는 하지 않는다.

## 실행

- 수행한 일:
  - `docs/data-research-tooling-guidelines.md`를 새로 작성했다.
  - Clarity/GTM 사용 조건, dataLayer 예시, Clarity custom tag 예시, 금지 필드, 봇 이벤트 스키마를 추가했다.
  - yt-dlp는 다운로드보다 공개 메타데이터 우선 수집 도구로 제한했다.
  - `1,686편`, `초당 100편`은 운영 SLA가 아니라 원본 가이드의 예시/벤치마크 후보로 정의했다.
  - Data/EVE/KITT/TRON, 데이터 파이프라인, 봇 시뮬레이션, 파일럿, Risk Shield 문서에 새 지침 링크를 연결했다.
  - 운영 자산 인벤토리에 새 지침을 추가하고 `65개+` 표기로 조정했다.
- 사용한 도구: PowerShell, web research, Playwright 브라우저 표면, apply_patch
- 주요 판단: 실제 추적/수집 실행은 Medium 이상 리스크로 보고 KITT/TRON 검토를 필수화했다.
- 우회 또는 피봇: 없음.

## 산출물

- 산출물:
  - `docs/data-research-tooling-guidelines.md`
  - `work-requests/2026-05-22-update-data-research-tooling-guidelines/README.md`
  - `work-requests/2026-05-22-update-data-research-tooling-guidelines/references/source-notes.md`
  - `work-requests/2026-05-22-update-data-research-tooling-guidelines/evidence/keyword-check.txt`
- 변경 파일:
  - `agents/data.md`
  - `agents/eve.md`
  - `agents/kitt-tron.md`
  - `docs/README.md`
  - `docs/data-analysis-pipeline.md`
  - `docs/bot-simulation-design.md`
  - `docs/pilot-youtube-shop-kickoff.md`
  - `docs/risk-shield.md`
  - `docs/operating-assets-inventory-65.md`
  - `docs/project-user-manual.html`
- 검증 결과: 키워드 연결 확인 완료. `validate-jarvis-request.ps1` 결과 `Pass`.

## 리스크

- 발견한 리스크: 사용자 행동 추적과 외부 플랫폼 수집은 개인정보, 동의, 저작권, 플랫폼 약관 리스크가 있다.
- 호출한 CC: KITT/TRON, Friday
- 승격 여부: 실제 추적/수집 실행은 하지 않았으므로 Human Conductor 승격 없음.

## 다음

- 다음 액션: 실제 사이트에 Clarity/GTM을 적용하거나 yt-dlp 수집을 실행하려면 KITT/TRON 검토와 Human Conductor 승인 조건을 먼저 확인한다.
- 후속 담당자: Data, EVE, KITT/TRON
