# Cursor Rules

This directory contains context-aware rules for Cursor AI.

## How It Works

Cursor automatically loads rules based on the files you're editing:

| Rule | Trigger | Purpose |
|------|---------|---------|
| `agentic-programming.mdc` | All files | Global context loading strategy |
| `typescript-react.mdc` | `frontend/**/*.{ts,tsx}` | React 19 + TypeScript + Vite standards |
| `python-flask.mdc` | `backend/**/*.py` | Python + Flask standards |
| `api-context.mdc` | `backend/**/*.py`, `frontend/src/**/*` | API endpoint guidelines |
| `deployment-context.mdc` | Docker, env files | Infrastructure constraints |
| `security.mdc` | All files | Security checks |
| `testing.mdc` | Test files, source files | TDD workflow and standards |
| `performance.mdc` | Frontend files | Web performance optimization |
| `workflow.mdc` | All files | Development workflow and git conventions |

## Global Rule

The `.cursorrules` file in the project root provides baseline conventions that apply to all files.

## Adding New Rules

1. Create a new `.mdc` file in this directory
2. Add frontmatter with `description` and `globs`
3. Keep rules focused and concise
4. Reference `AI skills/*` for detailed documentation

## Best Practices

- Rules are loaded based on file globs — keep them targeted
- Don't duplicate content between rules
- Update rules when project conventions change
- Write all rules in English
