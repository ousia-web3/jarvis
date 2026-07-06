# Risk Shield Review

- Request ID: `korea-travel-content-service-planning`
- Reviewer: KITT/TRON
- Date: 2026-06-19
- Risk Level: Medium
- Assignment: CC

## 검토 범위

- 도메인: 여행정보 콘텐츠 서비스 기획, 영상 기반 리서치, 이미지 플레이스홀더, 다국어 확장, 콘텐츠 DB 운영 관리, 지식 그래프/온톨로지 대시보드
- 관련 파일: `deliverables/*.md`, `research/*.md`
- 관련 명령: `yt-dlp --flat-playlist`, `validate-jarvis-request.ps1`
- 검토하지 않은 범위: 실제 배포, 실제 이미지 라이선스 계약, 개인정보 처리방침 전문

## 판정

- Status: Pass with Conditions
- Summary: 현재 산출물은 내부 기획 문서이며, 무단 이미지 저장/재배포와 개인정보 수집을 포함하지 않는다. 실제 서비스 구현 전 저작권, 지도 API 약관, 개인정보 설계가 필요하다.

## 차단 리스크

| 항목 | 판정 | 근거 | 조치 |
| --- | --- | --- | --- |
| 개인정보/비밀키 | 조건부 통과 | 현재 회원/예약/결제 미구현 | 저장/회원 기능 도입 전 개인정보 설계 |
| 외부 배포 | 조건부 통과 | 공개 배포 없음 | 배포 전 release risk gate |
| 결제/계좌/실거래 | 통과 | 결제 기능 제외 | 예약/결제 도입 시 별도 승인 |
| 법무/저작권 | 조건부 통과 | 유튜브 영상은 링크/메타데이터만 사용 | 썸네일/방송 이미지 저장 금지, 라이선스 기록 |
| 보장/과장 표현 | 조건부 통과 | 국적별 선호는 가설 | 추천 이유와 대체 코스 표시 |
| DB 운영/감사 | 조건부 통과 | 권리 상태, 검수 로그, 중복 병합 이력 설계 필요 | `ReviewTask`, `ReviewLog`, `DuplicateCandidate`, canonical key 운영 |
| 온톨로지/추천 근거 | 조건부 통과 | 그래프 관계가 추천 근거처럼 노출될 수 있음 | `Evidence`와 운영자 승인 없는 관계는 공개 추천 근거로 사용 금지 |
| 온톨로지 선행 구현 | 조건부 통과 | 온톨로지가 후순위로 밀리면 검색/추천/CMS가 서로 다른 분류 기준을 만들 수 있음 | W0/W1에서 용어 사전, relation assertion 정책, graph projection 기본 스키마를 먼저 확정 |
| Supabase 스키마/RLS | 조건부 통과 | schema expose와 CRUD grant만 있고 RLS가 느슨하면 데이터가 과노출될 수 있음 | `public` 사용 지양, 프로젝트 전용 schema, Exposed schemas 등록, RLS 정책 분리 |

## 조건부 허용 사항

- 유튜브 영상은 공개 URL과 메타데이터를 분석 근거로만 사용한다.
- 실제 이미지는 직접 촬영, 공공 라이선스, 스톡, 제휴 제공 등 권리 확인 후 교체한다.
- 국적별/권역별 추천은 사용자 행동 데이터와 편집 검수를 통해 보정한다.
- 콘텐츠 DB는 공개 콘텐츠 원장, 원천 staging, 검색 읽기 모델, 분석 로그를 분리해 관리한다.
- Trip Ontology Dashboard의 relation assertion은 운영자 승인 전 공개 서비스에 반영하지 않는다.
- Ontology First 선행 트랙 완료 전에는 공개 추천 이유, 검색 facet, CMS 공개 조건을 확정하지 않는다.
- Supabase client에는 publishable key 또는 anon key만 사용하고, service role key는 서버 전용으로 분리한다.
- 관리자 쓰기 권한은 RLS 정책과 서버 경로를 확정한 뒤 제한적으로 연다.

## 다음 액션

- 이미지 권리 정책 문서 작성
- 개인정보 기능 도입 여부 결정
- 지도 API 약관과 해외 접근성 비교
- 2025 외래관광객조사 최종 보고서 PDF 상세 수치 추출
- `trip-ontology-terms.md`, `relation-assertion-policy.md`, `graph-projection-spec.md` 작성
- Supabase 실제 관리자 생성 시 `korea_travel_content` 스키마명 확정, Data API Exposed schemas 등록, RLS 정책 작성
