"""
llm_client.py

Thin LLM abstraction used by the interview engine.

- If ANTHROPIC_API_KEY is set in the environment, real calls are made to
  Claude via the Anthropic SDK.
- If no key is available, a deterministic fallback is used so the app
  can still run locally without crashing.

Every call site in the app goes through generate_text() / generate_json().
"""

import json
import os
import re
from typing import Any, Optional


MODEL = os.environ.get("INTERVIEW_LLM_MODEL", "claude-sonnet-4-5")
_api_key = os.environ.get("ANTHROPIC_API_KEY")

_client = None

if _api_key:
    try:
        import anthropic

        _client = anthropic.Anthropic(api_key=_api_key)
    except Exception:
        _client = None


def llm_available() -> bool:
    return _client is not None


def generate_text(
    system: str,
    user: str,
    max_tokens: int = 500
) -> Optional[str]:
    """Return raw text from the LLM, or None if no LLM is configured/reachable."""

    if not _client:
        return None

    try:
        resp = _client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            system=system,
            messages=[
                {
                    "role": "user",
                    "content": user
                }
            ],
        )

        parts = [
            block.text
            for block in resp.content
            if getattr(block, "type", "") == "text"
        ]

        return "\n".join(parts).strip()

    except Exception:
        return None


def generate_json(
    system: str,
    user: str,
    max_tokens: int = 800
) -> Optional[Any]:
    """Ask the LLM for JSON-only output and parse it."""

    strict_system = (
        system
        + "\n\nRespond with ONLY valid JSON. "
          "No markdown fences, no preamble, no commentary."
    )

    raw = generate_text(
        strict_system,
        user,
        max_tokens=max_tokens
    )

    if raw is None:
        return None

    # Remove markdown code fences if the model accidentally adds them
    cleaned = re.sub(
        r"^```(?:json)?|```$",
        "",
        raw.strip(),
        flags=re.MULTILINE
    ).strip()

    # First try parsing the entire response
    try:
        return json.loads(cleaned)

    except Exception:
        # If extra text exists, try extracting an object or array
        match = re.search(
            r"\{.*\}|\[.*\]",
            cleaned,
            re.DOTALL
        )

        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None

    return None
