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

- Keep Flask CORS enabled.
- Local frontend: local backend URL (for example: `http://localhost:5000/api/...`) when no proxy is configured.
- Production frontend: public API URL (for example: `https://api.<project>.blain-projects.ca/api/...`).

## Endpoint checklist (before merge)

- Endpoint is documented (input/output).
- HTTP statuses are consistent.
- Validation errors are covered.
- At least one manual check is run via curl/Postman.
