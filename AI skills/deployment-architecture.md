# Automated Deployment Architecture

## Overview

- Traefik is the entry point (routing + automatic TLS).
- Frontend is served by Nginx.
- FastAPI backend runs behind Uvicorn.
- All app services connect to Docker network `web_network`.

## Server orchestration (OpenClaw)

- OpenClaw/server manager uses a reference deployment script: `REFERENCE_deploy.sh.md`.
- This script defines the standard server flow:
  - clone/pull repository depending on project existence,
  - create/verify Docker network `web_network`,
  - create/update `.env` (`PROJECT_NAME`, `DOMAIN_NAME`),
  - run `docker compose up -d --build`.
- For deployment debugging, treat this file as the orchestration source of truth.

## Target domains

- Public frontend: `https://<project>.blain-projects.ca`
- Public API: `https://api.<project>.blain-projects.ca`

## Development implications

- New features must preserve frontend/API separation.
- Internal services should call backend via `http://backend:5000`.
- External clients (browser/mobile/partners) must use public API domain.

## Common risks

- Hardcoded local URLs in production.
- Persistent data written into ephemeral containers without volumes.
- Unhandled API timeouts.
- Proxy/CORS changes that break cross-subdomain behavior.

## Recommended guardrails

- Parameterize URLs via environment variables.
- Validate exposed routes after each infra change.
- Keep a health endpoint and monitor it post-deploy.
- Apply the correct security profile (`security-modes.md`).
