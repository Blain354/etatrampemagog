# API Design Patterns (ECC)

## REST Conventions

### URL Structure
```
GET    /api/v1/users           # List (paginated)
GET    /api/v1/users/{id}      # Get one
POST   /api/v1/users           # Create
PUT    /api/v1/users/{id}      # Full update
PATCH  /api/v1/users/{id}      # Partial update
DELETE /api/v1/users/{id}      # Delete
```

### HTTP Status Codes
| Code | When to Use |
|------|-------------|
| 200 | GET, PUT, PATCH success |
| 201 | POST success (created) |
| 204 | DELETE success |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, etc.) |
| 422 | Unprocessable entity |
| 429 | Rate limited |
| 500 | Server error (generic message) |

### Pagination
```python
# Offset-based (simple)
GET /api/users?offset=0&limit=20

# Cursor-based (scalable)
GET /api/users?cursor=abc123&limit=20
```

### Filtering
```python
GET /api/users?is_active=true&role=admin
GET /api/users?created_after=2024-01-01
GET /api/users?sort=-created_at  # descending
```

## FastAPI Implementation

### Response Models
```python
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    
    class Config:
        from_attributes = True  # For SQLModel compatibility

@app.get("/api/users/{id}", response_model=UserResponse)
def get_user(id: int):
    return user
```

### Request Validation
```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v
```

### Error Responses
```python
from fastapi import HTTPException

@app.get("/api/users/{id}")
def get_user(id: int):
    user = session.get(User, id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "User not found",
                "code": "user_not_found",
                "resource": "user",
                "id": id
            }
        )
    return user
```

## Versioning
```python
# URL versioning (recommended)
@app.get("/api/v1/users")
def list_users_v1(): ...

@app.get("/api/v2/users")
def list_users_v2(): ...
```
