# Backend Patterns (ECC)

## When to Use
- Designing API endpoints
- Implementing CRUD operations
- Adding business logic
- Setting up middleware

## API Design

### Resource-Based URLs
```
GET    /api/users              # List
GET    /api/users/{id}         # Get one
POST   /api/users              # Create
PUT    /api/users/{id}         # Update (full)
PATCH  /api/users/{id}         # Update (partial)
DELETE /api/users/{id}         # Delete
```

### Response Format
```python
# Success
{"data": user, "meta": {"total": 100}}

# Error
{"error": "User not found", "detail": "No user with id 123"}
```

## Repository Pattern
```python
class UserRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get(self, id: int) -> User | None:
        return self.session.get(User, id)
    
    def create(self, user: UserCreate) -> User:
        db_user = User.model_validate(user)
        self.session.add(db_user)
        self.session.commit()
        return db_user
```

## Service Layer
```python
class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo
    
    def register(self, data: UserCreate) -> User:
        # Business logic
        if self.repo.get_by_email(data.email):
            raise HTTPException(409, "Email already exists")
        return self.repo.create(data)
```

## Dependency Injection
```python
from fastapi import Depends

def get_user_repo(session: Session = Depends(get_session)):
    return UserRepository(session)

def get_user_service(repo: UserRepository = Depends(get_user_repo)):
    return UserService(repo)

@app.post("/api/users")
def create(user: UserCreate, service: UserService = Depends(get_user_service)):
    return service.register(user)
```

## Error Handling
```python
from fastapi import HTTPException

class NotFoundError(HTTPException):
    def __init__(self, resource: str, id: int):
        super().__init__(status_code=404, detail=f"{resource} {id} not found")

# Usage
if not user:
    raise NotFoundError("User", user_id)
```

## Middleware
```python
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response
```
