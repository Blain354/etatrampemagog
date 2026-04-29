# Project Onboarding Flow

> **Trigger**: This flow is triggered when a coding agent detects that `PROJECT.md` contains
> the `TODO: DEFINE YOUR PROJECT` marker or `ONBOARDING_PENDING` at the bottom.
>
> **Rule**: When triggered, this onboarding takes PRIORITY over any other user request.
> The agent MUST complete the onboarding before executing the user's actual task.

---

## Phase 0: Detection

At session start, the agent MUST read `PROJECT.md`. If the file contains:

- `TODO: DEFINE YOUR PROJECT` (in the header)
- OR `<!-- MARKER: ONBOARDING_PENDING -->` (at the bottom)

→ The project is in its **template/default state**. Proceed to Phase 1.

If `PROJECT.md` has been filled in (no markers present), skip onboarding entirely.

---

## Phase 1: Repository Analysis (Automatic)

Before asking the user anything, the agent MUST:

1. **Read existing project files** to understand what's already defined:
   - `PROJECT.md` (current state)
   - `README.md` (overall description)
   - `frontend/package.json` (dependencies, name)
   - `backend/pyproject.toml` or `backend/requirements.txt` (backend deps)
   - `docker-compose.yml` (services)
   - `.env` (environment variables — read only, never expose secrets)

2. **Summarize findings** for the user:
   - "Here's what I can see about your project so far: ..."
   - "Let me help you define its identity. I'll ask you a few questions."

---

## Phase 2: Identity Questionnaire (Interactive)

Ask questions in **batches of 2-3** to avoid overwhelming the user.
Wait for user responses before asking the next batch.

### Batch A — Core Identity
1. **What's the project name?** (Short, memorable, URL-friendly)
2. **In ONE sentence, what does it do?** (The elevator pitch)
3. **What problem does it solve?** (Why would anyone care?)

### Batch B — Audience & Scope
4. **Who is this for?** (Developers? Consumers? Businesses? Specific niche?)
5. **What are the 3-5 MUST-HAVE features for v1?** (MVP scope)
6. **What are explicit NON-goals for v1?** (Avoid scope creep)

### Batch C — Design & Vibe
7. **Describe the visual style in 3 words** (e.g. "Clean, Professional, Dark")
8. **Any brand colors in mind?** (Primary, secondary, accent)
9. **Any existing brand or project to use as visual reference?** (URLs, inspiration)

### Batch D — Technical Constraints
10. **Any special technical requirements?** (Real-time, offline-first, multi-tenant, PWA, etc.)
11. **User authentication needed?** (Google OAuth is default via Traefik, but do you need app-level auth with roles?)
12. **Any third-party integrations?** (Stripe, SendGrid, OpenAI, WebSocket, etc.)

### Batch E — Business & Success
13. **How will you monetize?** (Or is it free/open-source/internal tool?)
14. **What does success look like in 3 months?** (Users? Revenue? Personal learning?)
15. **Who are the competitors or similar projects?** What makes yours different?

---

## Phase 3: Write Back

After all questions are answered, the agent MUST:

1. **Fill in `PROJECT.md`** with all user answers, replacing each `<!-- TODO -->` section
2. **Remove the `<!-- MARKER: ONBOARDING_PENDING -->` line** (this deactivates future onboarding)
3. **Update `README.md`** with the project name, pitch, and badge reflecting the new identity
4. **Update `frontend/package.json` `name` field** to match the project slug
5. **Update `frontend/index.html` `<title>`** to the project name
6. **Present a summary** of the defined identity and ask: "Does this look right? Want to adjust anything?"

---

## Phase 4: Proceed to Original Request

After the user confirms the identity (or makes adjustments):
- **"Great! Your project now has an identity. Let me work on your original request: [restate original request]"**
- Proceed with the task the user originally asked for.

---

## Example Flow

```
User: "Ajoute un bouton de login sur la navbar"

Agent: 👋 I notice this is a fresh project from the template.
      Let me quickly analyze what we have...
      
      I see a React 19 + FastAPI stack, with SQLite, Traefik, Docker Compose.
      Your README is still the default template.
      
      Let's give this project an identity before I jump into code.
      I have a few questions (2-3 at a time):
      
      [Batch A]
      1️⃣ What's the project name?
      2️⃣ In ONE sentence, what does it do?
      3️⃣ What problem does it solve?

User: "Ça s'appelle TaskFlow, c'est un gestionnaire de tâches..."

Agent: Nice! [saves answers, asks Batch B] ...
      
      [... all batches complete ...]
      
Agent: ✅ Project identity saved to PROJECT.md.
      Summary: TaskFlow — A smart task manager for freelancers...
      
      Now, about that login button — let me plan the implementation...
```

---

## Important Notes

- **NEVER skip onboarding** if markers are present, even if the user seems impatient
- If the user insists on skipping, inform them: *"I can skip this, but your project will lack a defined identity. You can run onboarding later by keeping the markers in PROJECT.md. Want me to proceed?"*
- **Keep it conversational**, not robotic — adapt tone to the user's style
- **Save incrementally** — update PROJECT.md after each batch so progress isn't lost
- The original user request is NEVER lost — restate it explicitly when transitioning to Phase 4
