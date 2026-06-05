# 에피소딕 메모리: 하네스 에이전트 동향과 환경 분석

## 기본 정보

- 날짜: 2026-05-22
- 에이전트: Jarvis
- 프로젝트: Jarvis
- 작업 ID: `harness-agent-trend-env-analysis`

## 회고

- 오늘 내가 맡은 일: 최신 하네스 에이전트 흐름과 현재 Jarvis 환경을 비교 분석했다.
- 실제로 한 일: 공식 문서 중심으로 트렌드를 확인하고, 로컬 프로젝트의 문서/대시보드/이벤트/메모리/테스트 구조를 훑었다.
- 어려웠던 지점: "하네스 에이전트"라는 표현이 특정 제품명이 아니라 흐름을 가리킬 수 있어 작업 정의를 먼저 세워야 했다.
- 판단을 바꾼 순간: OpenAI Agents SDK와 Pydantic AI Harness 문서가 "harness"를 명시적으로 도구, 메모리, 샌드박스, guardrails, file/code execution 묶음으로 설명하는 것을 확인하고, Jarvis를 meta-harness로 보는 관점이 맞다고 판단했다.
- 인간 대표 또는 다른 에이전트에게 받은 피드백: 없음.

## 학습

- 새로 배운 점: 2026년형 agent harness는 multi-agent roleplay보다 tool protocol, sandbox, durable execution, typed eval, human approval 쪽으로 무게중심이 이동했다.
- 다음에 반복하지 말아야 할 실수: 최신 동향 분석에서 특정 프레임워크 인기만 나열하지 말고, 현재 프로젝트 구조에 어떤 계층으로 들어갈지 분리해서 판단해야 한다.
- 다음에도 재사용할 수 있는 패턴: "Jarvis meta-harness + MCP callable operating surface + typed lifecycle + eval gates" 조합.
- 지혜 승격 후보: Jarvis는 외부 agent framework를 대체재가 아니라 실행 엔진으로 편입하는 방향이 안정적이다.

## 기억 정책

- 장기 보존할 내용: Jarvis의 다음 기술 진화 방향은 MCP, typed lifecycle, eval gates, optional runtime SDK 순서가 좋다는 판단.
- 요약 후 소거할 내용: 개별 웹 조사 중간 탐색 내역.
- KITT/TRON 검토가 필요한 민감정보: 없음.
