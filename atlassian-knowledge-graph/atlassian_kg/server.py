from __future__ import annotations

import json
import mimetypes
import threading
import time
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .config import AppConfig, PROJECT_ROOT, load_config
from .graph import training_cards
from .pipeline import sync
from .storage import KnowledgeStore


WEB_ROOT = PROJECT_ROOT / "web"
SCHEDULER_LOCK = threading.Lock()
SCHEDULER_THREAD: threading.Thread | None = None
SCHEDULER_STATE: dict[str, object] = {
    "enabled": False,
    "running": False,
    "status": "disabled",
    "mode": "manual",
    "intervalMinutes": 0,
    "runOnStartup": False,
    "autoReloadHint": False,
    "lastStartedAt": "",
    "lastEndedAt": "",
    "nextRunAt": "",
    "message": "자동 갱신이 비활성화되어 있습니다.",
}


class JsonResponseMixin:
    def send_json(self, payload: dict | list, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class KnowledgeGraphHandler(BaseHTTPRequestHandler, JsonResponseMixin):
    config: AppConfig

    def log_message(self, format: str, *args: object) -> None:
        return

    @property
    def store(self) -> KnowledgeStore:
        return KnowledgeStore(self.config.db_path)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed.path)
            return
        self.serve_static(parsed.path)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/sync":
            if not self.manual_sync_allowed():
                self.send_json({"error": "Manual sync is disabled for this access URL"}, status=403)
                return
            result = sync(self.config, sample=False)
            status = 200 if result.status == "success" else 400
            self.send_json(result.__dict__, status=status)
            return
        if parsed.path == "/api/sample":
            if not self.config.sample_load_enabled:
                self.send_json({"error": "Sample load is disabled in this deployment"}, status=403)
                return
            result = sync(self.config, sample=True)
            self.send_json(result.__dict__)
            return
        self.send_json({"error": "Not found"}, status=404)

    def handle_api_get(self, path: str) -> None:
        store = self.store
        if path == "/api/health":
            self.send_json(
                {
                    "ok": True,
                    "dbPath": str(self.config.db_path),
                    "rootPageIds": self.config.root_page_ids,
                    "baseUrl": self.config.base_url,
                    "publicBaseUrl": self.config.public_base_url,
                    "tokenConfigured": self.config.token_configured,
                    "emailConfigured": self.config.email_configured,
                    "manualSyncEnabled": self.config.manual_sync_enabled,
                    "manualSyncAllowed": self.manual_sync_allowed(),
                    "manualSyncAllowedHosts": self.config.manual_sync_allowed_hosts,
                    "sampleLoadEnabled": self.config.sample_load_enabled,
                    "autoSyncEnabled": self.config.auto_sync_enabled,
                    "autoSyncIntervalMinutes": self.config.auto_sync_interval_minutes,
                    "autoSyncRunOnStartup": self.config.auto_sync_run_on_startup,
                    "scheduler": scheduler_snapshot(),
                    "allowExternalLlm": self.config.allow_external_llm,
                    "latestRuns": store.latest_runs(),
                }
            )
            return
        if path == "/api/pages":
            self.send_json({"pages": store.pages(), "runs": store.latest_runs()})
            return
        if path == "/api/graph":
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)
            mode = (query.get("mode") or ["semantic"])[0]
            topic = (query.get("topic") or [""])[0]
            self.send_json(store.graph(mode=mode, topic=topic))
            return
        if path == "/api/hub":
            self.send_json(store.hub())
            return
        if path == "/api/coverage":
            self.send_json(store.coverage(self.config.root_page_ids))
            return
        if path == "/api/scheduler":
            self.send_json(scheduler_snapshot())
            return
        if path == "/api/ideas":
            self.send_json({"ideas": store.ideas()})
            return
        if path == "/api/search":
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)
            term = (query.get("q") or [""])[0]
            self.send_json(store.search(term))
            return
        if path == "/api/training":
            self.send_json({"cards": training_cards(store.pages())})
            return
        self.send_json({"error": "Not found"}, status=404)

    def manual_sync_allowed(self) -> bool:
        if not self.config.manual_sync_enabled:
            return False
        allowed_hosts = {host.lower() for host in self.config.manual_sync_allowed_hosts}
        if not allowed_hosts:
            return True
        request_host = normalize_host(self.headers.get("Host", ""))
        return "*" in allowed_hosts or request_host in allowed_hosts

    def serve_static(self, path: str) -> None:
        if path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        if path in {"", "/"}:
            target = WEB_ROOT / "index.html"
        else:
            target = (WEB_ROOT / path.lstrip("/")).resolve()
            if not str(target).startswith(str(WEB_ROOT.resolve())):
                self.send_error(403)
                return

        if not target.exists() or target.is_dir():
            self.send_error(404)
            return

        content_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
        body = target.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def make_server(config: AppConfig) -> ThreadingHTTPServer:
    KnowledgeGraphHandler.config = config
    KnowledgeStore(config.db_path).initialize()
    start_scheduler(config)
    return ThreadingHTTPServer((config.host, config.port), KnowledgeGraphHandler)


def run_server(config: AppConfig | None = None) -> None:
    cfg = config or load_config()
    server = make_server(cfg)
    print(f"Connected Wiki Content Knowledge Graph running at http://{cfg.host}:{cfg.port}")
    server.serve_forever()


def scheduler_snapshot() -> dict[str, object]:
    with SCHEDULER_LOCK:
        return dict(SCHEDULER_STATE)


def update_scheduler_state(**values: object) -> None:
    with SCHEDULER_LOCK:
        SCHEDULER_STATE.update(values)


def normalize_host(value: str) -> str:
    host = value.strip().lower()
    if not host:
        return ""
    if host.startswith("["):
        end = host.find("]")
        return host[1:end] if end != -1 else host.strip("[]")
    return host.split(":", 1)[0]


def start_scheduler(config: AppConfig) -> None:
    global SCHEDULER_THREAD
    if not config.auto_sync_enabled:
        update_scheduler_state(
            enabled=False,
            running=False,
            status="disabled",
            mode="manual",
            intervalMinutes=config.auto_sync_interval_minutes,
            runOnStartup=False,
            autoReloadHint=False,
            nextRunAt="",
            message="자동 갱신이 비활성화되어 있습니다. AUTO_SYNC_ENABLED=true 설정 시 주기적으로 읽기 전용 동기화를 실행합니다.",
        )
        return
    if not config.confluence_configured:
        update_scheduler_state(
            enabled=False,
            running=False,
            status="blocked",
            mode="scheduled",
            intervalMinutes=config.auto_sync_interval_minutes,
            runOnStartup=config.auto_sync_run_on_startup,
            autoReloadHint=False,
            nextRunAt="",
            message="Atlassian 이메일 또는 API 토큰이 없어 자동 갱신을 시작하지 않았습니다.",
        )
        return
    if SCHEDULER_THREAD and SCHEDULER_THREAD.is_alive():
        return
    interval_seconds = max(15, config.auto_sync_interval_minutes) * 60
    next_run = datetime.now(timezone.utc) + timedelta(seconds=interval_seconds)
    update_scheduler_state(
        enabled=True,
        running=False,
        status="waiting",
        mode="scheduled",
        intervalMinutes=config.auto_sync_interval_minutes,
        runOnStartup=config.auto_sync_run_on_startup,
        autoReloadHint=True,
        nextRunAt=next_run.isoformat(),
        message="다음 자동 갱신을 대기 중입니다.",
    )

    def loop() -> None:
        if config.auto_sync_run_on_startup:
            run_scheduled_sync(config)
            next_run_at = datetime.now(timezone.utc) + timedelta(seconds=interval_seconds)
            update_scheduler_state(
                running=False,
                status="waiting",
                nextRunAt=next_run_at.isoformat(),
                message="서버 시작 동기화가 끝났고 다음 자동 갱신을 대기 중입니다.",
            )
        while True:
            time.sleep(interval_seconds)
            run_scheduled_sync(config)
            next_run_at = datetime.now(timezone.utc) + timedelta(seconds=interval_seconds)
            update_scheduler_state(
                running=False,
                status="waiting",
                nextRunAt=next_run_at.isoformat(),
                message="다음 자동 갱신을 대기 중입니다.",
            )

    SCHEDULER_THREAD = threading.Thread(target=loop, name="atlassian-kg-auto-sync", daemon=True)
    SCHEDULER_THREAD.start()


def run_scheduled_sync(config: AppConfig) -> None:
    started = datetime.now(timezone.utc).isoformat()
    update_scheduler_state(
        running=True,
        status="running",
        lastStartedAt=started,
        message="자동 갱신 실행 중입니다.",
    )
    try:
        result = sync(config, sample=False)
        ended = datetime.now(timezone.utc).isoformat()
        update_scheduler_state(
            running=False,
            status=result.status,
            lastEndedAt=ended,
            message=result.message,
        )
    except Exception as exc:
        ended = datetime.now(timezone.utc).isoformat()
        update_scheduler_state(
            running=False,
            status="failed",
            lastEndedAt=ended,
            message=f"자동 갱신 실패: {exc}",
        )
