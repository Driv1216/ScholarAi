from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.admin import router as admin_router
from app.routers.applications import router as applications_router
from app.routers.saved import router as saved_router
from app.routers.scholarships import router as scholarships_router

app = FastAPI(title="ScholarAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.FRONTEND_ORIGINS),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scholarships_router)
app.include_router(saved_router)
app.include_router(applications_router)
app.include_router(admin_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
