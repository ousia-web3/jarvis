from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from atlassian_kg.config import load_config, load_env_file, parse_csv


class ConfigTests(unittest.TestCase):
    def test_parse_csv(self) -> None:
        self.assertEqual(parse_csv("1, 2,,3"), ("1", "2", "3"))

    def test_load_env_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / ".env"
            path.write_text("ATLASSIAN_EMAIL=a@example.com\nAPP_PORT=9000\n", encoding="utf-8")
            values = load_env_file(path)
        self.assertEqual(values["ATLASSIAN_EMAIL"], "a@example.com")
        self.assertEqual(values["APP_PORT"], "9000")

    def test_load_config_placeholder_token_is_not_configured(self) -> None:
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / ".env"
            path.write_text(
                "\n".join(
                    [
                        "ATLASSIAN_EMAIL=your-email@example.com",
                        "ATLASSIAN_API_TOKEN=REPLACE_WITH_ROTATED_TOKEN",
                        "APP_DB_PATH=data/test.sqlite3",
                    ]
                ),
                encoding="utf-8",
            )
            with patch.dict("os.environ", {}, clear=True):
                config = load_config(path)
        self.assertFalse(config.token_configured)
        self.assertFalse(config.email_configured)
        self.assertFalse(config.auto_sync_enabled)
        self.assertEqual(config.auto_sync_interval_minutes, 360)
        self.assertFalse(config.auto_sync_run_on_startup)
        self.assertEqual(config.manual_sync_allowed_hosts, ())


if __name__ == "__main__":
    unittest.main()
