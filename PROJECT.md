# PROJECT.md — Rampe Magog État

## Name & Tagline

**Rampe Magog État** — Statut en direct de la rampe de mise à l'eau de Magog.

## Problem & Purpose

Les plaisanciers veulent savoir rapidement si la rampe municipale est ouverte ou fermée, sans parcourir le site de la Ville de Magog. Ce site agrège l'avis officiel et l'affiche clairement.

## Target Audience

Plaisanciers, résidents et visiteurs du lac Memphrémagog qui utilisent la rampe de mise à l'eau de Magog.

## Core Features (MVP)

1. Affichage du statut (ouverte / fermée) avec code couleur et icônes
2. Date de réouverture prévue lorsque la rampe est fermée
3. API backend `/api/ramp-status` qui scrape les avis municipaux

## Design Identity

- **Style:** Minimal, lisible, mobile-first
- **Primary color:** Vert (ouverte) / Rouge (fermée) sur fond Steel Signature
- **Vibe:** Utilitaire, rassurant, immédiat

## Technical Preferences

- Stack template : React 19 + Vite + FastAPI + Docker + Traefik
- Site public (sans Google Auth)
- Domaine : `rampe-magog-etat.blain-projects.ca`
- Source : https://www.ville.magog.qc.ca/informations-services/avis-important/

## Success Metrics

- Statut correct par rapport à l'avis municipal
- Chargement rapide sur mobile
- Mise à jour via cache backend (5 min)

## Notes & References

- Déploiement OpenClaw avec `PROJECT_NAME=rampe-magog-etat`
- CORS : `https://rampe-magog-etat.blain-projects.ca`
