from __future__ import annotations

import unittest

from atlassian_kg.atlassian import page_id_from_url
from atlassian_kg.content import keywords, parse_storage_body


class ContentTests(unittest.TestCase):
    def test_page_id_from_url(self) -> None:
        self.assertEqual(
            page_id_from_url("https://wiki-hanatour.atlassian.net/wiki/spaces/searchdata/pages/3501490259/26+2+POC"),
            "3501490259",
        )
        self.assertEqual(page_id_from_url("3635315029"), "3635315029")

    def test_parse_storage_body(self) -> None:
        text, headings, links = parse_storage_body('<h1>Title</h1><p>Hello <a href="https://x.test">World</a></p>')
        self.assertIn("Hello", text)
        self.assertEqual(headings, ("Title",))
        self.assertEqual(links, (("https://x.test", "World"),))

    def test_keywords(self) -> None:
        result = keywords("데이터 품질 데이터 자동화 자동화 자동화", limit=2)
        self.assertEqual(result[0][0], "자동화")


if __name__ == "__main__":
    unittest.main()
