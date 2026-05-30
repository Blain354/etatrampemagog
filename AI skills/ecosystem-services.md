# Écosystème de Services — `blain-projects.ca`

> **Source de vérité :** `docker ps` + `docker network inspect web_network` sur
> le serveur. Ce document liste les services partagés qu'un nouveau projet
> peut consommer **sans installation supplémentaire**.

## Architecture globale

```
                                INTERNET (HTTPS 443)
                                       │
                                       ▼
                ┌──────────────────────────────────────────┐
                │  Traefik v3.6.1                          │
                │  - Let's Encrypt (acme.json)             │
                │  - Routing par Host(`*.blain-projects.ca`)│
                │  - ForwardAuth google-auth (middleware)   │
                └─────────────────┬────────────────────────┘
                                  │ Docker DNS (web_network)
                                  ▼
        ┌────────┬────────┬────────┬────────┬────────┬─────────┐
        │ Apps   │ Bridge │ MCP    │ n8n    │ Files  │ Nomad   │
        │ projet │ OpenClaw│       │        │ cloud  │ admin   │
        └────────┴────┬───┴────────┴────────┴────────┴─────────┘
                     │
              ┌──────▼──────────────────┐
              │  Relay Helper (host)    │
              │  systemd user — :18790  │
              └──────┬──────────────────┘
                     │ WebSocket localhost:18789
                     ▼
              ┌─────────────────────────┐
              │  OpenClaw Gateway        │
              │  systemd user — :18789  │
              │  (node openclaw gateway)│
              └─────────────────────────┘
```

## Services accessibles depuis `web_network`

### Infrastructure de base

| Hostname Docker | Port | Description | Notes |
|-----------------|------|-------------|-------|
| `traefik` | 80, 443 | Reverse proxy + TLS auto | N'appelle pas directement — passer par le hostname public |
| `google-auth` | 4181 | ForwardAuth Google OAuth | Image `thomseddon/traefik-forward-auth:2`, middleware `google-auth@docker` |
| `catchall-404` | 80 | Page 404 nginx pour sous-domaines inconnus | Routeur Traefik prioritaire bas |

### Intégration agentique

| Hostname | Port | Description |
|----------|------|-------------|
| `openclaw-bridge` | 8000 | API HTTP vers tout agent OpenClaw — voir `OPENCLAW.md` |
| `openclaw-mcp` | 3100 | Serveur MCP exposant les capabilities OpenClaw (image gen, search, etc.) |

### Automatisation

| Hostname | Port | Description |
|----------|------|-------------|
| `n8n` | 5678 | Workflow automation no-code — webhooks, cron, intégrations |

### Données partagées (potentiellement consommables)

| Hostname | Port | Description |
|----------|------|-------------|
| `nextcloud` | 80 | Stockage fichiers, calendrier CalDAV, contacts | Auth Nextcloud propre |
| `nextcloud-db` | 3306 | MariaDB de Nextcloud (interne — ne pas toucher) |
| `nextcloud-redis` | 6379 | Cache Redis Nextcloud (interne) |
| `vaultwarden` | 80 | Gestionnaire de mots de passe (Bitwarden compatible) |
| `photoprism` | 2342 | Gestion photo (catalogue + recherche IA) |
| `actual-server` | 5006 | Budget personnel (Actual Budget) — port mappé `0.0.0.0:5006` |
| `flaresolverr` | 8191 | Bypass Cloudflare anti-bot pour scraping |

### Suite Project Nomad (Crosstalk Solutions)

| Hostname | Port | Description |
|----------|------|-------------|
| `nomad_admin` | 8080 | Console d'admin Nomad |
| `nomad_qdrant` | 6333-6334 | Vector DB Qdrant |
| `nomad_redis` | 6379 | Redis |
| `nomad_mysql` | 3306 | MySQL |
| `nomad_cyberchef` | 8100 | CyberChef (transformations data) |
| `nomad_kiwix_server` | 8090 | Kiwix (offline Wikipedia/docs) |
| `nomad_flatnotes` | 8200 | Notes markdown |
| `nomad_kolibri` | 8300 | Kolibri (éducation offline) |
| `nomad_dozzle` | 9999 | Visualiseur de logs Docker |
| `nomad_updater` | — | Sidecar updater |
| `nomad_disk_collector` | — | Sidecar disk metrics |

## Domain pattern

- **Frontends de projets** : `https://<project>.blain-projects.ca`
- **APIs de projets** : `https://api.<project>.blain-projects.ca`
- **Bridge OpenClaw** : `https://openclaw-relay.blain-projects.ca`
- **Services partagés** : variable (consulter chaque `docker-compose.yml` dans `~/`).

## Patterns d'intégration courants

### Lire un fichier depuis Nextcloud

Plutôt que de monter un volume directement, utilise l'API WebDAV publique
de Nextcloud (auth basic ou OAuth selon ton compte) :

```python
import httpx
r = httpx.get(
    "https://nextcloud.blain-projects.ca/remote.php/dav/files/<user>/<path>",
    auth=("<user>", "<app-password>"),
)
```

### Déclencher un workflow n8n

n8n peut exposer des webhooks que tu appelles depuis ton backend :

```python
httpx.post(
    "http://n8n:5678/webhook/<webhook-id>",
    json={"data": "..."},
)
# Côté n8n, le webhook peut router vers Discord, email, GitHub, etc.
```

### Stocker des embeddings dans Qdrant

```python
from qdrant_client import QdrantClient
client = QdrantClient(host="nomad_qdrant", port=6333)
# attention : Qdrant Nomad est sur le réseau de Project Nomad —
# vérifier que ton conteneur est joint à ce réseau aussi.
```

## Vérifier qui est sur `web_network`

```bash
docker network inspect web_network \
  --format '{{range .Containers}}{{.Name}}{{"\n"}}{{end}}' | sort
```

## Ce qui n'est **PAS** disponible (pour éviter les confusions)

- ❌ Postgres centralisé — chaque projet provisionne son propre Postgres si
  besoin (voir `docker-compose.yml` du template, section commentée).
- ❌ Redis centralisé — idem.
- ❌ Object storage (S3) — pas de MinIO/S3 partagé.
- ❌ Gateway OpenClaw direct — passe **toujours** par `openclaw-bridge` ou
  `host-gateway:18790`. Le gateway lui-même (`:18789`) est WebSocket et
  n'est pas conçu pour des appels HTTP simples.

## Quand demander l'ajout d'un service partagé

Critères pour qu'un service mérite d'être déployé une fois et partagé :

1. **Couteux à provisionner** (DB lourde, modèle ML, etc.).
2. **Utile à >1 projet** dans un horizon de 6 mois.
3. **Stateful** (les données doivent survivre aux redéploiements de projets).
4. **API stable et bien définie**.

Sinon → garde-le dans le `docker-compose.yml` de ton projet.
