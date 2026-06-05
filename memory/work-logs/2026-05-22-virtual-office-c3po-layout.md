# Work Log: Virtual Office C3PO 배치 개선

## 수행 작업

- Jarvis 운영 문서와 에이전트 라우팅 기준을 확인했다.
- `virtual-office-c3po-layout` 요청을 시작하고 작업 폴더를 만들었다.
- Virtual Office 배경을 `virtual-office.png`로 교체했다.
- 우상단 포커스 패널을 흰색 팝업에서 어두운 전광판 스타일로 변경했다.
- C3PO `copy` 스테이션 좌표를 `x: 71, y: 20`에서 `x: 57, y: 83`으로 이동했다.
- 긴 요청 제목 때문에 상단 툴바가 제목을 밀어내는 문제를 함께 보정했다.

## 변경 파일

- `dashboards/agent-assignment-dashboard.html`
- `dashboards/agent-assignment-data.json`
- `work-requests/2026-05-22-virtual-office-c3po-layout/README.md`
- `work-requests/2026-05-22-virtual-office-c3po-layout/human-brief.md`
- `work-requests/2026-05-22-virtual-office-c3po-layout/agent-assignment-preview.md`
- `work-requests/2026-05-22-virtual-office-c3po-layout/evidence/verification.md`

## 검증

- `802x394`와 `1365x768`에서 C3PO와 전광판 패널의 bounding box 겹침 면적이 `0`임을 확인했다.
- 브라우저 콘솔 경고와 오류가 없음을 확인했다.
- 증거 스크린샷을 작업 폴더 `evidence/`에 보관했다.

## 남은 리스크

- 에이전트가 동시에 같은 하단 작업대에 몰리는 이벤트가 많으면 라벨 밀집이 생길 수 있다. 현재 요청 범위에서는 C3PO 가림 문제를 우선 해결했다.
