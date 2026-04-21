# Strict Architectural Context
- **Frontend:** Vite, React 19, TypeScript, using the React Compiler (no manual useMemo/useCallback). Served by Nginx in production.
- **Backend:** Python 3.9+, FastAPI, Uvicorn, SQLModel. `CORSMiddleware` is mandatory.
- **Infrastructure:** Docker Compose. Services communicate via the `web_network` virtual network (e.g., `http://backend:5000`).
- **Database:** SQLite persisted via Docker volumes (`/app/data`). Migrations via Alembic.
- **Security:** Authentication is handled by Traefik ForwardAuth (Google OAuth). The application code does not handle passwords.
