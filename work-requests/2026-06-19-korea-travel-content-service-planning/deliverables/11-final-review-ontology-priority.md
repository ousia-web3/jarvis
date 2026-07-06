# 최종 검토: Deliverables 온톨로지 우선순위 점검

- 검토일: 2026-06-19
- 검토 범위: `deliverables/00`부터 `deliverables/10`까지 전체 산출물
- 검토 관점: 온톨로지 선행 여부, 문서 간 우선순위 충돌, 운영 가능성, 권리/근거 리스크
- 판정: Pass with Priority Reorder

## 1. 주요 Findings

| ID | 심각도 | 발견 내용 | 조치 |
| --- | --- | --- | --- |
| FR-01 | High | PRD의 출시 Wave에서 Trip Ontology Dashboard가 W3에 있어 후순위 기능처럼 읽힐 수 있었다. | W0/W1 Ontology First 기준으로 PRD와 TASKS를 재정렬했다. |
| FR-02 | Medium | User Flow에는 일반 콘텐츠 등록 흐름은 있었지만 관계 후보 검수, 근거 확인, graph projection 반영 흐름이 없었다. | `04-user-flow.md`에 운영자 Trip Ontology 검수 흐름을 추가했다. |
| FR-03 | Medium | Design System에는 그래프 탐색/관계 검수/권리 영향 UI 컴포넌트 정의가 부족했다. | `06-design-system.md`에 Trip Ontology Dashboard 컴포넌트를 추가했다. |
| FR-04 | Medium | AI 협업 가이드가 추천/권리 관계의 승인 조건과 네이밍 규칙을 명시하지 않았다. | `08-coding-convention-ai-guide.md`에 온톨로지 구현/AI 작성 규칙을 추가했다. |
| FR-05 | Low | 최종 검토 결과와 온톨로지 우선 작업 순서를 한 곳에서 추적할 문서가 없었다. | 본 최종 검토 문서를 추가하고 Evidence Manifest에 반영한다. |

## 2. 온톨로지 우선 작업 순서

| 순서 | 작업 | Owner | 결과물 |
| --- | --- | --- | --- |
| 0 | 클래스/관계 범위 동결 | TARS | `trip-ontology-terms.md` |
| 1 | `Evidence`, 출처, 권리 상태 필수 규칙 확정 | KITT/TRON | `relation-assertion-policy.md` |
| 2 | graph projection 기본 스키마 확정 | TARS | `graph-projection-spec.md` |
| 3 | Relation Review와 Risk & Rights 화면 정의 | Joi | `ontology-dashboard-wireframe.md` |
| 4 | CMS 공개 조건과 검색 facet에 승인 관계만 연결 | TARS, Data | API/DB 설계 업데이트 |
| 5 | 온톨로지 품질 게이트 점검 | Diagnostic Agent | `ontology-first-review.md` |

## 3. 문서별 추가 개선 필요 여부

| 문서 | 상태 | 추가 개선 필요 |
| --- | --- | --- |
| `00-decision-log.md` | 보강 완료 | D-011을 기준으로 실제 구현 전 `trip-ontology-terms.md` 작성 필요 |
| `01-prd.md` | 보강 완료 | W0/W1 범위 확정 후 우선 기능 수용 기준 세분화 |
| `02-trd.md` | 보강 완료 | graph projection 성능 기준은 구현 착수 시 구체화 |
| `03-ia-brief.md` | 유지 | 현재 구조는 온톨로지 대시보드를 포함하므로 추가 수정 우선순위 낮음 |
| `04-user-flow.md` | 보강 완료 | 실제 와이어프레임 단계에서 Relation Review 상세 상태 추가 |
| `05-database-design.md` | 유지 | ERD 수준은 충분하며, 실제 DDL 작성 시 제약조건 보강 |
| `06-design-system.md` | 보강 완료 | 그래프 캔버스 interaction spec은 UI 설계 단계에서 분리 작성 |
| `07-tasks.md` | 보강 완료 | TASK-ONT 선행 트랙을 실행 관리 기준으로 사용 |
| `08-coding-convention-ai-guide.md` | 보강 완료 | 코드 구현 시 테스트 체크리스트와 연결 |
| `09-content-db-management-strategy.md` | 유지 | DB 운영 전략은 온톨로지 projection과 충돌 없음 |
| `10-trip-ontology-dashboard-plan.md` | 유지 | 핵심 기획은 충분하며, W1 와이어프레임과 정책 문서로 확장 필요 |

## 4. 최종 권고

1. 다음 작업은 서비스 화면 목업보다 `trip-ontology-terms.md`, `relation-assertion-policy.md`, `graph-projection-spec.md`를 먼저 작성한다.
2. CMS와 검색은 온톨로지 용어 사전의 canonical key를 참조하도록 설계한다.
3. 공개 추천 이유는 승인된 relation assertion과 Evidence가 있을 때만 노출한다.
4. Trip Ontology Dashboard는 운영자용 W1 핵심 도구로 보고, Query Lab과 고급 그래프 분석만 W3 고도화로 둔다.
5. 이미지/영상 권리 리스크는 온톨로지 관계에도 전파되므로 `RiskImpactPanel`을 Relation Review와 함께 설계한다.
