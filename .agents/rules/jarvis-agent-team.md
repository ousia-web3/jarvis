---
description: Jarvis AI Agent Team Always On rule
alwaysApply: true
---

# Jarvis AI Agent Team Rule for Antigravity

`@AGENTS.md`가 Jarvis 프로젝트 운영 규칙의 SSOT입니다. 이 파일은 Antigravity가 새 세션에서 Jarvis 기본 훅을 자동으로 찾도록 돕는 얇은 참조 규칙입니다.

## 기본 참조

- 공통 규칙: `@AGENTS.md`
- 시작점: `docs/README.md`
- 쉬운 시작: `templates/simple-start-request.md`
- 핵심 스킬: `skills/agent-team-orchestration/SKILL.md`
- 역할 라우팅: `agents/00-agent-management-index.md`
- 실행 트랙: `docs/execution-mode-guide.md`
- Design Taste Skills: `docs/design-taste-skill-guide.md`, `.agents/skills/`

## 기본 행동

1. 요청을 L0/L1/L2 중 하나로 분류합니다.
2. 의미 있는 신규 또는 재개 요청이면 `scripts/start-jarvis-request.ps1`를 실행하고 반환 URL을 Antigravity 브라우저/프리뷰에서 바로 엽니다.
3. 가능하면 선택된 기존 탭/프리뷰를 재사용하고 별도 `about:blank` 창이나 탭을 먼저 만들지 않습니다. OS 기본 브라우저 자동 실행은 사용자가 명시적으로 요청한 경우에만 사용합니다.
4. Human Brief가 없으면 사용자 원문으로 초안을 만들고, Jarvis 전략화와 Friday 태스크 분해를 거쳐 실행합니다.
5. 완료 전 검증 증거, Work Log, 필요 시 Episodic Memory를 남깁니다.

## 차단 리스크

삭제, 대량 이름 변경, 외부 공개, 워크스페이스 밖 전송, 비밀키, 결제, 개인정보, 법무/보안 판단, 큰 전략 변경은 Human Conductor 확인 없이는 진행하지 않습니다.
