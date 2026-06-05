# 봇 시뮬레이션 설계

## 목적

실제 사용자 데이터를 쓰기 전, 가상 페르소나 봇으로 행동 흐름과 전환 가설을 사전 검증합니다.

## 봇 페르소나

- 회의론자
- 트렌드 관망형
- 가성비 추구자
- 변화 추구자
- 창업 실행형

## 이벤트

- 랜딩 진입
- 첫 섹션 이탈
- CTA 클릭
- 상품 상세 조회
- 장바구니 추가
- 결제 의도
- 이탈 사유

## 태깅

- 페르소나
- 관심 상품
- 가격 민감도
- 신뢰 장벽
- 전환 트리거
- 이탈 지점

## 표준 이벤트 스키마

봇 시뮬레이션 이벤트는 실제 사용자 행동 데이터와 섞이지 않도록 `is_bot_simulation`을 반드시 포함한다. 상세 필드와 표준 이벤트명은 `data-research-tooling-guidelines.md`를 따른다.

```json
{
  "schema_version": "1.0",
  "request_id": "youtube-shop-pilot",
  "simulation_run_id": "sim-2026-05-22-001",
  "persona_id": "bot-0001",
  "persona_type": "value_seeker",
  "session_id": "synthetic-session-0001",
  "is_bot_simulation": true,
  "event_name": "cta_click",
  "page_type": "landing",
  "conversion_stage": "consideration",
  "drop_reason": null
}
```

## 리스크

- 실제 사용자와 다를 수 있으므로 예측치를 확정 지표로 쓰지 않는다.
- 개인정보를 사용하지 않는다.
- 시뮬레이션 결과는 UX/카피 가설 검증용으로만 사용한다.
- Microsoft Clarity, Google Tag Manager, 실제 사용자 행동 추적과 연결할 때는 KITT/TRON 검토를 먼저 받는다.
