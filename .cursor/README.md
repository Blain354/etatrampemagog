# Cursor configuration

This directory contains Cursor-specific configuration.

## Rules

- Minimal global rule: `.cursor/rules/agentic-programming.mdc`.
- Specialized rules (loaded by file/task): `deployment-context.mdc`, `api-context.mdc`, `workflow-context.mdc`, `rule-authoring-context.mdc`.
- Frontend visual rule: `frontend-steel-signature-colors.mdc` (Steel Signature tokens + required header light/dark toggle for app shells).
- `AI skills/` documentation is referenced on demand, never permanently preloaded.

## Project Skills

- `.cursor/skills/steel-signature-frontend/SKILL.md`: reusable frontend skill enforcing Steel Signature token and color usage.