from __future__ import annotations

from datetime import date, datetime
from typing import Any


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if item is not None]
    return [str(value)]


def _normalize(value: Any) -> str:
    return str(value).strip().lower()


def _contains_normalized(values: list[str], candidate: Any) -> bool:
    normalized_candidate = _normalize(candidate)
    return any(_normalize(value) == normalized_candidate for value in values)


def _parse_date(value: Any) -> date | None:
    if value is None:
        return None
    if isinstance(value, date):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        try:
            return date.fromisoformat(value)
        except ValueError:
            return None
    return None


def _format_deadline(deadline: date) -> str:
    return deadline.strftime("%B %Y")


def _criteria_for(scholarship: dict[str, Any], criterion_type: str) -> list[dict[str, Any]]:
    criteria = scholarship.get("scholarship_criteria") or scholarship.get("criteria") or []
    return [
        criterion
        for criterion in criteria
        if _normalize(criterion.get("criterion_type")) == _normalize(criterion_type)
    ]


def _criterion_matches(value: Any, criterion: dict[str, Any]) -> bool:
    operator = _normalize(criterion.get("operator"))
    criterion_value = str(criterion.get("value", ""))
    candidate = str(value or "")

    if operator == "eq":
        return _normalize(candidate) == _normalize(criterion_value)
    if operator == "in":
        allowed_values = [item.strip() for item in criterion_value.split(",")]
        return _contains_normalized(allowed_values, candidate)
    if operator == "contains":
        return _normalize(candidate) in _normalize(criterion_value)
    return False


def _nationality_eligible(profile: dict[str, Any], scholarship: dict[str, Any]) -> bool:
    nationality = profile.get("nationality")
    nationality_criteria = _criteria_for(scholarship, "nationality")
    if not nationality_criteria:
        return False
    return any(_criterion_matches(nationality, criterion) for criterion in nationality_criteria)


def _cgpa_meets_minimum(profile: dict[str, Any], scholarship: dict[str, Any]) -> tuple[bool, str | None]:
    cgpa = profile.get("cgpa")
    if cgpa is None:
        return False, None

    try:
        student_cgpa = float(cgpa)
    except (TypeError, ValueError):
        return False, None

    for criterion in _criteria_for(scholarship, "cgpa"):
        if _normalize(criterion.get("operator")) != "gte":
            continue
        try:
            minimum_cgpa = float(criterion.get("value"))
        except (TypeError, ValueError):
            continue
        if student_cgpa >= minimum_cgpa:
            return True, f"{student_cgpa:g}"

    return False, None


def match_scholarships(
    profile: dict[str, Any],
    scholarships: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    matched_scholarships: list[dict[str, Any]] = []
    target_countries = _as_list(profile.get("target_countries"))
    target_degrees = _as_list(profile.get("target_degrees"))
    field_of_study = profile.get("field_of_study")

    for scholarship in scholarships:
        score = 0
        reasons: list[str] = []

        country = scholarship.get("country")
        if country and _contains_normalized(target_countries, country):
            score += 25
            reasons.append(f"Available in {country}, one of your target countries")

        degree_level = scholarship.get("degree_level")
        if degree_level and _contains_normalized(target_degrees, degree_level):
            score += 20
            reasons.append(f"Matches your {degree_level} degree goal")

        if _nationality_eligible(profile, scholarship):
            score += 20
            reasons.append(f"Open to students from {profile.get('nationality')}")

        cgpa_matches, cgpa_display = _cgpa_meets_minimum(profile, scholarship)
        if cgpa_matches and cgpa_display is not None:
            score += 15
            reasons.append(f"Your CGPA of {cgpa_display} meets the minimum requirement")

        scholarship_fields = _as_list(scholarship.get("fields"))
        if field_of_study and _contains_normalized(scholarship_fields, field_of_study):
            score += 10
            reasons.append(f"Supports your field of study: {field_of_study}")

        deadline = _parse_date(scholarship.get("deadline"))
        if deadline and deadline >= date.today():
            score += 10
            reasons.append(f"Deadline is {_format_deadline(deadline)} - you have time to apply")

        if score > 0:
            matched = dict(scholarship)
            matched["match_score"] = min(score, 100)
            matched["match_reasons"] = reasons
            matched_scholarships.append(matched)

    return sorted(
        matched_scholarships,
        key=lambda item: int(item.get("match_score", 0)),
        reverse=True,
    )
