#!/usr/bin/env python
"""Restricted LAN server for the Jarvis project user manual."""

from __future__ import annotations

import argparse
import mimetypes
import posixpath
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlparse


ALLOWED_PREFIXES = (
    "docs/",
    "architecture/",
    "agents/",
    "templates/",
    "skills/",
)

ALLOWED_EXACT = {
    "README.md",
    "AGENTS.md",
    ".clinerule",
    ".clinerules",
    ".windsurfrules",
    ".cursor/rules/jarvis-agent-team.mdc",
    ".github/copilot-instructions.md",
    "dashboards/agent-assignment-dashboard.html",
    "dashboards/agent-assignment-dashboard.md",
    "dashboards/task-event-schema.md",
}

BLOCKED_PARTS = {
    ".git",
    ".playwright-mcp",
    "decisions",
    "memory",
    "tmp",
    "work-requests",
}

ALLOWED_SUFFIXES = {
    ".css",
    ".gif",
    ".htm",
    ".html",
    ".ico",
    ".jpeg",
    ".jpg",
    ".js",
    ".md",
    ".mdc",
    ".png",
    ".svg",
    ".txt",
    ".webp",
}


def url_to_relative_path(url_path: str) -> str | None:
    parsed = urlparse(url_path)
    clean_path = unquote(parsed.path).replace("\\", "/")

    if clean_path in ("", "/"):
        return "docs/project-user-manual.html"

    if clean_path in ("/docs", "/docs/"):
        return "docs/project-user-manual.html"

    if clean_path.endswith("/"):
        return None

    normalized = posixpath.normpath(clean_path).lstrip("/")
    if normalized in ("", "."):
        return "docs/project-user-manual.html"

    parts = PurePosixPath(normalized).parts
    if any(part in ("", "..") for part in parts):
        return None

    return normalized


def is_allowed_path(relative_path: str) -> bool:
    if relative_path in ALLOWED_EXACT:
        return True

    parts = PurePosixPath(relative_path).parts
    if any(part in BLOCKED_PARTS for part in parts):
        return False

    if any(part.startswith(".") for part in parts):
        return False

    if not relative_path.startswith(ALLOWED_PREFIXES):
        return False

    suffix = Path(relative_path).suffix.lower()
    return suffix in ALLOWED_SUFFIXES


class ManualRequestHandler(SimpleHTTPRequestHandler):
    server_version = "JarvisManualLAN/1.0"

    def __init__(self, *args, directory: str | None = None, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def send_head(self):
        relative_path = url_to_relative_path(self.path)
        if not relative_path or not is_allowed_path(relative_path):
            self.send_error(403, "This path is not shared by the manual LAN server.")
            return None

        target = (Path(self.directory) / relative_path).resolve()
        root = Path(self.directory).resolve()

        if not target.is_file() or root not in target.parents:
            self.send_error(404, "File not found.")
            return None

        self.path = "/" + relative_path
        return super().send_head()

    def list_directory(self, path):
        self.send_error(403, "Directory listing is disabled.")
        return None

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def guess_type(self, path):
        suffix = Path(path).suffix.lower()
        if suffix == ".md":
            return "text/markdown; charset=utf-8"
        if suffix == ".mdc":
            return "text/plain; charset=utf-8"
        if suffix in ("", ".clinerule", ".clinerules", ".windsurfrules"):
            return "text/plain; charset=utf-8"
        return mimetypes.guess_type(path)[0] or "application/octet-stream"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument(
        "--root",
        default=str(Path(__file__).resolve().parents[1]),
        help="Repository root to serve restricted manual files from.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = Path(args.root).resolve()
    manual = root / "docs" / "project-user-manual.html"

    if not manual.is_file():
        raise SystemExit(f"Manual file not found: {manual}")

    handler = lambda *handler_args, **handler_kwargs: ManualRequestHandler(
        *handler_args,
        directory=str(root),
        **handler_kwargs,
    )
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(
        f"Serving Jarvis manual from {root} at http://{args.host}:{args.port}/docs/project-user-manual.html",
        flush=True,
    )
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
