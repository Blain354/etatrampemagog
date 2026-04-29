# Python Patterns (ECC)

## Core Principles

### Readability Counts
```python
# Good: Clear and readable
def get_active_users(users: list[User]) -> list[User]:
    """Return only active users from the provided list."""
    return [user for user in users if user.is_active]

# Bad: Clever but confusing
def get_active_users(u):
    return [x for x in u if x.a]
```

### Explicit is Better Than Implicit
```python
# Good: Explicit configuration
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Bad: Hidden side effects
import some_module
some_module.setup()  # What does this do?
```

### EAFP — Easier to Ask Forgiveness Than Permission
```python
# Good: EAFP style
def get_value(dictionary: dict, key: str) -> Any:
    try:
        return dictionary[key]
    except KeyError:
        return None

# Bad: LBYL (Look Before You Leap)
def get_value(dictionary: dict, key: str) -> Any:
    if key in dictionary:
        return dictionary[key]
    return None
```

## Type Hints
```python
from typing import Optional, List, Dict, Any

def process_users(
    users: List[User],
    options: Optional[Dict[str, Any]] = None
) -> List[ProcessedUser]:
    ...
```

## Dataclasses
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str
    
    def __post_init__(self):
        if '@' not in self.email:
            raise ValueError("Invalid email")
```

## Context Managers
```python
from contextlib import contextmanager

@contextmanager
def managed_resource():
    resource = acquire()
    try:
        yield resource
    finally:
        resource.release()

# Usage
with managed_resource() as r:
    r.do_something()
```

## Anti-Patterns to Avoid
```python
# Bad: Mutable default arguments
def append_to(item, items=[]):
    items.append(item)
    return items

# Good: Use None
def append_to(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# Bad: Checking type with type()
if type(obj) == list:
    process(obj)

# Good: Use isinstance
if isinstance(obj, list):
    process(obj)

# Bad: Bare except
try:
    risky_operation()
except:
    pass

# Good: Specific exception
try:
    risky_operation()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
```

## Tooling
```bash
# Formatting
black .
isort .

# Linting
ruff check .

# Type checking
mypy .

# Testing
pytest --cov=mypackage --cov-report=html

# Security
bandit -r .
```
