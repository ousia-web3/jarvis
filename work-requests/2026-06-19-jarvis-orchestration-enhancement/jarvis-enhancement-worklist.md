# Jarvis 고도화 작업목록

- requestId: `jarvis-orchestration-enhancement`
- 작성일: 2026-06-19
- 최종 갱신: 2026-06-19 (비용·단점 완화 — L0/L1/L2 트랙, SSOT 참조, 선택/보류 재분류)
- 근거: 2026-06-19 대화 — 오케스트레이션 연동 진단, MVP/Design Review 구분, SI 웹·EVE 리서치 갭, Codex/Antigravity IDE 규칙, 비용·오버헤드 완화
- SSOT: `AGENTS.md`, `skills/agent-team-orchestration/SKILL.md`
- SSOT 보조: `docs/jarvis-agent-improvement-backlog.md`

## 목적

Jarvis 운영 모델을 **새 프레임워크로 교체**하지 않고, 현재 구조(역할 라우팅 + JSONL + 대시보드 + 검증 게이트)를 **실행 가능하고 SI 웹·멀티 IDE에 맞게 고도화**한다.

**원칙:** 고도화 ≠ 모든 요청에 풀 루프 강제. **경량(L0)과 풀(L2)을 분리**해 오버헤드를 통제한다.

## 현재 진단 요약

| 영역 | 설계·코드 | 실제 운영 | 핵심 갭 |
| --- | --- | --- | --- |
| 역할 오케스트레이션 | ◎ | ○~◎ | 세션마다 이벤트·검증 훅 생략 |
| 대시보드/JSONL | ◎ | △ | 6/5 이후 `task-events.jsonl` 갱신 없음, 6/17~18 work-requests와 불일치 |
| Dynamic Workflow | ◎ | △ | L1~L4 구현 후 실사용 거의 없음 — **옵션 기능으로 유지** |
| Design Review / MVP | ◎ | ○ | 기본 실행 ≠ MVP 8문서 — **실행 모드 가이드로 혼동 방지** |
| SI/EVE 리서치 | △ | △ | AS-IS·레거시 템플릿 부재 — **depth별(R0~R2)로 도입** |
| 멀티 IDE | ○ | △ | Antigravity 전용 규칙 없음 — **SSOT 참조로 동기화 비용 최소화** |
| MCP/도구 계층 | △ | △ | Jarvis 공식 MCP 없음 — **2도구 MVP만 우선** |

---

## 실행 트랙 (비용 통제 핵심)

모든 요청에 4훅·전체 리서치·validate `-Strict`를 강제하지 않는다.

| 트랙 | 조건 | 최소 루프 | 필수 산출물 |
| --- | --- | --- | --- |
| **L0 경량** | Low, 1~2파일, 버그/문구, 기존 스펙 구현 | 실행 → diff/스크린샷 → Done 이벤트 1줄 | README 한 줄 또는 Work Log (선택) |
| **L1 표준** | Medium, 일반 작업, 단일 화면 목업 | `start-jarvis-request` → 실행 → Work Log | `work-requests/.../README.md`, memory/work-logs |
| **L2 풀** | SI 웹, High, 신규 MVP, Design Review | 4훅 + invoke + validate + (IA/리서치) | IA Brief, verification, validate Pass, Episodic |

**Design Review 8문서**는 L2 중에서도 **신규·고위험·아키텍처 확정**일 때만.

### SI 리서치 깊이 (EVE)

| 깊이 | 언제 | 산출물 |
| --- | --- | --- |
| **R0** | 단일 화면 목업, 기존 화면 미세 수정 | `source-analysis` 요약 1페이지 |
| **R1** | 신규 업무 화면 1개 | `source-analysis` + 필드表 |
| **R2** | 다화면·연동·RFP 대조 | EVE SI Research Pack 전체 |

Friday 체인: **TASK-RESEARCH는 R1 이상만 필수**. R0는 Joi/TARS가 축약 `source-analysis`로 대체 가능.

### validate 사용 규칙

| 모드 | 명령 | 용도 |
| --- | --- | --- |
| **보고용 (기본)** | `validate-jarvis-request.ps1 -RequestId <id>` | 미충족 게이트 확인, exit 0 |
| **차단용** | `... -Strict` | High/Critical, 외부 릴리스 전 — exit 1 |

대시보드는 Needs Work를 **차단**이 아니라 **채울 체크리스트**로 표시한다 (P2-02).

---

## 단점·비용 완화 정책

| 우려 | 완화 방법 | 관련 작업 |
| --- | --- | --- |
| 소작업 오버헤드 | L0 경량 트랙, 의미 있는 요청만 `start` | P0-07 |
| 규칙 파일 drift | IDE는 `@AGENTS.md` 참조, 본문 복붙 최소화 | P0-01~03 |
| SI 리서치 과다 | R0/R1/R2 depth, Pack 전체는 R2만 | P1-07~09 |
| MCP 구현 부담 | MVP 2도구만 (`append_task_event`, `validate_request`) | P1-01~02 |
| DWF 리스크 | 사용자 명시 요청 시만, `-AllowCommands` 기본 차단 | P2-01 (선택) |
| 과거 JSONL 백필 비용 | **신규 요청부터만 JSONL 필수**, 과거는 README/Work Log SSOT | P0-05 |
| 완료 체감 둔화 | validate 보고용 기본, `-Strict`는 High만 | P1-04 |

---

## 우선순위 로드맵 (비용 조정版)

```text
필수 (비용 낮음·효과 큼)
  P0: SSOT 참조 + L0/L1/L2 + 신규-only JSONL + catbook 경로
  P1-07/08: SI 템플릿 (depth별)

선택 (필요할 때)
  P1-01/02: MCP 2도구, P1-05 memory index, P1-06 권한 정책

보류 (ROI 낮을 때)
  P2-04 OTLP, P2-05 eval suite, P2-01 DWF 실연동, 과거 JSONL 전량 백필
```

---

## P0 — 즉시 (필수 권장)

| ID | 작업 | Owner | 산출물 | 완료 기준 | 비고 |
| --- | --- | --- | --- | --- | --- |
| P0-01 | **SSOT + IDE 참조 체인** — `AGENTS.md`에 L0/L1/L2·validate 모드 명시; IDE 규칙은 참조 위주 | Jarvis, TARS | `AGENTS.md`, orchestration SKILL | L0/L1/L2 표와 4훅 적용 범위가 SSOT에 있음 | 본문 전면 복제 ❌ |
| P0-02 | **Cursor 규칙** — `@AGENTS.md` + 실행 트랙 요약 + 브라우저 규칙 | TARS | `.cursor/rules/jarvis-agent-team.mdc` | AGENTS.md와 충돌 없음, 핵심 훅 링크 | |
| P0-03 | **Antigravity 규칙** — Always On + `@AGENTS.md` | TARS | `.agents/rules/jarvis-agent-team.md` | Antigravity 기본 Jarvis 훅 | GEMINI.md는 override만 |
| P0-04 | **매뉴얼 IDE 표** — Codex/Antigravity 행 + SSOT 설명 | C3PO | `docs/project-user-manual.html`, `docs/README.md` | IDE 표 완성 | |
| P0-05 | **이벤트 정책** — drift audit + **신규-only** (백필 선택) | Friday, Diagnostic Agent | `evidence/event-drift-audit.md` | 2026-06-19 이후 JSONL 필수 정책 확정 | 전량 백필 기본 ❌ |
| P0-06 | **catbook 경로 검증** | TARS | `validate-jarvis-request.ps1` | `catbook/project-records/work-requests/` 인식 | |
| P0-07 | **실행 모드 가이드** — L0/L1/L2 + Design Review + IA Draft + R0~R2 | Jarvis, C3PO | `docs/execution-mode-guide.md` | 모드 선택 1장으로 가능 | P0-01과 통합 가능 |

---

## P1 — 단기 (선택·점진)

| ID | 작업 | Owner | 산출물 | 완료 기준 | 우선순위 |
| --- | --- | --- | --- | --- | --- |
| P1-01 | **Jarvis MCP 스펙** — **2도구 MVP** 우선 | Jarvis, TARS | `docs/jarvis-mcp-server-spec.md` | append_event, validate_request, allowlist | 높음 |
| P1-02 | **Jarvis MCP 구현** — 2도구만 | TARS | `tools/jarvis-mcp/` 등 | IDE에서 호출 가능 | 중 |
| P1-03 | JSON Schema 확장 | TARS, Data | `task-event-schema.json` | 확장 필드 검증 | 낮음 |
| P1-04 | **validate 정책** — L2/High만 `-Strict` 권장 | Friday | AGENTS.md, SKILL | 보고용 vs 차단용 문문화 | 높음 |
| P1-05 | memory/index | TARS | `memory/index.md` | 태그 검색 | 중 |
| P1-06 | tool-permission-policy | KITT/TRON | `docs/tool-permission-policy.md` | MCP allowlist 연계 | 중 |
| P1-07 | **EVE SI Research Pack** — **R2 전용** 전체, R0/R1은 절 발췌 | EVE, C3PO | `templates/eve-si-research-pack.md` | depth별 사용법 포함 | **높음** |
| P1-08 | **source-analysis 템플릿** — R0/R1 기본 | EVE, TARS | `templates/source-analysis-template.md` | 하나허브 패턴 공식화 | **높음** |
| P1-09 | Friday SI 체인 — TASK-RESEARCH는 R1+ | Friday | friday template §7 | RESEARCH→IA→UX→WEB | 중 |
| P1-10 | skills-registry | Friday | `docs/skills-registry.md` | Codex + repo skills | 낮음 |

---

## P2 — 중기 (보류·명시 요청 시)

| ID | 작업 | Owner | 산출물 | 트리거 |
| --- | --- | --- | --- | --- |
| P2-01 | Dynamic Workflow PoC | TARS, Friday | dynamic-workflow 샘플 | 사용자가 병렬/DWF 명시 |
| P2-02 | 대시보드 validate 패널 (체크리스트 UI) | TARS, Joi | dashboard HTML | L1+ 운영 안정 후 |
| P2-03 | 대시보드 Blocked·요약 | Joi, TARS | dashboard | |
| P2-04 | OTLP export | TARS, Data | 스크립트/문서 | 관측 스택 도입 시 |
| P2-05 | eval suite | Data | tests/ | High-risk 빈도 증가 시 |
| P2-06 | JSONL 아카이브 | Friday | 정책 문서 | 로그 1000줄+ 시 |

---

## P3 — 비권장 (지금은 안 함)

| ID | 작업 | 판단 |
| --- | --- | --- |
| P3-01 | CrewAI / LangGraph 전체 교체 | 보류 |
| P3-02 | A2A 외부 에이전트 | 보류 |
| P3-03 | 원격 멀티유저 대시보드 | 보류 |
| P3-04 | Discord Bot 실연동 | 보류 |
| P3-05 | 과거 work-requests JSONL 전량 백필 | 기본 보류 — Done 1줄만 선택 가능 |

---

## 영역별 상세

### A. 오케스트레이션

- **L0**: 이벤트 1줄로도 Virtual Office 갱신 가능 (경량)
- **L1+**: `start-jarvis-request` 표준
- **L2**: `invoke-jarvis-agent`, `validate`, `close-jarvis-request`
- **DWF**: 옵션 — 일상은 Friday 분해 + invoke로 충분

### B. MVP / Design Review / IA

- L0~L1: Design Review **비적용**
- L2 + Medium+ 웹: `ia-brief.md` (`request-state-machine.md`)
- L2 + 신규 MVP/High: Design Review 8문서

### C. 멀티 IDE

| 도구 | 방식 |
| --- | --- |
| SSOT | `AGENTS.md` + `skills/agent-team-orchestration/SKILL.md` |
| Cursor | `.mdc` → `@AGENTS.md` 참조 |
| Codex | repo 루트 `AGENTS.md` |
| Antigravity | `.agents/rules/` Always On → `@AGENTS.md` |

### D. 2026 트렌드 (채택 범위)

- ✅ MCP 2도구 MVP
- ✅ 경량 allowlist (P1-06)
- ⏸ OTLP, eval — P2 보류
- ❌ 프레임워크 전면 교체

---

## 1차 착수 추천 (비용 조정版)

| 순서 | 묶음 | 예상 비용 | 효과 |
| --- | --- | --- | --- |
| 1 | **P0-01 + P0-07** — SSOT에 L0/L1/L2 + `execution-mode-guide.md` | 낮음 | 오버헤드·혼동 대부분 해소 |
| 2 | **P0-02 + P0-03** — IDE 참조 규칙 (복붙 최소) | 낮음 | 멀티 IDE 일치 |
| 3 | **P0-05** — 신규-only JSONL 정책 | 낮음 | drift 재발 방지 |
| 4 | **P1-07 + P1-08** — SI 템플릿 (depth별) | 중 | SI 웹 품질 |
| 5 | (선택) **P1-01** — MCP 2도구 스펙만 | 중 | 실행 강제 강화 |

**하지 않아도 되는 것 (1차):** JSONL 전량 백필, DWF PoC, OTLP, eval, JSON Schema 전체

---

## 장단점 요약 (고도화 후)

| | 내용 |
| --- | --- |
| **장점** | 추적 가능, SI·멀티 IDE 일관, Done 신뢰도, 하나허브형 리서치 반복 |
| **단점 (완화 전)** | 소작업 느림, 규칙 drift, 과리서치, MCP·P2 유지비 |
| **완화 후** | L0로 속도 유지, SSOT 참조로 drift 감소, R0~R2로 리서치 조절, P2는 보류 |

---

## Agent Assignment Preview

| 항목 | 내용 |
| --- | --- |
| 요청 | 고도화 작업목록 비용·단점 완화 반영 업데이트 |
| To | Jarvis, Friday |
| CC | TARS, C3PO |
| Risk | Low |
| 산출물 | 본 파일 갱신 |
| 다음 액션 | P0-01 + P0-07부터 실행 |

## 참고 링크

- [docs/jarvis-agent-improvement-backlog.md](../../docs/jarvis-agent-improvement-backlog.md)
- [docs/request-state-machine.md](../../docs/request-state-machine.md)
- [docs/dynamic-workflow.md](../../docs/dynamic-workflow.md)
- [skills/agent-team-orchestration/SKILL.md](../../skills/agent-team-orchestration/SKILL.md)
- [skills/jarvis-design-review/SKILL.md](../../skills/jarvis-design-review/SKILL.md)
- [templates/ia-brief-template.md](../../templates/ia-brief-template.md)
- [templates/friday-task-breakdown-template.md](../../templates/friday-task-breakdown-template.md)
