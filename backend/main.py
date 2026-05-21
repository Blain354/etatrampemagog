from typing import List, Union

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from services.ramp_status import RampStatusResponse, RampStatusValue, fetch_ramp_status


class Settings(BaseSettings):
    project_name: str = "unknown"
    domain_name: str = "blain-projects.ca"

    model_config = SettingsConfigDict(
        env_file="../.env",  # point to the parent dir if starting from /backend
        env_file_encoding="utf-8",
        extra="ignore",
    )


def get_cors_origins() -> List[str]:
    """Get CORS origins from environment variable."""
    import os
    cors_env = os.getenv("BACKEND_CORS_ORIGINS", "http://localhost,http://localhost:5173")
    return [origin.strip() for origin in cors_env.split(",")]


settings = Settings()

app = FastAPI(
    title=settings.project_name,
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Apply CORS config specifically with allow_credentials=True as requested
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "online", "service": "python-backend", "project": settings.project_name}


@app.get("/api/ramp-status", response_model=RampStatusResponse)
async def ramp_status(mock_flow: int | None = None) -> RampStatusResponse:
    try:
        res = await fetch_ramp_status()
        if mock_flow is not None:
            is_closed = mock_flow > 70
            res = res.model_copy(update={
                "river_flow": f"{mock_flow} m3/s",
                "status": RampStatusValue.CLOSED if is_closed else RampStatusValue.OPEN,
                "label": "Fermée" if is_closed else "Ouverte",
                "ramp_info": f"Navigation interdite - Débit trop élevé (>70 m3/s) [MOCK: {mock_flow} m3/s]" if is_closed else f"La rampe est accessible. [MOCK: {mock_flow} m3/s]",
                "reopening_date_display": "Date fictive (Débit bas requis)" if is_closed else None
            })
        return res
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail="Impossible de récupérer les avis de la Ville de Magog.",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    # Make sure Uvicorn binds to 0.0.0.0 so it's accessible inside the Docker network
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
