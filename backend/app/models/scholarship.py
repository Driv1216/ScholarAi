from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ScholarshipCriteria(BaseModel):
    model_config = ConfigDict(extra="ignore")

    scholarship_id: str
    criterion_type: str
    operator: str
    value: str
    required: bool = True


class Scholarship(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    name: str
    provider: str
    official_url: str
    country: Optional[str] = None
    degree_level: Optional[str] = None
    fields: list[str] = Field(default_factory=list)
    award_amount: Optional[str] = None
    deadline: Optional[date] = None
    application_url: Optional[str] = None
    trust_score: int = 50
    status: str
    scholarship_criteria: list[ScholarshipCriteria] = Field(default_factory=list)


class MatchedScholarship(Scholarship):
    match_score: int
    match_reasons: list[str]


class MatchRequest(BaseModel):
    user_id: str


class MatchResponse(BaseModel):
    scholarships: list[MatchedScholarship]
    total: int
