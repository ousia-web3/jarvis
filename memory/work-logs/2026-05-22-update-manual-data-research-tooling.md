# Work Log: 매뉴얼 데이터·리서치 도구 지침 반영

## Metadata

- Task ID: `update-manual-data-research-tooling`
- Project: Jarvis
- Agent: TARS, Data, EVE, KITT/TRON, Diagnostic Agent
- Role: 매뉴얼 문서 수정, 데이터·리서치 지침 노출, 브라우저 검증
- Started At: 2026-05-22T10:40:00+09:00
- Finished At: 2026-05-22T10:45:00+09:00
- Status: Done

## Input

- 요청 요약: 새 Data/EVE 데이터·리서치 도구 운영 지침을 사용자용 매뉴얼에도 반영한다.
- 참조 문서: `docs/project-user-manual.html`, `docs/data-research-tooling-guidelines.md`
- 제약: 내부 HTML 매뉴얼 문서만 수정하고 실제 추적 코드 삽입이나 외부 수집 실행은 하지 않는다.

## Execution

- 수행한 일:
  - EVE 역할 카드에 yt-dlp 기반 영상 메타데이터 수집 계획과 데이터·리서치 도구 기준 링크를 추가했다.
  - Data 역할 카드에 Clarity/GTM 행동 태깅, 봇 이벤트 스키마, 데이터·리서치 도구 기준 링크를 추가했다.
  - 파일럿 운영 예시에 `data-research-tooling-guidelines.md` 링크와 KITT/TRON 검토 전 제한 문구를 추가했다.
  - 주요 파일 링크 섹션에 Data/EVE 데이터·리서치 도구 운영 지침을 추가했다.
- 사용한 도구: PowerShell, Playwright 브라우저 표면, apply_patch
- 주요 판단: 매뉴얼은 사람이 보는 최신 운영 표면이므로 새 지침 링크를 역할/파일럿/참고 링크 세 곳에 노출했다.
- 우회 또는 피봇: 없음.

## Output

- 산출물:
  - `docs/project-user-manual.html`
  - `work-requests/2026-05-22-update-manual-data-research-tooling/README.md`
  - `work-requests/2026-05-22-update-manual-data-research-tooling/evidence/manual-keyword-check.txt`
  - `work-requests/2026-05-22-update-manual-data-research-tooling/evidence/manual-http-check.json`
- 변경 파일:
  - `docs/project-user-manual.html`
  - `work-requests/2026-05-22-update-manual-data-research-tooling/README.md`
  - `memory/work-logs/2026-05-22-update-manual-data-research-tooling.md`
- 검증 결과:
  - HTTP 200 확인
  - 매뉴얼 HTML에서 `data-research-tooling-guidelines.md`, `Clarity/GTM`, `yt-dlp`, `KITT/TRON 검토` 문구 확인
  - 브라우저 페이지 텍스트 확인 완료

## Risk

- 발견한 리스크: 없음. 실제 행동 추적이나 외부 수집은 실행하지 않았다.
- 호출한 CC: Data, EVE, KITT/TRON
- 승격 여부: Low risk라 Human Conductor 승격 없음.

## Next

- 다음 액션: 실제 Clarity/GTM 적용이나 yt-dlp 수집 실행 요청이 오면 KITT/TRON 검토 게이트부터 확인한다.
- 후속 담당자: Data, EVE, KITT/TRON
