# To/CC 메시지 프로토콜

에이전트 간 커뮤니케이션은 이메일 방식의 To/CC 모델을 사용합니다. 목적은 책임 소재를 명확히 하고, 불필요한 컨텍스트 확산과 토큰 낭비를 줄이는 것입니다.

## 1. 기본 원칙

- `To`는 실행 책임자입니다. 풀 컨텍스트를 받고 산출물을 만들어야 합니다.
- `CC`는 검토 또는 감시 책임자입니다. 요약 컨텍스트를 받고 필요한 경우 피드백합니다.
- `Escalate`는 상위 의사결정이 필요하다는 신호입니다.
- 리스크가 있는 작업은 KITT/TRON을 강제 CC에 포함합니다.
- 정량 근거가 있는 작업은 Data를 CC에 포함합니다.
- 전략 변경은 Jarvis를 CC 또는 Escalate 대상으로 지정합니다.

## 2. 메시지 필드

```text
To:
CC:
Escalate:
Subject:
Context:
Task:
Expected Output:
Constraints:
Risk Flags:
Deadline:
```

## 3. 예시

### 예시 1. 리서치 요청

```text
To: EVE
CC: Data, Friday
Subject: 유튜브 쇼핑몰 프로젝트 영상 메타데이터 수집
Context: 타깃 고객 페르소나를 분류하기 위한 초기 리서치가 필요함.
Task: 관련 영상 목록과 메타데이터 수집 범위를 정의하고 샘플 데이터를 확보.
Expected Output: 데이터 소스 목록, 수집 방법, 한계.
Risk Flags: 저작권, 플랫폼 정책.
Deadline: D+1
```

### 예시 2. UX 설계 요청

```text
To: Joi
CC: C3PO, Data, Friday
Subject: 페르소나별 랜딩 페이지 UX 흐름 설계
Context: Data가 5개 고객 페르소나를 도출했음.
Task: 각 페르소나에 맞는 진입, 설득, 장바구니 흐름 설계.
Expected Output: UX 플로우, 핵심 섹션, 전환 리스크.
Risk Flags: 과장 광고 가능성은 C3PO와 KITT/TRON 검토 필요.
Deadline: D+2
```

### 예시 3. 개발 요청

```text
To: TARS
CC: Joi, KITT/TRON, Friday
Subject: 개인화 랜딩 페이지 및 장바구니 기능 구현
Context: UX 플로우와 카피 초안이 승인됨.
Task: 로컬 개발 환경에서 랜딩 페이지와 장바구니 MVP 구현.
Expected Output: 실행 가능한 코드, 테스트 결과, 변경 요약.
Risk Flags: 결제, 개인정보 입력, 외부 API 사용 시 KITT/TRON 승인 필요.
Deadline: D+3
```

### 예시 4. 리스크 강제 소환

```text
To: KITT/TRON
CC: Data, Friday, Jarvis
Escalate: Jarvis
Subject: 외부 공개 가능성에 따른 법무/보안 검토
Context: 프로젝트 산출물이 외부 고객에게 공개될 가능성이 있음.
Task: 저작권, 개인정보, 보안, 고지 문구를 검토.
Expected Output: Pass / Pass with Changes / Blocked 판정.
Risk Flags: High
Deadline: 배포 전
```

### 예시 5. 드리프트 감지

```text
To: 진단 에이전트
CC: Friday, Jarvis, KITT/TRON
Escalate: Jarvis
Subject: 반복 실패 후 완료 보고 정합성 점검
Context: 동일 태스크에서 실패 로그가 3회 이상 발생했으나 완료 보고가 제출됨.
Task: 실행 로그, 산출물, 보고 내용의 불일치 여부 확인.
Expected Output: 드리프트 가능성, 회복 조치, 재검증 필요 여부.
Risk Flags: High
Deadline: 즉시
```
