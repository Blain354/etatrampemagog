# Recommended Development Workflow

## 0) Research & Reuse (Mandatory Before Implementation)
- Search existing codebase for similar implementations
- Check if a library/package already solves the problem
- Prefer battle-tested solutions over hand-rolled code

## 1) Before Coding
- Read `project-context.md` and `deployment-architecture.md`
- Identify impacted endpoints and components
- Clarify local and production impact
- Create implementation plan

## 2) During Implementation
- Make incremental changes
- Follow TDD: write tests first (RED), implement (GREEN), refactor (IMPROVE)
- Verify API compatibility for every changed/added endpoint
- Update technical documentation when contracts change
- Run linters and type checkers after each change

## 3) Local Verification

### Frontend
```bash
cd frontend
npm run dev      # Dev server: http://localhost:5173
npm run build    # Production build
npm run lint     # ESLint check
```

### Backend
```bash
cd backend
python app.py    # Or: flask run
# Check: GET http://localhost:5000/api/health
```

### Full Stack (Docker)
```bash
docker-compose up --build
```

## 4) Pre-Deployment Verification
- Confirm API URLs by environment (local vs public)
- Confirm required environment variables
- Verify no added dependency was missed
- Run full test suite with 80%+ coverage
- Security checklist passed

## 5) Definition of Done
- [ ] Code builds/starts without errors
- [ ] All tests passing (80%+ coverage)
- [ ] Linting and type checking clean
- [ ] Modified endpoints respond correctly
- [ ] Behavior compatible with Docker/Traefik deployment
- [ ] Documentation updated when relevant
- [ ] No secrets or hardcoded values
- [ ] Security checklist passed

## Commit Convention
Use conventional commits:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` code change
- `test:` tests
- `chore:` maintenance

Example: `feat(auth): add JWT login endpoint`
