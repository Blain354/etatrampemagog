# Project Context

## Target stack

- Frontend: React 19 + TypeScript + Vite (React Compiler enabled).
- Backend: Python 3.9+ + FastAPI, run with Uvicorn in production.
- Infrastructure: Docker Compose + Traefik v3.
- Internal network: `web_network` (inter-service communication through Docker DNS).

## Local startup

- Frontend: `cd frontend && npm install && npm run dev` (Vite server on `:5173`).
- Backend (two equivalent options):
  - `cd backend && pip install -r requirements.txt && python main.py`
    → binds `:5000` (matches Docker prod port). Used in the `if __name__ == "__main__"` block.
  - `cd backend && uvicorn main:app --reload`
    → binds the uvicorn default `:8000`. Convenient for hot reload during dev.

> ⚠️ **The ASGI module is `main:app`** (the file is `main.py`). Never use `app:app` —
> the template Dockerfile historically had this bug and made `template-back` crash-loop
> for 11 days before being caught. The Dockerfile is now fixed; do not regress it.

## Integration conventions

- From browser clients, use the public API URL in production (for example: `https://api.<project>.blain-projects.ca/...`).
- Between internal containers/services on `web_network`, use `http://<container-name>:<port>/...`.
  For the backend of THIS template, the container is `${PROJECT_NAME}-back` listening on `5000`.
  Generic alias `http://backend:5000` only resolves if the compose service is named `backend`
  AND containers share the same compose project network — for cross-project calls always use
  the explicit container name.
- To reach an OpenClaw agent, use `http://openclaw-bridge:8000/api/internal/v1/agents/{id}/send`.
  See `OPENCLAW.md` and `openclaw-agents-catalog.md`.

## Important constraints

- Backend uses `CORSMiddleware` configured by `pydantic-settings`; cross-subdomain communication is expected.
- Containers are ephemeral: persist data using SQLite via `backend_sqlite_data` volume mounting `/app/data`.
- Auth is delegated to the proxy (ForwardAuth/OAuth); no app-level password management by default.
- For security profiles (protected/non-protected), read `security-modes.md`.
- Server deployment is orchestrated by OpenClaw, with a reference script in `REFERENCE_deploy.sh.md`.
