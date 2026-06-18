# Human Brief

## 사용자 원문

JARVIS 구조 분석 후 웹서비스 기획 시 IA(정보설계) 구조 설계·구현 반영 여부를 검토하고, 보완 제안 6항목을 순차적으로 작업 진행.

## 1. 프로젝트 선언

- 프로젝트명: JARVIS 웹 IA 프로세스 통합
- 한 줄 목표: 웹서비스 기획 시 IA(정보설계)가 공식 프로세스·템플릿·게이트에 반영되도록 JARVIS 운영 자산을 보완한다.
- requestId: `jarvis-web-ia-process-integration`
- 최종적으로 얻고 싶은 결과: 신규 웹 요청부터 IA Brief → UX Brief → 구현까지 이어지는 표준 흐름

## 2. 성공 기준

- 80점: IA Brief 템플릿, Joi/Design Review/Friday/상태머신/산출물 기준 6항목 반영
- 100점: TARS 개발 체크리스트·에이전트 매트릭스·검증 스크립트까지 IA 게이트 연동

## 3. 제약

- 기존 4단계 아키텍처와 에이전트 역할 체계 유지
- 단순 파일 수정·기존 구현 작업에 IA를 강제하지 않음
- 외부 배포 없음, 문서·템플릿 중심 변경

## 4. 역할

- To: Jarvis, TARS
- CC: Friday, Joi, KITT/TRON
