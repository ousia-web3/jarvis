from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def parse_csv(value: str | None) -> tuple[str, ...]:
    if not value:
        return ()
    return tuple(item.strip() for item in value.split(",") if item.strip())


def load_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        values[key] = value
    return values


@dataclass(frozen=True)
class AppConfig:
    base_url: str
    email: str
    api_token: str
    root_page_ids: tuple[str, ...]
    body_format: str
    descendant_depth: int
    max_items: int
    db_path: Path
    host: str
    port: int
    public_base_url: str
    manual_sync_enabled: bool
    manual_sync_allowed_hosts: tuple[str, ...]
    sample_load_enabled: bool
    auto_sync_enabled: bool
    auto_sync_interval_minutes: int
    auto_sync_run_on_startup: bool
    allow_external_llm: bool
    llm_provider: str
    openai_api_key: str

    @property
    def token_configured(self) -> bool:
        token = self.api_token.strip()
        return bool(token and token != "REPLACE_WITH_ROTATED_TOKEN")

    @property
    def email_configured(self) -> bool:
        return bool(self.email.strip() and self.email != "your-email@example.com")

    @property
    def confluence_configured(self) -> bool:
        return self.token_configured and self.email_configured and bool(self.base_url)


def load_config(env_path: str | Path | None = None) -> AppConfig:
    path = Path(env_path) if env_path else PROJECT_ROOT / ".env"
    file_values = load_env_file(path)

    def get(name: str, default: str = "") -> str:
        return os.environ.get(name, file_values.get(name, default))

    db_path = Path(get("APP_DB_PATH", "data/knowledge_graph.sqlite3"))
    if not db_path.is_absolute():
        db_path = PROJECT_ROOT / db_path

    return AppConfig(
        base_url=get("ATLASSIAN_BASE_URL", "https://wiki-hanatour.atlassian.net").rstrip("/"),
        email=get("ATLASSIAN_EMAIL", "your-email@example.com"),
        api_token=get("ATLASSIAN_API_TOKEN", ""),
        root_page_ids=parse_csv(get("CONFLUENCE_ROOT_PAGE_IDS", "3635315029,3501490259")),
        body_format=get("CONFLUENCE_BODY_FORMAT", "storage"),
        descendant_depth=min(10, int(get("CONFLUENCE_DESCENDANT_DEPTH", "10"))),
        max_items=int(get("CONFLUENCE_MAX_ITEMS", "5000")),
        db_path=db_path,
        host=get("APP_HOST", "127.0.0.1"),
        port=int(get("APP_PORT", "8822")),
        public_base_url=get("APP_PUBLIC_BASE_URL", ""),
        manual_sync_enabled=parse_bool(get("ENABLE_MANUAL_SYNC"), default=True),
        manual_sync_allowed_hosts=parse_csv(get("MANUAL_SYNC_ALLOWED_HOSTS", "")),
        sample_load_enabled=parse_bool(get("ENABLE_SAMPLE_LOAD"), default=True),
        auto_sync_enabled=parse_bool(get("AUTO_SYNC_ENABLED"), default=False),
        auto_sync_interval_minutes=max(15, int(get("AUTO_SYNC_INTERVAL_MINUTES", "360"))),
        auto_sync_run_on_startup=parse_bool(get("AUTO_SYNC_RUN_ON_STARTUP", "false"), default=False),
        allow_external_llm=parse_bool(get("ALLOW_EXTERNAL_LLM"), default=False),
        llm_provider=get("LLM_PROVIDER", "none"),
        openai_api_key=get("OPENAI_API_KEY", ""),
    )
