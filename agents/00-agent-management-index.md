# 에이전트 관리 인덱스

에이전트는 한 문서에 뭉쳐 관리하지 않고, 역할별 지침 파일로 분리합니다. Friday는 태스크 배정 시 이 인덱스를 기준으로 Owner(To)와 CC를 지정합니다.

## 에이전트 그룹

| 그룹 | 에이전트 | 지침 파일 |
| --- | --- | --- |
| 지휘부 | 인간 대표 | `human-conductor.md` |
| 지휘부 | Jarvis | `jarvis.md` |
| 프로젝트 매니저 | Friday | `friday.md` |
| 기획 및 실무진 | EVE | `eve.md` |
| 기획 및 실무진 | Joi | `joi.md` |
| 기획 및 실무진 | TARS | `tars.md` |
| 기획 및 실무진 | C3PO | `c3po.md` |
| 분석 및 리스크관리 쉴드 | Data | `data.md` |
| 분석 및 리스크관리 쉴드 | KITT/TRON | `kitt-tron.md` |
| 분석 및 리스크관리 쉴드 | 진단 에이전트 | `diagnostic-agent.md` |

## 기본 배정 규칙

- 전략, 방향성, 우선순위 충돌: Jarvis
- 일정, 태스크 분해, 산출물 취합: Friday
- 리서치와 데이터 수집: EVE
- UX/UI, 화면 흐름, 감성 품질: Joi
- 개발, 테스트, Git 변경: TARS
- 마케팅 카피, 고객 심리 메시지: C3PO
- 분석, KPI, 시뮬레이션: Data
- 법무, 보안, 개인정보, 저작권: KITT/TRON
- 드리프트, 과부하, 거짓 보고 감지: 진단 에이전트

## 사용 순서

1. 인간 대표가 `../templates/human-brief-template.md`로 목표를 입력한다.
2. Jarvis가 전략 브리프를 만든다.
3. Friday가 태스크를 분해한다.
4. 각 Owner는 본인 지침 파일을 기준으로 실행한다.
5. CC 에이전트는 요약 컨텍스트만 검토한다.
6. 완료 후 `../templates/episodic-memory-template.md`에 회고를 남긴다.
