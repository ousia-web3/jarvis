# TASK: AI 에이전트 팀 기반 자율 협업 아키텍처 구축

## 0. 작업 상태 요약

| 상태 | 항목 | 담당 |
| --- | --- | --- |
| 완료 | 기존 Markdown 가이드 정리 | Codex |
| 완료 | `opendataloader-pdf` 기본 모드 설치 및 PDF 산출물 추출 | Codex |
| 완료 | PDF 이미지 21장, JSON, Markdown 추출 결과 정리 | Codex |
| 완료 | PRD 작성 | Codex |
| 완료 | 핵심 운영 템플릿, 페르소나 카드, 리스크 쉴드 초안 생성 | Codex |
| 완료 | 4단계 아키텍처 세부 문서 분리 | Codex |
| 완료 | 에이전트별 페르소나/지침 파일 분리 | Codex |
| 완료 | 운영 템플릿, 체크리스트, 파일럿 프로젝트 문서 생성 | Codex |
| 완료 | 스킬형 오케스트레이션 지침 생성 | Codex |

## 1. 마일스톤

| 마일스톤 | 목표 | 완료 기준 |
| --- | --- | --- |
| M1. 아키텍처 고정 | 4단계 협업 아키텍처와 역할 체계 확정 | PRD 승인, 누락 역할 0건 |
| M2. 운영 프로토콜 설계 | To/CC, 채널, 권한, 보고 체계 정의 | 운영 템플릿 생성 |
| M3. 에이전트 브레인 설계 | 기억, 지혜 승격, 망각, 성찰 규칙 정의 | 메모리 템플릿과 소거 정책 생성 |
| M4. 리스크 쉴드 구축 | Data/KITT/TRON/진단 에이전트의 방어 체계 정의 | 배포 전 체크리스트 생성 |
| M5. 파일럿 프로젝트 적용 | 유튜브 쇼핑몰 예시 워크플로우로 검증 | 태스크 실행 흐름과 품질 게이트 통과 |

## 2. Workstream A: 지휘부 및 PM 체계

### A-001. 인간 대표 입력 템플릿 작성

- Owner: Jarvis
- CC: Friday, KITT/TRON
- Priority: P0
- 산출물: `../templates/human-brief-template.md`
- 내용:
  - 비전
  - 목표
  - 성공 기준
  - 제약 조건
  - 금지 사항
  - 최종 승인 기준
- 완료 기준:
  - 인간 대표가 한 번의 입력으로 프로젝트 킥오프가 가능해야 한다.

### A-002. Jarvis 지휘 프로토콜 정의

- Owner: Jarvis
- CC: Friday, Data
- Priority: P0
- 산출물: `../templates/jarvis-command-protocol.md`
- 내용:
  - 목표 해석
  - 전략 우선순위
  - 의사결정 기준
  - 에이전트 호출 조건
  - 인간 대표 승격 조건
- 완료 기준:
  - Jarvis가 PM에게 전달할 전략 브리프 포맷이 있어야 한다.

### A-003. Friday PM 태스크 분해 템플릿 작성

- Owner: Friday
- CC: Jarvis, KITT/TRON
- Priority: P0
- 산출물: `../templates/friday-task-breakdown-template.md`
- 내용:
  - 업무 목적
  - To 담당자
  - CC 검토자
  - 입력 자료
  - 예상 산출물
  - 리스크
  - 마감
  - 완료 기준
- 완료 기준:
  - 모든 태스크에 To와 CC가 반드시 존재해야 한다.

## 3. Workstream B: The Dream Team 페르소나 명세

### B-001. 8대 핵심 에이전트 카드 작성

- Owner: Friday
- CC: Jarvis
- Priority: P0
- 산출물: `docs/agent-cards.md`
- 포함 대상:
  - Jarvis: 총괄 지휘
  - Friday: PM 및 비즈니스 전문가
  - EVE: 리서치 전문가
  - Joi: 디자인 및 UX/UI 전문가
  - TARS: 개발 엔지니어
  - C3PO: 마케팅 및 카피라이터
  - Data: 데이터 사이언티스트
  - KITT/TRON: 법무, 보안, 개인정보, 리스크 쉴드
- 완료 기준:
  - 각 카드에 역할, 권한, 금지사항, 주요 산출물, To/CC 규칙이 있어야 한다.

### B-002. 분석 및 리스크관리 쉴드 역할 강화

- Owner: KITT/TRON
- CC: Data, Jarvis
- Priority: P0
- 산출물: `docs/risk-shield.md`
- 내용:
  - 법무 리스크
  - 보안 리스크
  - 개인정보 리스크
  - 저작권 리스크
  - 드리프트 및 거짓 완료 보고
  - 외부 공개 전 검토 규칙
- 완료 기준:
  - 배포 또는 외부 공유 전 쉴드 검토가 필수 단계로 포함되어야 한다.

### B-003. 기획 및 실무진 산출물 정의

- Owner: Friday
- CC: EVE, Joi, TARS, C3PO
- Priority: P1
- 산출물: `docs/workforce-deliverables.md`
- 내용:
  - EVE: 리서치 로그, 데이터 소스 목록, 수집 한계
  - Joi: 사용자 흐름, 와이어프레임, UX 리스크
  - TARS: 구현 계획, 테스트 결과, Git 변경 요약
  - C3PO: 메시지 전략, 카피, 고객 심리 가설
- 완료 기준:
  - 실무 산출물별 검토자와 품질 기준이 있어야 한다.

## 4. Workstream C: The Virtual Office 통신망

### C-001. Discord 채널 구조 정의

- Owner: Friday
- CC: Jarvis, KITT/TRON
- Priority: P0
- 산출물: `docs/virtual-office-discord-structure.md`
- 채널:
  - `#command-bridge`
  - `#prj-{project-name}`
  - `#agent-jarvis`
  - `#agent-friday`
  - `#agent-eve`
  - `#agent-joi`
  - `#agent-tars`
  - `#agent-c3po`
  - `#agent-data`
  - `#agent-kitt`
  - `#risk-shield`
  - `#memory-log`
  - `#general-logs`
- 완료 기준:
  - 각 채널의 목적, 작성 주체, 열람 주체, 보존 기간이 정의되어야 한다.

### C-002. To/CC 메시지 프로토콜 작성

- Owner: Friday
- CC: Data, KITT/TRON
- Priority: P0
- 산출물: `docs/to-cc-message-protocol.md`
- 규칙:
  - `To`는 풀 컨텍스트와 실행 책임을 가진다.
  - `CC`는 요약 컨텍스트와 검토 책임을 가진다.
  - `Escalate`는 PM 또는 지휘부 승격을 의미한다.
  - 리스크 판단 시 KITT/TRON은 강제 CC로 추가된다.
- 완료 기준:
  - 예시 메시지 5개 이상을 포함해야 한다.

### C-003. 업무 로그 포맷 작성

- Owner: Data
- CC: Friday
- Priority: P1
- 산출물: `../templates/work-log-template.md`
- 내용:
  - 태스크 ID
  - 담당자
  - 입력
  - 실행
  - 산출물
  - 검증
  - 다음 액션
- 완료 기준:
  - 추후 분석 가능한 구조화 로그여야 한다.

## 5. Workstream D: The Agent Brain 기억 및 망각

### D-001. 에피소딕 메모리 템플릿 작성

- Owner: Data
- CC: Jarvis
- Priority: P0
- 산출물: `../templates/episodic-memory-template.md`
- 내용:
  - 오늘 수행한 일
  - 어려웠던 지점
  - 인간 대표의 피드백
  - 배운 점
  - 다음 업무에 적용할 원칙
- 완료 기준:
  - 모든 완료 태스크가 일기 형태로 복기 가능해야 한다.

### D-002. 지혜 승격 프로세스 정의

- Owner: Jarvis
- CC: Data, Friday
- Priority: P1
- 산출물: `docs/wisdom-promotion-process.md`
- 단계:
  - 로우 로그 수집
  - 반복 패턴 식별
  - 공통 원리 추출
  - 지혜 후보 등록
  - 인간 또는 Jarvis 승인
  - 공통 원칙 저장
- 완료 기준:
  - 업무 경험이 재사용 가능한 운영 원칙으로 승격되어야 한다.

### D-003. 망각 및 소거 정책 작성

- Owner: KITT/TRON
- CC: Data, Jarvis
- Priority: P0
- 산출물: `docs/forgetting-and-purging-policy.md`
- 정책:
  - 핵심 지혜는 장기 보존
  - 임시 로그는 기간 한정 보존
  - 개인정보와 민감정보는 최소 보존
  - 오류 유발 컨텍스트는 격리 또는 소거
  - 로우 데이터는 승격 후 요약본만 보존
- 완료 기준:
  - 보존, 요약, 소거 기준이 명확해야 한다.

## 6. Workstream E: 분석 및 리스크관리 쉴드

### E-001. 데이터 분석 파이프라인 정의

- Owner: Data
- CC: EVE, Friday
- Priority: P1
- 산출물: `docs/data-analysis-pipeline.md`
- 내용:
  - 수집 데이터 입력
  - 페르소나 분류
  - 행동 패턴 태깅
  - KPI 후보 도출
  - 한계와 편향 기록
- 완료 기준:
  - 리서치 결과가 기획과 실무 산출물로 이어지는 경로가 명확해야 한다.

### E-002. 드리프트 진단 체크리스트 작성

- Owner: 진단 에이전트
- CC: Data, KITT/TRON
- Priority: P0
- 산출물: `docs/drift-diagnosis-checklist.md`
- 체크 항목:
  - 반복 실패 은폐
  - 완료하지 않은 작업의 완료 보고
  - 목표와 무관한 우회 실행
  - 권한 초과 시도
  - 근거 없는 확신
  - 스트레스 또는 과부하 징후
- 완료 기준:
  - 이상 징후 발생 시 승격 기준이 있어야 한다.

### E-003. 배포 전 법무·보안 게이트 작성

- Owner: KITT/TRON
- CC: Jarvis, Friday
- Priority: P0
- 산출물: `docs/release-risk-gate.md`
- 체크 항목:
  - 개인정보 포함 여부
  - 저작권 침해 가능성
  - API 키 및 비밀정보 노출
  - 외부 공개 가능성
  - 계약 및 고지 문구
  - 배포 승인자
- 완료 기준:
  - 외부 공유 또는 배포 전 필수 검토 절차로 사용할 수 있어야 한다.

## 7. Workstream F: 파일럿 프로젝트 적용

### F-001. 유튜브 쇼핑몰 프로젝트 킥오프 시나리오 작성

- Owner: Friday
- CC: Jarvis, EVE, Data
- Priority: P1
- 산출물: `docs/pilot-youtube-shop-kickoff.md`
- 내용:
  - 목표
  - 데이터 소스
  - 사용자 페르소나
  - 상품 큐레이션 원칙
  - 랜딩 페이지 범위
  - 검증 방식
- 완료 기준:
  - 4시간 실행 프로세스를 재현 가능한 단계로 정의해야 한다.

### F-002. 500명 봇 시뮬레이션 설계

- Owner: Data
- CC: Joi, KITT/TRON
- Priority: P2
- 산출물: `docs/bot-simulation-design.md`
- 내용:
  - 봇 페르소나
  - 행동 이벤트
  - 전환 지표
  - 태깅 규칙
  - 개인정보 및 윤리 기준
- 완료 기준:
  - 실제 사용자 데이터 없이도 가설 검증이 가능해야 한다.

### F-003. 개발 실행 체크리스트 작성

- Owner: TARS
- CC: Joi, KITT/TRON
- Priority: P1
- 산출물: `docs/development-execution-checklist.md`
- 내용:
  - 로컬 개발 환경
  - Git 전략
  - 테스트
  - UI 검증
  - 보안 검사
  - 배포 전 확인
- 완료 기준:
  - 실무 개발자가 즉시 따라 할 수 있어야 한다.

## 8. 우선순위 실행 순서

1. A-001 인간 대표 입력 템플릿
2. A-003 Friday 태스크 분해 템플릿
3. B-001 8대 핵심 에이전트 카드
4. B-002 분석 및 리스크관리 쉴드
5. C-001 Discord 채널 구조
6. C-002 To/CC 메시지 프로토콜
7. D-001 에피소딕 메모리 템플릿
8. D-003 망각 및 소거 정책
9. E-002 드리프트 진단 체크리스트
10. E-003 배포 전 법무·보안 게이트

## 9. 완료 정의

- 4단계 아키텍처가 모든 문서와 태스크에 연결되어 있다.
- 지휘부, PM, 기획 및 실무진, 분석 및 리스크관리 쉴드가 모두 명시되어 있다.
- 모든 태스크에 Owner와 CC가 지정되어 있다.
- 모든 외부 공개 또는 배포 태스크는 KITT/TRON 검토를 통과해야 한다.
- 모든 완료 태스크는 에피소딕 메모리 또는 업무 로그를 남긴다.
- 인간 대표 승인 없이 삭제, 외부 배포, 민감정보 전송이 발생하지 않는다.

## 10. 완료 산출물

### 10.1 PDF 추출

- `docs/pdf-extraction-report.md`
- `docs/opendataloader-extract/AI_에이전트_팀_아키텍처.md`
- `docs/opendataloader-extract/AI_에이전트_팀_아키텍처.json`
- `docs/opendataloader-extract/images/`

### 10.2 PRD/TASK 문서

- `docs/PRD-ai-agent-collaboration-architecture.md`
- `docs/TASK-ai-agent-collaboration-architecture.md`

### 10.3 4단계 아키텍처

- `../architecture/sys-01-dream-team.md`
- `../architecture/sys-02-virtual-office.md`
- `../architecture/sys-03-agent-brain.md`
- `../architecture/sys-04-human-conductor.md`

### 10.4 에이전트 분리 지침

- `../agents/00-agent-management-index.md`
- `../agents/human-conductor.md`
- `../agents/jarvis.md`
- `../agents/friday.md`
- `../agents/eve.md`
- `../agents/joi.md`
- `../agents/tars.md`
- `../agents/c3po.md`
- `../agents/data.md`
- `../agents/kitt-tron.md`
- `../agents/diagnostic-agent.md`

### 10.5 운영 문서

- `docs/to-cc-message-protocol.md`
- `docs/virtual-office-discord-structure.md`
- `docs/risk-shield.md`
- `docs/workforce-deliverables.md`
- `docs/wisdom-promotion-process.md`
- `docs/forgetting-and-purging-policy.md`
- `docs/drift-diagnosis-checklist.md`
- `docs/release-risk-gate.md`
- `docs/data-analysis-pipeline.md`
- `docs/bot-simulation-design.md`
- `docs/pilot-youtube-shop-kickoff.md`
- `docs/development-execution-checklist.md`

### 10.6 템플릿 및 스킬형 지침

- `../templates/simple-start-request.md`
- `../templates/human-brief-template.md`
- `../templates/jarvis-command-protocol.md`
- `../templates/friday-task-breakdown-template.md`
- `../templates/work-log-template.md`
- `../templates/episodic-memory-template.md`
- `../skills/agent-team-orchestration/SKILL.md`
