"""
curriculum_analysis.py

Analyzes a candidate's mission history and creates
an interview-ready topic profile.
"""

from typing import Any, Dict, List


# ---------------------------------------------------------
# Curriculum information
# ---------------------------------------------------------

DAY_INFO: Dict[int, Dict[str, Any]] = {
    10: {
        "title": "Retrieval / RAG",
        "module": "Retrieval",
        "tools": [
            "Python",
            "Vector Database",
            "Embeddings"
        ]
    },

    12: {
        "title": "Prompt Engineering",
        "module": "LLM & Prompting",
        "tools": [
            "LLMs",
            "Prompt Engineering"
        ]
    },

    13: {
        "title": "AI Agents",
        "module": "Agents",
        "tools": [
            "LLM",
            "Agents",
            "Tools"
        ]
    },

    22: {
        "title": "Model Context Protocol",
        "module": "MCP",
        "tools": [
            "MCP"
        ]
    },

    23: {
        "title": "AI Security",
        "module": "Security",
        "tools": [
            "Authentication",
            "Security"
        ]
    },

    27: {
        "title": "Deployment",
        "module": "Deployment",
        "tools": [
            "Docker",
            "Cloud"
        ]
    },

    28: {
        "title": "Production AI Systems",
        "module": "Deployment",
        "tools": [
            "APIs",
            "Cloud",
            "Monitoring"
        ]
    }
}


# Day → Module
DAY_TO_MODULE: Dict[int, str] = {
    day: info["module"]
    for day, info in DAY_INFO.items()
}


# ---------------------------------------------------------
# Thresholds
# ---------------------------------------------------------

HIGH_ATTEMPTS_THRESHOLD = 4
FIRST_TRY_MAX = 1


# ---------------------------------------------------------
# Build topic profile
# ---------------------------------------------------------

def build_topic_profile(
    candidate: Dict[str, Any]
) -> Dict[str, Any]:

    missions: List[Dict[str, Any]] = candidate.get(
        "missions",
        []
    )

    strong: List[Dict[str, Any]] = []
    weak: List[Dict[str, Any]] = []
    skipped: List[Dict[str, Any]] = []

    touched_days = set()

    # -----------------------------------------------------
    # Analyze missions
    # -----------------------------------------------------

    for mission in missions:

        day = mission.get("day")

        if day is None:
            continue

        touched_days.add(day)

        day_info = DAY_INFO.get(day, {})

        title = (
            mission.get("title")
            or day_info.get("title")
            or f"Day {day}"
        )

        module = DAY_TO_MODULE.get(
            day,
            "General"
        )

        entry: Dict[str, Any] = {
            "day": day,
            "title": title,
            "module": module,
            "tools": day_info.get(
                "tools",
                []
            )
        }

        # Skipped
        if mission.get("skipped") is True:

            skipped.append(entry)

        # Failed
        elif mission.get("passed") is False:

            entry["attempts"] = mission.get(
                "attempts",
                0
            )

            weak.append(entry)

        # Passed
        elif mission.get("passed") is True:

            attempts = mission.get(
                "attempts",
                1
            )

            entry["attempts"] = attempts

            if attempts >= HIGH_ATTEMPTS_THRESHOLD:

                weak.append(entry)

            else:

                strong.append(entry)

    # -----------------------------------------------------
    # Core topics never attempted
    # -----------------------------------------------------

    core_days = [
        10,
        12,
        13,
        22,
        23,
        27,
        28
    ]

    unattempted: List[Dict[str, Any]] = []

    for day in core_days:

        if day not in touched_days:

            info = DAY_INFO.get(day)

            if info is None:
                continue

            unattempted.append({
                "day": day,
                "title": info["title"],
                "module": info["module"],
                "tools": info.get(
                    "tools",
                    []
                )
            })

    # -----------------------------------------------------
    # Candidate signals
    # -----------------------------------------------------

    signals = candidate.get(
        "signals",
        {}
    )

    # -----------------------------------------------------
    # Return profile
    # -----------------------------------------------------

    return {
        "member": candidate.get(
            "member",
            {}
        ),
        "strong": strong,
        "weak": weak,
        "skipped": skipped,
        "unattempted": unattempted,
        "signals": signals
    }