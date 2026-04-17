# AI skills

This directory centralizes technical context and working rules for AI agents building on this template.

## Contents

- `generic-agentic-rules.md`: generic agentic engineering rules.
- `project-context.md`: project context and core conventions.
- `api-endpoints.md`: existing backend endpoints and API conventions.
- `deployment-architecture.md`: Docker/Traefik architecture and deployment constraints.
- `development-workflow.md`: recommended implementation workflow.
- `security-modes.md`: security options (Google Auth, network protection, dev vs prod).
- `deployment-modes.md`: simple deployment mode contract (`secure` vs `public`).
- `REFERENCE_deploy.sh.md`: reference deployment orchestration script run by OpenClaw/server manager.
- `skill-authoring-ide-agnostic.md`: skill-authoring standard + targeted `.cursor/.agent` rule strategy.

## Purpose

Enable agents to quickly understand:

- how to run frontend/backend locally,
- which endpoints to use and extend,
- how to align with automated deployment architecture,
- which checks are required before considering work complete,
- which security profile to apply by environment,
- which deployment tag controls Google Auth behavior,
- which server-side deployment sequence OpenClaw executes for troubleshooting.