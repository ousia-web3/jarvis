# Risk Shield Review

- Request ID:
- Reviewer:
- Date:
- Risk Level:
- Assignment: `To` / `CC`

## 검토 범위

- 도메인:
- 관련 파일:
- 관련 명령:
- 검토하지 않은 범위:

## 판정

- Status: `Pass` / `Pass with Conditions` / `Blocked`
- Summary:

## 차단 리스크

| 항목 | 판정 | 근거 | 조치 |
| --- | --- | --- | --- |
| 개인정보/비밀키 |  |  |  |
| 외부 배포 |  |  |  |
| 결제/계좌/실거래 |  |  |  |
| 법무/저작권 |  |  |  |
| 보장/과장 표현 |  |  |  |

## 조건부 허용 사항

- 

## 다음 액션

- 

## 이벤트 기록

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "<request-id>" `
  -Agent "KITT/TRON" `
  -Assignment CC `
  -Skill "risk-shield-review" `
  -Task "Risk Shield Review" `
  -Channel risk `
  -RiskLevel High
```
