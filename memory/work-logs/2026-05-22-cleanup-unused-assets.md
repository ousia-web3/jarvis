# 작업 로그: cleanup-unused-assets

## 메타데이터

- Task ID: cleanup-unused-assets
- Project: Jarvis
- Agent: TARS
- Role: Engineering
- Finished At: 2026-05-22T10:40:57.215+09:00
- Status: Done

## 입력

- 요청 요약: 프로젝트 폴더의 불필요한 이미지 및 기타 파일 정리
- 제약 조건: 외부 배포 없음, 민감정보 전송 없음, 삭제 전 참조 여부와 워크스페이스 내부 경로 확인

## 실행

- 수행 작업: 임시 브라우저 프로필, 임시 스크린샷, Playwright MCP 산출물, Python 캐시, stray `Untitled` 파일 삭제
- 보존 판단: 대시보드 자산, PDF 추출 이미지, 기존 작업 증거 이미지는 문서와 대시보드에서 참조되거나 검증 증거로 필요해 보존
- 도구: Jarvis 요청 라이프사이클 스크립트, PowerShell 파일 스캔, `rg` 참조 검색
- 핵심 판단: “이미지 파일 전체 삭제”가 아니라 “미참조 또는 임시 산출물 삭제”로 범위를 제한해야 프로젝트 문서와 대시보드가 깨지지 않음

## 산출물

- `work-requests/2026-05-22-cleanup-unused-assets/README.md`
- `dashboards/task-events.jsonl`

## 검증

- `.playwright-mcp/` 삭제 확인
- `stock-auto-trader/**/__pycache__/` 0개 확인
- `tmp/`에는 현재 대시보드 서버 로그 2개만 남은 상태 확인
- 대시보드 URL HTTP 200 확인
- `validate-jarvis-request.ps1 -RequestId cleanup-unused-assets` Pass 확인

## 리스크

- Risk Level: Medium
- 남은 리스크: `tmp/dashboard-server-8787.*.log`는 현재 대시보드 서버 로그라 보존함

## 다음

- 대시보드 서버를 완전히 종료한 뒤 로그까지 지우려면 별도 종료 후 `tmp/` 로그 2개를 삭제하면 됨
