---
description: Project onboarding flow — triggered when PROJECT.md is still in template state.
---

# Project Onboarding Workflow

## Trigger

This workflow is activated when `PROJECT.md` contains `TODO: DEFINE YOUR PROJECT` or `ONBOARDING_PENDING`.

## Immediate Actions (Priority over all other tasks)

1. **Stop current task evaluation** — onboarding takes absolute priority.
2. **Read `AI skills/onboarding.md`** for the full procedure.
3. **Execute Phase 1**: Analyze the repository (files, deps, structure).
4. **Execute Phase 2**: Run the interactive questionnaire (batches of 2-3 questions).
5. **Execute Phase 3**: Write the identity back to PROJECT.md, README.md, package.json, index.html.
6. **Proceed to original request** after user confirms the identity.

## Key Rules

- Never skip onboarding even if the user seems to want to go fast.
- Always restate the original request when transitioning back to it.
- Save incrementally (after each batch) to avoid data loss.
- Keep the conversation warm and engaging, not robotic.
