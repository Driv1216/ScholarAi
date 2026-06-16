from __future__ import annotations

import asyncio
import json
import re
from typing import Any
from urllib.parse import urljoin, urlparse

import google.generativeai as genai
import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from google.api_core.exceptions import GoogleAPIError

from app.core.config import settings


EXTRACTION_FIELDS: dict[str, Any] = {
    "name": None,
    "provider": None,
    "country": None,
    "degree_level": None,
    "fields": [],
    "award_amount": None,
    "deadline": None,
    "application_url": None,
    "eligibility_notes": None,
    "nationality": None,
    "min_cgpa": None,
    "warnings": [],
}

FETCH_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

PREFERRED_GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
]

ALLOWED_COUNTRIES = {"Germany", "UK", "Canada", "USA", "Australia"}
ALLOWED_DEGREE_LEVELS = {"bachelors", "masters", "phd", "any"}
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")
BROAD_FIELD_VALUES = {"any", "all", "all fields", "any field", "any fields", "all disciplines"}


def _clean_page_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)[:8000]


def _parse_json_response(response_text: str) -> dict[str, Any]:
    response_json = _extract_json_object(response_text)
    try:
        parsed = json.loads(response_json)
    except json.JSONDecodeError as exc:
        raise ValueError("Gemini returned invalid JSON for the scholarship extraction") from exc

    if not isinstance(parsed, dict):
        raise ValueError("Gemini returned JSON, but it was not an object")

    normalized = {**EXTRACTION_FIELDS, **parsed}
    if not isinstance(normalized["fields"], list):
        normalized["fields"] = []
    else:
        normalized["fields"] = [field for field in normalized["fields"] if isinstance(field, str)]
    if not isinstance(normalized["warnings"], list):
        normalized["warnings"] = []

    return normalized


def _extract_json_object(response_text: str) -> str:
    cleaned_text = response_text.strip()
    if cleaned_text.startswith("```"):
        cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text, flags=re.IGNORECASE)
        cleaned_text = re.sub(r"\s*```$", "", cleaned_text)

    if cleaned_text.startswith("{") and cleaned_text.endswith("}"):
        return cleaned_text

    start_index = cleaned_text.find("{")
    end_index = cleaned_text.rfind("}")
    if start_index != -1 and end_index != -1 and end_index > start_index:
        return cleaned_text[start_index : end_index + 1]

    return cleaned_text


async def extract_scholarship_from_text(text: str, source_url: str | None = None) -> dict[str, Any]:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    clean_text = text.strip()[:8000]
    if not clean_text:
        raise ValueError("Scholarship text is required for extraction")

    # Prompt injection risk: scraped content is passed to LLM.
    # Never trust or execute AI output directly — always route through admin verification.
    prompt = _extraction_prompt(clean_text)

    gemini_response = await _generate_content(prompt)
    response_text = getattr(gemini_response, "text", "").strip()
    if not response_text:
        raise ValueError("Gemini returned an empty extraction response")

    extracted = _parse_json_response(response_text)
    return await _validate_extraction(extracted, source_url)


async def extract_scholarship(url: str) -> dict[str, Any]:
    try:
        async with httpx.AsyncClient(
            timeout=15,
            follow_redirects=True,
            headers=FETCH_HEADERS,
        ) as client:
            response = await _fetch_with_retry(client, url)
    except httpx.TimeoutException as exc:
        raise HTTPException(
            status_code=422,
            detail="Scholarship page did not respond from the backend. Try again or use a more specific scholarship page URL.",
        ) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Scholarship page fetch failed with status {exc.response.status_code}",
        ) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=422, detail=f"Scholarship page fetch failed: {exc}") from exc

    text = _clean_page_text(response.text)
    if not text:
        raise ValueError("Scholarship page did not contain readable text")

    return await extract_scholarship_from_text(text, source_url=url)


def _extraction_prompt(text: str) -> str:
    return f"""You are a scholarship data extractor. Extract scholarship information from the 
following webpage text and return ONLY a valid JSON object with these exact fields:
{{
  'name': string,
  'provider': string,
  'country': string (one of: Germany, UK, Canada, USA, Australia, or best guess),
  'degree_level': string (one of: bachelors, masters, phd, any),
  'fields': array of strings (academic fields this scholarship covers),
  'award_amount': string (describe the award in plain english),
  'deadline': string (YYYY-MM-DD format, or null if not found),
  'application_url': string (direct application link, or null if not found),
  'eligibility_notes': string (plain english summary of who is eligible),
  'nationality': string (eligible nationality codes, e.g. 'IN' for India, 'ANY' for all),
  'min_cgpa': number or null (minimum CGPA/GPA required, or null if not specified)
}}
Return ONLY the JSON. No explanation, no markdown, no code blocks.
Webpage text: {text}"""


async def _validate_extraction(
    extracted: dict[str, Any],
    source_url: str | None = None,
) -> dict[str, Any]:
    warnings = [
        warning
        for warning in extracted.get("warnings", [])
        if isinstance(warning, str) and warning.strip()
    ]

    country = extracted.get("country")
    if country is not None and country not in ALLOWED_COUNTRIES:
        extracted["country"] = None
        warnings.append("Country could not be confidently mapped to an allowed value.")

    degree_level = extracted.get("degree_level")
    if degree_level is not None and degree_level not in ALLOWED_DEGREE_LEVELS:
        extracted["degree_level"] = None
        warnings.append("Degree level could not be confidently mapped to an allowed value.")

    deadline = extracted.get("deadline")
    if deadline is not None and not (isinstance(deadline, str) and DATE_PATTERN.match(deadline)):
        extracted["deadline"] = None
        warnings.append("Deadline was not in YYYY-MM-DD format and was left blank.")

    min_cgpa = extracted.get("min_cgpa")
    if min_cgpa is not None and not isinstance(min_cgpa, (int, float)):
        extracted["min_cgpa"] = None
        warnings.append("Minimum CGPA was not numeric and was left blank.")

    fields = extracted.get("fields")
    if isinstance(fields, list) and len(fields) == 1 and fields[0].strip().lower() in BROAD_FIELD_VALUES:
        extracted["fields"] = ["All fields"]
        warnings.append("Fields were broad or unspecified and should be reviewed.")

    if source_url:
        application_url, application_warning = await _verified_application_url(
            extracted.get("application_url"),
            source_url,
        )
        extracted["application_url"] = application_url
        if application_warning:
            warnings.append(application_warning)

    extracted["warnings"] = warnings
    return extracted


async def _generate_content(prompt: str) -> Any:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    errors: list[str] = []

    for model_name in PREFERRED_GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            return await asyncio.to_thread(model.generate_content, prompt)
        except GoogleAPIError as exc:
            errors.append(f"{model_name}: {exc}")

    try:
        model_names = await _available_gemini_model_names()
    except GoogleAPIError as exc:
        errors.append(f"ListModels: {exc}")
        model_names = []

    for model_name in model_names:
        if model_name in PREFERRED_GEMINI_MODELS:
            continue
        try:
            model = genai.GenerativeModel(model_name)
            return await asyncio.to_thread(model.generate_content, prompt)
        except GoogleAPIError as exc:
            errors.append(f"{model_name}: {exc}")

    detail = "No available Gemini model could generate the extraction"
    if errors:
        detail = f"{detail}. Last error: {errors[-1]}"
    raise ValueError(detail)


async def _available_gemini_model_names() -> list[str]:
    models = await asyncio.to_thread(lambda: list(genai.list_models()))
    supported_model_names = [
        model.name
        for model in models
        if "generateContent" in getattr(model, "supported_generation_methods", [])
    ]

    preferred_model_names = []
    for model_name in PREFERRED_GEMINI_MODELS:
        if model_name in supported_model_names:
            preferred_model_names.append(model_name)
        elif f"models/{model_name}" in supported_model_names:
            preferred_model_names.append(f"models/{model_name}")
    discovered_model_names = [
        model_name for model_name in supported_model_names if model_name not in preferred_model_names
    ]
    model_names = preferred_model_names + discovered_model_names
    if not model_names:
        raise ValueError("No Gemini models supporting generateContent are available for this API key")

    return model_names


async def _verified_application_url(application_url: Any, source_url: str) -> tuple[str | None, str | None]:
    if not isinstance(application_url, str) or not application_url.strip():
        return None, "Application URL was not found and was left blank."

    candidate_url = urljoin(source_url, application_url.strip())
    if candidate_url == source_url:
        return None, "Application URL matched the official URL, so it was left blank for review."
    if not _is_http_url(candidate_url):
        return None, "Application URL was not a valid web URL and was left blank."

    try:
        async with httpx.AsyncClient(
            timeout=10,
            follow_redirects=True,
            headers=FETCH_HEADERS,
        ) as client:
            response = await client.head(candidate_url)
            if response.status_code == 405:
                response = await client.get(candidate_url)
            response.raise_for_status()
    except httpx.HTTPError:
        return None, "Application URL could not be verified and was left blank."

    verified_url = str(response.url)
    if verified_url == source_url:
        return None, "Application URL redirected to the official URL, so it was left blank for review."
    if response.status_code >= 400:
        return None, "Application URL returned an error and was left blank."

    return verified_url, None


def _is_http_url(url: str) -> bool:
    parsed_url = urlparse(url)
    return parsed_url.scheme in {"http", "https"} and bool(parsed_url.netloc)


async def _fetch_with_retry(client: httpx.AsyncClient, url: str) -> httpx.Response:
    last_timeout: httpx.TimeoutException | None = None

    for attempt in range(2):
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response
        except httpx.TimeoutException as exc:
            last_timeout = exc
            if attempt == 0:
                await asyncio.sleep(1)

    if last_timeout is not None:
        raise last_timeout

    raise HTTPException(status_code=422, detail="Scholarship page fetch failed")
