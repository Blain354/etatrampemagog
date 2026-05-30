---
description: Project onboarding flow — triggered by the ONBOARDING.md sentinel file, with PROJECT.md marker as fallback.
---

# Project Onboarding Workflow

## Trigger

Activates when **either** is true at the repo root:

1. `ONBOARDING.md` exists (primary, authoritative).
2. `PROJECT.md` contains `TODO: DEFINE YOUR PROJECT` or
   `<!-- MARKER: ONBOARDING_PENDING -->` (fallback).

## Operational details

→ Full procedure: [`AI skills/onboarding.md`](../../AI%20skills/onboarding.md).

## Immediate actions (priority over any user request)

1. **Stop** current task evaluation. Onboarding has absolute priority.
2. **Acknowledge** to the user — ~1 short paragraph.
3. **Plan** — write a 5-7 step plan, present it, **wait for user
   approval**. Do not skip this — it forces alignment before questions.
4. **Analyze** the repository (silent reading).
5. **Question** in batches of 2-3, saving to `PROJECT.md` after each.
6. **Fill** artifacts manually for `PROJECT.md`, `CONTEXT.md`,
   `.specify/constitution.md`.
7. **Finalize** by running
   `scripts/finalize-onboarding.sh --name <slug> --tagline "<…>"`
   — this deletes `ONBOARDING.md`.
8. **Verify** with `PROJECT_NAME=<slug> ./scripts/validate-deploy-ready.sh`.
9. **Resume** the original user request (preserved verbatim from step 1).

## Key rules

- Never skip onboarding even if the user pushes for speed.
- Always restate the original request when transitioning back to it.
- Save incrementally — after each question batch, write to `PROJECT.md`.
- The finalize script is the single source of truth for mass
  substitutions. Don't hand-edit what it covers.
- The sentinel (`ONBOARDING.md`) is deleted by the finalize script —
  never by hand.
