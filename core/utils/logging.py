from __future__ import annotations

import structlog


def get_logger(name: str | None = None):
    """Return a structlog logger with an optional custom name."""
    if name:
        return structlog.get_logger(name)
    return structlog.get_logger()

