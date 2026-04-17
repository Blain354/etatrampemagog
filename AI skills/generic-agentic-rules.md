# Generic Agentic Engineering Rules

## Priorities

1. Understand the requirement and system impact before coding.
2. Deliver minimal, testable, reviewable changes.
3. Verify real behavior (tests, build, endpoints) before declaring work done.

## Working rules

- Align changes with the existing architecture (React/Vite + Flask + Docker + Traefik).
- Do not disable CORS or modify SSL/proxy behavior without explicit request.
- Avoid out-of-scope refactors.
- Document assumptions when information is missing.
- Keep dependency files updated (`requirements.txt`, `package.json`/`package-lock.json`) when adding libraries.

## Quality rules

- Prefer clear single-responsibility units.
- Add explicit error handling for network calls.
- Keep API contracts stable (JSON shape and HTTP status codes).
- Limit side effects and prefer deterministic behavior.

## Minimum verification before delivery

- Frontend: dev start and build pass.
- Backend: start passes and health endpoint responds.
- Integration: frontend -> backend calls succeed using the correct URL for the environment.
