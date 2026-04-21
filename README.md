# Template Fullstack Web

Ce dépôt est un template modulaire hautement sécurisé pour la création de projets full-stack rapides.

## Architecture

* **Frontend** : React 19, Vite, TypeScript.
* **Backend** : FastAPI (Python 3.9+), Uvicorn, SQLModel (SQLite).
* **Déploiement** : Docker Compose, réseau interne protégé `web_network`.
* **Sécurité & Routage** : Traefik v3 avec ForwardAuth (SSO Google) et certificats automatiques.

## Utilisation

Lisez `how_to_use_repo.md` pour un guide de démarrage complet, et le fichier `NETWORK.md` pour la gestion des communications CORS/Proxy entre l'UI et le backend.
Les directives d'Intelligence Artificielle (Cursor, Antigravity) sont logées sous `AI skills/`.