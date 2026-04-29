# 🚀 Web Projects Template — React 19 + FastAPI + Docker

> **Fullstack boilerplate** avec React 19 Compiler + Vite + TypeScript + Python FastAPI + Docker/Traefik.
> Fork ce projet pour lancer un nouveau projet web — tout est pré-configuré.

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

## 🧠 Cursor Rules Intégrées

Ce template intègre des **best practices de Everything Claude Code (ECC)** adaptées pour Cursor :

| Fichier | Description |
|---------|-------------|
| `.cursorrules` | Règles globales (KISS, DRY, YAGNI, immutabilité) |
| `.cursor/rules/typescript-react.mdc` | React 19 + TypeScript + Vite |
| `.cursor/rules/python-flask.mdc` | Python + Flask backend |
| `.cursor/rules/api-context.mdc` | API endpoints |
| `.cursor/rules/deployment-context.mdc` | Docker/Traefik |
| `.cursor/rules/security.mdc` | Sécurité (secrets, XSS, SQLi) |
| `.cursor/rules/testing.mdc` | TDD et couverture 80%+ |
| `.cursor/rules/performance.mdc` | Core Web Vitals, bundle budgets |
| `.cursor/rules/workflow.mdc` | Pipeline de développement |

Les règles se chargent automatiquement selon les fichiers que tu touches. Voir `AI skills/cursor-ecc-integration.md` pour les détails.

---

## 🏗️ Stack Technique

- **Frontend:** React 19 + TypeScript + React Compiler + Vite
- **Backend:** Python + FastAPI + Uvicorn
- **Reverse Proxy:** Traefik v3 (SSL automatique)
- **Containerisation:** Docker Compose + Dockerfile

---

## 🚀 Déploiement

1. Fork ce repo dans ton GitHub
2. Envoie la commande à ton agent OpenClaw :
   > "Deploy project **[NAME]** using repo **git@github.com:[USER]/[REPO_NAME].git**"
3. Accès :
   - Frontend : `https://[NAME].blain-projects.ca`
   - API : `https://api.[NAME].blain-projects.ca`

---

## 📡 Communication

- **Browser → API :** `https://api.[NAME].blain-projects.ca/api/...`
- **Interne Docker :** `http://backend:5000/api/...`
- Toujours utiliser `credentials: 'include'` dans les `fetch()` frontend

---

## ⚠️ Notes Importantes

- React Compiler élimine le besoin de `useMemo`/`useCallback`
- Les conteneurs Docker sont éphémères — utilise des volumes pour les données persistantes
- Voir `NETWORK.md` pour les détails du dual-router pattern
- Toujours utiliser des variables d'environnement — jamais de secrets en dur