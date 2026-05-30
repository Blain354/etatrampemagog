# Catalogue des Agents OpenClaw

> **Source de vérité :** `/home/blain/.openclaw/openclaw.json` (clé `agents.list`).
> Ce document est généré à partir de l'état réel du serveur. Re-générer si
> de nouveaux agents sont ajoutés.

## Comment cibler un agent depuis ton projet

Le paramètre `{agent}` dans l'URL du bridge est l'**`id`** de l'agent, en
kebab-case (pas le `name` affiché). Exemple :

```python
# ✅ BON — utilise l'id
httpx.post("http://openclaw-bridge:8000/api/internal/v1/agents/fishey/send", ...)

# ❌ MAUVAIS — utilise le name (sera 404 ou inconnu côté CLI)
httpx.post("http://openclaw-bridge:8000/api/internal/v1/agents/Fishey/send", ...)
```

## Liste actuelle (13 agents)

### Agents "tiers" — généralistes selon le coût/qualité voulu

| id | name | Modèle principal | Quand l'utiliser |
|----|------|------------------|------------------|
| `tier1` | Big-Brain | `google/gemini-3.1-pro-preview` | Raisonnement complexe, architecture, analyse multi-fichier |
| `tier2` ⭐ | **Buddy** (default) | `deepseek/deepseek-v4-pro` | Usage quotidien — bon rapport qualité/coût |
| `tier3` | Local Agent | `ollama-local/gemma4:e4b` + fallbacks | Mode offline / privacy / pas d'API externe |
| `tierfast` | TierFast - Rapide | `deepseek/deepseek-v4-flash` + Mercury-2 | Itération rapide, tâches simples, peu de tokens |
| `main` | main | — | Point d'entrée "master" (route selon contexte) |

### Agents spécialisés par domaine

| id | name | Workspace | Skills/domaine |
|----|------|-----------|----------------|
| `codey` | **Codey** | `workspace/` | Programmation — wrap Cursor Agent CLI (`cursor-agent` skill) |
| `fishey` | **Fishey** | `workspace-fishey/` | Pêche (lac Memphremagog, conditions, spots, espèces) — skill `fishing` |
| `project-agent` | **Projee** | `workspace-project-agent/` | Idées projet, market analysis, GitHub, multi-search-engine |
| `maker-agent` | **Makey** | `workspace-maker-agent/` | Making, impression 3D, MakerWorld — `multi-search-engine`, `cursor-agent` |
| `makerworld-social` | makerworld-social | `workspace-makerworld-social/` | Réseaux sociaux MakerWorld (posts, engagement) |
| `master-buddy` | Master Buddy | `workspace-maitrise/` | Maîtrise universitaire — `zotero`, `markdown-converter`, `multi-search-engine` |
| `discussion-gratis` | Discussion Gratis | `workspace/` | Conversation "gratis" (modèles à coût zéro / free tier) |
| `perplexity` | Perplexity | `workspace/` | Recherche web propulsée par Perplexity Pro (Auto, GPT, Claude, Sonar) |

## Format de réponse du bridge

Le bridge retourne **toujours** un objet JSON avec cette forme :

```json
{
  "success": true,
  "response": "Texte structuré de l'agent (peut être multi-ligne)",
  "duration_ms": 8423,
  "error": null
}
```

ou en cas d'échec :

```json
{
  "success": false,
  "response": null,
  "error": "Description de l'erreur",
  "duration_ms": null
}
```

Le champ `response` est obtenu en concaténant les `payloads[*].text` de la
sortie JSON du CLI `openclaw agent --json`. Si l'agent retourne plusieurs
payloads, ils sont séparés par `\n`.

## Maintien de session (`session_id`)

OpenClaw supporte la persistance du contexte entre appels via un `session_id`
(passé au CLI comme `--session-id`). Pattern recommandé :

```python
# Premier appel — génère ou choisit ton propre session_id
session = f"projet-monapp-user-{user_id}-{date.today().isoformat()}"
r1 = transport.send_prompt("Analyse ce document...", session_id=session)

# Appels suivants — même session_id ⇒ même contexte côté gateway
r2 = transport.send_prompt("Donne-moi les 3 points clés", session_id=session)
r3 = transport.send_prompt("Et résume en 2 phrases", session_id=session)
```

> ⚠️ Sans `session_id`, chaque appel démarre **une session fraîche** —
> l'agent n'a aucune mémoire de l'appel précédent. À utiliser quand chaque
> requête est indépendante (one-shot Q&A).

## Ajouter un agent depuis ton projet

Tu ne peux **pas** créer un agent côté projet — c'est une opération côté host.
Si tu as besoin d'un agent spécifique :

1. Demande à OpenClaw (ou Blain) d'ajouter une entrée dans `openclaw.json`.
2. L'agent apparaîtra immédiatement via le bridge avec son `id`.
3. Aucune modification du bridge nécessaire — l'API est générique sur `{agent}`.

## Vérifier la disponibilité

```bash
# Liste des ids actuels (depuis le host)
python3 -c "import json; print('\n'.join(a['id'] for a in json.load(open('/home/blain/.openclaw/openclaw.json'))['agents']['list']))"

# Ping un agent depuis ton conteneur
docker exec monprojet-back python -c "
import httpx
r = httpx.post(
    'http://openclaw-bridge:8000/api/internal/v1/agents/tier2/send',
    json={'prompt': 'réponds juste OK', 'timeout_seconds': 30},
    headers={'X-Bridge-Token': 'bridge-super-secret-token-2026'}
)
print(r.status_code, r.json())
"
```

## Choix par défaut recommandés pour un nouveau projet

- **Conversation utilisateur** → `tier2` (Buddy) — bon défaut équilibré.
- **Lourd raisonnement / planification** → `tier1` (Big-Brain).
- **Tâches rapides batch / loops** → `tierfast`.
- **Recherche web factuelle** → `perplexity`.
- **Programmation autonome** → `codey`.
- **Domaine spécifique** (pêche, making, etc.) → l'agent dédié si disponible.
