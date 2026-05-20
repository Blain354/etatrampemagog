# 🚀 Fullstack Hybrid Template: React 19 (Compiler) + FastAPI

This repository is a production-ready boilerplate for modern fullstack applications. It bridges the performance of **React 19** with the flexibility and typesafety of **FastAPI** (Python), all orchestrated by **Docker** and **Traefik**.

---

## ⚡ Quickstart

Ouvre deux terminaux et copie-colle les commandes ci-dessous :

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend

# Crée et active l'environnement virtuel (première fois seulement)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000/api/health
```

---

## 🏗️ System Architecture

- **Frontend:** React 19 + TypeScript + **React Compiler**. Served by a high-performance **Nginx** server.
- **Backend:** Python 3.9+ + FastAPI. Managed by **Uvicorn** for production-grade async performance.
- **Database:** SQLite persisted on a Docker Volume path (`/app/data`), using **SQLModel** and **Alembic**.
- **Reverse Proxy:** **Traefik v3**. Handles automatic Let's Encrypt SSL certificates and routing.
- **Networking:** Private virtual bridge (`web_network`). Services communicate internally via Docker DNS.

---

## 🚀 Deployment Instructions

1. **Fork** this repository to your GitHub account.
2. **Trigger via Discord (OpenClaw):**
  Send this command to your agent:
  > "Deploy project **[NAME]** using repo **[git@github.com](mailto:git@github.com):[USER]/[REPO_NAME].git**"
3. **Access your App:**
  - **Frontend:** `https://[NAME].blain-projects.ca`
    - **Backend API:** `https://api.[NAME].blain-projects.ca`

---

## 📡 Communication Protocol

Crucial distinction for developers:

1. **Browser to API (External):** Your React code (running in the user's browser) **must** use the public URL:
  `fetch('https://api.[NAME].blain-projects.ca/api/status')`
2. **Server to Server (Internal):** If you add a service (like a database manager or a worker) that needs to talk to the Python backend, use the Docker alias:
  `http://backend:5000/api/status` (Faster, bypasses the public internet).

3. **Agent to Agent (via OpenClaw Bridge):** To talk to an OpenClaw agent (Fishey, Buddy, Makey), use the internal bridge endpoint:
  `http://openclaw-bridge:8000/api/internal/v1/agents/{agent}/send`
  → Requires `X-Bridge-Token` header. Full guide: **[OPENCLAW.md](OPENCLAW.md)**

---

## 🤖 Communication avec les Agents OpenClaw

### Intégration en 3 étapes

Ton projet peut communiquer avec n'importe quel agent OpenClaw (ex: Fishey pour la pêche) via le **Bridge permanent**.

**1. Assure-toi que ton conteneur est sur `web_network` :**

```yaml
# docker-compose.yml
networks:
  web_network:
    external: true
```

**2. Ajoute un transport dans ton backend :**

```python
# backend/openclaw_transport.py
import httpx

def send_to_agent(agent: str, prompt: str) -> dict:
    return httpx.post(
        f"http://openclaw-bridge:8000/api/internal/v1/agents/{agent}/send",
        json={"prompt": prompt, "timeout_seconds": 120},
        headers={"X-Bridge-Token": "bridge-super-secret-token-2026"},
        timeout=150,
    ).json()
```

**3. Utilise-le :**

```python
result = send_to_agent("fishey", "Meilleurs spots de pêche au doré?")
if result["success"]:
    print(result["response"])  # JSON structuré de l'agent
```

### Architecture

```
Ton Backend → Bridge (Docker) → Relay Helper (Host) → OpenClaw CLI → Agent
```

Le bridge (`openclaw-bridge`) est un service Docker permanent, déjà déployé sur le serveur.
Aucune installation supplémentaire nécessaire dans ton projet.

> 📖 **[Documentation complète : OPENCLAW.md](OPENCLAW.md)** — Architecture détaillée, sécurité, maintenance, ajout d'agents.

---

## ⚠️ Critical Development Notes

* **React Compiler:** This template uses the new React 19 Compiler. You no longer need `useMemo` or `useCallback` in most cases; the compiler optimizes re-renders automatically.
* **CORS & Authentication:** The backend uses FastAPI's `CORSMiddleware` with explicit configuration. The frontend **must** use `credentials: 'include'` in all `fetch()` calls. **Read `NETWORK.md`** for the full explanation of the Traefik Zero-Trust setup.
* **Statelessness:** Docker containers are **ephemeral**. Any file saved inside a container will be deleted on the next deploy. A volume mapped to `/app/data/` is strictly provisioned for the SQLite Database (`database.db`).

---

## 🤖 IoT, Robotics & Embedded Integration

Since this stack is designed for engineering projects, here are the recommendations for hardware integration:

### 1. Protocol: REST vs. WebSockets vs. MQTT

- **REST (Standard):** Best for periodic sensor updates. Send POST requests from your ESP32/Raspberry Pi to the API endpoint.
- **WebSockets (Real-time):** If you are building a **robotic controller** (like a gauntlet or exoskeleton), use WebSockets to reduce latency between the UI and the hardware.
- **MQTT (Scalable IoT):** For a fleet of sensors, add a **Mosquitto** container to the `docker-compose.yml`. MQTT is more resilient to unstable network conditions.

### 2. Embedded Security

- **TLS/SSL:** Traefik provides modern HTTPS. Ensure your microcontrollers support **TLS 1.2/1.3**.
- **Authentication:** Use a unique `X-API-KEY` header for your devices. Never hardcode GitHub or SSH keys on the hardware itself.

---

## 📈 Scaling & Advanced Tips

### Adding a Persistent Database (PostgreSQL)

Update your `docker-compose.yml` with:

```yaml
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - web_network
```

### Resource Management

If your backend performs heavy robotic simulations or AI processing:

- **Limits:** Add `deploy.resources.limits` in Docker to prevent a single project from consuming all the server's RAM.
- **Background Tasks:** Use **Celery** with **Redis** if a Python function takes more than 5 seconds to execute.

---

### Sources & Documentation

- **React Compiler (React Forget):** [Official React Documentation](https://react.dev/learn/react-compiler)
- **Docker Compose Networking:** [Docker Docs](https://docs.docker.com/compose/networking/)
- **Traefik Docker Provider:** [Traefik v3 Documentation](https://doc.traefik.io/traefik/routing/providers/docker/)

---

## 🧠 Agent Methodology: How To Actually Use These Skills

> **Philosophy**: Skills don't produce good code by magic. The agent is a tool — YOU are the engineer. The quality of the output depends on how you use the tool. This section explains the merged methodology from [Matt Pocock's skills](https://github.com/mattpocock/skills) and our template's existing approach.
>
> **Source repo**: https://github.com/mattpocock/skills — MIT licensed, "Skills for Real Engineers. Straight from my .claude directory."

### The Core Problem

> *"No-one knows exactly what they want"* — David Thomas & Andrew Hunt, The Pragmatic Programmer

The #1 failure mode in AI-assisted coding is **misalignment**. You think the agent understood your intent. It didn't. You see what it built and realize it was solving a different problem.

The #2 failure mode is **token waste**. The agent re-explains the same concepts every session, uses verbose language, and spends tokens on exploration that should have been documented once.

The #3 failure mode is **feedback blindness**. The agent writes code without knowing if it works, producing fragile implementations that pass the happy path and break everywhere else.

Our methodology addresses all three.

### The Flow: Clarify → Plan → Build → Verify → Debug

Use this flow for every non-trivial change. Skip steps only when you can justify why.

#### Step 1: Clarify (Alignment) ⭐

**Trigger**: Say **"grill me"** or **"let's align on this first"** before starting.

The agent interviews you about the plan — ONE question at a time, walking down each branch of the design tree. For each question, it provides its recommended answer. You just approve or correct.

**Why this works:**
- Forces you to think through edge cases BEFORE coding
- The agent surfaces contradictions in your plan early
- Terms get resolved → added to `CONTEXT.md` → never re-explained again
- Saves 10-50K tokens in avoided rework for a 1-3K token investment

**With docs**: If `CONTEXT.md` exists, the agent also challenges your terminology, proposes precise terms, and updates the glossary inline.

**Without docs**: Still valuable. The grill alone catches misalignment before it costs time.

See: `AI skills/grill-session.md`

#### Step 2: Plan (ReAct)

**Trigger**: The agent reads the system prompt and generates a plan.

- **Thought**: What modules are affected? What's the right approach?
- **Action**: What specific files/changes are needed?
- **Verification**: How will we confirm it works?

Check the plan against `CONTEXT.md` vocabulary — are the module names right? Does it respect existing ADRs?

See: `.agent/system_prompt.md`, `AI skills/development-workflow.md`

#### Step 3: Build (TDD Vertical Slices)

**Trigger**: Say **"start building"** or approve the plan.

The agent writes ONE test, then the implementation for that test, then repeats. This is the **vertical slice** approach — never "write all tests then all code".

```
RIGHT (vertical):          WRONG (horizontal):
  test1 → impl1              test1, test2, test3
  test2 → impl2              impl1, impl2, impl3
  test3 → impl3
```

**Why vertical slices produce better code:**
- Each test verifies ACTUAL behavior (what you just built), not IMAGINED behavior
- Tests survive refactors because they test through public interfaces
- You catch misunderstandings after 1 test, not after 10

**Rules:**
- Test behavior, not implementation. If renaming an internal function breaks a test, the test was wrong.
- One concept per test.
- AAA pattern: Arrange → Act → Assert.

See: `.cursor/rules/testing.mdc`, `.cursor/agents/tdd-guide.mdc`

#### Step 4: Verify

**Trigger**: Agent runs the verification checklist automatically.

- [ ] Code builds/starts without errors
- [ ] All tests passing (80%+ coverage)
- [ ] Linting and type checking clean
- [ ] Modified endpoints respond correctly
- [ ] Docker/Traefik compatible
- [ ] Documentation updated
- [ ] No secrets hardcoded

See: `AI skills/development-workflow.md`

#### Step 5: Debug (When Needed)

**Trigger**: Say **"diagnose this"** or **"debug this"** when something breaks.

The agent follows a structured 6-phase loop:

1. **Build a feedback loop** (70% of effort) — Find a fast, deterministic way to reproduce the bug
2. **Reproduce** — Run the loop, watch the bug appear
3. **Hypothesize** — Generate 3-5 ranked hypotheses, show them to you
4. **Instrument** — One variable at a time, targeted logs/debugger
5. **Fix + regression test** — Write the test BEFORE the fix
6. **Cleanup** — Remove debug code, state the correct hypothesis in commit

**Key insight**: The feedback loop IS the skill. Everything else is mechanical. If you can't reproduce it, you can't fix it.

See: `AI skills/diagnose.md`

### Token Economics: Why This Saves Money

| Action | Tokens In | Tokens Saved |
|--------|-----------|-------------|
| Grill session | 1-3K | 10-50K (avoids rework) |
| CONTEXT.md | 200-500/turn (read) | Thousands (stops re-explanation) |
| Caveman mode | 0 | 75% of every response |
| Vertical TDD | ~same as horizontal | Enormous (correct tests, no rewrite) |
| Diagnose loop | 2-5K | 10-30K (no random flailing) |

**Net effect**: A project using all these skills costs roughly **40-60% fewer tokens** than one using none.

### Communication Modes

#### Normal Mode (default)
Full explanations, reasoning, context. Use for planning, architecture discussions, onboarding.

#### Caveman Mode
**Trigger**: Say **"caveman mode"**, **"less tokens"**, or **"be brief"**.

Ultra-compressed. The agent drops articles, filler, pleasantries. Keeps full technical accuracy.

```
Normal:  "Sure! I'd be happy to help you with that. The issue you're experiencing
          is likely caused by a race condition in the useEffect hook. Let me explain..."

Caveman: "Bug in useEffect. Race condition — state update after unmount. Fix: cleanup fn."
```

**When to use caveman:**
- Deep in implementation (you know what you're doing)
- Quick fixes and refactors
- When you're paying per token

**When NOT to use caveman:**
- Planning/architecture discussions
- Security decisions
- When you need the agent to explain its reasoning

See: `AI skills/caveman-mode.md`

### The Domain Glossary (CONTEXT.md)

This is the **single highest-ROI technique** in the entire methodology.

Create a `CONTEXT.md` at the repo root. Define project-specific terms. One sentence each. Be opinionated — pick ONE term per concept.

```md
## Language

**Order**:
A request from a Customer for one or more Products.
_Avoid_: Purchase, transaction, request

**Invoice**:
A request for payment sent to a Customer after delivery.
_Avoid_: Bill, payment request
```

**Why this works:**
- Agent stops re-explaining concepts → fewer tokens every session
- Variable/function/file naming becomes consistent → easier navigation
- The agent writes code that domain experts can read
- Grill sessions use the glossary as a contract

**When to update CONTEXT.md:**
- During grill sessions (when terms crystallize)
- When the agent proposes a new term
- When you notice naming inconsistency
- When domain experts disagree on terminology

See: `AI skills/domain-language.md`

### When To Use Each Skill

| Situation | Skill | Trigger |
|-----------|-------|---------|
| Starting a feature | Grill session | "grill me" |
| Writing code | TDD vertical slices | Automatic (in workflow) |
| Something's broken | Diagnose | "diagnose this" |
| Saving tokens | Caveman mode | "caveman mode" |
| New concept/term | Domain language | Agent proposes term → add to CONTEXT.md |
| Planning | ReAct plan | Automatic (system prompt) |
| Architecture review | Improvement | "find refactoring opportunities" |

### Anti-Patterns (What NOT To Do)

1. **❌ Skipping the grill**: "I know what I want, just code it." — You don't. Grill it.
2. **❌ Horizontal TDD**: Writing all tests then all code → tests of imagined behavior
3. **❌ Testing implementation**: Mocking internals → tests break on refactor
4. **❌ No feedback loop**: Debugging by staring at code → wasting tokens
5. **❌ Empty CONTEXT.md**: Creating the file with no terms → waste of space
6. **❌ Always caveman**: Using caveman for planning → missing important context
7. **❌ Ignoring the glossary**: Using "account" when CONTEXT.md says "Customer" → inconsistency

### Architecture Decision Records (ADR)

When a decision is **hard to reverse**, **surprising without context**, and **the result of a real trade-off** — document it.

Create `docs/adr/` at the repo root. Format:

```md
# ADR-0001: Use SQLite for v1

## Status
Accepted

## Context
We need a database for the MVP. Options: SQLite, PostgreSQL, Supabase.

## Decision
SQLite with Alembic migrations. Docker volume for persistence.

## Consequences
- Pro: Zero config, single file, easy backup
- Con: No concurrent writes, no built-in auth
- Trade-off: We accept SQLite limits for v1 simplicity. Migrate to Postgres when write concurrency becomes a real bottleneck.
```

The agent reads ADRs before making architecture suggestions. It won't re-litigate accepted decisions unless you ask it to.

See: `AI skills/grill-session.md` (ADR creation is built into grill-with-docs)

