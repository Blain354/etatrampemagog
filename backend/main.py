from typing import List, Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "unknown"
    domain_name: str = "blain-projects.ca"
    # Provide default allowed origins for local dev
    backend_cors_origins: List[str] = ["http://localhost", "http://localhost:5173"]

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file="../.env",  # point to the parent dir if starting from /backend
        env_file_encoding="utf-8",
        extra="ignore",
    )


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
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "online", "service": "python-backend", "project": settings.project_name}


if __name__ == "__main__":
    import uvicorn

    # Make sure Uvicorn binds to 0.0.0.0 so it's accessible inside the Docker network
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
