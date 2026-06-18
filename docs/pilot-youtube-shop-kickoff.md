# 파일럿: YouTube Shop 킥오프

## 목표

유튜브 콘텐츠 기반 시청자 페르소나를 분석하고, 재고 부담 없음, 고마진, 높은 관련성 원칙에 맞는 상품 큐레이션과 개인화 랜딩 페이지를 설계합니다.

## 역할 배정

| 단계 | Owner(To) | CC |
| --- | --- | --- |
| 목표 확정 | Jarvis | Friday |
| 태스크 분해 | Friday | Jarvis, KITT/TRON |
| 영상 메타데이터 수집 | EVE | Data, KITT/TRON |
| 페르소나 분석 | Data | Friday, Joi |
| IA(정보설계) | Joi | TARS, Jarvis |
| UX 설계 | Joi | C3PO, TARS |
| 카피 작성 | C3PO | Joi, KITT/TRON |
| 구현 | TARS | Joi, KITT/TRON |
| 리스크 검토 | KITT/TRON | Jarvis, Friday |
| 최종 승인 | Human Conductor | Jarvis |

## 4시간 실행 흐름

1. 0:00-0:20 Human Brief와 Jarvis 전략 브리프
2. 0:20-0:40 Friday 태스크 분해
3. 0:40-1:40 EVE 리서치와 Data 1차 분석
4. 1:40-2:00 Joi IA Brief(사이트맵, 내비, 라벨)
5. 2:00-2:30 Joi UX 흐름과 C3PO 카피
6. 2:30-3:30 TARS MVP 구현
7. 3:30-4:00 Data/KITT/TRON 검토와 인간 대표 승인 준비

## 완료 기준

- 페르소나 5종 정의
- IA Brief(사이트맵, 내비 모델) 초안
- 상품 큐레이션 원칙 명시
- 랜딩 흐름 초안
- 카피 초안
- 리스크 검토 결과
- 다음 실행 태스크

## 데이터·리서치 도구 기준

- 영상 메타데이터 수집은 EVE가 담당하되 `data-research-tooling-guidelines.md`의 yt-dlp 운영 기준을 따른다.
- 행동 이벤트와 봇 시뮬레이션 태깅은 Data가 담당하되 실제 사용자 데이터와 합성 데이터를 분리한다.
- Microsoft Clarity, Google Tag Manager, 외부 플랫폼 대량 수집은 KITT/TRON 검토 전에는 설계 문서와 로컬 샘플 확인까지만 진행한다.
- `1,686편`, `초당 100편` 같은 수치는 원본 가이드의 예시/벤치마크 후보로만 사용하고, 운영 목표나 보장 수치로 쓰지 않는다.
