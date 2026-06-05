# DaySlot Local

SETLOG형 풀스펙 앱의 로컬 우선 구현 시작점입니다.

## 현재 구현 범위

- Expo SDK 56 TypeScript 앱 스캐폴딩
- 2~4초 비디오 녹화 UI
- `CameraView` 기반 영상 녹화
- `expo-media-library` 기반 사용자 폰 갤러리 `DaySlot` 앨범 저장
- `expo-sqlite` 기반 로컬 콘텐츠 인덱스
- 캡션, 기분, 상품 태그, 방/슬롯 메타데이터 저장
- 친구방 전달을 위한 E2E relay manifest 초안 생성
- 광고·쇼핑 매출 훅과 원본 영상 미보관 경계 표시

## 실행

```powershell
npm run start
```

모바일 기기에서 Expo Go 또는 개발 빌드로 실행합니다. 카메라와 갤러리 저장은 실제 기기에서 검증해야 합니다.

## 원칙

- 원본 클립은 회사 클라우드에 영구 저장하지 않습니다.
- 촬영 결과는 사용자 폰 갤러리를 기준 저장소로 둡니다.
- 앱 로컬 DB는 갤러리 asset id와 정보 레이어를 색인합니다.
- 원격 친구 공유는 짧은 TTL의 암호화 relay로만 처리합니다.
