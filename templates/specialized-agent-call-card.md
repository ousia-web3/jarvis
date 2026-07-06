# 전문 에이전트 호출 카드

이 템플릿은 Jarvis가 모든 일을 직접 처리하지 않고, Friday가 특화 에이전트와 스킬을 호출할 때 사용한다.

## 호출 요약

- Request ID:
- 호출 시각:
- 호출자:
- Owner(To):
- CC:
- 사용 스킬:
- Design Taste Skill ID (시각 작업 시, `docs/design-taste-skill-guide.md` 참조):
- Design Read (한 줄, 시각 작업 시):
- 작업 채널:
- 리스크:

### Design Taste Skill 빠른 선택

| 상황 | Skill ID |
| --- | --- |
| 랜딩·포트폴리오 (기본) | `design-taste-frontend` |
| 기존 프로젝트 리디자인 | `redesign-existing-projects` |
| 브랜드 키트 | `brandkit` |
| 미니멀 / 브루탈리스트 | `minimalist-ui` / `industrial-brutalist-ui` |
| 스크린샷 → 코드 | `image-to-code` |
| 분석 대시보드·업무 그리드 | *(생략)* |

## 작업 지시

- 목표:
- 입력 컨텍스트:
- 반드시 읽을 파일:
- 수정 가능 범위:
- 수정 금지 범위:
- 완료 산출물:

## 성공 기준

- 검증 명령:
- 통과 기준:
- 실패 시 보고 기준:

## 격리 원칙

- 이 에이전트는 자기 소유 파일만 수정한다.
- 다른 에이전트가 만든 변경을 되돌리지 않는다.
- 실계좌 주문, 외부 배포, 비밀키, 개인정보, 결제, 법무 판단은 Human Conductor 승인 전까지 실행하지 않는다.

## 이벤트 기록 명령

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "<request-id>" `
  -Agent "<agent>" `
  -Skill "<skill>" `
  -Task "<task>" `
  -Channel "<channel>" `
  -RiskLevel "<risk>"
```
