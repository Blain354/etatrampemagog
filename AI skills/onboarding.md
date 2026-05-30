---
name: onboarding
description: Convert a freshly-forked template into a uniquely-identified project, gated by a sentinel file (ONBOARDING.md). MANDATORY first run for any new project.
---

# Project Onboarding Workflow

## Trigger

Activated when either of these is true at the repo root:

- `ONBOARDING.md` exists (primary, authoritative trigger), **OR**
- `PROJECT.md` contains `TODO: DEFINE YOUR PROJECT` or
  `<!-- MARKER: ONBOARDING_PENDING -->` (fallback in case the sentinel
  was deleted manually).

The presence of either is **non-negotiable priority**: stop the user's
current request, run onboarding to completion, then resume.

## Goal

After onboarding, a `grep -RIn "Fullstack Hybrid Template\|\[NAME\]\|web_projects_template" .`
returns nothing user-facing, `PROJECT.md` is fully filled, the
sentinel is gone, and `./scripts/validate-deploy-ready.sh` is green.

---

## Phase 0 — Detection & acknowledgement

```
1. Read ONBOARDING.md if it exists. Note the rules it sets.
2. Note (do not display) the user's original request.
3. Acknowledge to the user in ONE short message:
   > "This project is still in template skin. I need ~3 min to onboard
   >  it before we can ship anything else. Here is my plan ↓"
```

Move directly to Phase 1 — do not start asking questions yet.

## Phase 1 — Planning (NEW, mandatory)

The agent **writes a concrete plan** and shows it to the user **before**
any question. The plan must cover:

1. **Files I will read** to understand current state.
2. **Questions I will ask** (high-level list, batched).
3. **Files I will modify** (and why).
4. **Finalization step** — running `scripts/finalize-onboarding.sh` and
   deleting `ONBOARDING.md`.
5. **Verification step** — running `validate-deploy-ready.sh`.
6. **Resumption** of the user's original request (restated).

Template plan to copy and adapt:

```markdown
**Onboarding plan for this repo:**

1. **Inspect** — `PROJECT.md`, `README.md`, `frontend/package.json`,
   `backend/requirements.txt`, `docker-compose.yml`, `.env*`.
2. **Ask** — 5 batches (core identity, audience/scope, design/vibe,
   technical constraints, business/success). ~15 questions total.
3. **Fill** — write answers into `PROJECT.md` as we go, then run the
   finalization script which patches: `README.md`, `how_to_use_repo.md`,
   `frontend/package.json#name`, `frontend/index.html#title`,
   `frontend/src/App.tsx` brand, `.env`, `.specify/constitution.md`.
4. **Finalize** — `scripts/finalize-onboarding.sh --name <slug>
   --tagline "<…>" --domain blain-projects.ca`. This script deletes
   `ONBOARDING.md` as its last action.
5. **Verify** — `PROJECT_NAME=<slug> ./scripts/validate-deploy-ready.sh`.
6. **Resume original request** — "[restated request]".

Want me to proceed?
```

Wait for explicit user approval (`yes`, `go`, `ok`, equivalent) before
moving to Phase 2. If the user proposes adjustments to the plan, fold
them in, redisplay, re-ask for approval.

## Phase 2 — Repository analysis (silent)

Read in parallel:

- `PROJECT.md` — current placeholder text.
- `README.md` — current title and badges.
- `frontend/package.json` — current `name`, dependencies.
- `backend/requirements.txt` — current Python deps.
- `docker-compose.yml` — current services and `PROJECT_NAME` usage.
- `.env`, `.env.example` (if present) — current values (never log
  secrets back to the user).

Form a one-line internal summary of the repo's current shape — use it
later to ground the questions.

## Phase 3 — Interactive questionnaire

Ask in **batches of 2-3**. Wait for the user before moving to the next
batch. Save answers to `PROJECT.md` immediately after each batch.

### Batch A — Core Identity

1. **Project name?** (Short, memorable, URL-friendly slug — used as
   subdomain `<slug>.blain-projects.ca`)
2. **One-sentence pitch?**
3. **Problem solved?**

### Batch B — Audience & Scope

4. **Primary users?** (Devs / consumers / businesses / niche)
5. **3-5 MUST-HAVE features for v1?**
6. **Explicit non-goals for v1?** (Scope guard)

### Batch C — Design & Vibe

7. **Visual style in 3 words?**
8. **Primary brand color?** (Hex or descriptor)
9. **Inspiration sources?** (URLs / mood)
10. **Replace the "Steel Signature" baseline branding?** (yes/no — if
    no, the showcase page stays as is until the user redesigns it
    themselves)

### Batch D — Technical Constraints

11. **Special requirements?** (Real-time / offline / multi-tenant / PWA
    / hardware integration)
12. **App-level auth needed beyond Google OAuth?** (Roles, RBAC, etc.)
13. **Third-party integrations to plan for?** (Stripe, OpenAI,
    WebSocket, etc.)
14. **Security mode at launch?** (`secure` = Google Auth on, default,
    or `public`)

### Batch E — Business & Success

15. **Monetization?** (Free / freemium / subscription / one-time / ad
    / internal tool)
16. **Definition of success in 3 months?**
17. **Competitors and differentiator?**

> If the user supplies a multi-question answer up front, fold it in and
> skip past those questions. Never ask the same thing twice.

## Phase 4 — Fill artifacts

Write to `PROJECT.md` incrementally (already happening from Phase 3).
Once Phase 3 is complete, the **finalization script** does the rest of
the substitutions automatically.

Manual edits the agent still does:

- `PROJECT.md` — replace every `<!-- TODO -->` block with the real
  answer. Remove `<!-- MARKER: ONBOARDING_PENDING -->`.
- `CONTEXT.md` (create if not present) — seed it with the project's
  first 3-5 domain terms (drawn from the answers).
- `.specify/constitution.md` — update the "Last updated" line and the
  free-text reference to template if any.

## Phase 5 — Finalization

```bash
scripts/finalize-onboarding.sh \
  --name <slug> \
  --tagline "<one-sentence pitch>" \
  --domain blain-projects.ca   # default if omitted
```

What the script does:

1. Sed-replaces `Fullstack Hybrid Template`, `[NAME]`,
   `web_projects_template`, `template.blain-projects.ca`, etc. with
   project values across the agreed file set.
2. Updates `frontend/package.json#name`, `frontend/index.html#<title>`,
   `frontend/src/App.tsx` brand string.
3. Writes `PROJECT_NAME` and `DOMAIN_NAME` to `.env`.
4. Bumps `.specify/constitution.md` last-updated.
5. **Deletes `ONBOARDING.md`** as its final step (only if every
   substitution succeeded — atomic-ish via a temp file).

The agent **does not** hand-edit the files the script handles — keep
the script as the single source of truth so it stays maintainable.

## Phase 6 — Verify

```bash
PROJECT_NAME=<slug> ./scripts/validate-deploy-ready.sh
```

All checks must pass. Then sanity-grep:

```bash
grep -RIn "Fullstack Hybrid Template\|\[NAME\]\|web_projects_template" \
  --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=__pycache__ \
  . || echo "clean"
```

Expected output: `clean` (with maybe a benign reference inside the
finalization script itself, which is fine — it's the source of those
strings).

Confirm to the user:

> "Onboarding complete. `ONBOARDING.md` removed. `PROJECT.md` filled.
> `validate-deploy-ready.sh` green. Resuming your request: **[restated
> original request]**."

## Phase 7 — Resume the user's request

The original user request was captured in Phase 0. Restate it verbatim
and execute it using the normal workflow (plan, TDD vertical slices,
verify).

---

## Hard rules

| ❌ Do NOT | ✅ Do |
|---------|------|
| Ask questions before showing the plan | Show plan, get approval, then ask |
| Write production code during onboarding | Only edit artifacts the flow specifies |
| Delete `ONBOARDING.md` manually | Let `finalize-onboarding.sh` do it (it gates on substitutions succeeding) |
| Improvise answers | Always ask; never assume |
| Skip phases under user pressure | Acknowledge urgency, complete anyway (3 min) |
| Touch generic infra docs in finalization | Keep `NETWORK.md`, `OPENCLAW.md`, `AI skills/*` generic |

## Token-saving tips

- Ask 3 questions per batch — the user can answer them in one paragraph.
- Don't repeat the user's answer back; just save it.
- Use caveman mode for confirmation steps ("Saved.", "Plan applied.",
  "Verify ok.").
- The finalization script is faster than the agent doing every
  substitution individually — prefer it.

## Recovery if interrupted

If the session ends mid-onboarding:

- `PROJECT.md` has whatever was saved so far.
- `ONBOARDING.md` is still present → next agent re-triggers the flow.
- Replay only the unanswered batches by reading `PROJECT.md` and
  spotting the still-`<!-- TODO -->` sections.
