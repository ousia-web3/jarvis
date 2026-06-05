from __future__ import annotations

import html
import re
from collections import Counter
from html.parser import HTMLParser
from urllib.parse import urlparse


STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "this",
    "that",
    "into",
    "have",
    "has",
    "are",
    "was",
    "were",
    "입니다",
    "그리고",
    "대한",
    "관련",
    "통해",
    "위한",
    "있는",
    "없는",
    "한다",
    "되는",
    "수집",
    "페이지",
    "문서",
}


class StorageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.headings: list[str] = []
        self.links: list[tuple[str, str]] = []
        self._capture_heading: list[str] | None = None
        self._active_href: str | None = None
        self._active_link_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {key: value or "" for key, value in attrs}
        tag_lower = tag.lower()
        if tag_lower in {"p", "br", "div", "li", "tr"}:
            self.parts.append("\n")
        if re.fullmatch(r"h[1-6]", tag_lower):
            self._capture_heading = []
            self.parts.append("\n")
        if tag_lower == "a":
            self._active_href = attrs_dict.get("href")
            self._active_link_text = []
        if tag_lower == "ri:page":
            title = attrs_dict.get("ri:content-title") or attrs_dict.get("content-title")
            if title:
                self.links.append(("", title))

    def handle_endtag(self, tag: str) -> None:
        tag_lower = tag.lower()
        if re.fullmatch(r"h[1-6]", tag_lower) and self._capture_heading is not None:
            heading = normalize_text(" ".join(self._capture_heading))
            if heading:
                self.headings.append(heading)
            self._capture_heading = None
            self.parts.append("\n")
        if tag_lower == "a" and self._active_href:
            text = normalize_text(" ".join(self._active_link_text))
            self.links.append((self._active_href, text or self._active_href))
            self._active_href = None
            self._active_link_text = []

    def handle_data(self, data: str) -> None:
        text = html.unescape(data)
        if text.strip():
            self.parts.append(text)
            self.parts.append(" ")
            if self._capture_heading is not None:
                self._capture_heading.append(text)
            if self._active_href:
                self._active_link_text.append(text)

    def text(self) -> str:
        return normalize_text(" ".join(self.parts))


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def parse_storage_body(body: str) -> tuple[str, tuple[str, ...], tuple[tuple[str, str], ...]]:
    parser = StorageParser()
    parser.feed(body or "")
    return parser.text(), tuple(parser.headings), tuple(parser.links)


def extract_external_domain(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc.lower()


def keywords(text: str, limit: int = 12) -> list[tuple[str, int]]:
    tokens = re.findall(r"[A-Za-z가-힣][A-Za-z0-9가-힣_-]{1,}", text)
    normalized = [token.strip().lower() for token in tokens]
    filtered = [
        token
        for token in normalized
        if len(token) >= 2 and token not in STOPWORDS and not token.isdigit()
    ]
    return Counter(filtered).most_common(limit)


def short_summary(text: str, max_chars: int = 180) -> str:
    text = normalize_text(text)
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rstrip() + "..."
