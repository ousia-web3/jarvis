from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
LOCAL_ONTOLOGY_RUNTIME = PROJECT_ROOT / "ontology_runtime"
LEGACY_MCP_ROOT = PROJECT_ROOT.parent / "mcp"
MCP_ROOT = (
    LOCAL_ONTOLOGY_RUNTIME
    if (LOCAL_ONTOLOGY_RUNTIME / "ontology_store.py").is_file()
    else LEGACY_MCP_ROOT
)
sys.path.insert(0, str(MCP_ROOT))

from ontology_store import OntologyStore  # noqa: E402
from safety import safety_notes_for_nodes  # noqa: E402


SCENARIO_EXCLUDE_IDS = {"ontology:catbook"}
DISPLAY_CLASSES = {
    "Scenario",
    "CatSignal",
    "HealthObservation",
    "CareAction",
    "Need",
    "EnvironmentElement",
    "SafetyRisk",
    "Chapter",
}
RELATED_CLASSES = {
    "CatSignal",
    "HealthObservation",
    "CareAction",
    "Need",
    "EnvironmentElement",
    "SafetyRisk",
}
CONCEPT_PREFIXES = [
    "signal",
    "health",
    "action",
    "need",
    "environment",
    "risk",
    "chapter",
    "topic",
    "part",
]
CLASS_PREFIXES = {
    "CatSignal": "signal",
    "HealthObservation": "health",
    "CareAction": "action",
    "Need": "need",
    "EnvironmentElement": "environment",
    "SafetyRisk": "risk",
    "Chapter": "chapter",
    "Topic": "topic",
    "BookPart": "part",
}
EMOJI_RE = re.compile(r"[\U00010000-\U0010ffff\u200d\ufe0f]", re.UNICODE)
SEARCH_TOKEN_RE = re.compile(r"[0-9A-Za-z가-힣·]+", re.UNICODE)

SEARCH_CLASS_SCORE = {
    "Scenario": 45,
    "HealthObservation": 36,
    "CatSignal": 34,
    "CareAction": 24,
    "Need": 20,
    "EnvironmentElement": 18,
    "SafetyRisk": 16,
    "Chapter": 8,
}

ASK_FALLBACK_OBSERVE = [
    "언제부터 시작됐는지와 하루 중 반복되는 시간대를 적어보세요.",
    "식욕, 활력, 숨는 장소, 구토 여부가 평소와 다른지 함께 확인하세요.",
    "화장실 횟수, 배변·배뇨 모양, 모래나 위치 변화가 있었는지 살펴보세요.",
]

ASK_FALLBACK_CARE_ACTIONS = [
    "억지로 만지거나 혼내기보다 거리를 두고 변화를 관찰하세요.",
    "물, 화장실, 숨을 곳, 조용한 동선처럼 기본 환경을 먼저 정돈하세요.",
    "변화가 빠르게 커지거나 통증이 의심되면 병원 상담 메모를 준비하세요.",
]

ASK_GENERAL_SAFETY_NOTE = (
    "이 안내는 진단이 아니라 관찰 보조입니다. 식욕 저하, 무기력, 반복 구토, "
    "배변·배뇨 변화처럼 건강 신호가 함께 보이면 병원 상담을 준비하세요."
)

SEARCH_SUFFIXES = (
    "했습니다",
    "했어요",
    "합니다",
    "해요",
    "어요",
    "아요",
    "에서",
    "마다",
    "으로",
    "부터",
    "까지",
    "은",
    "는",
    "이",
    "가",
    "을",
    "를",
    "요",
)

SEARCH_STOP_WORDS = {
    "고양이",
    "냥이",
    "우리",
    "애",
    "아기",
    "아이",
    "자꾸",
    "계속",
    "너무",
    "좀",
    "왜",
}


def clean_text(value: Any) -> str:
    text = "" if value is None else str(value)
    return re.sub(r"\s+", " ", EMOJI_RE.sub("", text)).strip()


def add_unique(items: list[str], values: list[str] | tuple[str, ...]) -> None:
    for value in values:
        normalized = clean_text(value).lower()
        if normalized and normalized not in items:
            items.append(normalized)


def base_search_terms(query: str) -> list[str]:
    terms: list[str] = []
    for token in SEARCH_TOKEN_RE.findall(query.lower()):
        if token in SEARCH_STOP_WORDS:
            continue
        add_unique(terms, [token])
        for suffix in SEARCH_SUFFIXES:
            if token.endswith(suffix) and len(token) > len(suffix) + 1:
                add_unique(terms, [token[: -len(suffix)]])
    return terms


def expanded_search_terms(query: str) -> list[str]:
    raw = query.lower()
    terms = base_search_terms(raw)

    if any(value in raw for value in ("화장실", "모래", "배변", "배뇨", "오줌", "소변", "똥")):
        add_unique(terms, ("화장실", "배변", "배뇨", "오줌", "소변", "모래", "망설임"))
    if any(value in raw for value in ("울", "야옹", "소리", "운다", "울어요", "울어")):
        add_unique(terms, ("울음", "야옹", "소리", "시간대", "통증"))
    if any(value in raw for value in ("숨어", "숨", "숨기")):
        add_unique(terms, ("숨", "숨기", "숨어", "숨을 곳", "안전감"))
    if "하악" in raw:
        add_unique(terms, ("하악", "하악질", "손 멈추기", "거리"))
    if any(value in raw for value in ("밤", "야간", "새벽")):
        add_unique(terms, ("밤", "시간대", "루틴", "에너지", "불안"))

    return terms[:18]


def intent_boost_ids(query: str) -> list[str]:
    raw = query.lower()
    ids: list[str] = []

    def add(values: tuple[str, ...]) -> None:
        for value in values:
            if value not in ids:
                ids.append(value)

    has_litter = any(value in raw for value in ("화장실", "모래", "배변", "배뇨", "오줌", "소변", "똥"))
    has_voice = any(value in raw for value in ("울", "야옹", "소리", "운다", "울어요", "울어"))
    has_night = any(value in raw for value in ("밤", "야간", "새벽"))

    if has_litter:
        add(("scenario:litter", "health:litter_change", "environment:litter_box"))
    if has_voice:
        add(("signal:vocalization",))
    if has_litter and has_voice:
        add(("action:vet_notes",))
    if has_night and has_voice:
        add(("need:predictable_routine", "action:daily_check"))
    if any(value in raw for value in ("숨어", "숨", "숨기")):
        add(("scenario:hiding", "signal:hiding", "environment:hideout", "need:safety"))
    if "하악" in raw:
        add(("signal:hissing", "scenario:hissing", "action:pause_contact"))

    return ids


def searchable_node_text(node: dict[str, Any]) -> str:
    parts: list[str] = [
        clean_text(node.get("id")),
        clean_text(node.get("label")),
        clean_text(node.get("summary")),
        clean_text(node.get("beginner")),
    ]
    for key in ("checks", "observe", "keywords"):
        parts.extend(clean_text(value) for value in node.get(key, []) if clean_text(value))
    return " ".join(parts).lower()


def search_score(node: dict[str, Any], query: str, terms: list[str], boost_ids: list[str]) -> int:
    node_id = clean_text(node.get("id"))
    class_name = clean_text(node.get("class"))
    label = clean_text(node.get("label")).lower()
    keywords = " ".join(clean_text(value) for value in node.get("keywords", [])).lower()
    checks = " ".join(clean_text(value) for value in node.get("checks", [])).lower()
    text = searchable_node_text(node)

    score = SEARCH_CLASS_SCORE.get(class_name, 0)
    if node_id in boost_ids:
        score += max(30, 500 - (boost_ids.index(node_id) * 110))
    if query and query.lower() in text:
        score += 80
    for term in terms:
        if len(term) < 2:
            continue
        if term in label:
            score += 32
        elif term in keywords:
            score += 24
        elif term in checks:
            score += 22
        elif term in text:
            score += 12

    evidence_count = node.get("evidence_count")
    if isinstance(evidence_count, int):
        score += min(evidence_count, 12)
    return score


def search_candidate_nodes(store: OntologyStore, query: str) -> list[dict[str, Any]]:
    candidates: dict[str, dict[str, Any]] = {}

    def add_node(node: dict[str, Any] | None) -> None:
        if not node:
            return
        node_id = node.get("id")
        if (
            node_id
            and node_id not in SCENARIO_EXCLUDE_IDS
            and node.get("class") in DISPLAY_CLASSES
            and node_id not in candidates
        ):
            candidates[str(node_id)] = node

    exact = store.search_nodes(query=query, include_sources=False, limit=24)
    for node in exact.get("nodes", []):
        add_node(node)

    terms = expanded_search_terms(query)
    boost_ids = intent_boost_ids(query)

    for node_id in boost_ids:
        add_node(store.get_node(node_id))
    for term in terms:
        if len(term) < 2:
            continue
        result = store.search_nodes(query=term, include_sources=False, limit=16)
        for node in result.get("nodes", []):
            add_node(node)

    ranked = sorted(
        candidates.values(),
        key=lambda node: (
            -search_score(node, query, terms, boost_ids),
            clean_text(node.get("class")),
            clean_text(node.get("label")),
        ),
    )
    return ranked[:24]


def suffix_slug(node_id: str) -> str:
    suffix = node_id.split(":", 1)[-1]
    return suffix.replace("_", "-")


def concept_slug(node_id: str) -> str:
    if ":" not in node_id:
        return node_id.replace("_", "-")
    prefix, suffix = node_id.split(":", 1)
    return f"{prefix}-{suffix.replace('_', '-')}"


def scenario_id_from_slug(slug: str) -> str:
    return f"scenario:{slug.replace('-', '_')}"


def concept_id_from_slug(slug: str) -> str:
    if ":" in slug:
        return slug
    for prefix in CONCEPT_PREFIXES:
        marker = f"{prefix}-"
        if slug.startswith(marker):
            return f"{prefix}:{slug[len(marker):].replace('-', '_')}"
    return slug.replace("-", "_")


def href_for_node(node: dict[str, Any]) -> str:
    class_name = node.get("class")
    node_id = str(node.get("id", ""))
    if class_name == "Scenario":
        return f"/scenarios/{suffix_slug(node_id)}"
    return f"/concepts/{concept_slug(node_id)}"


def normalize_evidence(item: dict[str, Any]) -> dict[str, Any]:
    url = item.get("url") or item.get("watch_url") or ""
    return {
        "id": clean_text(item.get("id") or item.get("content_id") or url),
        "title": clean_text(item.get("title") or item.get("default_title") or "근거 영상"),
        "url": clean_text(url),
        "mediaFamily": clean_text(item.get("media_family") or "video"),
        "durationMin": item.get("duration_min"),
        "viewCount": item.get("view_count"),
        "topics": [clean_text(topic) for topic in item.get("topics", []) if clean_text(topic)],
    }


def normalize_node(node: dict[str, Any]) -> dict[str, Any]:
    node_id = clean_text(node.get("id"))
    class_name = clean_text(node.get("class"))
    slug = suffix_slug(node_id) if class_name == "Scenario" else concept_slug(node_id)
    return {
        "id": node_id,
        "slug": slug,
        "href": href_for_node(node),
        "label": clean_text(node.get("label") or node_id),
        "className": class_name,
        "summary": clean_text(node.get("summary")),
        "checks": [clean_text(value) for value in node.get("checks", []) if clean_text(value)],
        "beginner": clean_text(node.get("beginner")),
        "observe": [clean_text(value) for value in node.get("observe", []) if clean_text(value)],
        "keywords": [clean_text(value) for value in node.get("keywords", []) if clean_text(value)],
        "medical": bool(node.get("medical")) or class_name in {"HealthObservation", "SafetyRisk"},
        "evidenceCount": node.get("evidence_count"),
        "topEvidence": [normalize_evidence(item) for item in node.get("top_evidence", [])[:8]],
    }


def normalize_edge(edge: dict[str, Any]) -> dict[str, Any]:
    relation_id = clean_text(edge.get("relation") or edge.get("relation_id"))
    return {
        "id": clean_text(edge.get("id") or f"{edge.get('source')}->{edge.get('target')}"),
        "sourceId": clean_text(edge.get("source") or edge.get("source_id")),
        "targetId": clean_text(edge.get("target") or edge.get("target_id")),
        "relationId": relation_id,
        "label": relation_id.replace("_", " ").title() if relation_id else "Related",
    }


def meta(store: OntologyStore, safety: list[str] | None = None) -> dict[str, Any]:
    stats = store.stats()
    return {
        "ontologyVersion": stats.get("schema_version"),
        "snapshotDate": "2026-07-06",
        "safety": safety or [],
    }


def scenario_nodes(store: OntologyStore) -> list[dict[str, Any]]:
    result = store.search_nodes(query="", class_id="Scenario", limit=100)
    nodes = [
        normalize_node(node)
        for node in result.get("nodes", [])
        if node.get("id") not in SCENARIO_EXCLUDE_IDS
    ]
    return nodes


def compact_related(nodes: list[dict[str, Any]], root_id: str) -> list[dict[str, Any]]:
    related = []
    for node in nodes:
        node_id = node.get("id")
        class_name = node.get("class")
        if node_id == root_id or class_name not in RELATED_CLASSES:
            continue
        related.append(normalize_node(node))
    return related


def command_stats(store: OntologyStore, _args: dict[str, Any]) -> dict[str, Any]:
    stats = store.stats()
    top_nodes = []
    for item in stats.get("top_evidence_concepts", [])[:8]:
        node = store.get_node(item["node_id"])
        if node:
            top_nodes.append(normalize_node(node))
    data = {
        "title": clean_text(stats.get("title")),
        "description": clean_text(stats.get("description")),
        "nodes": int(stats.get("tables", {}).get("nodes", 0)),
        "edges": int(stats.get("tables", {}).get("edges", 0)),
        "scenarios": int(stats.get("tables", {}).get("scenarios", 0)),
        "sources": int(stats.get("tables", {}).get("content_items", 0)),
        "classCounts": stats.get("class_counts", {}),
        "topEvidenceConcepts": top_nodes,
    }
    return {"data": data, "meta": meta(store)}


def command_scenarios(store: OntologyStore, _args: dict[str, Any]) -> dict[str, Any]:
    scenarios = scenario_nodes(store)
    return {
        "data": {"count": len(scenarios), "scenarios": scenarios},
        "meta": meta(store),
    }


def command_scenario(store: OntologyStore, args: dict[str, Any]) -> dict[str, Any]:
    node_id = scenario_id_from_slug(clean_text(args.get("slug")))
    result = store.neighborhood(node_id=node_id, depth=1, edge_limit=80, evidence_limit=4)
    data = {
        "root": normalize_node(result["root"]),
        "related": compact_related(result.get("nodes", []), node_id),
        "edges": [normalize_edge(edge) for edge in result.get("edges", [])],
        "evidence": [normalize_evidence(item) for item in result.get("evidence", [])],
    }
    return {"data": data, "meta": meta(store, result.get("safety", []))}


def command_search(store: OntologyStore, args: dict[str, Any]) -> dict[str, Any]:
    query = clean_text(args.get("query"))
    raw_nodes = search_candidate_nodes(store, query)
    nodes = [normalize_node(node) for node in raw_nodes]
    return {
        "data": {"query": query, "count": len(nodes), "results": nodes},
        "meta": meta(store, safety_notes_for_nodes(raw_nodes)),
    }


def dedupe_display_strings(values: list[str]) -> list[str]:
    seen: set[str] = set()
    results: list[str] = []
    for value in values:
        cleaned = clean_text(value)
        key = cleaned.lower()
        if cleaned and key not in seen:
            seen.add(key)
            results.append(cleaned)
    return results


def first_node_by_class(
    raw_nodes: list[dict[str, Any]], class_name: str
) -> dict[str, Any] | None:
    for node in raw_nodes:
        if node.get("class") == class_name:
            return node
    return None


def ask_summary(question: str, raw_nodes: list[dict[str, Any]]) -> str:
    if not raw_nodes:
        return (
            "아직 바로 연결된 신호를 찾지 못했습니다. 행동, 장소, 시간대를 "
            "조금 더 짧게 나눠 적으면 관련 관찰 항목을 찾기 쉽습니다."
        )

    lead_node = first_node_by_class(raw_nodes, "Scenario") or raw_nodes[0]
    label = clean_text(lead_node.get("label") or "관련 행동")
    detail = clean_text(lead_node.get("summary") or lead_node.get("beginner"))
    if detail:
        return f'"{question}"은(는) {label}와 연결해 살펴볼 수 있습니다. {detail}'
    return (
        f'"{question}"은(는) {label}와 연결해 살펴볼 수 있습니다. '
        "단정하기보다 함께 나타나는 변화를 차분히 확인해보세요."
    )


def ask_observe(raw_nodes: list[dict[str, Any]]) -> list[str]:
    values: list[str] = []
    for node in raw_nodes[:8]:
        for key in ("observe", "checks"):
            values.extend(clean_text(value) for value in node.get(key, []))
    values.extend(ASK_FALLBACK_OBSERVE)
    return dedupe_display_strings(values)[:6]


def ask_care_actions(raw_nodes: list[dict[str, Any]]) -> list[str]:
    values: list[str] = []
    for node in raw_nodes:
        if node.get("class") != "CareAction":
            continue
        label = clean_text(node.get("label"))
        detail = clean_text(node.get("summary") or node.get("beginner"))
        if label and detail:
            values.append(f"{label}: {detail}")
        elif label:
            values.append(label)
    values.extend(ASK_FALLBACK_CARE_ACTIONS)
    return dedupe_display_strings(values)[:5]


def ask_record_guide(question: str) -> list[str]:
    subject = question or "궁금한 행동"
    return [
        f"언제부터: {subject} 행동이 처음 보인 날짜와 시간대를 적어보세요.",
        "무엇이 함께: 식욕, 활력, 구토, 숨는 장소, 배변·배뇨 변화를 같이 적어보세요.",
        "얼마나 자주: 하루 횟수, 지속 시간, 직전 상황을 짧게 남겨보세요.",
    ]


def command_ask(store: OntologyStore, args: dict[str, Any]) -> dict[str, Any]:
    question = clean_text(args.get("question"))
    raw_nodes = search_candidate_nodes(store, question) if question else []
    scenario = first_node_by_class(raw_nodes, "Scenario")
    nodes = [normalize_node(node) for node in raw_nodes[:8]]
    data = {
        "question": question,
        "scenario": normalize_node(scenario) if scenario else None,
        "matchedNodes": nodes,
        "answer": {
            "summary": ask_summary(question, raw_nodes),
            "observe": ask_observe(raw_nodes),
            "careActions": ask_care_actions(raw_nodes),
            "recordGuide": ask_record_guide(question),
            "safetyNote": ASK_GENERAL_SAFETY_NOTE,
        },
    }
    return {"data": data, "meta": meta(store, safety_notes_for_nodes(raw_nodes))}


def command_concept(store: OntologyStore, args: dict[str, Any]) -> dict[str, Any]:
    node_id = concept_id_from_slug(clean_text(args.get("slug")))
    result = store.neighborhood(node_id=node_id, depth=1, edge_limit=80, evidence_limit=8)
    data = {
        "root": normalize_node(result["root"]),
        "related": compact_related(result.get("nodes", []), node_id),
        "edges": [normalize_edge(edge) for edge in result.get("edges", [])],
        "evidence": [normalize_evidence(item) for item in result.get("evidence", [])],
    }
    return {"data": data, "meta": meta(store, result.get("safety", []))}


def command_evidence(store: OntologyStore, args: dict[str, Any]) -> dict[str, Any]:
    node_id = concept_id_from_slug(clean_text(args.get("slug")))
    result = store.evidence_for_concept(node_id, limit=20)
    node = result.get("concept")
    data = {
        "concept": normalize_node(node) if node else None,
        "items": [normalize_evidence(item) for item in result.get("items", [])],
    }
    return {"data": data, "meta": meta(store, result.get("safety", []))}


COMMANDS = {
    "stats": command_stats,
    "scenarios": command_scenarios,
    "scenario": command_scenario,
    "search": command_search,
    "ask": command_ask,
    "concept": command_concept,
    "evidence": command_evidence,
}


def main() -> int:
    try:
        command = sys.argv[1]
        args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
        if command not in COMMANDS:
            raise ValueError(f"Unknown command: {command}")
        store = OntologyStore()
        print(json.dumps(COMMANDS[command](store, args), ensure_ascii=False, separators=(",", ":")))
        return 0
    except Exception as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False, separators=(",", ":")))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
