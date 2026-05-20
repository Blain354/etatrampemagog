"""Scrape Magog city alerts for boat ramp (mise à l'eau) status."""

from __future__ import annotations

import re
import time
from datetime import datetime, timezone
from enum import Enum
from html import unescape
from typing import Final

import httpx
from pydantic import BaseModel, Field

MAGOG_AVIS_URL: Final[str] = (
    "https://www.ville.magog.qc.ca/informations-services/avis-important/"
)
CACHE_TTL_SECONDS: Final[int] = 300
USER_AGENT: Final[str] = "RampeMagogEtat/1.0 (+https://rampe-magog-etat.blain-projects.ca)"

FRENCH_MONTHS: Final[dict[str, int]] = {
    "janvier": 1,
    "février": 2,
    "fevrier": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "août": 8,
    "aout": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "décembre": 12,
    "decembre": 12,
}

FRENCH_MONTH_PATTERN: Final[str] = "|".join(FRENCH_MONTHS.keys())

_cache: dict[str, object] = {"expires_at": 0.0, "payload": None}


class RampStatusValue(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    UNKNOWN = "unknown"


class RampStatusResponse(BaseModel):
    status: RampStatusValue
    label: str = Field(description="Human-readable status in French")
    reopening_date: str | None = Field(
        default=None,
        description="ISO 8601 date (YYYY-MM-DD) when ramp reopens, if closed",
    )
    reopening_date_display: str | None = Field(
        default=None,
        description="French display date for UI",
    )
    source_url: str
    fetched_at: datetime
    excerpt: str | None = Field(
        default=None,
        description="Relevant text snippet from the municipal page",
    )


def _strip_html(html: str) -> str:
    without_scripts = re.sub(
        r"<(script|style|noscript)[^>]*>.*?</\1>",
        " ",
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    without_tags = re.sub(r"<[^>]+>", " ", without_scripts)
    normalized = unescape(without_tags)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def _find_ramp_excerpt(text: str) -> str | None:
    lowered = text.lower()
    ramp_index = lowered.find("rampe")
    if ramp_index == -1:
        return None

    start = max(0, ramp_index - 120)
    end = min(len(text), ramp_index + 420)
    excerpt = text[start:end].strip()

    if "mise" not in excerpt.lower() and "eau" not in excerpt.lower():
        wider_end = min(len(text), ramp_index + 800)
        excerpt = text[start:wider_end].strip()

    return excerpt if excerpt else None


def _is_closed(excerpt: str) -> bool:
    lowered = excerpt.lower()
    if re.search(r"\bferm[ée]e?s?\b", lowered):
        return True
    return bool(re.search(r"\bindisponible\b", lowered))


def _is_open(excerpt: str) -> bool:
    lowered = excerpt.lower()
    if re.search(r"\bferm[ée]e?s?\b", lowered):
        return False
    if re.search(r"\bouvert[e]?\b", lowered):
        return True
    if re.search(r"\baccessible\b", lowered):
        return True
    return False


def _parse_french_date(day: str, month_name: str, year: str | None) -> datetime | None:
    month_key = month_name.lower().replace("é", "e")
    month_key = month_key.replace("û", "u").replace("ô", "o")
    month = FRENCH_MONTHS.get(month_name.lower())
    if month is None:
        for key, value in FRENCH_MONTHS.items():
            if key.replace("é", "e").replace("û", "u") == month_key:
                month = value
                break
    if month is None:
        return None

    resolved_year = int(year) if year else datetime.now(timezone.utc).year
    try:
        return datetime(resolved_year, month, int(day), tzinfo=timezone.utc)
    except ValueError:
        return None


def _extract_reopening_date(excerpt: str) -> tuple[str | None, str | None]:
    patterns = [
        rf"réouverture[^.]*?(?:le\s+)?(\d{{1,2}})\s+({FRENCH_MONTH_PATTERN})(?:\s+(\d{{4}}))?",
        rf"réouverture[^.]*?(?:le\s+)?(\d{{1,2}})[/-](\d{{1,2}})[/-](\d{{4}})",
        rf"jusqu[''']?au\s+(\d{{1,2}})\s+({FRENCH_MONTH_PATTERN})(?:\s+(\d{{4}}))?",
        rf"prévue\s+(?:le\s+)?(\d{{1,2}})\s+({FRENCH_MONTH_PATTERN})(?:\s+(\d{{4}}))?",
        rf"(\d{{1,2}})\s+({FRENCH_MONTH_PATTERN})\s+(\d{{4}})",
    ]

    for pattern in patterns:
        match = re.search(pattern, excerpt, re.IGNORECASE)
        if not match:
            continue

        groups = match.groups()
        if len(groups) == 3 and groups[1].isdigit():
            day, month_num, year = groups
            try:
                parsed = datetime(
                    int(year), int(month_num), int(day), tzinfo=timezone.utc
                )
            except ValueError:
                continue
        else:
            day, month_name, year = groups[0], groups[1], groups[2] if len(groups) > 2 else None
            parsed = _parse_french_date(day, month_name, year)
            if parsed is None:
                continue

        iso_date = parsed.date().isoformat()
        month_display = month_name if not month_name.isdigit() else _month_name_fr(parsed.month)
        display = f"{int(day)} {month_display} {parsed.year}"
        return iso_date, display

    return None, None


def _month_name_fr(month: int) -> str:
    names = [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
    ]
    return names[month - 1]


def parse_ramp_status_from_html(html: str, *, source_url: str = MAGOG_AVIS_URL) -> RampStatusResponse:
    """Parse municipal HTML and derive ramp status."""
    text = _strip_html(html)
    excerpt = _find_ramp_excerpt(text)
    fetched_at = datetime.now(timezone.utc)

    if excerpt is None:
        return RampStatusResponse(
            status=RampStatusValue.OPEN,
            label="Ouverte",
            source_url=source_url,
            fetched_at=fetched_at,
            excerpt=None,
        )

    closed = _is_closed(excerpt)
    open_status = _is_open(excerpt)

    if closed:
        iso_date, display_date = _extract_reopening_date(excerpt)
        return RampStatusResponse(
            status=RampStatusValue.CLOSED,
            label="Fermée",
            reopening_date=iso_date,
            reopening_date_display=display_date,
            source_url=source_url,
            fetched_at=fetched_at,
            excerpt=excerpt,
        )

    if open_status:
        return RampStatusResponse(
            status=RampStatusValue.OPEN,
            label="Ouverte",
            source_url=source_url,
            fetched_at=fetched_at,
            excerpt=excerpt,
        )

    return RampStatusResponse(
        status=RampStatusValue.UNKNOWN,
        label="Statut inconnu",
        source_url=source_url,
        fetched_at=fetched_at,
        excerpt=excerpt,
    )


async def fetch_ramp_status(*, force_refresh: bool = False) -> RampStatusResponse:
    """Fetch and parse ramp status, with a short in-memory cache."""
    now = time.monotonic()
    cached = _cache.get("payload")
    expires_at = float(_cache.get("expires_at", 0.0))

    if not force_refresh and cached is not None and now < expires_at:
        return cached  # type: ignore[return-value]

    async with httpx.AsyncClient(
        timeout=30.0,
        follow_redirects=True,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "fr-CA,fr;q=0.9"},
    ) as client:
        response = await client.get(MAGOG_AVIS_URL)
        response.raise_for_status()
        html = response.text

    payload = parse_ramp_status_from_html(html)
    _cache["payload"] = payload
    _cache["expires_at"] = now + CACHE_TTL_SECONDS
    return payload


def clear_ramp_status_cache() -> None:
    """Reset cache (for tests)."""
    _cache["expires_at"] = 0.0
    _cache["payload"] = None
