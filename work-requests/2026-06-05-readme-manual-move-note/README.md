# README 매뉴얼 위치 안내 추가

## Human Brief 초안

- 사용자 원문 요청: `[README.md](README.md) 내 [project-user-manual.html](docs/project-user-manual.html) 매뉴얼 이동 내용 추가 후 깃허브 추가 커밋해`
- 목표: 루트 README에 상세 사용자 매뉴얼의 기준 위치가 `docs/project-user-manual.html`임을 명시하고 GitHub에 추가 커밋한다.
- 성공 기준: README에 매뉴얼 이동/관리 위치 안내가 자연스럽게 추가되고, 원격 `main` 브랜치에 커밋이 반영된다.
- 제약: 기존 사용자 변경 파일은 건드리거나 함께 커밋하지 않는다.

## 역할 배정

- To: TARS - README 수정, Git 커밋, push 검증
- CC: Friday - 작업 범위 확인
- CC: KITT/TRON - 외부 업로드 범위와 민감 파일 포함 여부 확인

## 검증 기록

- 대시보드 시작 훅: `readme-manual-move-note`로 실행 완료
- AI툴 브라우저: `iab` 미제공으로 URL 보고 방식 사용
- 변경 대상: `README.md`
- 커밋 및 push: README 변경과 작업 메모만 커밋 대상으로 제한
- 보완 요청: 설명 문구뿐 아니라 [상세 사용자 매뉴얼 열기](../../docs/project-user-manual.html) 형태의 실제 이동 링크를 README에 제공
