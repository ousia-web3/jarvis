# 스킬 폴더

이 폴더는 Jarvis 에이전트가 따라야 하는 스킬형 운영 절차를 보관합니다.

## 핵심 스킬

- `agent-team-orchestration/SKILL.md`: Jarvis Dream Team 운영의 기본 흐름
- `jarvis-design-review/SKILL.md`: 신규 MVP, 고위험 기능, 아키텍처 결정 보조 모드
- `jarvis-prd-planning/SKILL.md`: 표준 PRD 6섹션 기획

## Design Taste Skills (Cursor Agent Skills)

시각·프론트엔드 구현은 `.agents/skills/`에 설치된 taste-skill 계열을 사용합니다. 선택·호출·비적용 범위 SSOT는 `docs/design-taste-skill-guide.md`입니다. 버전 잠금은 루트 `skills-lock.json`을 따릅니다.

| Skill ID | 경로 |
| --- | --- |
| `design-taste-frontend` (기본) | `.agents/skills/design-taste-frontend/SKILL.md` |
| `redesign-existing-projects` | `.agents/skills/redesign-existing-projects/SKILL.md` |
| `brandkit` | `.agents/skills/brandkit/SKILL.md` |
| 기타 10종 | `docs/design-taste-skill-guide.md` 매트릭스 참조 |

분석 대시보드·업무 그리드·다단계 포털 UI는 taste-skill 대상이 아닙니다.

## 사용 원칙

일반 작업은 에이전트 팀 오케스트레이션을 기본으로 사용합니다. 신규 MVP, 고위험 기능, 8개 문서 산출이 필요한 작업은 설계 리뷰 모드를 보조로 추가합니다. 랜딩·포트폴리오·리디자인·브랜드 키트는 IA Brief(Joi) 선행 후 Design Taste Skill(TARS/Joi)을 호출합니다.
