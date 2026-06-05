from datetime import datetime, timezone
import unittest

from jarvis_trader.models import Market
from jarvis_trader.research import (
    IssueResearchEngine,
    ResearchItem,
    default_research_sources,
)


class ResearchTest(unittest.TestCase):
    def test_default_sources_include_official_disclosure_sources(self) -> None:
        sources = default_research_sources()
        names = {source.name for source in sources}

        self.assertIn("OpenDART", names)
        self.assertIn("SEC EDGAR APIs", names)

    def test_high_priority_issue_creates_risk_shield_actions(self) -> None:
        engine = IssueResearchEngine()
        item = ResearchItem(
            title="Trading halt notice",
            summary="Symbol is under trading halt review.",
            source_name="KRX",
            source_url="https://openapi.krx.co.kr/contents/OPP/DATA/OPPDATA002.jsp",
            timestamp=datetime.now(timezone.utc),
            market=Market.KR,
            symbol="005930",
            tags=("halt",),
        )

        brief = engine.build_brief([item], market=Market.KR, symbol="005930")

        self.assertEqual(brief.high_priority_count, 1)
        self.assertIn("Risk Shield", brief.headline)
        self.assertTrue(any("Jarvis" in action for action in brief.agent_actions))


if __name__ == "__main__":
    unittest.main()
