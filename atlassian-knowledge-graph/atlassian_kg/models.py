from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class PageRecord:
    id: str
    title: str
    url: str
    type: str = "page"
    parent_id: str | None = None
    depth: int = 0
    space_id: str | None = None
    version_number: int | None = None
    fetched_at: str = ""
    body_text: str = ""
    body_storage: str = ""
    body_format: str = "storage"
    headings: tuple[str, ...] = field(default_factory=tuple)
    links: tuple[tuple[str, str], ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class EdgeRecord:
    source_id: str
    target_id: str
    edge_type: str
    label: str
    weight: float = 1.0
    evidence: str = ""
    status: str = "deterministic"


@dataclass(frozen=True)
class ConceptRecord:
    id: str
    name: str
    kind: str
    score: float
    source_page_id: str
    evidence: str


@dataclass(frozen=True)
class IdeaRecord:
    id: str
    title: str
    summary: str
    source_page_id: str
    score: float
    risk_level: str
    evidence: str
