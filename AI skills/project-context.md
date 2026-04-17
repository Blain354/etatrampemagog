# Project Context

## Target stack

- Frontend: React 19 + TypeScript + Vite (React Compiler enabled).
- Backend: Python 3.9 + Flask, run with Gunicorn in production.
- Infrastructure: Docker Compose + Traefik v3.
- Internal network: `web_network` (inter-service communication through Docker DNS).

## Local startup

- Frontend: `cd frontend && npm install && npm run dev` (Vite server).
- Backend: `cd backend && pip install -r requirements.txt && python app.py`.

## Integration conventions

- From browser clients, use the public API URL in production (for example: `https://api.<project>.blain-projects.ca/...`).
- Between internal containers/services, use `http://backend:5000/...`.

## Important constraints

- Backend uses `flask-cors`; cross-subdomain communication is expected.
- Containers are ephemeral: do not store persistent data without volumes.
- Auth is delegated to the proxy (ForwardAuth/OAuth); no app-level password management by default.
- For security profiles (protected/non-protected), read `security-modes.md`.
- Server deployment is orchestrated by OpenClaw, with a reference script in `REFERENCE_deploy.sh.md`.
