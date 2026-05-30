<!-- BEGIN blain-agent-kit:agents (managed v0.2.0) -->
## Méthodo agent blain-projects (managée par blain-agent-kit)

> Ce bloc est **managé par blain-agent-kit**. Ne l'édite pas ici : modifie le repo `blain-agent-kit`, le sync le réinjectera. Tout texte hors de ce bloc reste local et n'est jamais touché.

### Écosystème
Les apps blain-projects partent d'un **template** : on **fork → déploie via OpenClaw**. OpenClaw roule le sync de ce kit au fork-init puis à chaque update, pour garder une méthodo agent universelle alignée.

### Règles à respecter (voir `.cursor/rules/`)
- **TDD** (`00-core`) : écris + roule un test avant "done", code modulaire single-responsibility, zéro régression sans test, commits atomiques sur `main` (pas de PR).
- **Sécurité** (`10-security`) : pas de secret en clair, `/approve` avant tout changement sécu/infra/port/credential, Inventory API via curl+Bearer, SimpleFin = seule source bancaire.
- **Docker / Traefik** (`20-docker-traefik`) : `web_network`, jamais de ports exposés (labels Traefik), `apiFetch()` côté front.
- **Design system** (`30-blain-ui`) : toute l'UI depuis `@blain-projects/ui`, zéro primitive maison / hex brut, **mobile-first minimal** testé à 375px.
<!-- END blain-agent-kit:agents -->
