# Generic Agentic Rules

## Context Loading Strategy
- Load context ONLY when required for the current task
- Use specialized rules in `.cursor/rules/*` based on touched files
- Reference `AI skills/*` on demand, never by default
- Prioritize closest domain docs (API, deployment, security, workflow)

## Code Quality Standards
- Functions: <50 lines
- Files: <800 lines (200-400 typical)
- No deep nesting (>4 levels)
- Early returns over nested conditionals
- Extract utilities from large modules

## Decision Making
- Prefer simplest solution that works (KISS)
- Extract repetition into shared utilities (DRY)
- Don't build before it's needed (YAGNI)
- Optimize for clarity over cleverness

## Error Handling Pattern
```typescript
// TypeScript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Unexpected error'
}

async function operation() {
  try {
    return await riskyCall()
  } catch (error: unknown) {
    logger.error('Failed', error)
    throw new Error(getErrorMessage(error))
  }
}
```

```python
# Python
def get_error_message(error: Exception) -> str:
    return str(error)

def operation():
    try:
        return risky_call()
    except Exception as e:
        logger.error(f"Failed: {e}")
        raise
```

## Input Validation Pattern
```typescript
// TypeScript with Zod
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

type UserInput = z.infer<typeof userSchema>
const validated = userSchema.parse(input)
```

```python
# Python with marshmallow
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    email = fields.Email(required=True)
    age = fields.Integer(validate=validate.Range(min=0, max=150))

schema = UserSchema()
validated = schema.load(data)
```

## When to Ask vs Decide
- **Decide**: Code style, implementation approach, file organization
- **Ask**: Architecture changes, security decisions, deployment changes, dependency additions
