from __future__ import annotations

import json
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from collections.abc import Iterator
from typing import Any

from .models import ConceptRecord, EdgeRecord, IdeaRecord, PageRecord
from .ontology import SEMANTIC_KINDS


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class KnowledgeStore:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    @contextmanager
    def connection(self) -> Iterator[sqlite3.Connection]:
        conn = self.connect()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def initialize(self) -> None:
        with self.connection() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS pages (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    url TEXT NOT NULL,
                    type TEXT NOT NULL,
                    parent_id TEXT,
                    depth INTEGER NOT NULL,
                    space_id TEXT,
                    version_number INTEGER,
                    fetched_at TEXT NOT NULL,
                    body_text TEXT NOT NULL,
                    body_storage TEXT NOT NULL,
                    body_format TEXT NOT NULL,
                    headings_json TEXT NOT NULL,
                    links_json TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS edges (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    source_id TEXT NOT NULL,
                    target_id TEXT NOT NULL,
                    edge_type TEXT NOT NULL,
                    label TEXT NOT NULL,
                    weight REAL NOT NULL,
                    evidence TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS concepts (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    kind TEXT NOT NULL,
                    score REAL NOT NULL,
                    source_page_id TEXT NOT NULL,
                    evidence TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS ideas (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    source_page_id TEXT NOT NULL,
                    score REAL NOT NULL,
                    risk_level TEXT NOT NULL,
                    evidence TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sync_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    started_at TEXT NOT NULL,
                    ended_at TEXT,
                    status TEXT NOT NULL,
                    root_ids TEXT NOT NULL,
                    message TEXT NOT NULL,
                    page_count INTEGER NOT NULL DEFAULT 0,
                    edge_count INTEGER NOT NULL DEFAULT 0
                );

                CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_id);
                CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
                CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
                """
            )

    def start_run(self, root_ids: tuple[str, ...], status: str = "running") -> int:
        self.initialize()
        with self.connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO sync_runs (started_at, status, root_ids, message)
                VALUES (?, ?, ?, ?)
                """,
                (utc_now(), status, ",".join(root_ids), ""),
            )
            return int(cursor.lastrowid)

    def finish_run(self, run_id: int, status: str, message: str, page_count: int, edge_count: int) -> None:
        with self.connection() as conn:
            conn.execute(
                """
                UPDATE sync_runs
                SET ended_at = ?, status = ?, message = ?, page_count = ?, edge_count = ?
                WHERE id = ?
                """,
                (utc_now(), status, message, page_count, edge_count, run_id),
            )

    def upsert_pages(self, pages: list[PageRecord]) -> None:
        self.initialize()
        with self.connection() as conn:
            conn.executemany(
                """
                INSERT INTO pages (
                    id, title, url, type, parent_id, depth, space_id, version_number,
                    fetched_at, body_text, body_storage, body_format, headings_json, links_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    title = excluded.title,
                    url = excluded.url,
                    type = excluded.type,
                    parent_id = excluded.parent_id,
                    depth = excluded.depth,
                    space_id = excluded.space_id,
                    version_number = excluded.version_number,
                    fetched_at = excluded.fetched_at,
                    body_text = excluded.body_text,
                    body_storage = excluded.body_storage,
                    body_format = excluded.body_format,
                    headings_json = excluded.headings_json,
                    links_json = excluded.links_json
                """,
                [
                    (
                        page.id,
                        page.title,
                        page.url,
                        page.type,
                        page.parent_id,
                        page.depth,
                        page.space_id,
                        page.version_number,
                        page.fetched_at,
                        page.body_text,
                        page.body_storage,
                        page.body_format,
                        json.dumps(page.headings, ensure_ascii=False),
                        json.dumps(page.links, ensure_ascii=False),
                    )
                    for page in pages
                ],
            )

    def replace_pages(self, pages: list[PageRecord]) -> None:
        self.initialize()
        with self.connection() as conn:
            conn.execute("DELETE FROM pages")
        self.upsert_pages(pages)

    def replace_derived(
        self,
        edges: list[EdgeRecord],
        concepts: list[ConceptRecord],
        ideas: list[IdeaRecord],
    ) -> None:
        with self.connection() as conn:
            conn.execute("DELETE FROM edges")
            conn.execute("DELETE FROM concepts")
            conn.execute("DELETE FROM ideas")
            conn.executemany(
                """
                INSERT INTO edges (source_id, target_id, edge_type, label, weight, evidence, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        edge.source_id,
                        edge.target_id,
                        edge.edge_type,
                        edge.label,
                        edge.weight,
                        edge.evidence,
                        edge.status,
                        utc_now(),
                    )
                    for edge in edges
                ],
            )
            conn.executemany(
                """
                INSERT OR REPLACE INTO concepts (id, name, kind, score, source_page_id, evidence)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (concept.id, concept.name, concept.kind, concept.score, concept.source_page_id, concept.evidence)
                    for concept in concepts
                ],
            )
            conn.executemany(
                """
                INSERT OR REPLACE INTO ideas (id, title, summary, source_page_id, score, risk_level, evidence)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (idea.id, idea.title, idea.summary, idea.source_page_id, idea.score, idea.risk_level, idea.evidence)
                    for idea in ideas
                ],
            )

    def pages(self) -> list[dict[str, Any]]:
        self.initialize()
        with self.connection() as conn:
            rows = conn.execute("SELECT * FROM pages ORDER BY depth, title").fetchall()
        return [self._page_dict(row) for row in rows]

    def page_records(self) -> list[PageRecord]:
        return [
            PageRecord(
                id=row["id"],
                title=row["title"],
                url=row["url"],
                type=row["type"],
                parent_id=row["parent_id"],
                depth=int(row["depth"]),
                space_id=row["space_id"],
                version_number=row["version_number"],
                fetched_at=row["fetched_at"],
                body_text=row["body_text"],
                body_storage=row["body_storage"],
                body_format=row["body_format"],
                headings=tuple(json.loads(row["headings_json"] or "[]")),
                links=tuple(tuple(item) for item in json.loads(row["links_json"] or "[]")),
            )
            for row in self._page_rows()
        ]

    def _page_rows(self) -> list[sqlite3.Row]:
        self.initialize()
        with self.connection() as conn:
            return conn.execute("SELECT * FROM pages ORDER BY depth, title").fetchall()

    def concepts(self) -> list[dict[str, Any]]:
        self.initialize()
        with self.connection() as conn:
            rows = conn.execute("SELECT * FROM concepts ORDER BY score DESC, name").fetchall()
        return [dict(row) for row in rows]

    def ideas(self) -> list[dict[str, Any]]:
        self.initialize()
        with self.connection() as conn:
            rows = conn.execute("SELECT * FROM ideas ORDER BY score DESC, title").fetchall()
        return [dict(row) for row in rows]

    def edges(self) -> list[dict[str, Any]]:
        self.initialize()
        with self.connection() as conn:
            rows = conn.execute("SELECT * FROM edges ORDER BY edge_type, source_id, target_id").fetchall()
        return [dict(row) for row in rows]

    def latest_runs(self, limit: int = 5) -> list[dict[str, Any]]:
        self.initialize()
        with self.connection() as conn:
            rows = conn.execute(
                "SELECT * FROM sync_runs ORDER BY id DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [dict(row) for row in rows]

    def search(self, query: str = "", limit: int = 6) -> dict[str, Any]:
        pages = self.pages()
        concepts = self.concepts()
        ideas = self.ideas()
        clean_query = compact_text(query, 120)
        tokens = search_tokens(clean_query)
        matched_pages = rank_pages(pages, tokens)[:limit] if tokens else []
        top_score = float(matched_pages[0]["_score"]) if matched_pages else 0.0
        matched_source_ids = {page["id"] for page in matched_pages}
        matched_concepts = rank_concepts(concepts, tokens, matched_source_ids)[:8] if tokens else []
        matched_ideas = rank_ideas(ideas, tokens, matched_source_ids)[:4] if tokens else ideas[:4]
        sources = [
            {
                "id": page["id"],
                "title": page["title"],
                "url": page["url"],
                "type": display_type(page["type"]),
                "depth": page["depth"],
                "headings": page["headings"][:5],
                "summary": page_snippet(page, tokens),
                "score": round(float(page["_score"]), 2),
                **confidence_for_page(page, tokens, top_score),
            }
            for page in matched_pages
        ]
        related_terms = [
            {
                "id": concept["id"],
                "name": concept["name"],
                "kind": concept["kind"],
                "sourcePageId": concept["source_page_id"],
                "summary": compact_text(concept.get("evidence") or "", 160),
            }
            for concept in matched_concepts
        ]
        related_ideas = [
            {
                "id": idea["id"],
                "title": idea["title"],
                "summary": compact_text(idea.get("summary") or "", 220),
                "sourcePageId": idea["source_page_id"],
                "score": idea["score"],
                "riskLevel": idea["risk_level"],
            }
            for idea in matched_ideas
        ]
        manuals = manual_cards(clean_query, tokens)
        return {
            "query": clean_query,
            "answer": search_answer(clean_query, sources, related_terms, manuals),
            "sources": sources,
            "relatedTerms": related_terms,
            "ideas": related_ideas,
            "manuals": manuals,
            "suggestedQueries": SUGGESTED_QUERIES,
            "coverage": {
                "pageCount": len(pages),
                "sourceCount": len(sources),
                "termCount": len(related_terms),
                "ideaCount": len(related_ideas),
            },
        }

    def coverage(self, root_page_ids: tuple[str, ...] = ()) -> dict[str, Any]:
        pages = self.pages()
        edges = self.edges()
        concepts = self.concepts()
        ideas = self.ideas()
        graph = self.graph(mode="semantic")
        latest = self.latest_runs(1)
        page_ids = {page["id"] for page in pages}
        known_ids = page_ids | {concept["id"] for concept in concepts} | {idea["id"] for idea in ideas}
        type_counts: dict[str, int] = {}
        depth_counts: dict[str, int] = {}
        children_by_parent: dict[str | None, list[dict[str, Any]]] = {}
        for page in pages:
            type_counts[page["type"]] = type_counts.get(page["type"], 0) + 1
            depth_key = str(page["depth"])
            depth_counts[depth_key] = depth_counts.get(depth_key, 0) + 1
            children_by_parent.setdefault(page.get("parent_id"), []).append(page)
        root_ids = root_page_ids or tuple(page["id"] for page in pages if not page.get("parent_id"))
        root_pages = []
        for root_id in root_ids:
            page = next((item for item in pages if item["id"] == root_id), None)
            root_pages.append(
                {
                    "id": root_id,
                    "found": bool(page),
                    "title": page["title"] if page else "",
                    "url": page["url"] if page else "",
                    "descendantCount": count_descendants(root_id, children_by_parent) if page else 0,
                }
            )
        missing_endpoints = [
            edge
            for edge in edges
            if edge["source_id"] not in known_ids or edge["target_id"] not in known_ids
        ]
        orphan_pages = [
            page
            for page in pages
            if page.get("parent_id") and page["parent_id"] not in page_ids
        ]
        body_pages = [
            page
            for page in pages
            if page["type"] == "page" and bool((page.get("body_text") or "").strip())
        ]
        page_type_count = type_counts.get("page", 0)
        body_ratio = (len(body_pages) / page_type_count) if page_type_count else 0
        latest_run = latest[0] if latest else None
        quality_checks = [
            coverage_check(
                "루트 페이지",
                len([item for item in root_pages if item["found"]]),
                len(root_pages),
                "지정 루트가 로컬 DB에 존재하는지 확인합니다.",
            ),
            coverage_check(
                "본문 수집",
                len(body_pages),
                page_type_count,
                "page 타입 콘텐츠의 본문 텍스트 수집 비율입니다.",
                warn_ratio=0.85,
            ),
            coverage_check(
                "관계 무결성",
                0 if missing_endpoints else 1,
                1,
                "관계의 source/target 누락 여부를 확인합니다.",
            ),
            coverage_check(
                "최신 동기화",
                1 if latest_run and latest_run.get("status") == "success" else 0,
                1,
                "마지막 동기화 실행 상태입니다.",
            ),
        ]
        return {
            "summary": {
                "pageCount": len(pages),
                "rootCount": len(root_pages),
                "foundRootCount": len([item for item in root_pages if item["found"]]),
                "maxDepth": max((int(page.get("depth") or 0) for page in pages), default=0),
                "bodyPageCount": len(body_pages),
                "bodyCoverageRatio": round(body_ratio, 3),
                "containerCount": len([page for page in pages if page["type"] != "page"]),
                "semanticNodeCount": len(graph["nodes"]),
                "semanticEdgeCount": len(graph["edges"]),
                "rawEdgeCount": len(edges),
                "conceptCount": len(concepts),
                "ideaCount": len(ideas),
                "missingEndpointCount": len(missing_endpoints),
                "orphanPageCount": len(orphan_pages),
                "latestRun": latest_run,
            },
            "rootPages": root_pages,
            "typeCounts": type_counts,
            "depthCounts": depth_counts,
            "qualityChecks": quality_checks,
            "issues": {
                "missingEndpoints": missing_endpoints[:10],
                "orphanPages": [
                    {
                        "id": page["id"],
                        "title": page["title"],
                        "parentId": page.get("parent_id"),
                    }
                    for page in orphan_pages[:10]
                ],
            },
        }

    def graph(self, mode: str = "semantic", topic: str = "") -> dict[str, Any]:
        pages = self.pages()
        concepts = self.concepts()
        edges = self.edges()
        mode = normalize_graph_mode(mode)
        nodes = [
            {
                "id": page["id"],
                "label": page["title"],
                "type": display_type(page["type"]),
                "rawType": page["type"],
                "depth": page["depth"],
                "url": page["url"],
                "summary": page["body_text"][:220],
                "parentId": page["parent_id"],
                "headings": page["headings"],
            }
            for page in pages
        ]
        concept_nodes = [
            {
                "id": concept["id"],
                "label": concept["name"],
                "type": "Concept",
                "kind": concept["kind"],
                "depth": 0,
                "url": "",
                "summary": concept["evidence"],
            }
            for concept in concepts
            if include_concept(concept, mode)
        ]
        nodes.extend(concept_nodes)
        node_ids = {node["id"] for node in nodes}
        filtered_edges = [
            edge
            for edge in edges
            if edge["source_id"] in node_ids
            and edge["target_id"] in node_ids
            and include_edge(edge, mode)
        ]
        if topic.strip():
            nodes, filtered_edges = filter_topic(nodes, filtered_edges, topic)
        return {"mode": mode, "nodes": nodes, "edges": filtered_edges}

    def hub(self) -> dict[str, Any]:
        pages = self.pages()
        ideas = self.ideas()
        graph = self.graph(mode="semantic")
        latest = self.latest_runs(1)
        type_counts: dict[str, int] = {}
        for page in pages:
            type_counts[page["type"]] = type_counts.get(page["type"], 0) + 1
        risk_nodes = [
            node
            for node in graph["nodes"]
            if node.get("type") == "Concept" and node.get("kind") == "Risk"
        ]
        metric_nodes = [
            node
            for node in graph["nodes"]
            if node.get("type") == "Concept" and node.get("kind") == "Metric"
        ]
        degree: dict[str, int] = {}
        for edge in graph["edges"]:
            degree[edge["source_id"]] = degree.get(edge["source_id"], 0) + 1
            degree[edge["target_id"]] = degree.get(edge["target_id"], 0) + 1
        top_concepts = sorted(
            [
                node
                for node in graph["nodes"]
                if node.get("type") == "Concept"
                and node.get("kind") not in {"Risk", "Metric", "WorkIdea"}
            ],
            key=lambda node: (-(degree.get(node["id"], 0)), node.get("label") or ""),
        )[:8]
        starter_pages = [
            page
            for page in pages
            if any(token in (page["title"] + " " + page["body_text"]).lower() for token in ["교육", "가이드", "온보딩", "매뉴얼", "faq", "ai"])
        ][:6]
        return {
            "summary": {
                "pageCount": len(pages),
                "ideaCount": len(ideas),
                "semanticNodeCount": len(graph["nodes"]),
                "semanticEdgeCount": len(graph["edges"]),
                "typeCounts": type_counts,
                "latestRun": latest[0] if latest else None,
            },
            "starterPages": starter_pages,
            "topIdeas": ideas[:8],
            "topConcepts": top_concepts,
            "riskNodes": risk_nodes[:8],
            "metricNodes": metric_nodes[:8],
            "categoryTree": build_category_tree(pages),
        }

    @staticmethod
    def _page_dict(row: sqlite3.Row) -> dict[str, Any]:
        result = dict(row)
        result["headings"] = json.loads(result.pop("headings_json") or "[]")
        result["links"] = json.loads(result.pop("links_json") or "[]")
        return result


SUGGESTED_QUERIES = [
    "지식그래프가 뭐야?",
    "Neptune은 어디에 쓰였어?",
    "Fallback 리스크를 알려줘",
    "호텔 지식그래프 내용을 알려줘",
    "신규 담당자 학습 매뉴얼을 보여줘",
]


SYNONYMS = {
    "지식그래프": ("knowledge", "graph", "kg", "온톨로지", "ontology", "rdf", "owl"),
    "온톨로지": ("ontology", "rdf", "owl", "지식그래프"),
    "neptune": ("넵튠", "graphdb", "그래프db", "sparql"),
    "넵튠": ("neptune", "graphdb", "sparql"),
    "검색": ("retrieval", "opensearch", "search", "rag"),
    "품질": ("quality", "metric", "kpi", "검증"),
    "지표": ("metric", "kpi", "품질"),
    "리스크": ("risk", "보안", "권한", "개인정보", "fallback"),
    "위험": ("risk", "리스크", "보안", "fallback"),
    "학습": ("교육", "매뉴얼", "온보딩", "가이드"),
    "매뉴얼": ("교육", "학습", "온보딩", "가이드"),
    "호텔": ("hotel", "숙소", "검색데이터"),
    "poc": ("프로토타입", "검증", "실험"),
}


def search_tokens(query: str) -> list[str]:
    raw_tokens = re.findall(r"[0-9a-zA-Z가-힣_./+-]+", query.lower())
    tokens: list[str] = []
    for token in raw_tokens:
        normalized = normalize_search_token(token)
        if len(normalized) >= 2:
            tokens.append(normalized)
    for token in list(tokens):
        tokens.extend(SYNONYMS.get(token, ()))
    return dedupe_preserve_order(tokens)


def normalize_search_token(token: str) -> str:
    normalized = token.strip().lower()
    for suffix in ("입니다", "인가요", "뭐야", "알려줘", "에서", "으로", "하고", "하게", "가", "이", "은", "는", "을", "를", "의", "에", "와", "과", "도", "만", "로"):
        if len(normalized) > len(suffix) + 1 and normalized.endswith(suffix):
            normalized = normalized[: -len(suffix)]
            break
    return normalized


def dedupe_preserve_order(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result = []
    for value in values:
        if value and value not in seen:
            seen.add(value)
            result.append(value)
    return result


def rank_pages(pages: list[dict[str, Any]], tokens: list[str]) -> list[dict[str, Any]]:
    scored: list[dict[str, Any]] = []
    for page in pages:
        title = (page.get("title") or "").lower()
        headings = " ".join(page.get("headings") or []).lower()
        body = (page.get("body_text") or "").lower()
        haystack = f"{title} {headings} {body}"
        score = 0.0
        for token in tokens:
            if token in title:
                score += 6.0
            if token in headings:
                score += 3.5
            count = haystack.count(token)
            if count:
                score += min(count, 10) * 0.6
        if score <= 0:
            continue
        result = dict(page)
        result["_score"] = score
        scored.append(result)
    return sorted(scored, key=lambda page: (-page["_score"], int(page.get("depth") or 0), page.get("title") or ""))


def confidence_for_page(page: dict[str, Any], tokens: list[str], top_score: float) -> dict[str, Any]:
    title = (page.get("title") or "").lower()
    headings = " ".join(page.get("headings") or []).lower()
    body = (page.get("body_text") or "").lower()
    raw_score = float(page.get("_score") or 0)
    relative = raw_score / top_score if top_score else 0
    title_hits = [token for token in tokens if token in title]
    heading_hits = [token for token in tokens if token in headings]
    body_hits = [token for token in tokens if token in body]
    basis = []
    if title_hits:
        basis.append("제목 일치")
    if heading_hits:
        basis.append("헤딩 일치")
    if body_hits:
        basis.append("본문 일치")
    if page.get("url"):
        basis.append("원본 위키 링크")
    score = min(0.99, 0.35 + relative * 0.42 + min(len(set(title_hits + heading_hits + body_hits)), 6) * 0.035)
    if title_hits or heading_hits:
        score = min(0.99, score + 0.08)
    if score >= 0.82:
        label = "High"
        label_ko = "높음"
    elif score >= 0.64:
        label = "Medium"
        label_ko = "보통"
    else:
        label = "Low"
        label_ko = "낮음"
    return {
        "confidenceScore": round(score, 2),
        "confidenceLabel": label,
        "confidenceLabelKo": label_ko,
        "matchReasons": basis or ["유사 본문"],
    }


def rank_concepts(concepts: list[dict[str, Any]], tokens: list[str], source_ids: set[str]) -> list[dict[str, Any]]:
    scored = []
    for concept in concepts:
        haystack = " ".join(
            str(concept.get(key) or "")
            for key in ["name", "kind", "evidence"]
        ).lower()
        score = 1.5 if concept.get("source_page_id") in source_ids else 0.0
        for token in tokens:
            if token in haystack:
                score += 2.0
        if score <= 0:
            continue
        result = dict(concept)
        result["_score"] = score + float(concept.get("score") or 0)
        scored.append(result)
    return sorted(scored, key=lambda item: (-item["_score"], item.get("name") or ""))


def rank_ideas(ideas: list[dict[str, Any]], tokens: list[str], source_ids: set[str]) -> list[dict[str, Any]]:
    scored = []
    for idea in ideas:
        haystack = " ".join(
            str(idea.get(key) or "")
            for key in ["title", "summary", "risk_level", "evidence"]
        ).lower()
        score = 2.5 if idea.get("source_page_id") in source_ids else 0.0
        for token in tokens:
            if token in haystack:
                score += 1.4
        if score <= 0:
            continue
        result = dict(idea)
        result["_score"] = score + float(idea.get("score") or 0)
        scored.append(result)
    return sorted(scored, key=lambda item: (-item["_score"], item.get("title") or ""))


def page_snippet(page: dict[str, Any], tokens: list[str]) -> str:
    body = compact_text(page.get("body_text") or "", 900)
    if not body:
        headings = ", ".join(page.get("headings") or [])
        return compact_text(headings or page.get("title") or "", 220)
    lower_body = body.lower()
    first_match = min((lower_body.find(token) for token in tokens if token in lower_body), default=-1)
    if first_match < 0:
        return compact_text(body, 220)
    start = max(0, first_match - 70)
    end = min(len(body), first_match + 170)
    prefix = "..." if start else ""
    suffix = "..." if end < len(body) else ""
    return compact_text(f"{prefix}{body[start:end]}{suffix}", 260)


def compact_text(value: object, limit: int) -> str:
    text = re.sub(r"\s+", " ", str(value or "")).strip()
    if len(text) <= limit:
        return text
    return text[: max(0, limit - 1)].rstrip() + "…"


def manual_cards(query: str, tokens: list[str]) -> list[dict[str, str]]:
    manual = {
        "id": "training:kg-poc-onboarding-manual",
        "title": "지식그래프 POC 신규 담당자 학습 매뉴얼",
        "summary": "목적, 데이터 흐름, 온톨로지, Neptune, Retrieval, 검증 포인트를 실무 투입 순서로 정리한 로컬 HTML 매뉴얼입니다.",
        "url": "/training/kg-poc-manual.html",
        "matchReason": "지식그래프 POC의 전체 맥락을 빠르게 익히기 좋은 기준 문서입니다.",
    }
    if not query or {"학습", "교육", "매뉴얼", "온보딩", "poc", "지식그래프", "온톨로지"} & set(tokens):
        return [manual]
    return [manual]


def count_descendants(root_id: str, children_by_parent: dict[str | None, list[dict[str, Any]]]) -> int:
    total = 0
    stack = list(children_by_parent.get(root_id, []))
    while stack:
        page = stack.pop()
        total += 1
        stack.extend(children_by_parent.get(page["id"], []))
    return total


def known_edge_endpoint(value: str, page_ids: set[str]) -> bool:
    if value in page_ids:
        return True
    return value.startswith(("concept:", "section:", "keyword:", "idea:"))


def coverage_check(name: str, passed: int, total: int, description: str, warn_ratio: float = 1.0) -> dict[str, Any]:
    ratio = (passed / total) if total else 0
    if total == 0:
        status = "warn"
    elif ratio >= 1:
        status = "pass"
    elif ratio >= warn_ratio:
        status = "warn"
    else:
        status = "fail"
    return {
        "name": name,
        "status": status,
        "passed": passed,
        "total": total,
        "ratio": round(ratio, 3),
        "description": description,
    }


def search_answer(query: str, sources: list[dict[str, Any]], terms: list[dict[str, Any]], manuals: list[dict[str, str]]) -> dict[str, Any]:
    if not query:
        return {
            "title": "업무 질문을 입력하면 관련 지식을 한 번에 정리합니다",
            "summary": "위키 원문, 의미 노드, 업무 아이디어, 학습 매뉴얼을 연결해 신규 담당자가 바로 읽을 수 있는 답변형 결과를 제공합니다.",
            "nextActions": [
                "추천 질문을 눌러 실제 문서 근거를 확인합니다.",
                "근거 문서에서 원본 위키를 열어 세부 내용을 확인합니다.",
                "학습 매뉴얼을 새 탭으로 열어 전체 흐름을 먼저 익힙니다.",
            ],
        }
    if not sources:
        return {
            "title": "일치하는 위키 근거를 찾지 못했습니다",
            "summary": "질문 표현을 바꾸거나 지식그래프, Neptune, 리스크, 호텔처럼 문서에 자주 등장하는 핵심어로 다시 검색해 보세요.",
            "nextActions": [
                "추천 질문 중 가장 가까운 주제를 선택합니다.",
                "카테고리 트리에서 원문 구조를 먼저 확인합니다.",
                "그래프 검색으로 관련 노드를 좁혀봅니다.",
            ],
        }
    top_titles = ", ".join(source["title"] for source in sources[:3])
    term_text = ", ".join(term["name"] for term in terms[:4]) or "관련 의미 노드"
    manual_text = manuals[0]["title"] if manuals else "학습 매뉴얼"
    avg_confidence = sum(float(source.get("confidenceScore") or 0) for source in sources[:3]) / min(len(sources), 3)
    return {
        "title": f"{query} 관련 핵심 문서 {len(sources)}건을 찾았습니다",
        "summary": f"가장 가까운 근거는 {top_titles}입니다. 연결 개념은 {term_text}이며, 전체 업무 맥락은 {manual_text}에서 순서대로 확인할 수 있습니다.",
        "confidence": {
            "score": round(avg_confidence, 2),
            "label": "High" if avg_confidence >= 0.82 else "Medium" if avg_confidence >= 0.64 else "Low",
            "labelKo": "높음" if avg_confidence >= 0.82 else "보통" if avg_confidence >= 0.64 else "낮음",
            "basis": "상위 근거 문서의 제목, 헤딩, 본문 매칭 정도를 기준으로 계산했습니다.",
        },
        "nextActions": [
            "요약 답변 아래의 근거 문서 1~3번을 먼저 읽습니다.",
            "관련 업무 아이디어와 리스크 수준을 확인합니다.",
            "세부 원문이 필요하면 위키 링크를 새 탭에서 엽니다.",
        ],
    }


def display_type(raw_type: str) -> str:
    mapping = {
        "page": "Page",
        "folder": "Folder",
        "database": "Database",
        "whiteboard": "Whiteboard",
        "embed": "Embed",
    }
    return mapping.get((raw_type or "").lower(), raw_type.title() or "Content")


def normalize_graph_mode(mode: str) -> str:
    mode = (mode or "semantic").lower()
    return mode if mode in {"overview", "semantic", "full"} else "semantic"


def include_concept(concept: dict[str, Any], mode: str) -> bool:
    kind = concept.get("kind")
    if mode == "overview":
        return False
    if mode == "semantic":
        return kind in SEMANTIC_KINDS
    return True


def include_edge(edge: dict[str, Any], mode: str) -> bool:
    edge_type = edge.get("edge_type")
    if mode == "overview":
        return edge_type in {"PARENT_OF", "LINKS_TO"}
    if mode == "semantic":
        return edge_type != "MENTIONS"
    return True


def filter_topic(nodes: list[dict[str, Any]], edges: list[dict[str, Any]], topic: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    query = topic.strip().lower()
    if not query:
        return nodes, edges
    node_map = {node["id"]: node for node in nodes}
    matched = {
        node["id"]
        for node in nodes
        if query in " ".join(
            str(node.get(key, ""))
            for key in ["label", "type", "kind", "summary", "id"]
        ).lower()
    }
    keep = set(matched)
    for edge in edges:
        if edge["source_id"] in matched or edge["target_id"] in matched:
            keep.add(edge["source_id"])
            keep.add(edge["target_id"])
    filtered_nodes = [node for node in nodes if node["id"] in keep]
    filtered_edges = [
        edge for edge in edges if edge["source_id"] in keep and edge["target_id"] in keep
    ]
    return [node for node in filtered_nodes if node["id"] in node_map], filtered_edges


def build_category_tree(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_parent: dict[str | None, list[dict[str, Any]]] = {}
    for page in pages:
        by_parent.setdefault(page.get("parent_id"), []).append(page)

    def build(parent_id: str | None) -> list[dict[str, Any]]:
        children = []
        for page in by_parent.get(parent_id, []):
            children.append(
                {
                    "id": page["id"],
                    "title": page["title"],
                    "type": page["type"],
                    "url": page["url"],
                    "children": build(page["id"]),
                }
            )
        return children

    return build(None)
