# API Endpoints and Contracts

## Existing baseline endpoints

- `GET /api/health`: verifies backend liveness.

## Rules for adding endpoints

- Prefix app routes with `/api/...`.
- Return consistent JSON:
  - success: explicit payload (`status`, `data`, `message` as needed),
  - error: `error` or `message` + appropriate HTTP status code.
- Avoid ambiguous routes; name by resource (`/api/users`, `/api/orders/:id`).

## CORS and frontend API calls

- Keep `CORSMiddleware` configured.
- Local frontend: local backend URL (for example: `http://localhost:5000/api/...`) when no proxy is configured.
- Production frontend: public API URL (for example: `https://api.<project>.blain-projects.ca/api/...`).

## Endpoint checklist (before merge)

- Endpoint is documented via FastAPI OpenAPI (type hints).
- HTTP statuses are consistent.
- Validation is performed using Pydantic models.
- Tests are added in `backend/tests/` using `TestClient`.
- At least one manual check is run via curl/Postman.
