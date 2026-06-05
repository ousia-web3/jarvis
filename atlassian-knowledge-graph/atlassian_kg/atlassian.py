from __future__ import annotations

import base64
import json
import time
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlencode, urljoin, urlparse
from urllib.request import Request, urlopen

from .config import AppConfig
from .content import parse_storage_body
from .models import PageRecord


class AtlassianClientError(RuntimeError):
    pass


@dataclass(frozen=True)
class ContentItem:
    id: str
    title: str
    type: str
    parent_id: str | None
    depth: int
    space_id: str | None = None


DIRECT_CHILDREN_PATHS = {
    "page": "/wiki/api/v2/pages/{id}/direct-children",
    "folder": "/wiki/api/v2/folders/{id}/direct-children",
    "database": "/wiki/api/v2/databases/{id}/direct-children",
    "whiteboard": "/wiki/api/v2/whiteboards/{id}/direct-children",
    "embed": "/wiki/api/v2/embeds/{id}/direct-children",
}


DETAIL_PATHS = {
    "folder": "/wiki/api/v2/folders/{id}",
    "database": "/wiki/api/v2/databases/{id}",
    "whiteboard": "/wiki/api/v2/whiteboards/{id}",
    "embed": "/wiki/api/v2/embeds/{id}",
}


def page_id_from_url(value: str) -> str:
    if value.isdigit():
        return value
    path = urlparse(value).path
    parts = [part for part in path.split("/") if part]
    if "pages" in parts:
        index = parts.index("pages")
        if index + 1 < len(parts) and parts[index + 1].isdigit():
            return parts[index + 1]
    raise ValueError(f"Cannot extract Confluence page id from {value!r}")


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class AtlassianClient:
    def __init__(self, config: AppConfig, timeout: int = 30) -> None:
        if not config.confluence_configured:
            raise AtlassianClientError(
                "Atlassian email/token/base URL are not configured. Update .env with a newly issued token."
            )
        self.config = config
        self.timeout = timeout

    def _headers(self) -> dict[str, str]:
        credential = f"{self.config.email}:{self.config.api_token}".encode("utf-8")
        auth = base64.b64encode(credential).decode("ascii")
        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth}",
            "User-Agent": "Jarvis-Atlassian-Knowledge-Graph/0.1",
        }

    def _url(self, path: str, params: dict[str, Any] | None = None) -> str:
        base = self.config.base_url.rstrip("/") + "/"
        full = urljoin(base, path.lstrip("/"))
        if params:
            full = f"{full}?{urlencode(params)}"
        return full

    def request_json(self, path_or_url: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        url = path_or_url if path_or_url.startswith("http") else self._url(path_or_url, params)
        last_error: Exception | None = None
        for attempt in range(4):
            request = Request(url, headers=self._headers(), method="GET")
            try:
                with urlopen(request, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except HTTPError as exc:
                body = exc.read().decode("utf-8", errors="replace")
                if exc.code in {429, 500, 502, 503, 504} and attempt < 3:
                    retry_after = exc.headers.get("Retry-After")
                    delay = float(retry_after) if retry_after and retry_after.isdigit() else 1.5 * (attempt + 1)
                    time.sleep(delay)
                    last_error = exc
                    continue
                raise AtlassianClientError(f"Atlassian API HTTP {exc.code}: {body[:300]}") from exc
            except (URLError, ConnectionResetError, TimeoutError, OSError) as exc:
                last_error = exc
                if attempt < 3:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                reason = getattr(exc, "reason", exc)
                raise AtlassianClientError(f"Atlassian API connection failed: {reason}") from exc
        raise AtlassianClientError(f"Atlassian API request failed: {last_error}")

    def descendants(self, page_id: str) -> list[ContentItem]:
        items: list[ContentItem] = []
        cursor: str | None = None
        next_url: str | None = None
        while True:
            if next_url:
                payload = self.request_json(next_url)
            else:
                params: dict[str, Any] = {
                    "limit": 250,
                    "depth": self.config.descendant_depth,
                }
                if cursor:
                    params["cursor"] = cursor
                payload = self.request_json(f"/wiki/api/v2/pages/{page_id}/descendants", params)

            for item in payload.get("results", []):
                items.append(
                    ContentItem(
                        id=str(item.get("id", "")),
                        title=str(item.get("title", "")),
                        type=str(item.get("type", "page")),
                        parent_id=str(item["parentId"]) if item.get("parentId") else None,
                        depth=int(item.get("depth") or 0),
                        space_id=str(item.get("spaceId")) if item.get("spaceId") else None,
                    )
                )

            links = payload.get("_links", {})
            next_path = links.get("next")
            if next_path:
                next_url = next_path if str(next_path).startswith("http") else self._url(str(next_path))
                continue

            cursor = None
            meta = payload.get("meta") or {}
            if isinstance(meta, dict):
                cursor = meta.get("cursor")
            if not cursor:
                break
            next_url = None
            time.sleep(0.1)
        return items

    def direct_children(self, content_id: str, content_type: str, depth: int) -> list[ContentItem]:
        content_type = normalize_content_type(content_type)
        path_template = DIRECT_CHILDREN_PATHS.get(content_type)
        if not path_template:
            return []

        items: list[ContentItem] = []
        next_url: str | None = None
        cursor: str | None = None
        while True:
            if next_url:
                payload = self.request_json(next_url)
            else:
                params: dict[str, Any] = {"limit": 250}
                if cursor:
                    params["cursor"] = cursor
                payload = self.request_json(path_template.format(id=content_id), params)

            for item in payload.get("results", []):
                item_type = normalize_content_type(str(item.get("type", "page")))
                items.append(
                    ContentItem(
                        id=str(item.get("id", "")),
                        title=str(item.get("title", "") or item.get("id", "")),
                        type=item_type,
                        parent_id=content_id,
                        depth=depth,
                        space_id=str(item.get("spaceId")) if item.get("spaceId") else None,
                    )
                )

            links = payload.get("_links", {})
            next_path = links.get("next")
            if next_path:
                next_url = next_path if str(next_path).startswith("http") else self._url(str(next_path))
                continue

            meta = payload.get("meta") or {}
            cursor = meta.get("cursor") if isinstance(meta, dict) else None
            if not cursor:
                break
            next_url = None
            time.sleep(0.1)
        return items

    def page(self, page_id: str, parent_id: str | None = None, depth: int = 0) -> PageRecord:
        payload = self.request_json(
            f"/wiki/api/v2/pages/{page_id}",
            {"body-format": self.config.body_format},
        )
        body = payload.get("body") or {}
        body_part = body.get(self.config.body_format) or body.get("storage") or body.get("atlas_doc_format") or {}
        body_value = ""
        if isinstance(body_part, dict):
            body_value = str(body_part.get("value", ""))
        elif isinstance(body_part, str):
            body_value = body_part

        body_text, headings, links = parse_storage_body(body_value)
        base_link = payload.get("_links", {}).get("base") or self.config.base_url
        webui = payload.get("_links", {}).get("webui") or f"/wiki/spaces/searchdata/pages/{page_id}"
        version = payload.get("version") or {}
        return PageRecord(
            id=str(payload.get("id", page_id)),
            title=str(payload.get("title", page_id)),
            url=urljoin(str(base_link).rstrip("/") + "/", str(webui).lstrip("/")),
            type=normalize_content_type(str(payload.get("type", "page"))),
            parent_id=str(parent_id) if parent_id is not None else None,
            depth=depth,
            space_id=str(payload.get("spaceId")) if payload.get("spaceId") else None,
            version_number=int(version["number"]) if version.get("number") is not None else None,
            fetched_at=utc_now(),
            body_text=body_text,
            body_storage=body_value,
            body_format=self.config.body_format,
            headings=headings,
            links=links,
        )

    def content_record(self, item: ContentItem) -> PageRecord:
        content_type = normalize_content_type(item.type)
        if content_type == "page":
            return self.page(item.id, parent_id=item.parent_id, depth=item.depth)

        payload: dict[str, Any] = {}
        path_template = DETAIL_PATHS.get(content_type)
        if path_template:
            try:
                payload = self.request_json(path_template.format(id=item.id))
            except AtlassianClientError:
                payload = {}

        title = str(payload.get("title") or item.title or item.id)
        base_link = payload.get("_links", {}).get("base") or self.config.base_url
        webui = payload.get("_links", {}).get("webui") or "/wiki"
        return PageRecord(
            id=item.id,
            title=title,
            url=urljoin(str(base_link).rstrip("/") + "/", str(webui).lstrip("/")),
            type=content_type,
            parent_id=item.parent_id,
            depth=item.depth,
            space_id=str(payload.get("spaceId") or item.space_id) if (payload.get("spaceId") or item.space_id) else None,
            version_number=None,
            fetched_at=utc_now(),
            body_text=f"{content_type} container: {title}",
            body_storage="",
            body_format=self.config.body_format,
            headings=(title,),
            links=(),
        )

    def crawl_roots(self, root_page_ids: tuple[str, ...]) -> list[PageRecord]:
        records: list[PageRecord] = []
        seen_records: set[str] = set()
        expanded: set[str] = set()

        for root in root_page_ids:
            root_id = page_id_from_url(root)
            root_page = self.page(root_id, parent_id=None, depth=0)
            if root_page.id not in seen_records:
                records.append(root_page)
                seen_records.add(root_page.id)

            queue: deque[tuple[str, str, int]] = deque([(root_page.id, root_page.type, 1)])
            while queue and len(records) < self.config.max_items:
                parent_id, parent_type, child_depth = queue.popleft()
                expand_key = f"{parent_type}:{parent_id}"
                if expand_key in expanded:
                    continue
                expanded.add(expand_key)

                for item in self.direct_children(parent_id, parent_type, child_depth):
                    if not item.id or len(records) >= self.config.max_items:
                        break
                    if item.id not in seen_records:
                        record = self.content_record(item)
                        records.append(record)
                        seen_records.add(record.id)
                        time.sleep(0.04)
                    if item.type in DIRECT_CHILDREN_PATHS:
                        queue.append((item.id, item.type, child_depth + 1))

            for item in self.descendants(root_id):
                if not item.id or item.id in seen_records or len(records) >= self.config.max_items:
                    continue
                record = self.content_record(item)
                records.append(record)
                seen_records.add(record.id)
                time.sleep(0.04)
        return records


def cursor_from_next_link(next_url: str) -> str | None:
    query = parse_qs(urlparse(next_url).query)
    values = query.get("cursor")
    return values[0] if values else None


def normalize_content_type(value: str) -> str:
    value = (value or "page").strip().lower()
    aliases = {
        "pages": "page",
        "folders": "folder",
        "databases": "database",
        "whiteboards": "whiteboard",
        "embeds": "embed",
        "smartlink": "embed",
        "smart_link": "embed",
    }
    return aliases.get(value, value)
