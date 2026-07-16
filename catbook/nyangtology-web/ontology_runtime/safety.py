from __future__ import annotations

from pathlib import Path
from typing import Iterable


class SafetyError(ValueError):
    """Raised when a request violates the local read-only safety boundary."""


CATBOOK_ROOT = Path(__file__).resolve().parent
MAX_LIST_LIMIT = 100
MAX_EDGE_LIMIT = 500
MAX_EVIDENCE_LIMIT = 50
MAX_ARTIFACT_CHARS = 200_000
DEFAULT_ARTIFACT_CHARS = 40_000
SENSITIVE_CLASSES = {"HealthObservation", "SafetyRisk"}


def clamp_int(value, *, default: int, minimum: int, maximum: int, name: str) -> int:
    if value is None:
        return default
    if isinstance(value, bool):
        raise SafetyError(f"{name} must be an integer.")
    try:
        numeric = int(value)
    except (TypeError, ValueError) as error:
        raise SafetyError(f"{name} must be an integer.") from error
    return max(minimum, min(maximum, numeric))


def require_non_empty_string(value, *, name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise SafetyError(f"{name} must be a non-empty string.")
    return value.strip()


def resolve_within_catbook(path: Path) -> Path:
    resolved = path.resolve()
    root = CATBOOK_ROOT.resolve()
    if resolved != root and root not in resolved.parents:
        raise SafetyError(f"Path is outside MCP package root: {resolved}")
    return resolved


def escape_like(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def safety_notes_for_nodes(nodes: Iterable[dict]) -> list[str]:
    sensitive = []
    for node in nodes:
        if node.get("class") in SENSITIVE_CLASSES or node.get("medical"):
            sensitive.append(node.get("label") or node.get("id") or "unknown")
    if not sensitive:
        return []
    preview = ", ".join(sensitive[:5])
    suffix = "" if len(sensitive) <= 5 else f" and {len(sensitive) - 5} more"
    return [
        "Safety filter: health and safety concepts are observation/record/consultation guidance only, not diagnosis or treatment.",
        f"Sensitive concepts included: {preview}{suffix}.",
    ]
