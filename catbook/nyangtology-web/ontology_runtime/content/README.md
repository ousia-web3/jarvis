# 냥톨로지 MCP content package

이 폴더는 `냥톨로지` 신규 작업 산출물에 포함되는 런타임 콘텐츠 패키지입니다. 내부 ID는 `cat-signal-explorer`이며, 기존 `catbook-mcp`는 호환 alias로만 사용합니다.

MCP 서버를 별도 작업 단위로 올릴 때 필요한 SQLite, RDF cache, SPARQL preset, 구조 스냅샷을 이 폴더 내부에 같이 둔 것입니다. 업로드 패키지는 이 폴더만 런타임 콘텐츠로 사용합니다.

- 공개 타이틀: `냥톨로지`
- 서브타이틀: `고양이 행동 신호를 근거와 함께 풀어주는 관찰 도우미`
- 보조 캐릭터/응답 콘셉트: `고집사`
- 내부 ID: `cat-signal-explorer`

## 포함 범위

| 경로 | 역할 |
| --- | --- |
| `data/catbook_ontology.sqlite` | MCP 조회용 read-only SQLite ontology store |
| `data/catbook_ontology.ttl` | SPARQL preset 실행용 RDF Turtle cache |
| `data/catbook_ontology.owl` | OWL/RDFXML artifact cache |
| `data/catbook_shapes.ttl` | SHACL shapes artifact |
| `data/catbook_rdf_status.json` | RDF/OWL/SHACL 검증 상태 |
| `data/ontology_refresh_status.json` | ontology refresh 상태 |
| `research/cat_ontology_graph.json` | graph JSON artifact |
| `research/cat-ontology-graph-report.md` | graph 생성 리포트 artifact |
| `research/queries/*.rq` | 8개 SPARQL preset 원본 |
| `ontology-snapshot.json` | MCP 배포 기준 구조 스냅샷 |

## 현재 스냅샷

| 항목 | 값 |
| --- | ---: |
| nodes | 956 |
| edges | 4099 |
| RDF triples | 98586 |
| SPARQL presets | 8 |

## 서버 사용 방식

`ontology_store.py`는 이 폴더를 필수 런타임 콘텐츠로 사용합니다.

따라서 MCP 신규 작업 산출물을 별도로 검수할 때는 이 폴더가 포함된 standalone 패키지를 기준으로 확인하면 됩니다.
