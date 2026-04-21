---
name: fastapi-database-management
description: Guidelines for operating the database using SQLModel and Alembic in the FastAPI backend
---

# FastAPI Database Management

## Goal

Provide standard patterns for data persistence using SQLite, SQLModel, and Alembic within the backend architecture.

## Workflow: Managing Models

1. **Location**: All models must be defined in `backend/models/`.
2. **Standard**: Always use `SQLModel` from the `sqlmodel` library. Do not use plain SQLAlchemy declarative bases.
3. **Registration**: Ensure all models are imported in `backend/models/__init__.py` so that Alembic's `env.py` can discover them via `SQLModel.metadata`.
4. **Security Principle**: **Never store raw passwords or handle native authentication logic.** Authentication is handled externally by Traefik (OAuth/SSO). The database models should strictly handle business logic, user profiles, or permissions—not credentials.

## Workflow: Applying Migrations

When a model is created or updated:

1. **Generate Migration**: Run `alembic revision --autogenerate -m "description of your change"` from the `backend/` directory.
2. **Review**: Always review the generated script in `backend/alembic/versions/` (ensure it imports `sqlmodel`).
3. **Apply**: Run `alembic upgrade head` to apply changes to the SQLite database.

## Architecture Guidelines

- The database connection string connects to `sqlite:///data/database.db`.
- The SQLite file is persisted in a Docker volume `backend_sqlite_data` mounted at `/app/data/`.
- Repositories/Endpoints must rely on the dependency injection mechanism in `database.py` via `Session = Depends(get_session)`.

## Verification

Before pushing database schema changes:
1. Verify the migration applies successfully to an empty database.
2. Verify test suites pass (run `pytest`). Tests may use an in-memory SQLite database or the staging one.
