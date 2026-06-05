# Data 에이전트 Analysis Pipeline

## 목적

리서치 데이터를 의사결정 가능한 인사이트와 실험 구조로 변환합니다.

## 입력

- EVE 리서치 로그
- 영상 메타데이터
- 사용자 행동 이벤트
- UX 실험 결과
- 봇 시뮬레이션 로그

도구 기반 수집과 행동 추적을 다룰 때는 `data-research-tooling-guidelines.md`를 우선 확인한다.

## 처리 단계

1. 데이터 정합성 확인
2. 중복 제거와 소스 태깅
3. 페르소나 분류
4. 행동 패턴 태깅
5. KPI 후보 도출
6. 편향과 한계 기록
7. KITT/TRON 리스크 게이트 필요 여부 확인
8. Friday와 Joi, C3PO에게 인사이트 전달

## 출력

- 페르소나 세그먼트
- 행동 패턴 맵
- 전환 가설
- KPI 정의
- 리스크 신호
- 다음 실험 제안

## 관련 지침

- `data-research-tooling-guidelines.md`: Clarity/GTM, 봇 이벤트 스키마, yt-dlp 메타데이터 수집, KITT/TRON 검토 기준
