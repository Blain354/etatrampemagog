# CONTEXT.md — Rampe Magog État · Domain Language

> Glossaire de domaine. Un terme par concept, une phrase. Utiliser ces termes
> tels quels dans le code, commits et réponses agent. Reconstitué par analyse
> du PROJECT.md + de la finalité du repo — enrichir au fil du développement.

## Language

**Rampe**
: La rampe de mise à l'eau municipale de Magog (lac Memphrémagog) dont ce site rapporte l'état.
_Avoid_: descente, quai, slip.

**Statut**
: L'état de la rampe à un instant donné : `ouverte` ou `fermée`, affiché avec code couleur (vert / rouge) et icône.
_Avoid_: état (ambigu), state (en français), disponibilité.

**Avis municipal**
: La source officielle scrappée — les avis importants de la Ville de Magog (`ville.magog.qc.ca/.../avis-important/`). Source unique de vérité du statut.
_Avoid_: communiqué, annonce.

**Scrape**
: L'opération backend qui lit la page d'avis municipale et en dérive le `Statut` (+ date de réouverture si fermée).
_Avoid_: crawl, fetch (seul).

**/api/ramp-status**
: L'endpoint backend qui retourne le `Statut` courant (servi depuis le cache).
_Avoid_: /status, /api/etat.

**Cache (5 min)**
: Fenêtre de mise en cache backend du résultat du scrape pour éviter de marteler le site municipal et garder un chargement rapide.
_Avoid_: TTL (sans préciser), buffer.

**Date de réouverture**
: Quand la rampe est `fermée`, la date prévue de réouverture extraite de l'avis, affichée à l'utilisateur.
_Avoid_: ETA, deadline.

## Notes

- Site **public** (pas de Google Auth) ; domaine `etatrampemagog.blain-projects.ca`.
- Utilitaire mono-fonction : un seul signal (ouverte/fermée) doit être immédiat et fiable vs l'avis municipal.
