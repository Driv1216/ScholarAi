from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")


def _frontend_origins() -> tuple[str, ...]:
    configured_origins = os.getenv("FRONTEND_URLS", os.getenv("FRONTEND_URL", "http://localhost:5173"))
    origins = {origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()}

    # Browsers treat localhost and 127.0.0.1 as different origins. Allow both for local development.
    for origin in tuple(origins):
        parsed = urlsplit(origin)
        if parsed.hostname not in {"localhost", "127.0.0.1"}:
            continue

        alternate_host = "127.0.0.1" if parsed.hostname == "localhost" else "localhost"
        port = f":{parsed.port}" if parsed.port else ""
        origins.add(urlunsplit((parsed.scheme, f"{alternate_host}{port}", parsed.path, "", "")))

    return tuple(sorted(origins))


@dataclass(frozen=True)
class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    FRONTEND_ORIGINS: tuple[str, ...] = _frontend_origins()
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")


settings = Settings()
