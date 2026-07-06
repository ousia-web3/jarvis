# PC/MO Responsive Prototype

- Request ID: `2026-06-19-korea-travel-content-service-planning`
- Scope: 공개 웹 홈, 탐색 목록, 상세 화면
- Type: 정적 HTML/CSS/JS 목업
- Entry: `index.html`

## 실행 방법

브라우저에서 `index.html`을 직접 열어 확인한다.

```powershell
cd C:\Users\HANA\Desktop\gemini\jarvis
start work-requests\2026-06-19-korea-travel-content-service-planning\web\responsive-prototype\index.html
```

## 검증 기준

- 360, 390, 430, 768, 1024, 1280px에서 가로 스크롤 없음
- 모바일 필터 바텀시트 열기/닫기 가능
- 공개 웹 홈, 탐색, 상세 화면 전환 가능
- 공통 이미지 영역은 실제 이미지 없이도 비율과 상태 텍스트 유지
- 주요 버튼은 모바일에서 44px 이상 터치 영역 유지
- 콘텐츠 후보가 0건인 검색어라도 `queryObservations`에 관측값이 있으면 관측 입구와 원본 영상 링크 표시
