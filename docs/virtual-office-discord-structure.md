# Virtual Office Discord 구조

## 목적

에이전트 팀이 실시간으로 협업하고, 인간 대표가 업무 흐름을 감사할 수 있도록 채널 기반 가상 사무실을 구성합니다.

## 권장 채널

| 채널 | 목적 | 작성자 | 보존 |
| --- | --- | --- | --- |
| `#command-bridge` | 인간 대표, Jarvis, Friday의 최상위 지휘 | 인간 대표, Jarvis, Friday | 장기 |
| `#prj-{project-name}` | 프로젝트별 통합 진행 | Friday, 전체 에이전트 | 프로젝트 종료 후 요약 |
| `#agent-jarvis` | 전략 판단과 지휘 로그 | Jarvis | 장기 |
| `#agent-friday` | 태스크 분해와 PM 로그 | Friday | 장기 |
| `#agent-eve` | 리서치 로그 | EVE | 요약 후 소거 |
| `#agent-joi` | UX/UI 설계 로그 | Joi | 프로젝트 단위 |
| `#agent-tars` | 개발 로그와 테스트 결과 | TARS | Git 링크와 함께 보존 |
| `#agent-c3po` | 카피와 메시지 후보 | C3PO | 승인본 장기 보존 |
| `#agent-data` | 분석, KPI, 시뮬레이션 로그 | Data | 요약 장기 보존 |
| `#agent-kitt` | 법무·보안 리스크 판단 | KITT/TRON | 장기 |
| `#risk-shield` | 고위험 이슈, 차단, 승격 | KITT/TRON, 진단 에이전트 | 장기 |
| `#memory-log` | 에피소딕 메모리, 지혜 후보 | Data, Jarvis | 장기 |
| `#general-logs` | 자동화, 시스템 이벤트 | 전체 | 기간 보존 |

## 운영 규칙

- 모든 신규 태스크는 `#prj-{project-name}`에서 시작한다.
- 상세 사고 과정과 산출물은 에이전트별 채널에 남긴다.
- High 이상 리스크는 `#risk-shield`로 복사한다.
- 완료된 태스크는 `#memory-log`에 회고를 남긴다.
- 인간 대표에게 필요한 정보는 `#command-bridge`에 요약한다.
