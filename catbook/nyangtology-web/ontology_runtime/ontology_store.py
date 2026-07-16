from __future__ import annotations

import json
import sqlite3
from functools import cached_property
from pathlib import Path
from typing import Any

from safety import (
    CATBOOK_ROOT,
    DEFAULT_ARTIFACT_CHARS,
    MAX_ARTIFACT_CHARS,
    MAX_EDGE_LIMIT,
    MAX_EVIDENCE_LIMIT,
    MAX_LIST_LIMIT,
    SafetyError,
    clamp_int,
    escape_like,
    require_non_empty_string,
    resolve_within_catbook,
    safety_notes_for_nodes,
)


MCP_ROOT = Path(__file__).resolve().parent
MCP_CONTENT_DIR = MCP_ROOT / "content"
DATA_DIR = MCP_CONTENT_DIR / "data"
RESEARCH_DIR = MCP_CONTENT_DIR / "research"
DB_PATH = DATA_DIR / "catbook_ontology.sqlite"
GRAPH_JSON_PATH = RESEARCH_DIR / "cat_ontology_graph.json"
GRAPH_REPORT_PATH = RESEARCH_DIR / "cat-ontology-graph-report.md"
TTL_PATH = DATA_DIR / "catbook_ontology.ttl"
OWL_PATH = DATA_DIR / "catbook_ontology.owl"
SHAPES_PATH = DATA_DIR / "catbook_shapes.ttl"
RDF_STATUS_PATH = DATA_DIR / "catbook_rdf_status.json"
REFRESH_STATUS_PATH = DATA_DIR / "ontology_refresh_status.json"
QUERIES_DIR = RESEARCH_DIR / "queries"


def _relative_to_root(path: Path) -> str:
    return resolve_within_catbook(path).relative_to(CATBOOK_ROOT).as_posix()


class StoreError(RuntimeError):
    pass


def _json_load(value: str | None, fallback: Any = None) -> Any:
    if value is None:
        return fallback
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return fallback


def _row_payload(row: sqlite3.Row) -> dict:
    payload = _json_load(row["payload_json"], {})
    if isinstance(payload, dict):
        return payload
    return {}


def _term_to_value(term) -> Any:
    if term is None:
        return None
    to_python = getattr(term, "toPython", None)
    if callable(to_python):
        value = to_python()
        if isinstance(value, (str, int, float, bool)) or value is None:
            return value
    return str(term)


class OntologyStore:
    def __init__(self, db_path: Path = DB_PATH) -> None:
        self.db_path = resolve_within_catbook(db_path)
        if not self.db_path.is_file():
            raise StoreError(f"SQLite ontology DB not found: {self.db_path}")
        self._rdf_graph = None

    def connect(self) -> sqlite3.Connection:
        uri = f"file:{self.db_path.as_posix()}?mode=ro"
        conn = sqlite3.connect(uri, uri=True)
        conn.row_factory = sqlite3.Row
        return conn

    @cached_property
    def preset_catalog(self) -> list[dict]:
        if not QUERIES_DIR.is_dir():
            return []
        presets = []
        for path in sorted(QUERIES_DIR.glob("*.rq")):
            preset_id = path.stem
            text = path.read_text(encoding="utf-8")
            presets.append(
                {
                    "id": preset_id,
                    "file": path.name,
                    "title": preset_id.replace("_", " "),
                    "description": self._describe_preset(preset_id),
                    "query": text,
                }
            )
        return presets

    def _describe_preset(self, preset_id: str) -> str:
        descriptions = {
            "01_scenario_entry_points": "Beginner scenario entry points and starting concept links.",
            "02_health_observation_safety": "Health observations that require record-focused actions.",
            "03_top_evidence_sources": "Concepts with the largest number of evidence sources.",
            "04_content_topics": "Source content connected to ontology topic nodes.",
            "05_inferred_safety_sensitive_concepts": "Safety-sensitive health/risk concepts inferred by RDF typing.",
            "06_relation_assertion_integrity": "Relation assertion rows with subject, predicate, object, and confidence.",
            "07_non_diagnostic_safety_controls": "Sensitive concepts that keep non-diagnostic controls.",
            "08_source_url_coverage": "Source URL coverage and linked concept counts.",
        }
        return descriptions.get(preset_id, "냥톨로지 SPARQL preset.")

    def preset_ids(self) -> list[str]:
        return [item["id"] for item in self.preset_catalog]

    def stats(self) -> dict:
        with self.connect() as conn:
            table_counts = {}
            for row in conn.execute(
                """
                SELECT name
                FROM sqlite_master
                WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
                ORDER BY name
                """
            ):
                table_name = row["name"]
                table_counts[table_name] = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]

            metadata = {
                row["key"]: _json_load(row["value_json"])
                for row in conn.execute("SELECT key, value_json FROM metadata ORDER BY sort_order")
            }
            class_counts = {
                row["class_id"]: row["count"]
                for row in conn.execute(
                    """
                    SELECT class_id, COUNT(*) AS count
                    FROM nodes
                    GROUP BY class_id
                    ORDER BY count DESC, class_id
                    """
                )
            }
            relation_counts = {
                row["relation_id"]: row["count"]
                for row in conn.execute(
                    """
                    SELECT relation_id, COUNT(*) AS count
                    FROM edges
                    GROUP BY relation_id
                    ORDER BY count DESC, relation_id
                    """
                )
            }
            top_concepts = [
                dict(row)
                for row in conn.execute(
                    """
                    SELECT node_id, label, class_id, evidence_count
                    FROM nodes
                    WHERE evidence_count IS NOT NULL
                      AND class_id NOT IN ('Source', 'Topic', 'BookPart', 'Chapter', 'Scenario')
                    ORDER BY evidence_count DESC, label
                    LIMIT 16
                    """
                )
            ]
            safety_rules = [
                row["rule"]
                for row in conn.execute("SELECT rule FROM safety_rules ORDER BY sort_order")
            ]
        return {
            "title": metadata.get("title", "catbook ontology"),
            "description": metadata.get("description", ""),
            "schema_version": metadata.get("schema_version"),
            "backend": metadata.get("backend"),
            "content_mode": "mcp_content_required",
            "content_root": _relative_to_root(MCP_CONTENT_DIR) if MCP_CONTENT_DIR.is_dir() else None,
            "sqlite_path": _relative_to_root(self.db_path),
            "rdf_turtle": _relative_to_root(TTL_PATH),
            "sparql_presets": len(self.preset_catalog),
            "preset_ids": self.preset_ids(),
            "tables": table_counts,
            "class_counts": class_counts,
            "relation_counts": relation_counts,
            "top_evidence_concepts": top_concepts,
            "safety_rules": safety_rules,
        }

    def search_nodes(
        self,
        *,
        query: str = "",
        class_id: str | None = None,
        include_sources: bool = False,
        limit: int | None = None,
    ) -> dict:
        safe_limit = clamp_int(limit, default=20, minimum=1, maximum=MAX_LIST_LIMIT, name="limit")
        clauses = []
        params: list[Any] = []

        query = (query or "").strip()
        if query:
            pattern = f"%{escape_like(query)}%"
            clauses.append(
                "(node_id LIKE ? ESCAPE '\\' OR label LIKE ? ESCAPE '\\' OR summary LIKE ? ESCAPE '\\' OR beginner LIKE ? ESCAPE '\\')"
            )
            params.extend([pattern, pattern, pattern, pattern])
        if class_id:
            clauses.append("class_id = ?")
            params.append(class_id)
        if not include_sources:
            clauses.append("class_id != 'Source'")

        where = "WHERE " + " AND ".join(clauses) if clauses else ""
        sql = f"""
            SELECT payload_json
            FROM nodes
            {where}
            ORDER BY
              CASE WHEN evidence_count IS NULL THEN 1 ELSE 0 END,
              evidence_count DESC,
              class_id,
              label
            LIMIT ?
        """
        params.append(safe_limit)
        with self.connect() as conn:
            nodes = [_row_payload(row) for row in conn.execute(sql, params)]
        return {
            "query": query,
            "class_id": class_id,
            "include_sources": include_sources,
            "limit": safe_limit,
            "count": len(nodes),
            "nodes": nodes,
            "safety": safety_notes_for_nodes(nodes),
        }

    def get_node(self, node_id: str) -> dict | None:
        safe_id = require_non_empty_string(node_id, name="node_id")
        with self.connect() as conn:
            row = conn.execute("SELECT payload_json FROM nodes WHERE node_id = ?", (safe_id,)).fetchone()
        return _row_payload(row) if row else None

    def list_edges(
        self,
        *,
        source_id: str | None = None,
        target_id: str | None = None,
        relation_id: str | None = None,
        limit: int | None = None,
    ) -> dict:
        safe_limit = clamp_int(limit, default=50, minimum=1, maximum=MAX_EDGE_LIMIT, name="limit")
        clauses = []
        params: list[Any] = []
        if source_id:
            clauses.append("source_id = ?")
            params.append(source_id)
        if target_id:
            clauses.append("target_id = ?")
            params.append(target_id)
        if relation_id:
            clauses.append("relation_id = ?")
            params.append(relation_id)
        where = "WHERE " + " AND ".join(clauses) if clauses else ""
        sql = f"""
            SELECT payload_json
            FROM edges
            {where}
            ORDER BY sort_order
            LIMIT ?
        """
        params.append(safe_limit)
        with self.connect() as conn:
            edges = [_row_payload(row) for row in conn.execute(sql, params)]
        return {
            "filters": {
                "source_id": source_id,
                "target_id": target_id,
                "relation_id": relation_id,
            },
            "limit": safe_limit,
            "count": len(edges),
            "edges": edges,
        }

    def neighborhood(
        self,
        *,
        node_id: str,
        depth: int | None = None,
        direction: str = "both",
        include_sources: bool = False,
        edge_limit: int | None = None,
        evidence_limit: int | None = None,
    ) -> dict:
        root_id = require_non_empty_string(node_id, name="node_id")
        safe_depth = clamp_int(depth, default=1, minimum=0, maximum=2, name="depth")
        safe_edge_limit = clamp_int(edge_limit, default=120, minimum=1, maximum=MAX_EDGE_LIMIT, name="edge_limit")
        safe_evidence_limit = clamp_int(
            evidence_limit,
            default=8,
            minimum=0,
            maximum=MAX_EVIDENCE_LIMIT,
            name="evidence_limit",
        )
        if direction not in {"both", "in", "out"}:
            raise SafetyError("direction must be one of: both, in, out.")

        with self.connect() as conn:
            root_row = conn.execute("SELECT payload_json FROM nodes WHERE node_id = ?", (root_id,)).fetchone()
            if not root_row:
                raise SafetyError(f"Unknown node_id: {root_id}")
            node_payloads = {root_id: _row_payload(root_row)}
            frontier = {root_id}
            edge_payloads: list[dict] = []
            seen_edges = set()

            for _ in range(safe_depth):
                if not frontier or len(edge_payloads) >= safe_edge_limit:
                    break
                next_frontier = set()
                for current in sorted(frontier):
                    if direction in {"both", "out"}:
                        rows = conn.execute(
                            """
                            SELECT e.payload_json, target.payload_json AS target_payload
                            FROM edges e
                            JOIN nodes target ON target.node_id = e.target_id
                            WHERE e.source_id = ?
                            ORDER BY e.sort_order
                            LIMIT ?
                            """,
                            (current, safe_edge_limit),
                        )
                        for row in rows:
                            edge = _json_load(row["payload_json"], {})
                            target = _json_load(row["target_payload"], {})
                            self._append_neighbor(
                                edge,
                                target,
                                include_sources,
                                node_payloads,
                                next_frontier,
                                edge_payloads,
                                seen_edges,
                                safe_edge_limit,
                            )
                    if direction in {"both", "in"}:
                        rows = conn.execute(
                            """
                            SELECT e.payload_json, source.payload_json AS source_payload
                            FROM edges e
                            JOIN nodes source ON source.node_id = e.source_id
                            WHERE e.target_id = ?
                            ORDER BY e.sort_order
                            LIMIT ?
                            """,
                            (current, safe_edge_limit),
                        )
                        for row in rows:
                            edge = _json_load(row["payload_json"], {})
                            source = _json_load(row["source_payload"], {})
                            self._append_neighbor(
                                edge,
                                source,
                                include_sources,
                                node_payloads,
                                next_frontier,
                                edge_payloads,
                                seen_edges,
                                safe_edge_limit,
                            )
                    if len(edge_payloads) >= safe_edge_limit:
                        break
                frontier = next_frontier - set(node_payloads.keys())

            nodes = list(node_payloads.values())
            evidence = []
            if safe_evidence_limit:
                evidence = self.evidence_for_concept(root_id, limit=safe_evidence_limit)["items"]
        return {
            "root": node_payloads[root_id],
            "depth": safe_depth,
            "direction": direction,
            "include_sources": include_sources,
            "nodes": nodes,
            "edges": edge_payloads,
            "evidence": evidence,
            "safety": safety_notes_for_nodes(nodes),
        }

    def _append_neighbor(
        self,
        edge: dict,
        node: dict,
        include_sources: bool,
        node_payloads: dict[str, dict],
        next_frontier: set[str],
        edge_payloads: list[dict],
        seen_edges: set[str],
        edge_limit: int,
    ) -> None:
        if not edge or not node or len(edge_payloads) >= edge_limit:
            return
        if node.get("class") == "Source" and not include_sources:
            return
        edge_id = edge.get("id")
        if edge_id and edge_id not in seen_edges:
            edge_payloads.append(edge)
            seen_edges.add(edge_id)
        node_id = node.get("id")
        if node_id and node_id not in node_payloads:
            node_payloads[node_id] = node
            if node.get("class") != "Source":
                next_frontier.add(node_id)

    def evidence_for_concept(
        self,
        concept_id: str,
        *,
        query: str = "",
        limit: int | None = None,
    ) -> dict:
        safe_id = require_non_empty_string(concept_id, name="concept_id")
        safe_limit = clamp_int(limit, default=12, minimum=1, maximum=MAX_EVIDENCE_LIMIT, name="limit")
        clauses = ["m.concept_id = ?"]
        params: list[Any] = [safe_id]
        query = (query or "").strip()
        if query:
            pattern = f"%{escape_like(query)}%"
            clauses.append(
                "(i.content_id LIKE ? ESCAPE '\\' OR i.title LIKE ? ESCAPE '\\' OR i.default_title LIKE ? ESCAPE '\\' OR i.topics_json LIKE ? ESCAPE '\\')"
            )
            params.extend([pattern, pattern, pattern, pattern])
        sql = f"""
            SELECT
              i.content_id,
              i.title,
              i.default_title,
              i.url,
              i.watch_url,
              i.media_family,
              i.duration_min,
              i.view_count,
              i.thumbnail_url,
              i.topics_json,
              m.score,
              m.hits_json,
              i.payload_json
            FROM content_matches m
            JOIN content_items i ON i.content_id = m.content_id
            WHERE {' AND '.join(clauses)}
            ORDER BY m.score DESC, i.view_count DESC, i.title
            LIMIT ?
        """
        params.append(safe_limit)
        with self.connect() as conn:
            node = conn.execute("SELECT payload_json FROM nodes WHERE node_id = ?", (safe_id,)).fetchone()
            rows = conn.execute(sql, params).fetchall()
        items = []
        for row in rows:
            item = {
                key: row[key]
                for key in [
                    "content_id",
                    "title",
                    "default_title",
                    "url",
                    "watch_url",
                    "media_family",
                    "duration_min",
                    "view_count",
                    "thumbnail_url",
                    "score",
                ]
            }
            item["topics"] = _json_load(row["topics_json"], [])
            item["hits"] = _json_load(row["hits_json"], [])
            items.append(item)
        node_payload = _row_payload(node) if node else None
        return {
            "concept_id": safe_id,
            "query": query,
            "limit": safe_limit,
            "concept": node_payload,
            "count": len(items),
            "items": items,
            "safety": safety_notes_for_nodes([node_payload] if node_payload else []),
        }

    def run_sparql_preset(self, preset: str, *, limit: int | None = None) -> dict:
        safe_preset = require_non_empty_string(preset, name="preset")
        safe_limit = clamp_int(limit, default=50, minimum=1, maximum=MAX_LIST_LIMIT, name="limit")
        catalog_item = next((item for item in self.preset_catalog if item["id"] == safe_preset), None)
        if not catalog_item:
            raise SafetyError(f"Unknown preset. Allowed presets: {', '.join(self.preset_ids())}")
        graph = self._load_rdf_graph()
        results = graph.query(catalog_item["query"])
        columns = [str(var) for var in getattr(results, "vars", [])]
        rows = []
        for row in results:
            rows.append([_term_to_value(value) for value in row])
            if len(rows) >= safe_limit:
                break
        return {
            "preset": safe_preset,
            "title": catalog_item["title"],
            "file": catalog_item["file"],
            "limit": safe_limit,
            "columns": columns,
            "row_count": len(rows),
            "rows": rows,
            "query": catalog_item["query"],
        }

    def _load_rdf_graph(self):
        if self._rdf_graph is not None:
            return self._rdf_graph
        try:
            from rdflib import Graph
        except ImportError as error:
            raise StoreError(
                "rdflib is required for SPARQL presets. Install catbook/mcp/requirements.txt or standalone requirements.txt."
            ) from error
        ttl_path = resolve_within_catbook(TTL_PATH)
        graph = Graph()
        graph.parse(str(ttl_path), format="turtle")
        self._rdf_graph = graph
        return graph

    def read_artifact(self, artifact: str, *, offset: int | None = None, max_chars: int | None = None) -> dict:
        safe_artifact = require_non_empty_string(artifact, name="artifact")
        safe_offset = clamp_int(offset, default=0, minimum=0, maximum=10_000_000, name="offset")
        safe_max = clamp_int(
            max_chars,
            default=DEFAULT_ARTIFACT_CHARS,
            minimum=1,
            maximum=MAX_ARTIFACT_CHARS,
            name="max_chars",
        )
        path, mime_type = self.artifact_path(safe_artifact)
        text = path.read_text(encoding="utf-8")
        chunk = text[safe_offset:safe_offset + safe_max]
        return {
            "artifact": safe_artifact,
            "path": _relative_to_root(path),
            "mime_type": mime_type,
            "offset": safe_offset,
            "max_chars": safe_max,
            "returned_chars": len(chunk),
            "total_chars": len(text),
            "has_more": safe_offset + len(chunk) < len(text),
            "text": chunk,
        }

    def artifact_path(self, artifact: str) -> tuple[Path, str]:
        artifact_map = {
            "graph_json": (GRAPH_JSON_PATH, "application/json"),
            "graph_report": (GRAPH_REPORT_PATH, "text/markdown"),
            "ttl": (TTL_PATH, "text/turtle"),
            "owl": (OWL_PATH, "application/rdf+xml"),
            "shapes": (SHAPES_PATH, "text/turtle"),
            "rdf_status": (RDF_STATUS_PATH, "application/json"),
            "refresh_status": (REFRESH_STATUS_PATH, "application/json"),
        }
        if artifact.startswith("preset:"):
            preset_id = artifact.split(":", 1)[1]
            item = next((preset for preset in self.preset_catalog if preset["id"] == preset_id), None)
            if not item:
                raise SafetyError(f"Unknown preset artifact: {preset_id}")
            return resolve_within_catbook(QUERIES_DIR / item["file"]), "application/sparql-query"
        if artifact not in artifact_map:
            allowed = sorted(artifact_map) + [f"preset:{preset_id}" for preset_id in self.preset_ids()]
            raise SafetyError(f"Unknown artifact. Allowed artifacts: {', '.join(allowed)}")
        path, mime_type = artifact_map[artifact]
        resolved = resolve_within_catbook(path)
        if not resolved.is_file():
            raise StoreError(f"Artifact not found: {resolved}")
        return resolved, mime_type

    def resource_list(self) -> list[dict]:
        resources = [
            ("catbook://ontology/summary", "냥톨로지 요약", "Read-only SQLite-backed cat signal explorer stats.", "application/json"),
            ("catbook://artifact/graph_json", "cat_ontology_graph.json", "JSON graph export.", "application/json"),
            ("catbook://artifact/graph_report", "cat-ontology-graph-report.md", "Human-readable graph build report.", "text/markdown"),
            ("catbook://artifact/ttl", "catbook_ontology.ttl", "RDF Turtle cache.", "text/turtle"),
            ("catbook://artifact/owl", "catbook_ontology.owl", "OWL/RDFXML cache.", "application/rdf+xml"),
            ("catbook://artifact/shapes", "catbook_shapes.ttl", "SHACL shapes cache.", "text/turtle"),
            ("catbook://artifact/rdf_status", "catbook_rdf_status.json", "RDF/OWL validation status.", "application/json"),
            ("catbook://artifact/refresh_status", "ontology_refresh_status.json", "Latest ontology refresh status.", "application/json"),
        ]
        for preset in self.preset_catalog:
            resources.append(
                (
                    f"catbook://artifact/preset:{preset['id']}",
                    preset["file"],
                    preset["description"],
                    "application/sparql-query",
                )
            )
        return [
            {
                "uri": uri,
                "name": name,
                "title": name,
                "description": description,
                "mimeType": mime_type,
            }
            for uri, name, description, mime_type in resources
        ]

    def read_resource(self, uri: str) -> dict:
        safe_uri = require_non_empty_string(uri, name="uri")
        if safe_uri == "catbook://ontology/summary":
            return {
                "uri": safe_uri,
                "mimeType": "application/json",
                "text": json.dumps(self.stats(), ensure_ascii=False, indent=2),
            }
        prefix = "catbook://artifact/"
        if not safe_uri.startswith(prefix):
            raise SafetyError("Unsupported resource URI.")
        artifact = safe_uri[len(prefix):]
        chunk = self.read_artifact(artifact, offset=0, max_chars=DEFAULT_ARTIFACT_CHARS)
        note = ""
        if chunk["has_more"]:
            note = "\n\n[truncated: use tool catbook_read_artifact with offset/max_chars for more]"
        return {
            "uri": safe_uri,
            "mimeType": chunk["mime_type"],
            "text": chunk["text"] + note,
        }
