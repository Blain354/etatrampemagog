# Testing Patterns (ECC)

## TDD Workflow
1. **RED** — Write failing test
2. **GREEN** — Write minimal code to pass
3. **REFACTOR** — Improve while keeping tests green

## pytest Fundamentals

### Basic Test
```python
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
```

### Fixtures
```python
@pytest.fixture
def db_session():
    from sqlmodel import Session
    from database import engine
    with Session(engine) as session:
        yield session
        session.rollback()

@pytest.fixture
def sample_user(db_session):
    user = User(username="test", email="test@example.com")
    db_session.add(user)
    db_session.commit()
    return user
```

### Parametrization
```python
@pytest.mark.parametrize("username,expected", [
    ("alice", True),
    ("bob", True),
    ("", False),
    ("a" * 51, False),
])
def test_username_validation(username, expected):
    is_valid = validate_username(username)
    assert is_valid == expected
```

### Mocking
```python
from unittest.mock import patch, Mock

@patch("main.send_email")
def test_user_registration(mock_send_email):
    mock_send_email.return_value = True
    
    response = client.post("/api/users", json={
        "username": "test",
        "email": "test@example.com"
    })
    
    assert response.status_code == 201
    mock_send_email.assert_called_once()
```

## Test Structure (AAA)
```python
def test_create_user():
    # Arrange
    user_data = {"username": "test", "email": "test@example.com"}
    
    # Act
    response = client.post("/api/users", json=user_data)
    
    # Assert
    assert response.status_code == 201
    assert response.json()["username"] == "test"
```

## Coverage
```bash
# Run with coverage
pytest --cov=backend --cov-report=term-missing --cov-report=html

# Target: 80%+ coverage
# Critical paths: 100% coverage
```

## Running Tests
```bash
# All tests
pytest

# Specific file
pytest tests/test_users.py

# Specific test
pytest tests/test_users.py::test_create_user

# Verbose
pytest -v

# With coverage
pytest --cov=backend --cov-report=html

# Fast only (skip slow)
pytest -m "not slow"

# Until first failure
pytest -x
```
