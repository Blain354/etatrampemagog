# 🔐 Network & Security Considerations

> **Ce document est la référence réseau pour tous les projets dérivés de ce template.**
> Il explique comment l'authentification, les CORS et le reverse proxy interagissent.
> Tout développeur ou agent IA qui déploie un nouveau projet doit le lire.

---

## Architecture Réseau

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVIGATEUR (client)                                                │
│                                                                     │
│  1. GET https://monprojet.blain-projects.ca/                        │
│     → Traefik route vers le frontend (nginx)                        │
│     → Middleware google-auth intercepte → vérifie cookie            │
│     → Pas de cookie? → 307 vers Google OAuth                       │
│     → Cookie valide? → page servie normalement                     │
│                                                                     │
│  2. Le frontend fait fetch('https://api.monprojet.../api/data')     │
│     → Navigateur envoie d'abord une requête OPTIONS (preflight)     │
│     → Traefik route OPTIONS vers le backend SANS auth               │
│     → Backend répond avec les headers CORS                          │
│     → Navigateur envoie le vrai GET/POST avec le cookie auth        │
│     → Traefik vérifie le cookie via google-auth middleware          │
│     → Cookie valide? → requête passe au backend                    │
└─────────────────────────────────────────────────────────────────────┘

Flux détaillé:

  Browser                    Traefik                   google-auth            Backend
    │                           │                           │                    │
    │── GET frontend ──────────▶│                           │                    │
    │                           │── forwardAuth ───────────▶│                    │
    │                           │                           │── no cookie ──▶ 307│
    │◀── 307 Google login ──────│◀──────────────────────────│                    │
    │                           │                           │                    │
    │── [user logs in] ────────▶│                           │                    │
    │◀── cookie set on          │                           │                    │
    │    .blain-projects.ca ────│                           │                    │
    │                           │                           │                    │
    │── GET frontend ──────────▶│                           │                    │
    │   (with cookie)           │── forwardAuth ───────────▶│                    │
    │                           │                           │── cookie OK ──▶ 200│
    │◀── page HTML ─────────────│◀──────────────────────────│                    │
    │                           │                           │                    │
    │── OPTIONS api.xxx ───────▶│ (CORS router, no auth)    │                    │
    │◀── 200 + CORS headers ────│──────────────────────────────────────────────▶│
    │                           │                           │                    │
    │── GET api.xxx ───────────▶│                           │                    │
    │   (with cookie)           │── forwardAuth ───────────▶│                    │
    │                           │                           │── cookie OK ──▶ 200│
    │◀── JSON data ─────────────│◀──────────────────────────│◀───── data ───────│
```

---

## Les 3 Règles d'Or

### 1. Le frontend est protégé par `google-auth@docker`

```yaml
# docker-compose.yml — service frontend
labels:
  - "traefik.http.routers.${PROJECT_NAME}-front.middlewares=google-auth@docker"
```

C'est le point d'entrée sécurisé. L'utilisateur doit se connecter via Google avant de voir la page.

### 2. Le backend a DEUX routers Traefik

```yaml
# docker-compose.yml — service backend
labels:
  # Router principal — protégé par Google Auth
  - "traefik.http.routers.${PROJECT_NAME}-back.rule=Host(`api.${PROJECT_NAME}.${DOMAIN_NAME}`)"
  - "traefik.http.routers.${PROJECT_NAME}-back.middlewares=google-auth@docker"
  - "traefik.http.services.${PROJECT_NAME}-back.loadbalancer.server.port=5000"
  # ...entrypoints, tls...

  # Router CORS preflight — laisse passer les OPTIONS sans auth
  - "traefik.http.routers.${PROJECT_NAME}-back-cors.rule=Host(`api.${PROJECT_NAME}.${DOMAIN_NAME}`) && Method(`OPTIONS`)"
  - "traefik.http.routers.${PROJECT_NAME}-back-cors.priority=200"
  - "traefik.http.routers.${PROJECT_NAME}-back-cors.service=${PROJECT_NAME}-back"
  # ...entrypoints, tls...
```

**Pourquoi deux routers?**
Le navigateur envoie automatiquement une requête `OPTIONS` (preflight CORS) avant chaque requête cross-origin. Si le middleware auth intercepte cette requête, il répond par un 307 redirect — le navigateur bloque immédiatement car les redirects ne sont pas autorisés sur les preflight. Le router `-cors` avec priorité 200 matche les OPTIONS *avant* le router principal et les laisse passer directement au backend.

### 3. Le frontend envoie les cookies avec chaque requête API

```typescript
// ✅ BON — envoie le cookie _forward_auth avec la requête
fetch('https://api.monprojet.blain-projects.ca/api/data', {
  credentials: 'include'
});

// Ou avec axios:
axios.defaults.withCredentials = true;

// ❌ MAUVAIS — pas de cookie, le backend renvoie 307
fetch('https://api.monprojet.blain-projects.ca/api/data');
```

**Sans `credentials: 'include'`**, le navigateur n'envoie pas le cookie d'authentification vers le sous-domaine `api.*`, et le middleware auth rejette la requête.

---

## Configuration CORS du Backend

### Règle critique : pas de wildcard `*` avec credentials

```python
# ❌ INTERDIT par la spec CORS — le navigateur bloque silencieusement
CORS(app, origins=["*"], supports_credentials=True)

# ✅ CORRECT — origin explicite
CORS(app, origins=[
    "https://monprojet.blain-projects.ca",  # Production
    "http://localhost:5173",                  # Dev local
], supports_credentials=True)
```

La spécification CORS interdit `Access-Control-Allow-Origin: *` quand `Access-Control-Allow-Credentials: true`. Le navigateur ignore silencieusement la réponse.

### FastAPI (ce template)

```python
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings

# via notre dépendance pydantic-settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"https://{settings.project_name}.blain-projects.ca",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Développement Local vs Production

| Aspect | Dev local | Production |
|--------|-----------|------------|
| Frontend URL | `http://localhost:5173` | `https://monprojet.blain-projects.ca` |
| Backend URL | `http://localhost:5000` | `https://api.monprojet.blain-projects.ca` |
| Auth | Aucune (pas de middleware) | Google OAuth via Traefik |
| CORS | `localhost:5173` → `localhost:5000` | `monprojet.blain-projects.ca` → `api.monprojet.blain-projects.ca` |
| Cookies | Non nécessaires | `credentials: 'include'` obligatoire |
| HTTPS | Non | Oui (Let's Encrypt via Traefik) |

**Important :** En dev local, il n'y a pas de Traefik ni de middleware auth. Les fetch fonctionnent sans `credentials: 'include'`. Mais en production, l'oublier = backend inaccessible.

Le frontend doit détecter l'environnement pour ajuster le base URL de l'API:

```typescript
function getApiBaseUrl(): string {
  // Variable d'environnement (build-time) prioritaire
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured;

  // Dev local
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return `http://localhost:${import.meta.env.VITE_API_PORT ?? '5000'}`;
  }

  // Production: api.SUBDOMAIN.DOMAIN
  return `${window.location.protocol}//api.${window.location.host}`;
}
```

---

## Erreurs Courantes et Solutions

### ❌ `CORS policy: No 'Access-Control-Allow-Origin' header`

**Cause :** Le backend ne reconnaît pas l'origin, OU le backend est derrière l'auth et la requête est bloquée avant d'atteindre le code CORS.

**Fix :**
1. Vérifier que l'origin est dans la liste `allow_origins` du backend
2. Vérifier que le router `-cors` (OPTIONS) existe dans docker-compose
3. Vérifier que `credentials: 'include'` est présent dans les fetch

### ❌ `Redirect is not allowed for a preflight request`

**Cause :** Le middleware `google-auth@docker` est sur le backend et intercepte la requête OPTIONS.

**Fix :** Ajouter le router CORS preflight (voir section "Le backend a DEUX routers Traefik").

### ❌ `middleware "google-auth@docker" does not exist`

**Cause :** Le container `google-auth` n'est pas visible par Traefik (pas sur `web_network`, ou mauvais compose project).

**Fix :**
1. Vérifier : `docker inspect google-auth --format '{{.Config.Image}}'` → doit être `thomseddon/traefik-forward-auth:2`
2. Vérifier : `docker inspect google-auth --format '{{index .Config.Labels "com.docker.compose.project"}}'` → doit être `traefik`
3. Si mauvais : `cd /home/blain/traefik && docker compose up -d google-auth`

### ❌ Site affiche la page 404 "Projet introuvable"

**Cause possible :** Le container frontend est `unhealthy` (Traefik ne route pas vers les containers unhealthy).

**Fix :** Vérifier `docker ps | grep front`. Si `unhealthy`, le healthcheck utilise probablement `localhost` (IPv6) au lieu de `127.0.0.1` (IPv4). Corriger :

```yaml
healthcheck:
  test: ["CMD-SHELL", "wget --spider -q http://127.0.0.1:80/ || exit 1"]
```

### ❌ `Invalid cookie mac` dans les logs google-auth

**Cause :** Le `SECRET` du container a changé, invalidant les cookies existants.

**Fix :** Ouvrir une fenêtre privée ou vider les cookies `*.blain-projects.ca`.

---

## Checklist Nouveau Projet

Avant de déployer, vérifier :

- [ ] `docker-compose.yml` : frontend a `middlewares=google-auth@docker`
- [ ] `docker-compose.yml` : backend a le router principal AVEC `google-auth@docker`
- [ ] `docker-compose.yml` : backend a le router `-cors` pour OPTIONS (priority=200, pas d'auth)
- [ ] Backend CORS : origins explicites (pas `*`), `supports_credentials=True`
- [ ] Frontend fetch : `credentials: 'include'` sur toutes les requêtes API
- [ ] Healthcheck : utilise `127.0.0.1` (pas `localhost`) si image Alpine
- [ ] `.env` : `PROJECT_NAME` et `DOMAIN_NAME` sont définis
- [ ] Container sur `web_network`
- [ ] Test en fenêtre privée après déploiement

---

## Projet PUBLIC (sans auth)

Pour rendre un projet accessible sans connexion Google :

1. **Retirer** le label `middlewares=google-auth@docker` du frontend
2. **Retirer** le label `middlewares=google-auth@docker` du backend
3. **Retirer** le router `-cors` du backend (plus nécessaire)
4. Le CORS peut rester avec `origins=["*"]` et `credentials` n'est plus nécessaire

```yaml
# Projet PUBLIC — pas de middleware auth
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.${PROJECT_NAME}-front.rule=Host(`${PROJECT_NAME}.${DOMAIN_NAME}`)"
  - "traefik.http.routers.${PROJECT_NAME}-front.entrypoints=websecure"
  - "traefik.http.routers.${PROJECT_NAME}-front.tls.certresolver=myresolver"
  - "traefik.http.services.${PROJECT_NAME}-front.loadbalancer.server.port=80"
  # Pas de ligne middlewares = pas d'auth
```
