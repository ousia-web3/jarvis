# Design Taste Skill 가이드

## 목적

이 문서는 `Leonxlnx/taste-skill` 계열 Cursor Agent Skills를 Jarvis 디자인·프론트엔드 워크플로에 공식 연결하는 SSOT입니다. Jarvis 운영 스킬(`skills/`)과 Cursor Agent Skills(`.agents/skills/`)의 역할 분담, 선택 기준, 호출 절차, 비적용 범위를 한 장에서 고정합니다.

## 스킬 2계층

| 계층 | 위치 | 역할 |
| --- | --- | --- |
| Jarvis 운영 스킬 | `skills/` | 오케스트레이션, Design Review, PRD 기획 |
| Design Taste Skills | `.agents/skills/` | 랜딩·포트폴리오·리디자인·브랜드 키트 등 시각 구현 |

설치·버전 잠금은 루트 `skills-lock.json`을 따릅니다. 재설치:

```powershell
npx skills add Leonxlnx/taste-skill
```

## Jarvis 워크플로 연계

```text
Jarvis/Friday (전략·분해)
  → Joi: IA Brief (templates/ia-brief-template.md) — 정보구조·내비·라벨
  → Joi/TARS: Design Taste Skill — 시각 언어·레이아웃·모션·구현
  → Joi: Design QA — IA·UX·시각 일치 검수
  → C3PO: 카피·CTA 라벨 정합
```

Design Review L2에서 Design System(8문서 중 6번) 산출 시, taste-skill은 **시각 토큰·컴포넌트 톤·레퍼런스 구현** 보조로 쓰고 IA Brief를 대체하지 않습니다.

## 스킬 선택 매트릭스

| 작업 유형 | Owner(To) | CC | Skill ID | 경로 |
| --- | --- | --- | --- | --- |
| 랜딩·포트폴리오·일반 프론트 (기본) | TARS | Joi, C3PO | `design-taste-frontend` | `.agents/skills/design-taste-frontend/SKILL.md` |
| v1 호환(레거시 동작 고정) | TARS | Joi | `design-taste-frontend-v1` | `.agents/skills/design-taste-frontend-v1/SKILL.md` |
| 기존 프로젝트 시각 리디자인 | Joi | TARS, C3PO | `redesign-existing-projects` | `.agents/skills/redesign-existing-projects/SKILL.md` |
| 미니멀 UI | TARS | Joi | `minimalist-ui` | `.agents/skills/minimalist-ui/SKILL.md` |
| 인더스트리얼 브루탈리스트 UI | TARS | Joi | `industrial-brutalist-ui` | `.agents/skills/industrial-brutalist-ui/SKILL.md` |
| 고급 비주얼·에디토리얼 | Joi | TARS | `high-end-visual-design` | `.agents/skills/high-end-visual-design/SKILL.md` |
| 브랜드 키트·아이덴티티 보드 | Joi | C3PO | `brandkit` | `.agents/skills/brandkit/SKILL.md` |
| Stitch 연동 디자인 | TARS | Joi | `stitch-design-taste` | `.agents/skills/stitch-design-taste/SKILL.md` |
| 스크린샷·목업 → 코드 | TARS | Joi | `image-to-code` | `.agents/skills/image-to-code/SKILL.md` |
| 웹 목업 이미지 생성 | Joi | TARS | `imagegen-frontend-web` | `.agents/skills/imagegen-frontend-web/SKILL.md` |
| 모바일 목업 이미지 생성 | Joi | TARS | `imagegen-frontend-mobile` | `.agents/skills/imagegen-frontend-mobile/SKILL.md` |
| GPT 스타일 테이스트 보조 | Joi | TARS | `gpt-taste` | `.agents/skills/gpt-taste/SKILL.md` |
| 전체 출력·누락 방지 | (보조) | — | `full-output-enforcement` | `.agents/skills/full-output-enforcement/SKILL.md` |

Friday는 위 표에서 **하나의 Primary Skill**을 Owner(To) 행에 지정하고, 애매하면 `design-taste-frontend`를 기본값으로 둡니다.

## 비적용 범위 (생략)

다음 작업은 taste-skill을 **호출하지 않습니다**. Jarvis IA + TARS 구현 + Plotly/Dash·업무 그리드·폼 중심 UI를 따릅니다.

- 분석 대시보드, 데이터 테이블, KPI cockpit (예: `hnt_cob-brand`)
- 다단계 업무·ERP·포털 내부 화면 (SI 단일 화면 목업은 IA만, taste-skill 선택)
- API-only, CLI, 배치·스크립트
- L0 문구/버그 1~2파일 수정

## 실행 트랙별 최소 루프

| 트랙 | taste-skill |
| --- | --- |
| L0 | 생략 (시각 작업이 아니면) |
| L1 | 단일 랜딩/목업이면 Primary Skill 1개 지정 → 구현 → 스크린샷 검증 |
| L2 | IA Brief 선행 → Design System 또는 시각 구현 단계에서 Primary Skill → Joi Design QA |

## 호출 이벤트

```powershell
powershell -ExecutionPolicy Bypass -File scripts/invoke-jarvis-agent.ps1 `
  -RequestId "<request-id>" `
  -Agent "TARS" `
  -Skill "design-taste-frontend" `
  -Task "코브랜드 랜딩 Hero·CTA 시각 구현" `
  -Channel "design" `
  -RiskLevel "Medium" `
  -Cc "Joi","C3PO"
```

`-Skill` 값은 위 **Skill ID** 문자열을 그대로 사용합니다.

## 에이전트 적용 규칙

- **Joi**: IA·User Flow·Design Read(한 줄 디자인 방향) 선언. 리디자인·브랜드 키트는 Joi Owner 가능.
- **TARS**: HTML/CSS/프레임워크 구현 Owner. 스킬 파일을 실행 전 반드시 읽습니다.
- **C3PO**: Hero·CTA·라벨 카피는 Label Dictionary와 정합.
- **Jarvis**: taste-skill이 IA나 PRD 범위를 덮어쓰지 않도록 단계 순서를 지킵니다.

## 검증

- 시각 작업: 데스크톱·모바일 스크린샷 또는 프리뷰 URL
- Design Read 한 줄이 work-request README 또는 Work Log에 기록됨
- IA Brief가 있는 L2 작업은 내비·라벨 충돌 없음

## 참고

- 에이전트 매트릭스: [agent-skill-call-matrix.md](./agent-skill-call-matrix.md)
- 전문 호출: [specialized-agent-invocation-playbook.md](./specialized-agent-invocation-playbook.md)
- Joi 역할: [../agents/joi.md](../agents/joi.md)
- upstream: https://skills.sh/Leonxlnx/taste-skill
