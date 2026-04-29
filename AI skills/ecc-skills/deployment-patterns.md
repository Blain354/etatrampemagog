# Deployment Patterns (ECC)

## Deployment Strategies

### Rolling Deployment
Replace instances gradually. Zero downtime, backward-compatible changes required.

### Blue-Green Deployment
Run two identical environments. Switch traffic atomically. Instant rollback.

### Canary Deployment
Route small % of traffic to new version first. Catches issues early.

## CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install -r backend/requirements.txt
      - run: cd backend && pytest --cov=. --cov-report=xml
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: backend/coverage.xml

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying ${{ github.sha }}"
```

## Health Checks

```python
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": os.environ.get("APP_VERSION", "unknown"),
        "checks": {
            "database": check_database(),
            "redis": check_redis(),
        }
    }
```

## Environment Configuration

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    project_name: str = "unknown"
    database_url: str = "sqlite:///./database.db"
    redis_url: str = "redis://localhost:6379"
    log_level: str = "info"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )
```

## Production Readiness Checklist
- [ ] All tests passing (80%+ coverage)
- [ ] Docker image builds reproducibly
- [ ] Environment variables documented
- [ ] Resource limits set
- [ ] Health check endpoint working
- [ ] Logging structured (JSON)
- [ ] Error handling covers edge cases
- [ ] Rollback plan tested
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] SSL/TLS enabled
- [ ] Monitoring alerts configured
