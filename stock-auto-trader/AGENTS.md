# Stock Auto Trader 작업 지침

이 폴더는 루트 Jarvis 프로젝트 안에서 주식 자동매매 MVP만 독립 관리하는 하위 프로젝트입니다.

## 시작 절차

1. 루트 `../AGENTS.md`와 `../docs/README.md`의 Jarvis 에이전트 팀 규칙을 따른다.
2. 이 폴더 안의 `README.md`와 `docs/auto-trader-mvp.md`를 먼저 확인한다.
3. 자동매매 작업은 이 폴더 안에서만 코드, 테스트, 설정, 데이터, 문서를 수정한다.
4. 실거래, 인증 정보, 계좌 접근, 외부 배포는 Human Conductor 승인 전까지 차단한다.

## 기본 실행 위치

명령은 기본적으로 `stock-auto-trader/`에서 실행한다.

```powershell
python -m unittest discover -s tests -v
python -m jarvis_trader.cli status
```

## 역할 분장

- Jarvis: 전략 기준과 승격 판단
- Friday: 태스크 분해와 진행 관리
- EVE: 공시, 뉴스, 시장 이슈 리서치
- Data: 시세 품질, 백테스트, KPI 검증
- TARS: 코드 구현과 테스트
- KITT/TRON: 법무, 보안, 개인정보, API 약관 리스크 검토
- Diagnostic Agent: 과신, 드리프트, 허위 완료 보고 점검

## 금지 사항

- 수익 보장 표현
- 실계좌 주문 활성화
- 토스증권 비공식 API 호출
- 화면 스크래핑 또는 앱 자동조작
- API 키, 계좌번호, 개인정보 저장
