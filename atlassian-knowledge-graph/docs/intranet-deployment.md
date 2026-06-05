# 사내망 배포 가이드

## 현재 접근 URL

```text
http://192.168.82.199:8822
```

## 현재 배포 상태

- 서버 바인딩: `0.0.0.0:8822`
- 사내망 IP: `192.168.82.199`
- 일반 사용자 모드: 조회 전용
- 수동 동기화 API: 비활성화
- 샘플 데이터 로드 API: 비활성화
- 외부 LLM 전송: 비활성화

## 재시작 명령

`atlassian-knowledge-graph/` 폴더에서 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-intranet.ps1
```

## 환경변수

사내망 배포 모드는 `.env`에서 다음 값으로 관리한다.

```dotenv
APP_HOST=0.0.0.0
APP_PORT=8822
APP_PUBLIC_BASE_URL=http://192.168.82.199:8822
ENABLE_MANUAL_SYNC=false
ENABLE_SAMPLE_LOAD=false
```

## 일반 사용자 정책

일반 사용자는 내부 URL에서 대시보드 조회, 검색, 그래프 탐색, 원본 Confluence 링크 이동만 수행한다.

운영성 작업은 화면과 API 양쪽에서 막는다.

- `POST /api/sync`: `403`
- `POST /api/sample`: `403`

실제 Confluence 동기화는 운영자가 서버 로컬에서 실행한다.

```powershell
python -m atlassian_kg.cli sync
```

## Windows 방화벽

사내망 접속을 위해 다음 인바운드 규칙을 추가했다.

```text
Rule Name: Atlassian Knowledge Graph Intranet 8822
Enabled: Yes
Direction: In
Profiles: Domain, Private
RemoteIP: LocalSubnet
Protocol: TCP
LocalPort: 8822
Action: Allow
```

## 검증 결과

- `http://192.168.82.199:8822/api/health`: `200`
- `http://192.168.82.199:8822`: 화면 렌더링 성공
- UI 동기화 버튼: 숨김
- UI 샘플 버튼: 숨김
- `POST /api/sync`: `403`
- `POST /api/sample`: `403`
- 페이지 수: `76`
- 기본 그래프 노드 수: `196`
- 기본 그래프 관계 수: `361`

검증 스크린샷:

```text
work-requests/2026-05-28-atlassian-knowledge-graph-dashboard/evidence/intranet-url-dashboard.png
```
