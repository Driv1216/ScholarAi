from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from fastapi import APIRouter, HTTPException
from postgrest.exceptions import APIError
from pydantic import BaseModel, ConfigDict

from app.db.client import db


router = APIRouter(prefix="/applications", tags=["applications"])

ApplicationStatus = Literal["planning", "in_progress", "submitted", "accepted", "rejected"]

DEFAULT_TASKS = [
    {"task_name": "Review eligibility", "task_type": "other"},
    {"task_name": "Gather required documents", "task_type": "document"},
    {"task_name": "Prepare essays/SOP", "task_type": "essay"},
    {"task_name": "Request recommendations", "task_type": "recommendation"},
    {"task_name": "Submit application form", "task_type": "form"},
]


class CreateApplicationRequest(BaseModel):
    user_id: str
    scholarship_id: str


class UpdateApplicationRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: Optional[ApplicationStatus] = None
    deadline_reminder: Optional[str] = None


class UpdateTaskRequest(BaseModel):
    completed: bool


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


def _application_select() -> str:
    return "*, scholarships(*, scholarship_criteria(*)), application_tasks(*)"


def _get_application_or_404(application_id: str) -> dict[str, Any]:
    response = _execute_query(
        _table("applications")
        .select(_application_select())
        .eq("id", application_id)
        .maybe_single()
    )
    application = response.data
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


def _create_default_tasks(application_id: str) -> None:
    existing_response = _execute_query(
        _table("application_tasks").select("id").eq("application_id", application_id)
    )
    if existing_response.data:
        return

    _execute_query(
        _table("application_tasks").insert(
            [
                {
                    **task,
                    "application_id": application_id,
                    "completed": False,
                }
                for task in DEFAULT_TASKS
            ]
        )
    )


@router.get("")
def list_applications(user_id: str) -> list[dict[str, Any]]:
    response = _execute_query(
        _table("applications")
        .select(_application_select())
        .eq("user_id", user_id)
    )
    return response.data or []


@router.post("", status_code=201)
def create_application(payload: CreateApplicationRequest) -> dict[str, Any]:
    existing_response = _execute_query(
        _table("applications")
        .select(_application_select())
        .eq("user_id", payload.user_id)
        .eq("scholarship_id", payload.scholarship_id)
        .maybe_single()
    )
    if existing_response.data is not None:
        _create_default_tasks(existing_response.data["id"])
        return _get_application_or_404(existing_response.data["id"])

    response = _execute_query(
        _table("applications").insert(
            {
                "user_id": payload.user_id,
                "scholarship_id": payload.scholarship_id,
                "status": "planning",
                "updated_at": datetime.utcnow().isoformat(),
            }
        )
    )
    applications = response.data or []
    if not applications:
        raise HTTPException(status_code=500, detail="Application was not created")

    application_id = applications[0]["id"]
    _create_default_tasks(application_id)
    return _get_application_or_404(application_id)


@router.patch("/{application_id}")
def update_application(
    application_id: str, payload: UpdateApplicationRequest
) -> dict[str, Any]:
    application = _get_application_or_404(application_id)
    update_payload: dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}

    if payload.status is not None:
        update_payload["status"] = payload.status
        if payload.status == "submitted" and application.get("applied_at") is None:
            update_payload["applied_at"] = datetime.utcnow().isoformat()

    if payload.deadline_reminder is not None:
        update_payload["deadline_reminder"] = payload.deadline_reminder or None

    _execute_query(
        _table("applications").update(update_payload).eq("id", application_id)
    )
    return _get_application_or_404(application_id)


@router.delete("/{application_id}")
def delete_application(application_id: str) -> dict[str, bool]:
    _get_application_or_404(application_id)
    _execute_query(_table("applications").delete().eq("id", application_id))
    return {"deleted": True}


@router.patch("/{application_id}/tasks/{task_id}")
def update_application_task(
    application_id: str, task_id: str, payload: UpdateTaskRequest
) -> dict[str, Any]:
    _get_application_or_404(application_id)
    response = _execute_query(
        _table("application_tasks")
        .update({"completed": payload.completed})
        .eq("id", task_id)
        .eq("application_id", application_id)
    )
    tasks = response.data or []
    if not tasks:
        raise HTTPException(status_code=404, detail="Application task not found")
    return tasks[0]
