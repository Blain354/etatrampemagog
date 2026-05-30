# 🦾 Intégration OpenClaw Agent Bridge

> **Skill IA :** Comment intégrer la communication agent OpenClaw dans un projet Docker.

---

## Objectif

Permettre à n'importe quel backend Docker (FastAPI, Express, etc.) de communiquer avec les agents OpenClaw (Fishey, Buddy, etc.) via le **OpenClaw Agent Bridge**.

Le bridge est un service réutilisable déjà déployé sur le serveur. Une fois intégré, ton backend peut envoyer des prompts aux agents et recevoir des réponses structurées.

---

## Pattern de Transport

Le pattern est inspiré de `fishey_transport.py` — un client HTTP léger qui wrap les appels au bridge.

```
┌──────────────────┐     POST /api/internal/v1/agents/{agent}/send     ┌──────────────────┐
│  Ton Backend     │ ──────────────────────────────────────────────────▶│  openclaw-bridge │
│  (Docker)        │ ◀──────────────────────────────────────────────────│  (Docker)        │
│  web_network     │           JSON { success, response }              │  web_network     │
└──────────────────┘                                                    └──────────────────┘
```

**Pourquoi un endpoint interne ?**
- Pas de Google Auth → idéal pour machine-à-machine
- Accessible uniquement depuis le réseau Docker `web_network`
- Protégé par un token partagé (`X-Bridge-Token`)

---

## Intégration Étape par Étape

### 1. Variables d'Environnement

```env
# .env du projet
OPENCLAW_BRIDGE_URL=http://openclaw-bridge:8000
OPENCLAW_BRIDGE_TOKEN=bridge-super-secret-token-2026
```

### 2. Code Réutilisable

Copie ce module dans ton backend (ex: `app/transport/openclaw_transport.py`) :

```python
"""Transport standard vers l'OpenClaw Agent Bridge.

Pattern extrait de fishey_transport.py — réutilisable dans tout projet
qui a besoin de communiquer avec un agent OpenClaw.
"""

import httpx
import os
from typing import Optional, Dict, Any


class OpenClawTransport:
    """Client HTTP pour l'OpenClaw Agent Bridge (endpoint interne)."""

    def __init__(
        self,
        agent: str = "fishey",
        bridge_url: Optional[str] = None,
        token: Optional[str] = None,
    ):
        """
        Args:
            agent: Nom de l'agent cible (ex: "fishey", "buddy").
            bridge_url: URL du bridge (défaut: depuis env ou fallback).
            token: Token d'authentification (défaut: depuis env ou fallback).
        """
        self._agent = agent
        self._bridge_url = bridge_url or os.getenv(
            "OPENCLAW_BRIDGE_URL", "http://openclaw-bridge:8000"
        )
        self._token = token or os.getenv(
            "OPENCLAW_BRIDGE_TOKEN", "bridge-super-secret-token-2026"
        )

    def send_prompt(
        self, prompt: str, timeout: int = 120, session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Envoie un prompt à l'agent et retourne la réponse JSON.

        Args:
            prompt: Texte à envoyer à l'agent.
            timeout: Timeout en secondes pour l'appel.
            session_id: ID de session OpenClaw optionnel pour poursuivre
                        une conversation existante.

        Returns:
            {
                "success": True,
                "response": "Contenu de la réponse",
                "error": "..."  # uniquement si success=False
            }

        Raises:
            httpx.HTTPError: Si le bridge est inaccessible.
            httpx.HTTPStatusError: Si le bridge retourne 4xx/5xx.
        """
        headers = {
            "Content-Type": "application/json",
            "X-Bridge-Token": self._token,
        }
        payload = {
            "prompt": prompt,
            "timeout_seconds": timeout,
        }
        if session_id:
            payload["session_id"] = session_id

        with httpx.Client(timeout=timeout + 15) as client:
            resp = client.post(
                f"{self._bridge_url}/api/internal/v1/agents/{self._agent}/send",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            return resp.json()

    def health_check(self) -> Dict[str, Any]:
        """Vérifie que le bridge est accessible."""
        with httpx.Client(timeout=5) as client:
            resp = client.get(f"{self._bridge_url}/health")
            resp.raise_for_status()
            return resp.json()
```

### 3. Utilisation dans une Route FastAPI

```python
from app.transport.openclaw_transport import OpenClawTransport

transport = OpenClawTransport(agent="fishey")

@app.post("/api/ask-agent")
async def ask_agent(prompt: str):
    """Route qui délègue une question à l'agent OpenClaw."""
    try:
        result = transport.send_prompt(prompt, timeout=60)
        return {
            "status": "ok",
            "agent_response": result.get("response"),
            "duration_ms": result.get("duration_ms"),
        }
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Agent bridge inaccessible: {e}"
        )
```

### 4. Tests

Écris un test d'intégration pour valider la connexion :

```python
# tests/test_openclaw_transport.py
import pytest
from unittest.mock import patch, MagicMock


def test_transport_uses_env_vars():
    """Vérifie que le transport lit les variables d'environnement."""
    transport = OpenClawTransport(agent="test-agent")
    assert transport._bridge_url == "http://openclaw-bridge:8000"
    assert transport._token == "bridge-super-secret-token-2026"


@patch("httpx.Client")
def test_send_prompt_builds_correct_request(mock_client):
    """Vérifie que la requête est correctement construite."""
    mock_instance = MagicMock()
    mock_instance.post.return_value.json.return_value = {
        "success": True, "response": "OK"
    }
    mock_instance.post.return_value.status_code = 200
    mock_client.return_value.__enter__.return_value = mock_instance

    transport = OpenClawTransport(
        agent="fishey",
        bridge_url="http://test-bridge:8000",
        token="test-token"
    )
    result = transport.send_prompt("ping")

    mock_instance.post.assert_called_once_with(
        "http://test-bridge:8000/api/internal/v1/agents/fishey/send",
        json={"prompt": "ping", "timeout_seconds": 120},
        headers={
            "Content-Type": "application/json",
            "X-Bridge-Token": "test-token",
        },
    )
    assert result == {"success": True, "response": "OK"}


def test_send_prompt_with_session_id():
    """Vérifie que session_id est bien passé dans le payload."""
    import httpx
    with patch("httpx.Client") as mock_client:
        mock_instance = MagicMock()
        mock_instance.post.return_value.json.return_value = {
            "success": True, "response": "OK"
        }
        mock_instance.post.return_value.status_code = 200
        mock_client.return_value.__enter__.return_value = mock_instance

        transport = OpenClawTransport(
            agent="fishey",
            bridge_url="http://test-bridge:8000",
            token="test-token"
        )
        transport.send_prompt("test", session_id="session-123")

        # Vérifie que session_id est dans le payload
        call_args = mock_instance.post.call_args[1]["json"]
        assert call_args["session_id"] == "session-123"
```

---

## Endpoints Disponibles

| Endpoint | Accès | Auth | Usage |
|----------|-------|------|-------|
| `/api/internal/v1/agents/{agent}/send` | Interne (web_network) | Token seul | Backend → Agent |
| `/api/v1/agents/{agent}/send` | Public (Internet) | Google OAuth + token | Utilisateur externe → Agent |
| `/health` | Interne | Aucune | Healthcheck |

---

## 🧪 Smoke Test

Depuis le host, après déploiement :

```bash
# 1a. Vérifier le bridge depuis l'host
#     Le conteneur openclaw-bridge n'a PAS de port mapping vers l'host —
#     il est exposé uniquement via Traefik (HTTPS + Google Auth) et via
#     web_network. Utilise donc le hostname Traefik :
curl -sf https://openclaw-relay.blain-projects.ca/health  # nécessite Google login
# OU teste directement depuis le conteneur (recommandé) :
docker exec openclaw-bridge curl -s http://localhost:8000/health
# → {"status":"ok","service":"openclaw-bridge"}

# 1b. Vérifier le relay helper (host)
curl -s http://localhost:18790/health
# → {"status":"ok","service":"openclaw-relay-helper"}

# 2. Vérifier que le conteneur backend voit le bridge (Docker DNS)
docker exec monprojet-back curl -s http://openclaw-bridge:8000/health
# → {"status":"ok","service":"openclaw-bridge"}

# 3. Tester un appel complet (ping)
docker exec monprojet-back python -c "
import httpx
r = httpx.post(
    'http://openclaw-bridge:8000/api/internal/v1/agents/fishey/send',
    json={'prompt': 'ping', 'timeout_seconds': 30},
    headers={'X-Bridge-Token': 'bridge-super-secret-token-2026'}
)
print(r.status_code, r.json())
"
```

---

## Dépendances

- `httpx` (déjà dans `requirements.txt` du template)
- Conteneur sur le réseau `web_network` (déjà dans le docker-compose du template)

---

## Références

- **Documentation complète du bridge :** `/home/blain/.openclaw/workspace-project-agent/openclaw-bridge/README.md`
- **Code source du bridge :** `/home/blain/.openclaw/workspace-project-agent/openclaw-bridge/backend/main.py`
- **Relay helper (host) :** `/home/blain/openclaw-relay-helper.py` (port 18790)
- **Documentation principale :** `OPENCLAW.md` (à la racine du projet)
- **Catalogue des agents :** `AI skills/openclaw-agents-catalog.md`
