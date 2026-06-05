# 작업 로그: 프로젝트 파일 관리 개선과 매뉴얼 업데이트

## 개요

- 요청 ID: `project-file-management-improvements`
- 날짜: 2026-05-22
- 목적: 파일 관리 감사에서 발견한 Medium/Low 개선 항목을 비파괴적으로 반영하고 사용자 매뉴얼을 갱신한다.

## 수행 내용

- 루트 `.gitignore`를 추가했다.
- `docs/file-management-policy.md`와 `docs/opendataloader-extract/README.md`를 추가했다.
- 핵심 폴더별 README를 보강했다.
- 작업 요청 건강도 점검 스크립트 `scripts/audit-work-requests.ps1`를 추가했다.
- 과거 작업 요청의 빈 README/evidence/outputs 안내를 보강했다.
- Joi 단일 표기 원칙을 활성 문서와 텍스트 기록에 반영했다.
- `docs/project-user-manual.html`에 파일 관리 정책, `.gitignore`, 작업 요청 건강도 점검, PDF 추출 보존 자료 안내를 추가했다.

## 적용한 에이전트 역할

- Jarvis: 개선 범위와 비파괴 처리 원칙 결정
- Friday: 개선 태스크와 검증 기준 정리
- TARS: 파일 생성, 스크립트 추가, 검증 실행
- C3PO: 한글 정책 문서와 매뉴얼 문장 정리
- KITT/TRON: 삭제, 이동, 비밀키, 개인정보 리스크 확인
- Diagnostic Agent: 검색 노이즈와 작업 요청 건강도 점검

## 검증 계획

- `scripts/audit-work-requests.ps1` 실행
- 새 정책/스크립트 링크 검색
- Joi 활성 표기 검색
- 매뉴얼 브라우저 확인
- `scripts/validate-jarvis-request.ps1` 실행

## 검증 결과

- 작업 요청 건강도: `reviewRequests: 0`
- 활성 문서 Joi 병기 표기 검색: evidence 제외 기준 결과 없음
- 비밀키 후보 파일: 없음
- 매뉴얼 브라우저 로드: 완료
- Jarvis 요청 검증 훅: `Pass`
