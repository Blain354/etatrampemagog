# Recommended Development Workflow

## 1) Before coding

- Read `project-context.md` and `deployment-architecture.md`.
- Identify impacted endpoints.
- Clarify local and production impact.

## 2) During implementation

- Make incremental changes.
- Verify API compatibility for every changed/added endpoint.
- Update technical documentation when contracts change.

## 3) Local verification

- Frontend:
  - `npm run dev`
  - `npm run build`
- Backend:
  - `python app.py` or equivalent stack startup
  - check `GET /api/health`

## 4) Pre-deployment verification

- Confirm API URLs by environment.
- Confirm required environment variables.
- Verify no added dependency was missed.
- For deployment debugging, validate alignment with `REFERENCE_deploy.sh.md` (OpenClaw server flow).

## 5) Definition of done

- Code builds/starts.
- Modified endpoints respond correctly.
- Behavior is compatible with Docker/Traefik deployment.
- Change is documented in `AI skills` when relevant.
