# Rule loading strategy (Agent + Cursor)

Shared strategy:

- Keep only a minimal global rule (no large context preload).
- Load specialized rules on demand based on file type/task.
- Read `AI skills/*` docs only when relevant to the current task.

Goal:

Prevent context rot, reduce noise, and keep decisions precise.

## When creating a new rule

Always ask these scoping questions:

1. What exact trigger (files/globs)?
2. Automatic or manual trigger?
3. What minimal context should be loaded (1-3 docs)?
4. What is explicitly out of scope?

Then create:

- a targeted `.cursor/rules/*.mdc` rule,
- and a matching `.agent/context/*` reference using the same trigger strategy.
