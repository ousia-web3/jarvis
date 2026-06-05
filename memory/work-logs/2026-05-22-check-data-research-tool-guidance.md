# 업무 로그: Data/EVE 도구 지침 존재 여부 확인

## 메타데이터

- 작업 ID: `check-data-research-tool-guidance`
- 프로젝트: Jarvis
- 에이전트: Jarvis, Data, EVE, KITT/TRON
- 역할: 문서 점검, 리서치 지침 확인, 리스크 관점 판정
- 시작 시각: 2026-05-22T10:22:00+09:00
- 완료 시각: 2026-05-22T10:30:00+09:00
- 상태: Done

## 입력

- 요청 요약: Microsoft Clarity/GTM 및 YTDLP 관련 Data/EVE 지침이 현재 문서에 있는지 확인한다.
- 참조 문서: `docs/README.md`, `agents/data.md`, `agents/eve.md`, `docs/ai-agent-team-guide.md`, `docs/data-analysis-pipeline.md`, `docs/bot-simulation-design.md`, `docs/pilot-youtube-shop-kickoff.md`
- 제약: 문서 존재 여부 확인만 수행하고, 새 운영 지침은 추가하지 않는다.

## 실행

- 수행한 일:
  - Data/EVE 역할 문서를 확인했다.
  - 데이터 분석 파이프라인, 봇 시뮬레이션, 유튜브 쇼핑몰 파일럿 문서를 확인했다.
  - Clarity, GTM, YT-DLP, YTDLP, YouTube, 500명, 1,680/1,686, 초당 100, 태깅 키워드를 검색했다.
  - 작업 요청 README에 존재 여부 판정표를 남겼다.
- 사용한 도구: PowerShell, rg, Select-String, Playwright 브라우저 표면
- 주요 판단: 도구명은 일부 문서에 있으나, 실제 운영 절차와 이벤트 태깅 설계는 아직 별도 지침으로 존재하지 않는다.
- 우회 또는 피봇: 없음.

## 산출물

- 산출물:
  - `work-requests/2026-05-22-check-data-research-tool-guidance/README.md`
  - `work-requests/2026-05-22-check-data-research-tool-guidance/evidence/keyword-search.txt`
- 변경 파일:
  - `work-requests/2026-05-22-check-data-research-tool-guidance/README.md`
  - `memory/work-logs/2026-05-22-check-data-research-tool-guidance.md`
- 검증 결과: 키워드 검색과 관련 문서 직접 확인 완료

## 리스크

- 발견한 리스크: Clarity/GTM, yt-dlp 실제 사용은 개인정보, 플랫폼 약관, 저작권, 추적 동의 리스크가 있어 별도 KITT/TRON 검토가 필요하다.
- 호출한 CC: Data, EVE, KITT/TRON
- 승격 여부: 현재는 문서 확인만 수행했으므로 승격 없음.

## 다음

- 다음 액션: 필요하면 `docs/data-research-tooling-guidelines.md` 같은 별도 지침 문서를 만들어 Clarity/GTM/yt-dlp 운영 기준을 정리한다.
- 후속 담당자: Data, EVE, KITT/TRON
