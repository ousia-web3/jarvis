# 냥톨로지 생성 리포트

## 요약

- 노드: 956개
- 엣지: 4099개
- 콘텐츠 인덱스: 1304개
- 개념 매칭 콘텐츠: 820개
- 그래프에 표시할 상위 근거 콘텐츠 노드: 820개
- Source 노드 제한: 2000개
- SQLite DB: `data\catbook_ontology.sqlite`
- JSON export: `research\cat_ontology_graph.json`
- RDF Turtle: `data\catbook_ontology.ttl`
- OWL/RDFXML: `data\catbook_ontology.owl`
- SHACL shapes: `data\catbook_shapes.ttl`
- RDF triples: 98586개
- 스키마 버전: `2026-06-05.2`

## SQLite 테이블

| 테이블 | 행 수 |
| --- | ---: |
| classes | 11 |
| content_items | 1304 |
| content_matches | 4664 |
| content_topics | 1411 |
| edges | 4099 |
| metadata | 15 |
| nodes | 956 |
| relations | 13 |
| safety_rules | 4 |
| scenarios | 11 |

## 클래스별 노드 수

| 클래스 | 노드 수 |
| --- | ---: |
| Source | 820 |
| Chapter | 42 |
| Topic | 16 |
| Need | 16 |
| Scenario | 12 |
| CatSignal | 11 |
| CareAction | 10 |
| EnvironmentElement | 9 |
| HealthObservation | 8 |
| BookPart | 7 |
| SafetyRisk | 5 |

## 근거가 많은 개념

| 개념 | 클래스 | 근거 수 |
| --- | --- | ---: |
| 물기 / 깨물기 | CatSignal | 307 |
| 울음소리 / 야옹 | CatSignal | 302 |
| 하악질 | CatSignal | 287 |
| 음수 변화 | HealthObservation | 217 |
| 배변·배뇨 변화 | HealthObservation | 197 |
| 같은 방에 머무는 신뢰 | CatSignal | 186 |
| 숨을 곳 | EnvironmentElement | 179 |
| 식욕 변화 | HealthObservation | 174 |
| 노묘의 느린 변화 | HealthObservation | 170 |
| 전문가에게 묻기 | CareAction | 170 |
| 놀이와 싸움의 경계 | CatSignal | 167 |
| 병원 상담용 세 줄 메모 | CareAction | 164 |
| 숨기 / 숨어 있기 | CatSignal | 149 |
| 문·창문·방묘 | EnvironmentElement | 140 |
| 구토 | HealthObservation | 137 |
| 눈인사 / 느린 눈 | CatSignal | 125 |

## 안전 원칙

- 건강/진료 관계는 진단/처방이 아니라 관찰, 기록, 상담 준비로만 표현한다.
- YouTube 공개 메타만 사용하며 자막 원문과 영상 파일은 저장하지 않는다.
