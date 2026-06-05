# 하나샘 품의서 임시지정 실패 해결 요청

## Human Brief

- 요청일: 2026-06-02
- 요청 슬러그: `hanasaem-approval-temp-save-fix`
- 대상 폴더: `C:\Users\HANA\Desktop\gemini\testing`
- 사용자 요청: 품의서 설정에 등록된 품의서 기준 생성 작업에서 하나샘 품의서 정보를 입력한 뒤 임시지정 완료까지 진행하지 못하는 오류의 원인을 분석하고 완전히 해결한다.

## 핵심 참고 단서

1. 최종 임시저장 제출 순간 `processEdiInsert`가 `Y`로 다시 살아난다.
   - 성공 건: `processEdiInsert=""`
   - 실패 건: 최종 임시저장 요청에서 `processEdiInsert=Y`
2. 실패 건에서 예산 hidden 값이 비어 있다.
   - `canAmt0`
   - `monthPlanAmt0`
   - `monthAmt0`
   - `quartPlanAmt0`
   - `quartAmt0`
   - `preMonthBal0`
   - `executeLimit0`
3. 첨부 파일명 유실은 1차 원인에서 제외한다.
   - XML만 있을 때 `fileName`이 비던 문제는 보강 후 채워졌으나 HANA Exception이 계속 발생했다.

## 성공 기준

- 자동화가 임시저장 요청에서 `processEdiInsert`를 순수 임시저장 상태로 보낸다.
- 예산 선택 후 하나샘이 내부적으로 계산/세팅하는 hidden 값이 최종 제출까지 보존된다.
- 관련 테스트나 재현 스크립트로 회귀를 확인한다.
- 수정 내용과 검증 증거를 이 작업 폴더에 기록한다.

## Agent Assignment Preview

- To: TARS
- CC: Jarvis, Friday, KITT/TRON, Diagnostic Agent
- Risk: Medium
- Expected Outputs: 원인 분석, 코드 수정, 검증 결과, 남은 리스크
- 다음 액션: trace와 자동화 코드를 대조해 `processEdiInsert` 재설정 지점과 예산 hidden 값 유실 지점을 찾는다.

## 원인 분석 결과

- 최종 임시저장 submit 경로에서 `processEdiInsert`가 다시 `Y`로 살아난 상태가 제출되고 있었다.
- 세금계산서 XML 등록 및 첨부 재시도 이후, 하나샘 화면이 예산 선택/금액 입력으로 계산해 둔 hidden 값이 최종 submit까지 보존되지 않았다.
- 실패 trace의 빈 값 대상은 `canAmt0`, `monthPlanAmt0`, `monthAmt0`, `quartPlanAmt0`, `quartAmt0`, `preMonthBal0`, `executeLimit0`였다.
- 첨부 파일명 보강 후에도 HANA Exception이 지속되었으므로 현재 1차 원인은 첨부가 아니라 임시저장 플래그와 예산 hidden 상태 유실로 판단했다.

## 수정 내용

- `C:\Users\HANA\Desktop\gemini\testing\automation_engine.py`
  - 최종 submit 직전 `cmd=EdsInsert`, `tmpSaveYn=Y`를 재설정하고 `processEdiInsert` 계열 플래그를 비우도록 보강했다.
  - `HTMLFormElement.prototype.submit`, 폼 submit, submit 이벤트 경로에서 동일한 임시저장 준비 로직이 실행되도록 확장했다.
  - 예산 hidden 값 스냅샷을 캡처하고, 최종 submit 직전 값이 비었거나 자동화 sentinel 값이면 실제 화면 계산값으로 복원하도록 추가했다.
  - 세금계산서 XML 필드 업데이트 직후에도 금액/예산 필드 이벤트를 다시 발생시켜 하나샘 내부 계산값을 캡처하도록 `_apply_xml_attachment_update_fields` 래퍼를 추가했다.
  - XML 필드 동기화 직후 예산 hidden 캡처가 비어 있으면 하나샘의 비동기 계산 반영을 기다린 뒤 한 번 더 캡처하도록 보강했다.
  - 제3자 세금계산서의 `conversationId`를 비우지 않고 보존하도록 수정했다.
  - 비즈니스번호 alias 및 일반 첨부/세금계산서 첨부 순서 테스트 경로가 캐시 엔진 래퍼와 같은 함수를 보도록 연결했다.

## 검증 결과

- `python -m py_compile automation_engine.py` 통과
- `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest tests\test_expense_budget_amount_guards.py tests\test_approval_attachment_order.py -q`
  - 12 passed
- `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest tests\test_approval_attachment_order.py tests\test_approval_save_response.py tests\test_browser_and_evidence_guards.py tests\test_xml_tax_invoice.py tests\test_attachment_zip_filename.py tests\test_expense_budget_amount_guards.py -q`
  - 24 passed
- `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest tests -q`
  - 91 passed

## 잔여 리스크

- 로컬 자동화 테스트는 모두 통과했지만, 실제 하나샘 세션에서 최종 임시지정 저장까지의 live E2E는 사용자 인증/실서비스 세션이 필요해 이번 로컬 검증에는 포함하지 않았다.
- 다음 live trace에서는 최종 `EdsInsert` payload에서 `processEdiInsert=""`이고 예산 hidden 값이 비어 있지 않은지 확인하면 된다.
