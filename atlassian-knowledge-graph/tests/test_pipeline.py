from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from atlassian_kg.config import load_config
from atlassian_kg.pipeline import sync
from atlassian_kg.storage import KnowledgeStore


class PipelineTests(unittest.TestCase):
    def test_sample_sync_builds_graph(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            env_path = Path(temp) / ".env"
            db_path = Path(temp) / "kg.sqlite3"
            env_path.write_text(
                "\n".join(
                    [
                        "ATLASSIAN_BASE_URL=https://wiki-hanatour.atlassian.net",
                        "ATLASSIAN_EMAIL=your-email@example.com",
                        "ATLASSIAN_API_TOKEN=REPLACE_WITH_ROTATED_TOKEN",
                        "CONFLUENCE_ROOT_PAGE_IDS=3635315029,3501490259",
                        f"APP_DB_PATH={db_path}",
                    ]
                ),
                encoding="utf-8",
            )
            config = load_config(env_path)
            result = sync(config, sample=True)
            store = KnowledgeStore(config.db_path)
            self.assertEqual(result.status, "success")
            pages = store.pages()
            graph = store.graph()
            semantic_graph = store.graph(mode="semantic")
            overview_graph = store.graph(mode="overview")
            hub = store.hub()
            search = store.search("지식그래프 POC")
            coverage = store.coverage(config.root_page_ids)
            self.assertGreaterEqual(len(pages), 10)
            self.assertIn("folder", {page["type"] for page in pages})
            self.assertIn("database", {page["type"] for page in pages})
            self.assertIn("Folder", {node["type"] for node in graph["nodes"]})
            self.assertIn("Database", {node["type"] for node in graph["nodes"]})
            self.assertGreater(len(store.graph()["edges"]), 0)
            self.assertFalse(any(node.get("kind") == "Keyword" for node in semantic_graph["nodes"]))
            self.assertFalse(any(node.get("type") == "Concept" for node in overview_graph["nodes"]))
            self.assertGreater(len(hub["topIdeas"]), 0)
            self.assertIn("topConcepts", hub)
            self.assertGreater(len(hub["topConcepts"]), 0)
            self.assertGreater(len(hub["riskNodes"]), 0)
            self.assertGreater(len(store.ideas()), 0)
            self.assertGreater(len(search["sources"]), 0)
            self.assertIn("answer", search)
            self.assertGreater(len(search["manuals"]), 0)
            self.assertIn("confidenceScore", search["sources"][0])
            self.assertGreater(len(search["sources"][0]["matchReasons"]), 0)
            self.assertEqual(coverage["summary"]["foundRootCount"], len(config.root_page_ids))
            self.assertEqual(coverage["summary"]["missingEndpointCount"], 0)
            self.assertGreaterEqual(len(coverage["qualityChecks"]), 4)


if __name__ == "__main__":
    unittest.main()
