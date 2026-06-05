from __future__ import annotations

import argparse
import json

from .config import load_config
from .pipeline import sync
from .server import run_server
from .storage import KnowledgeStore


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Connected Wiki Content Knowledge Graph")
    parser.add_argument("--env", default=None, help="Path to .env file")
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init-db", help="Initialize the SQLite database")

    sync_parser = sub.add_parser("sync", help="Sync Confluence pages")
    sync_parser.add_argument("--sample", action="store_true", help="Load built-in sample data instead of calling Atlassian")

    serve_parser = sub.add_parser("serve", help="Run the local full-stack server")
    serve_parser.add_argument("--host", default=None)
    serve_parser.add_argument("--port", type=int, default=None)

    sub.add_parser("status", help="Print current local app status")

    args = parser.parse_args(argv)
    config = load_config(args.env)

    if args.command == "init-db":
        KnowledgeStore(config.db_path).initialize()
        print(f"Initialized {config.db_path}")
        return 0

    if args.command == "sync":
        result = sync(config, sample=args.sample)
        print(json.dumps(result.__dict__, ensure_ascii=False, indent=2))
        return 0 if result.status == "success" else 1

    if args.command == "serve":
        if args.host or args.port:
            config = type(config)(
                base_url=config.base_url,
                email=config.email,
                api_token=config.api_token,
                root_page_ids=config.root_page_ids,
                body_format=config.body_format,
                descendant_depth=config.descendant_depth,
                max_items=config.max_items,
                db_path=config.db_path,
                host=args.host or config.host,
                port=args.port or config.port,
                public_base_url=config.public_base_url,
                manual_sync_enabled=config.manual_sync_enabled,
                manual_sync_allowed_hosts=config.manual_sync_allowed_hosts,
                sample_load_enabled=config.sample_load_enabled,
                auto_sync_enabled=config.auto_sync_enabled,
                auto_sync_interval_minutes=config.auto_sync_interval_minutes,
                auto_sync_run_on_startup=config.auto_sync_run_on_startup,
                allow_external_llm=config.allow_external_llm,
                llm_provider=config.llm_provider,
                openai_api_key=config.openai_api_key,
            )
        run_server(config)
        return 0

    if args.command == "status":
        store = KnowledgeStore(config.db_path)
        payload = {
            "dbPath": str(config.db_path),
            "baseUrl": config.base_url,
            "rootPageIds": config.root_page_ids,
            "tokenConfigured": config.token_configured,
            "emailConfigured": config.email_configured,
            "publicBaseUrl": config.public_base_url,
            "manualSyncEnabled": config.manual_sync_enabled,
            "manualSyncAllowedHosts": config.manual_sync_allowed_hosts,
            "sampleLoadEnabled": config.sample_load_enabled,
            "autoSyncEnabled": config.auto_sync_enabled,
            "autoSyncIntervalMinutes": config.auto_sync_interval_minutes,
            "autoSyncRunOnStartup": config.auto_sync_run_on_startup,
            "latestRuns": store.latest_runs(),
            "pageCount": len(store.pages()),
            "ideaCount": len(store.ideas()),
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
