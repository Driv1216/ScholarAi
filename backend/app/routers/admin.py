from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from postgrest.exceptions import APIError

from app.db.client import db
from app.services.extractor import extract_scholarship, extract_scholarship_from_text


router = APIRouter(prefix="/admin", tags=["admin"])


class AdminCriteriaInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    criterion_type: str
    operator: str
    value: str
    required: bool = True


class AdminScholarshipInput(BaseModel):
    model_config = ConfigDict(extra="ignore")

    source_id: Optional[str] = None
    name: str
    provider: str
    official_url: str
    country: Optional[str] = None
    degree_level: Optional[str] = None
    fields: list[str] = Field(default_factory=list)
    award_amount: Optional[str] = None
    deadline: Optional[str] = None
    application_url: Optional[str] = None
    trust_score: int = Field(default=50, ge=0, le=100)
    status: str = "draft"
    verified_by: Optional[str] = None
    last_verified_at: Optional[str] = None
    scholarship_criteria: list[AdminCriteriaInput] = Field(default_factory=list)


class ExtractScholarshipInput(BaseModel):
    url: str
    text: Optional[str] = None


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


def _scholarship_payload(payload: AdminScholarshipInput) -> dict[str, Any]:
    data = payload.model_dump(exclude={"scholarship_criteria"})
    if data["deadline"] == "":
        data["deadline"] = None
    if data["last_verified_at"] == "":
        data["last_verified_at"] = None
    if data["status"] == "verified" and not data["last_verified_at"]:
        data["last_verified_at"] = datetime.utcnow().isoformat()
    return data


def _criteria_payload(scholarship_id: str, criteria: list[AdminCriteriaInput]) -> list[dict[str, Any]]:
    return [
        {
            **criterion.model_dump(),
            "scholarship_id": scholarship_id,
        }
        for criterion in criteria
        if criterion.criterion_type and criterion.operator and criterion.value
    ]


def _get_scholarship_or_404(scholarship_id: str) -> dict[str, Any]:
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


@router.get("/stats")
def get_admin_stats() -> dict[str, int]:
    response = _execute_query(_table("scholarships").select("id,status"))
    scholarships = response.data or []

    stats = {
        "total": len(scholarships),
        "verified": 0,
        "pending": 0,
        "expired": 0,
    }

    for scholarship in scholarships:
        status = scholarship.get("status")
        if status == "verified":
            stats["verified"] += 1
        elif status == "pending_review":
            stats["pending"] += 1
        elif status == "expired":
            stats["expired"] += 1

    return stats


@router.post("/extract")
async def extract_admin_scholarship(payload: ExtractScholarshipInput) -> dict[str, Any]:
    try:
        if payload.text and payload.text.strip():
            return await extract_scholarship_from_text(payload.text, source_url=payload.url)
        return await extract_scholarship(payload.url)
    except HTTPException as exc:
        raise HTTPException(status_code=422, detail=exc.detail) from exc
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/scholarships")
def list_admin_scholarships() -> list[dict[str, Any]]:
    response = _execute_query(
        _table("scholarships").select("*, scholarship_criteria(*)")
    )
    return response.data or []


@router.post("/scholarships", status_code=201)
def create_admin_scholarship(payload: AdminScholarshipInput) -> dict[str, Any]:
    scholarship_response = _execute_query(
        _table("scholarships").insert(_scholarship_payload(payload))
    )
    scholarships = scholarship_response.data or []
    if not scholarships:
        raise HTTPException(status_code=500, detail="Scholarship was not created")

    scholarship = scholarships[0]
    criteria = _criteria_payload(scholarship["id"], payload.scholarship_criteria)
    if criteria:
        _execute_query(_table("scholarship_criteria").insert(criteria))

    return _get_scholarship_or_404(scholarship["id"])


@router.get("/scholarships/{scholarship_id}")
def get_admin_scholarship(scholarship_id: str) -> dict[str, Any]:
    return _get_scholarship_or_404(scholarship_id)


@router.put("/scholarships/{scholarship_id}")
def update_admin_scholarship(
    scholarship_id: str, payload: AdminScholarshipInput
) -> dict[str, Any]:
    _get_scholarship_or_404(scholarship_id)

    response = _execute_query(
        _table("scholarships").update(_scholarship_payload(payload)).eq("id", scholarship_id)
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    _execute_query(
        _table("scholarship_criteria").delete().eq("scholarship_id", scholarship_id)
    )
    criteria = _criteria_payload(scholarship_id, payload.scholarship_criteria)
    if criteria:
        _execute_query(_table("scholarship_criteria").insert(criteria))

    return _get_scholarship_or_404(scholarship_id)


@router.delete("/scholarships/{scholarship_id}")
def delete_admin_scholarship(scholarship_id: str) -> dict[str, bool]:
    _get_scholarship_or_404(scholarship_id)

    _execute_query(
        _table("scholarship_criteria").delete().eq("scholarship_id", scholarship_id)
    )
    _execute_query(_table("scholarships").delete().eq("id", scholarship_id))
    return {"deleted": True}
