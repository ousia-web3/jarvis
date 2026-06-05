# Project User Manual Version History

이 파일은 `docs/project-user-manual.html`의 스냅샷과 변경 의도를 PULM 형식으로 관리한다.

## PULM 정의

| 표기 | 의미 | 설명 |
| --- | --- | --- |
| P | Previous | 변경 직전 보관본 |
| U | Upgrade | 이번에 바꾼 내용 |
| L | Latest | 현재 최신본 또는 최종 스냅샷 |
| M | Manual | 사용자가 실제로 따라 읽을 매뉴얼 위치 |

## 2026-05-29 매뉴얼 폭 및 핵심 흐름 클릭 보정

| PULM | 내용 |
| --- | --- |
| P, Previous | `work-requests/2026-05-29-project-user-manual-flow-width-fix/deliverables/manual-versions/project-user-manual.previous-20260529-flow-width.html` |
| U, Upgrade | 매뉴얼 최대 폭을 넓히고, 상단 핵심 흐름 메뉴가 데스크톱 폭에서 가로 스크롤 없이 표시되도록 조정. 핵심 흐름 클릭 시 활성 위치와 sticky header 보정 스크롤이 즉시 반영되도록 JS 클릭 핸들러 추가 |
| L, Latest | `docs/project-user-manual.html`, final snapshot `work-requests/2026-05-29-project-user-manual-flow-width-fix/deliverables/manual-versions/project-user-manual.final-20260529-flow-width.html` |
| M, Manual | 상단 `핵심 흐름` 메뉴, 본문 `한눈 흐름도`, 전체 레이아웃 폭 |

## 2026-05-29 핵심 흐름/사이드바 기준선 정렬

| PULM | 내용 |
| --- | --- |
| P, Previous | `work-requests/2026-05-29-project-user-manual-flow-sidebar-align/deliverables/manual-versions/project-user-manual.previous-20260529-flow-sidebar-align.html` |
| U, Upgrade | 상단 `핵심 흐름` 바의 컨테이너 폭 기준을 본문 레이아웃과 같은 `--max`로 통일해 `핵심 흐름` 라벨 왼쪽선과 `목차` 사이드바 왼쪽선을 정렬 |
| L, Latest | `docs/project-user-manual.html`, final snapshot `work-requests/2026-05-29-project-user-manual-flow-sidebar-align/deliverables/manual-versions/project-user-manual.final-20260529-flow-sidebar-align.html` |
| M, Manual | 상단 `핵심 흐름` 메뉴와 좌측 `목차` 사이드바 |

## 2026-05-29 핵심 흐름 클릭 후 사이드바/본문 간격 안정화

| PULM | 내용 |
| --- | --- |
| P, Previous | `work-requests/2026-05-29-project-user-manual-sidebar-gap-stability/deliverables/manual-versions/project-user-manual.previous-20260529-sidebar-gap-stability.html` |
| U, Upgrade | sticky header 높이와 본문 간격을 CSS 변수로 묶어 사이드바 sticky top과 앵커 스크롤 오프셋을 동일하게 적용. 핵심 흐름 활성 링크의 `scrollIntoView()` 호출을 제거해 클릭 후 레이아웃 흔들림을 방지 |
| L, Latest | `docs/project-user-manual.html`, final snapshot `work-requests/2026-05-29-project-user-manual-sidebar-gap-stability/deliverables/manual-versions/project-user-manual.final-20260529-sidebar-gap-stability.html` |
| M, Manual | 상단 `핵심 흐름` 메뉴 클릭 후 좌측 `목차` 사이드바와 본문 섹션 상단 간격 |

## 2026-05-29 Dynamic Workflow L1-L4 최초 업데이트

| PULM | 내용 |
| --- | --- |
| P, Previous | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.previous-20260529.html` |
| U, Upgrade | Dynamic Workflow L1-L4, Task Graph, Worker Manifest, Parallel Executor, Verifier/Fixer/Aggregator, PULM 표기 추가 |
| L, Latest | `docs/project-user-manual.html`, final snapshot `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.final-20260529.html` |
| M, Manual | 매뉴얼 본문 `5-1. Dynamic Workflow 레벨업`과 `매뉴얼 버전 관리와 PULM` 섹션 |

## 2026-05-29 Dynamic Workflow 표현 명확화 업데이트

| PULM | 내용 |
| --- | --- |
| P, Previous | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.previous-20260529-dwf-clarified.html` |
| U, Upgrade | 4단계 아키텍처와 Dynamic Workflow L4의 차이 명확화, 운영 본체/관찰 하네스/실행 하네스 구분 추가, 5개 worker 병렬 실행 검증 결과 추가 |
| L, Latest | `docs/project-user-manual.html`, final snapshot `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.final-20260529-dwf-clarified.html` |
| M, Manual | 매뉴얼 본문 `오케스트레이션 적용 확인`, `5-1. Dynamic Workflow 실행 레벨 L1-L4`, `매뉴얼 버전 관리 Ledger와 PULM` 섹션 |

## 버전 Ledger

| 버전 | 상태 | 파일 | 설명 |
| --- | --- | --- | --- |
| manual-20260529-before-dwf | Previous | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.previous-20260529.html` | Dynamic Workflow 섹션 추가 전 매뉴얼 |
| manual-20260529-dwf-final | Final Snapshot | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.final-20260529.html` | Dynamic Workflow L1-L4와 PULM을 처음 추가한 최종 스냅샷 |
| manual-20260529-dwf-clarified-previous | Previous | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.previous-20260529-dwf-clarified.html` | 4단계/L4/하네스 표현 보정 직전 스냅샷 |
| manual-20260529-dwf-clarified-final | Latest Snapshot | `work-requests/2026-05-29-dynamic-workflow-level4-upgrade/deliverables/manual-versions/project-user-manual.final-20260529-dwf-clarified.html` | 운영 본체, 관찰 하네스, 실행 하네스와 5-worker Pass/Done 검증 결과를 반영한 최신 스냅샷 |
| manual-20260529-flow-width-previous | Previous | `work-requests/2026-05-29-project-user-manual-flow-width-fix/deliverables/manual-versions/project-user-manual.previous-20260529-flow-width.html` | 핵심 흐름 메뉴 폭/클릭 보정 직전 기준 스냅샷 |
| manual-20260529-flow-width-final | Latest Snapshot | `work-requests/2026-05-29-project-user-manual-flow-width-fix/deliverables/manual-versions/project-user-manual.final-20260529-flow-width.html` | 매뉴얼 폭 확장과 핵심 흐름 클릭 위치 반영 보정 완료본 |
| manual-20260529-flow-sidebar-align-previous | Previous | `work-requests/2026-05-29-project-user-manual-flow-sidebar-align/deliverables/manual-versions/project-user-manual.previous-20260529-flow-sidebar-align.html` | 핵심 흐름/목차 기준선 정렬 직전 스냅샷 |
| manual-20260529-flow-sidebar-align-final | Latest Snapshot | `work-requests/2026-05-29-project-user-manual-flow-sidebar-align/deliverables/manual-versions/project-user-manual.final-20260529-flow-sidebar-align.html` | 핵심 흐름 바와 목차 사이드바 기준선 정렬 완료본 |
| manual-20260529-sidebar-gap-stability-previous | Previous | `work-requests/2026-05-29-project-user-manual-sidebar-gap-stability/deliverables/manual-versions/project-user-manual.previous-20260529-sidebar-gap-stability.html` | 핵심 흐름 클릭 후 사이드바/본문 상단 간격 안정화 직전 스냅샷 |
| manual-20260529-sidebar-gap-stability-final | Latest Snapshot | `work-requests/2026-05-29-project-user-manual-sidebar-gap-stability/deliverables/manual-versions/project-user-manual.final-20260529-sidebar-gap-stability.html` | sticky top과 앵커 offset을 통일해 클릭 후 간격 유지가 검증된 완료본 |

## 운영 규칙

- 매뉴얼을 크게 수정하기 전에는 작업 요청 폴더의 `deliverables/manual-versions/`에 previous snapshot을 보관한다.
- 최종 검증 후에는 같은 폴더에 final snapshot을 보관한다.
- `docs/project-user-manual.html`은 항상 최신본으로 유지한다.
- 변경 설명은 PULM 형식으로 사람이 쉽게 비교할 수 있게 쓴다.
