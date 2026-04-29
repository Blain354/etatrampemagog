# Security Review (ECC)

## Pre-Commit Checklist
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated (Pydantic models)
- [ ] SQL injection prevention (SQLModel parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection (CORS configured)
- [ ] Authentication/authorization verified
- [ ] Rate limiting on endpoints
- [ ] Error messages don't leak sensitive data

## FastAPI Security

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # Never use "*" with credentials
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Input Validation
```python
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8)
```

### Dependency Injection for Auth
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = verify_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return user

@app.get("/api/protected")
def protected_route(user: User = Depends(get_current_user)):
    return {"message": f"Hello {user.username}"}
```

### Rate Limiting
```python
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/users")
@limiter.limit("100/minute")
def list_users(request: Request):
    return users
```

## Error Handling
```python
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    # Log full error internally
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    
    # Return generic message to client
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```

## Dependency Security
```bash
# Check for vulnerabilities
pip-audit
safety check

# Update dependencies
pip install --upgrade -r requirements.txt
```
