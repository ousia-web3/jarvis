# NC 유성점 품의서 XML 임시저장 오류 해결

## Human Brief

- 요청: NC 유성점 임대료, NC 유성점 관리비 품의서를 설정값과 목업 XML 기준으로 생성한다.
- 성공 기준: 하나샘 임시저장 버튼 클릭이 아니라, 임시함에서 각 품의서 문서번호가 확인되어야 한다.
- 핵심 제약:
  - 세금계산서 XML 업로드 후 거래처정보 설정 팝업/선택 로직이 반드시 진행되어야 한다.
  - XML 반영 전 금액을 임의 선입력하지 않는다.
  - 문서유형/예산유형/집행부서 설정값 순서를 지킨다.
  - 목업 XML은 `testing/data/mock_xml/` 하위 별도 폴더에서 관리한다.

## Agent Assignment Preview

- To: TARS
- CC: Jarvis, Friday, EVE, Risk Shield
- Risk: 반복 `HANA Exception`으로 인해 저장 성공 오판 가능성이 높음. 임시함 문서번호 확인 전까지 성공 처리 금지.
- Expected Outputs: 원인 분석, 수정 내역, 임대료/관리비 임시함 문서번호, 실행 trace/evidence.
- Next Action: 이전 실패 trace와 현재 전송 payload를 비교해 누락/오입력 필드를 분리한다.

## Evidence

- NC 유성점 목업 XML 폴더: `C:\Users\HANA\Desktop\gemini\testing\data\mock_xml\nc-yuseong\20260604`
- 로컬 앱: `http://127.0.0.1:3000/expense-approval`, `http://127.0.0.1:3000/settings`
