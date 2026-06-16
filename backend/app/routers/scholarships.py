from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from postgrest.exceptions import APIError

from app.db.client import db
from app.models.scholarship import MatchResponse, Scholarship
from app.services.matcher import match_scholarships


router = APIRouter(prefix="/scholarships", tags=["scholarships"])


def _table(name: str) -> Any:
    try:
        return db.table(name)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


def _execute_query(query: Any) -> Any:
    try:
        return query.execute()
    except APIError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/matches", response_model=MatchResponse)
def get_scholarship_matches(user_id: str) -> MatchResponse:
    profile_response = _execute_query(
        _table("student_profiles").select("*").eq("user_id", user_id).maybe_single()
    )
    profile = profile_response.data
    if profile is None:
        raise HTTPException(status_code=404, detail="Student profile not found")

    scholarships_response = _execute_query(
        _table("scholarships")
        .select("*, scholarship_criteria(*)")
        .eq("status", "verified")
    )
    scholarships = scholarships_response.data or []
    matches = match_scholarships(profile, scholarships)

    return MatchResponse(scholarships=matches, total=len(matches))


@router.get("/{scholarship_id}", response_model=Scholarship)
def get_scholarship(scholarship_id: str) -> dict[str, Any]:
    response = _execute_query(
        _table("scholarships")
        .select("*, scholarship_criteria(*)")
        .eq("id", scholarship_id)
        .maybe_single()
    )
    scholarship = response.data
    if scholarship is None:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    return scholarship


@router.get("", response_model=list[Scholarship])
def list_scholarships(
    country: Optional[str] = None,
    degree_level: Optional[str] = None,
    limit: int = Query(default=20, ge=1, le=100),
) -> list[dict[str, Any]]:
    query = _table("scholarships").select("*, scholarship_criteria(*)").eq("status", "verified")

    if country:
        query = query.eq("country", country)
    if degree_level:
        query = query.eq("degree_level", degree_level)

    response = _execute_query(query.limit(limit))
    return response.data or []
