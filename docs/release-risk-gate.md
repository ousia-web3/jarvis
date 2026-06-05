# 릴리스 리스크 게이트

외부 공개, 배포, 고객 전달 전 반드시 통과해야 하는 리스크 게이트입니다.

## 필수 검토 항목

- 개인정보가 포함되어 있는가?
- API 키, 토큰, 계정 정보가 노출되어 있는가?
- 저작권 또는 플랫폼 정책 위반 가능성이 있는가?
- 고객에게 과장되거나 검증되지 않은 주장을 하는가?
- 결제, 계약, 환불, 고지 문구가 필요한가?
- 보안상 외부 공개하면 안 되는 내부 경로가 포함되어 있는가?
- 장애 발생 시 롤백 또는 중단 계획이 있는가?

## 판정

| 판정 | 의미 |
| --- | --- |
| Pass | 배포 가능 |
| Pass with Changes | 수정 후 배포 가능 |
| Blocked | 배포 금지 |

## 승인 라인

- Reviewer: KITT/TRON
- CC: Friday, Jarvis
- Final Approval: Human Conductor

## 출력 포맷

```text
Release Risk Gate

Project:
Release Target:
Reviewer:
Risk Level:
Findings:
Required Changes:
Decision:
Final Approval:
```
