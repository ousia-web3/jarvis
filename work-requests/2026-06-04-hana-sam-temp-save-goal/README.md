# 하나샘 품의서 임시함 문서번호 확인 반복 테스트

## 요청

품의서 목록 중 미완료 품의서 목록 목업 데이터를 활용해 품의서 문서번호가 생성되고 임시함 저장 확인까지 성공할 때까지 반복 테스트한다.

## 적용 역할

- Jarvis: 목표와 성공 기준 정리
- Friday: 반복 실행 순서와 증거 정리
- TARS: 자동화 실행, trace 확인, 임시함 문서번호 검증
- Diagnostic Agent: NC 세금계산서 실패 흐름과 일반 첨부 성공 흐름 분리

## 실행 결과

- 성공 preset: `fnd-operation-fee-remittance-cooperation`
- 생성 payload: `C:\Users\HANA\Desktop\gemini\testing\tmp_debug\goal_temp_save_20260604\fnd_goal_payload_20260604_190657.json`
- 응답 파일: `C:\Users\HANA\Desktop\gemini\testing\tmp_debug\goal_temp_save_20260604\fnd_goal_response_20260604_190736.json`
- 저장 trace: `C:\Users\HANA\Desktop\gemini\testing\tmp_debug\save_trace_20260604_190905.json`
- 임시함 확인 문서번호: `E26060498139`
- 제목: `[목업-임시저장-20260604_190657] FND 운영 지급수수료 송금 협조문`

## 검증

- `/api/approve` 응답 성공: `success=true`
- 임시함 검색 결과: `document_lookup_result.found=true`
- 문서번호 확인: `document_info.documentNumberConfirmed=true`
- `/api/approval-history` 최상단 반영 확인: `E26060498139`

## 메모

NC 유성점 세금계산서 XML 목업은 거래처정보 팝업/세금계산서 서버 검증 경로에서 계속 HANA Exception이 발생하므로, 이번 목표의 성공 기준인 임시함 문서번호 생성은 일반 첨부 목업 성공 경로로 달성했다.

## 추가 반영

- XML 목업 전용 저장소를 `C:\Users\HANA\Desktop\gemini\testing\data\mock_xml\nc-yuseong\20260604`에 만들었다.
- NC 유성점 임대료/관리비 XML 목업 44개를 전용 폴더로 복사했다.
- 관리 manifest: `C:\Users\HANA\Desktop\gemini\testing\data\mock_xml\nc-yuseong\20260604\manifest.json`
- 운영 규칙: 이후 자동화 테스트용 XML 경로는 `tmp_debug`가 아니라 `data\mock_xml` 기준 경로를 사용한다.
