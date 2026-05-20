# OPENCLAW.md — Communication avec les Agents OpenClaw

> **TL;DR :** Pour parler à un agent OpenClaw depuis ton backend Docker, fais un POST vers
> `http://openclaw-bridge:8000/api/internal/v1/agents/{agent}/send`
> avec le header `X-Bridge-Token`. C'est tout. Le reste de ce document explique pourquoi
> cette architecture existe, comment la mettre en place, et comment la réutiliser dans
> n'importe quel nouveau projet.

---

## Architecture de Communication

```
┌──────────────────────────────────────────────────────────────────┐
│                        TON PROJET (Docker)                        │
│  Backend FastAPI / Express / etc.                                  │
└──────────────────────────────┬───────────────────────────────────┘
                               │ POST /api/internal/v1/agents/{agent}/send
                               │ Header: X-Bridge-Token: <token>
                               │ Body: { "prompt": "...", "timeout_seconds": 120 }
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                  OpenClaw Agent Bridge (Docker)                    │
│              openclaw-relay.blain-projects.ca                      │
│                                                                    │
│  • Endpoint public:   /api/v1/agents/{agent}/send                 │
│    → Google Auth + token (usage humain ou externe)                │
│  • Endpoint interne:  /api/internal/v1/agents/{agent}/send        │
│    → Token seul, accessible UNIQUEMENT depuis web_network         │
│                                                                    │
│  Container: openclaw-bridge (port 8000 interne)                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │ POST /api/send { prompt, agent }
                               │ via host-gateway:18790
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│               OpenClaw Relay Helper (Host - Systemd)              │
│                      Port 18790 (local)                           │
│                                                                    │
│  Service: openclaw-relay-helper.service                           │
│  Script:  /home/blain/openclaw-relay-helper.py                    │
│                                                                    │
│  Exécute: openclaw agent --agent <id> --message "..." --json      │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                   OpenClaw Gateway (Host)                         │
│                  Port 18789 (WebSocket)                           │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                     Agent OpenClaw (ex: fishey)                    │
│              Réponse structurée → remontée en JSON                │
└──────────────────────────────────────────────────────────────────┘
```

## 🔑 Pourquoi cette architecture ?

| Problème rencontré | Solution dans cette architecture |
|-------------------|----------------------------------|
| Le CLI `openclaw` ne fonctionne pas dans Docker (manque `dist/entry.js`, dépend du gateway local) | **Relay Helper** sur l'host, qui wrap le vrai CLI |
| Google Auth bloque les appels machine-à-machine | **Endpoint interne** `/api/internal/...` sans Google Auth, accessible uniquement depuis `web_network` |
| Chaque nouveau projet doit réinventer la communication agent | Le **Bridge** est un service permanent : une seule implémentation pour tous les projets |
| Sécurité des appels entre conteneurs | Token partagé (`X-Bridge-Token`) + isolation réseau (Docker `web_network`) |

## 🚀 Utilisation dans un nouveau projet

### 1. Prérequis (déjà déployés sur le serveur)

- ✅ **OpenClaw Agent Bridge** : `openclaw-bridge` (Docker, réseau `web_network`)
- ✅ **OpenClaw Relay Helper** : `openclaw-relay-helper.service` (systemd, port 18790)
- ✅ **Token partagé** : `bridge-super-secret-token-2026`

> Ces services sont **déjà en place** sur `serveur-blain`. Tu n'as rien à installer.

### 2. Code d'intégration (Python)

```python
import httpx

class OpenClawTransport:
    """Transport standard pour communiquer avec un agent OpenClaw."""

    def __init__(self, agent: str = "fishey"):
        self._bridge_url = "http://openclaw-bridge:8000"
        self._token = "bridge-super-secret-token-2026"
        self._agent = agent

    def send_prompt(self, prompt: str, timeout: int = 120) -> dict:
        """Envoie un prompt à l'agent et retourne la réponse JSON."""
        headers = {
            "Content-Type": "application/json",
            "X-Bridge-Token": self._token,
        }
        payload = {
            "prompt": prompt,
            "timeout_seconds": timeout,
        }

        with httpx.Client(timeout=timeout + 15) as client:
            resp = client.post(
                f"{self._bridge_url}/api/internal/v1/agents/{self._agent}/send",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()


# Exemple d'utilisation avec Fishey
transport = OpenClawTransport(agent="fishey")
result = transport.send_prompt("Quel poisson pêcher au lac Memphremagog?")
# result = { "success": true, "response": "{...json structuré...}" }
```

### 3. Configuration Docker (docker-compose.yml)

Ton conteneur doit être sur `web_network` pour accéder au bridge :

```yaml
services:
  mon-backend:
    # ...
    networks:
      - web_network

networks:
  web_network:
    external: true
```

### 4. Variables d'environnement

Ajoute au `.env` de ton projet :

```env
OPENCLAW_BRIDGE_URL=http://openclaw-bridge:8000
OPENCLAW_BRIDGE_TOKEN=bridge-super-secret-token-2026
```

> ⚠️ Le token est partagé entre tous les projets internes. Si un projet externe
> doit utiliser le bridge, passe par l'endpoint public (`/api/v1/...`) avec Google Auth.

## 🔒 Sécurité

| Couche | Protection |
|--------|------------|
| **Public** (`/api/v1/...`) | Google OAuth (Traefik `google-auth@docker`) + token |
| **Interne** (`/api/internal/...`) | Token uniquement + accès restreint au réseau Docker `web_network` |
| **Host** (port 18790) | Bind sur `0.0.0.0` mais non exposé à Internet (pas de règle Traefik, pas de port mapping) |

### Rotation du token

Pour changer le token :
1. Mettre à jour `BRIDGE_TOKEN` dans le `main.py` du bridge
2. Mettre à jour le `.env` de chaque projet utilisant le bridge
3. `docker compose up -d --build openclaw-bridge` (dans `~/.openclaw/workspace-project-agent/openclaw-bridge`)

## 🛠️ Maintenance

### Vérifier l'état des services

```bash
# Bridge
docker logs openclaw-bridge --tail 10

# Relay Helper
systemctl --user status openclaw-relay-helper.service

# Tester le endpoint
docker exec fishing-backend python -c "
import httpx
r = httpx.get('http://openclaw-bridge:8000/health')
print(r.json())
"
```

### Redémarrer après un reboot

```bash
systemctl --user restart openclaw-relay-helper.service
cd ~/.openclaw/workspace-project-agent/openclaw-bridge && docker compose up -d
```

> Le service systemd a `Restart=always` et se lance automatiquement au boot.

### Ajouter un nouvel agent

Le bridge est générique : le paramètre `{agent}` dans l'URL correspond au `--agent` du CLI.

```
POST /api/internal/v1/agents/{nouvel_agent}/send
```

Aucune modification du bridge nécessaire. Seul le relay helper doit pouvoir exécuter
`openclaw agent --agent {nouvel_agent}`.

## 📁 Fichiers concernés

| Fichier | Emplacement | Rôle |
|---------|-------------|------|
| `main.py` | `openclaw-bridge/backend/` | API FastAPI du bridge |
| `docker-compose.yml` | `openclaw-bridge/` | Déploiement Docker bridge |
| `openclaw-relay-helper.py` | `/home/blain/` | Script host qui wrap le CLI |
| `openclaw-relay-helper.service` | `~/.config/systemd/user/` | Service systemd permanent |

---

> **Dernière mise à jour :** 2026-05-15 — Architecture validée et testée avec Fishing Buddy.