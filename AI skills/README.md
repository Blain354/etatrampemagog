# AI skills

This directory centralizes technical context and working rules for AI agents building on this template.

## Contents

### Spec-Driven Development (session start — MANDATORY)
- `.specify/constitution.md`: project governing principles — agents VALIDATE, not just read.
- `.specify/templates/spec-template.md`: feature specification blueprint.
- `.specify/templates/checklist-template.md`: per-feature validation checklist.
- `scripts/validate-deploy-ready.sh`: automated network/build pre-deployment checks.

### Methodology (use these actively)
- `domain-language.md`: shared project glossary (CONTEXT.md) — eliminates agent reinventing terms every session.
- `grill-session.md`: alignment interview before coding — the #1 defense against misunderstood intent.
- `caveman-mode.md`: ultra-compressed communication, ~75% token savings.
- `diagnose.md`: structured 6-phase debug loop — fastest path from bug to fix.

### Process & standards
- `generic-agentic-rules.md`: generic agentic engineering rules.
- `onboarding.md`: project onboarding flow — gated by the `ONBOARDING.md` sentinel at the repo root. Plan → Questions → Fill → `scripts/finalize-onboarding.sh` (which deletes the sentinel). Mandatory first-run for any fresh project.
- `project-context.md`: project context and core conventions.
- `development-workflow.md`: recommended implementation workflow.
- `skill-authoring-ide-agnostic.md`: skill-authoring standard + targeted `.cursor/.agent` rule strategy.

### Technical reference
- `api-endpoints.md`: existing backend endpoints and API conventions.
- `openclaw-bridge.md`: intégration OpenClaw Agent Bridge — comment connecter ton backend aux agents IA.
- `openclaw-agents-catalog.md`: liste des 13 agents OpenClaw disponibles avec leurs `id` et spécialités.
- `ecosystem-services.md`: services partagés sur `web_network` (n8n, openclaw-mcp, nextcloud, etc.).
- `deployment-architecture.md`: Docker/Traefik architecture and deployment constraints.
- `security-modes.md`: security options (Google Auth, network protection, dev vs prod).
- `deployment-modes.md`: simple deployment mode contract (`secure` vs `public`).
- `REFERENCE_deploy.sh.md`: reference deployment orchestration script run by OpenClaw/server manager.
- `steel-signature-colors.md`: canonical Steel Signature color/token rules for frontend work.
- `fastapi-database-management.md`: FastAPI + SQLModel patterns.
- `frontend-design-system.md`: frontend design system conventions.

## Purpose

Enable agents to quickly understand:

- how to run frontend/backend locally,
- which endpoints to use and extend,
- how to align with automated deployment architecture,
- which checks are required before considering work complete,
- which security profile to apply by environment,
- which deployment tag controls Google Auth behavior,
- which server-side deployment sequence OpenClaw executes for troubleshooting.