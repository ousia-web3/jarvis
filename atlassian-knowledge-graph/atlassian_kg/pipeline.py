from __future__ import annotations

from dataclasses import dataclass

from .atlassian import AtlassianClient, AtlassianClientError
from .config import AppConfig
from .graph import build_derived_data
from .sample_data import sample_pages
from .storage import KnowledgeStore


@dataclass(frozen=True)
class SyncResult:
    status: str
    message: str
    page_count: int
    edge_count: int


def sync(config: AppConfig, sample: bool = False) -> SyncResult:
    store = KnowledgeStore(config.db_path)
    roots = config.root_page_ids
    run_id = store.start_run(roots, status="running")
    try:
        if sample:
            pages = sample_pages()
            message = "샘플 데이터 동기화 완료"
        else:
            client = AtlassianClient(config)
            pages = client.crawl_roots(roots)
            message = "Atlassian API 동기화 완료"

        edges, concepts, ideas = build_derived_data(pages)
        store.replace_pages(pages)
        store.replace_derived(edges, concepts, ideas)
        store.finish_run(run_id, "success", message, len(pages), len(edges))
        return SyncResult("success", message, len(pages), len(edges))
    except (AtlassianClientError, OSError, ValueError) as exc:
        store.finish_run(run_id, "failed", str(exc), 0, 0)
        return SyncResult("failed", str(exc), 0, 0)
