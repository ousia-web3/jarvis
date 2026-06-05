# 작업 기록: Work Requests

신규 작업 요청 보관소입니다.

## 규칙

- 모든 신규 작업은 실행 전에 `YYYY-MM-DD-request-slug/` 폴더를 만든다.
- 폴더에는 Human Brief 초안, 참고 자료, 산출물, 검증 증거, 로컬 실행 방법을 보관한다.
- 공용 대시보드, 공용 이벤트 로그, 앱 핵심 파일처럼 중앙에서 유지해야 하는 파일은 이동하지 않고 작업 폴더에는 링크와 스냅샷을 둔다.
- 비밀키, 계좌 정보, 개인정보, 실거래 주문 세부값은 보관하지 않는다.
- evidence가 없거나 중앙 로그를 참조하는 과거 요청은 `README.md`에 그 사실을 명시한다.
- 빈 `outputs/`가 생기면 `outputs/README.md`로 의도를 설명하거나 별도 승인 후 정리한다.
- 작업 요청 폴더 건강도는 `../scripts/audit-work-requests.ps1`로 점검한다.

## 기본 구조

```text
work-requests/
  YYYY-MM-DD-request-slug/
    README.md
    index.html
    evidence/
```

## 건강도 점검

```powershell
powershell -ExecutionPolicy Bypass -File scripts/audit-work-requests.ps1 -Markdown
```

점검 결과에서 `missing-readme`, `empty-evidence`, `empty-outputs`, `large-evidence`가 표시되면 해당 작업 폴더의 기록 또는 보존 기준을 보강한다.
