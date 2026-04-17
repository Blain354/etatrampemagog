# Security: Protected vs Public Mode

This document defines how to configure the app by desired security level.

## Protected mode (recommended for production)

### Authentication

- Use Traefik ForwardAuth with Google OAuth in front of sensitive frontend and/or API routes.
- Business app code does not handle passwords by default; identity is delegated to the proxy.

### "Firewall" / network protection

- Expose only Traefik publicly.
- Keep backend and internal services on private Docker network `web_network`.
- Restrict admin routes (IP allowlist, dedicated Traefik middleware, or required auth).
- Enable proxy-level rate limiting to reduce brute-force and abuse.

### API

- Keep CORS enabled but strict (explicit origins in production).
- Add API key (`X-API-KEY`) for machine-to-machine clients when needed.
- Avoid exposing undocumented/internal endpoints.

### Observability and incident response

- Log denied access, 401/403 errors, and traffic spikes.
- Keep a health endpoint and availability alerts.

## Public mode (local dev / demos)

- Google authentication may be disabled to iterate faster.
- CORS may be more permissive only in local environments.
- Do not expose backend directly to the public internet outside controlled local setups.

## Decision guide

- If app is public or handles user data: protected mode is required.
- If app is local/POC with no sensitive data: public mode is acceptable temporarily.
- Switch to protected mode before production release.