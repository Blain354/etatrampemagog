# IDE-Agnostic Skill Authoring

## Goal

Define a standard method to create skills that are:

- modular (small reusable blocks),
- portable across IDEs/agents (Cursor, Copilot CLI, Gemini CLI, etc.),
- easy to maintain.

## Design principles

1. Separate "what" from "how":
  - user asks for the outcome (what),
  - skill enforces the workflow (how) only when needed.
2. Progressive disclosure:
  - `SKILL.md` contains the operational minimum,
  - long details live in linked reference files.
3. Low platform coupling:
  - avoid single-tool instructions when equivalents exist.
4. Stable terminology:
  - keep neutral terms (`agent`, `tool`, `workflow`, `verification`) consistent.
5. Skill vs integration separation:
  - skill remains neutral (no IDE loader config in `SKILL.md`),
  - integration references are created separately.

## Recommended skill structure

```
skill-name/
├── SKILL.md
├── reference.md
├── examples.md
└── scripts/
```

## Minimum `SKILL.md` contract

Keep `SKILL.md` concise (ideally < 500 lines) and include:

1. YAML frontmatter:
  - `name`: explicit stable kebab-case,
  - `description`: concrete trigger conditions.
2. A "Workflow" section with actionable steps.
3. A "Verification" section with required evidence.
4. An "Escalation/Blockers" section.
5. No IDE integration section inside the skill itself.

## Integration references (required, outside skill)

When creating a skill in `AI skills`, also create integration references in:

- `.cursor/rules`
- `.agent/context`

Rules:

- Never complete skill creation without `.cursor` + `.agent` references.
- Avoid global preload rules that load all skills.
- Skills must be loaded just-in-time, only when needed.

## Workflow for creating a new skill

1. Scope the need:
  - which recurring problem the skill solves,
  - where it should trigger.
2. Define contract:
  - expected input (intent, files, constraints),
  - expected output (format, evidence level).
3. Write concise `SKILL.md`:
  - clear steps,
  - explicit decisions,
  - measurable completion criteria.
4. Extract details to references:
  - examples and edge cases,
  - platform-specific tool mapping.
5. Create integration references:
  - create/update targeted rule in `.cursor/rules`,
  - create/update matching context file in `.agent/context`,
  - verify both point to the skill in `AI skills`.
6. Validate with a real task:
  - run a representative task,
  - verify the skill is discovered, applied, and completed with evidence.

## Mandatory trigger questionnaire (for rule creation)

When user asks to create a rule (or implies a new rule), ask these before writing it:

1. Which files/types should trigger the rule? (precise globs)
2. Should the rule trigger automatically or manually?
3. What minimal context should be loaded? (1-3 docs max)
4. What is explicitly out of scope to prevent context rot?

Without these answers, do not produce a global always-apply rule.

## Recommended Cursor rule template

```markdown
---
description: <focused rule objective>
globs:
  - "<glob-1>"
  - "<glob-2>"
---

# <Rule Name>

Load only:
- `AI skills/<doc-1>.md`
- `AI skills/<doc-2>.md`

Do not load unrelated docs/skills.
```

## Maintenance

- Version workflow changes in git history.
- Remove obsolete sections instead of stacking variants.
- Keep one default path with limited exceptions.
