# Deployment Modes (Simple)

Goal: let an agent (for example OpenClaw) quickly decide whether to deploy in protected or public mode.

## Expected tag

- `deploy_mode=secure`
- `deploy_mode=public`

If the tag is missing, default to `secure`.

## Application rule in `docker-compose.yml`

Security here means Google Authentication via Traefik middleware.

- **Mode `secure`**: keep the Google Auth middleware line on frontend router:
  - `traefik.http.routers.${PROJECT_NAME}-front.middlewares=google-auth@docker`
- **Mode `public`**: remove that middleware line to expose frontend without Google Auth.

## Current template state

Template is already `secure` by default (Google Auth line is present).

## Recommended agent command

- "Deploy project `<name>` with `deploy_mode=secure`"
- "Deploy project `<name>` with `deploy_mode=public`"
