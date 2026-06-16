from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx
from supabase import Client, create_client

from app.core.config import settings


@dataclass(frozen=True)
class QueryResponse:
    data: Any


class SupabaseRestQuery:
    def __init__(
        self,
        table_name: str,
        select_columns: str = "*",
        method: str = "GET",
        payload: Any = None,
    ) -> None:
        self._table_name = table_name
        self._params: dict[str, str] = {"select": select_columns}
        self._limit: int | None = None
        self._maybe_single = False
        self._method = method
        self._payload = payload

    def select(self, columns: str) -> SupabaseRestQuery:
        self._params["select"] = columns
        return self

    def eq(self, column: str, value: Any) -> SupabaseRestQuery:
        self._params[column] = f"eq.{value}"
        return self

    def limit(self, count: int) -> SupabaseRestQuery:
        self._limit = count
        return self

    def maybe_single(self) -> SupabaseRestQuery:
        self._maybe_single = True
        self._limit = 1
        return self

    def single(self) -> SupabaseRestQuery:
        self._maybe_single = True
        return self

    def insert(self, payload: Any) -> SupabaseRestQuery:
        self._method = "POST"
        self._payload = payload
        return self

    def update(self, payload: Any) -> SupabaseRestQuery:
        self._method = "PATCH"
        self._payload = payload
        return self

    def delete(self) -> SupabaseRestQuery:
        self._method = "DELETE"
        return self

    def execute(self) -> QueryResponse:
        params = dict(self._params)
        if self._limit is not None:
            params["limit"] = str(self._limit)

        headers = {
            "apikey": settings.SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Prefer": "return=representation",
        }

        response = httpx.request(
            self._method,
            f"{settings.SUPABASE_URL}/rest/v1/{self._table_name}",
            headers=headers,
            params=params,
            json=self._payload,
            timeout=10.0,
        )

        if response.status_code >= 400:
            raise RuntimeError(
                f"Supabase request failed with {response.status_code}: {response.text}"
            )

        data = response.json()
        if self._maybe_single:
            return QueryResponse(data=data[0] if data else None)
        return QueryResponse(data=data)


class SupabaseRestClient:
    def table(self, name: str) -> SupabaseRestQuery:
        return SupabaseRestQuery(name)


class SupabaseClientProxy:
    def __init__(self) -> None:
        self._client: Client | SupabaseRestClient | None = None

    def _get_client(self) -> Client | SupabaseRestClient:
        if self._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
                raise RuntimeError("Supabase URL and service key must be configured")
            if settings.SUPABASE_SERVICE_KEY.startswith("sb_secret_"):
                self._client = SupabaseRestClient()
                return self._client
            try:
                self._client = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_KEY,
                )
            except Exception as exc:
                raise RuntimeError(f"Could not initialize Supabase client: {exc}") from exc
        return self._client

    def __getattr__(self, name: str) -> object:
        return getattr(self._get_client(), name)


db = SupabaseClientProxy()
