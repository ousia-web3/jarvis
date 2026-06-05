# 병렬 작업공간 포트 정책

## 배경

Jarvis 작업은 다른 도구나 에이전트가 별도 작업공간에서 동시에 실행하는 작업과 병렬로 진행될 수 있습니다. 예시는 다음과 같습니다.

- `C:\Users\HANA\Desktop\gemini\jarvis`
- `C:\Users\HANA\Desktop\gemini\testing`

각 작업공간은 같은 로컬 포트, 임시 런타임 폴더, 장기 실행 서버 프로세스를 조용히 재사용하면 안 됩니다.

## 현재 예약

- `jarvis` 대시보드: `http://localhost:8787/dashboards/agent-assignment-dashboard.html`
- `testing` 작업공간: 별도 소유로 취급한다. 사용자가 명시적으로 요청하지 않는 한 해당 작업공간의 런타임 리소스를 읽거나 수정하거나 시작/중지/재사용하지 않는다.

## 규칙

1. 로컬 서버를 시작하기 전에 목표 포트가 이미 수신 중인지 확인한다.
2. 포트가 사용 중이면 사용자가 명시적으로 요청하지 않는 한 종료하거나 재사용하지 않는다.
3. 작업공간별 포트를 우선 사용한다.
   - `jarvis`: `8787`, 그다음 `8788`, 그다음 사용 가능한 높은 포트.
   - `testing`: 사용자가 해당 작업공간 조정을 요청하지 않는 한 여기서 포트를 배정하지 않는다.
4. 서버 시작 후 실제 사용 URL을 보고한다.
5. 생성된 스크린샷, 브라우저 프로필, 임시 파일은 현재 작업공간 아래에 둔다. 예: `jarvis/tmp/`.
6. 작업이 명시하지 않은 형제 프로젝트 폴더, 예를 들어 `testing`은 건드리지 않는다.

## PowerShell 포트 확인

```powershell
Get-NetTCPConnection -State Listen |
  Select-Object LocalAddress, LocalPort, OwningProcess |
  Sort-Object LocalPort
```

특정 포트만 확인할 때:

```powershell
Get-NetTCPConnection -LocalPort 8787 -State Listen -ErrorAction SilentlyContinue
```
