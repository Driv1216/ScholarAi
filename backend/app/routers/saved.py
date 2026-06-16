from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field

from app.db.client import db
from app.models.scholarship import MatchedScholarship


router = APIRouter(prefix="/saved", tags=["saved"])


class SaveScholarshipRequest(BaseModel):
    user_id: str
    scholarship_id: str
    match_score: int = Field(ge=0, le=100)
    match_reason: str = ""


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


def _normalize_saved_scholarship(saved_row: dict[str, Any]) -> dict[str, Any] | None:
    scholarship = saved_row.get("scholarships")
    if scholarship is None:
        scholarship = saved_row.get("scholarship")
    if scholarship is None:
        return None

    match_reason = saved_row.get("match_reason")
    return {
        **scholarship,
        "match_score": saved_row.get("match_score") or 0,
        "match_reasons": [match_reason] if match_reason else [],
    }


@router.post("", response_model=dict[str, Any])
def save_scholarship(payload: SaveScholarshipRequest) -> dict[str, Any]:
    existing_response = _execute_query(
        _table("saved_scholarships")
        .select("*")
        .eq("user_id", payload.user_id)
        .eq("scholarship_id", payload.scholarship_id)
        .maybe_single()
    )
    if existing_response.data is not None:
        return existing_response.data

    response = _execute_query(
        _table("saved_scholarships").insert(
            {
                "user_id": payload.user_id,
                "scholarship_id": payload.scholarship_id,
                "match_score": payload.match_score,
                "match_reason": payload.match_reason,
            }
        )
    )
    saved_rows = response.data or []
    return saved_rows[0] if saved_rows else {}


@router.delete("/{scholarship_id}")
def unsave_scholarship(scholarship_id: str, user_id: str) -> dict[str, bool]:
    _execute_query(
        _table("saved_scholarships")
        .delete()
        .eq("user_id", user_id)
        .eq("scholarship_id", scholarship_id)
    )
    return {"deleted": True}


@router.get("", response_model=list[MatchedScholarship])
def get_saved_scholarships(user_id: str) -> list[dict[str, Any]]:
    response = _execute_query(
        _table("saved_scholarships")
        .select("*, scholarships(*, scholarship_criteria(*))")
        .eq("user_id", user_id)
    )

    scholarships: list[dict[str, Any]] = []
    for saved_row in response.data or []:
        scholarship = _normalize_saved_scholarship(saved_row)
        if scholarship is not None:
            scholarships.append(scholarship)

    return scholarships
