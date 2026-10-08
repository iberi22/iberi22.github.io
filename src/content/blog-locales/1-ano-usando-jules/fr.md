---
title: 'Un an avec Google Jules : de l’expérimentation au développement autonome par vagues parallèles'
excerpt: 'Rétrospective du premier push de Jules (11 juin 2025, bêta publique) au 28 août 2026 : GitCore, vagues de 15 tâches et métriques sur 81 dépôts. Antigravity est arrivé le 18 novembre 2025.'
locale: fr
entry: 1-ano-usando-jules
---

Le **11 juin 2025, à 02:05 UTC**, Jules a fait le premier push sur mon compte. La pull request a été mergée à 03:50 UTC le même jour. Jules était en bêta publique depuis le Google I/O du 20 mai. Le premier changement qui portait une feature est arrivé 22 minutes plus tard, dans la même pull request.

Au **28 août 2026**, avec **11 240 commits** comptés dans 81 dépôts, le flux n’est plus un chat. C’est une **usine logicielle asynchrone et déterministe** qui envoie des **vagues de jusqu’à 15 micro-tâches parallèles** à [Google Jules](https://jules.google), coordonnées par **Hermes** et vérifiées par la machine d’états de **GitCore**.

Voici la rétrospective technique de cette période : l’évolution des outils, les parades aux collisions de contexte, les métriques de clôture et ce que j’en ai retenu.

---

## 1. Le début : une posture minimaliste et les premiers outils

En juin 2025, j’expérimentais déjà des agents de code en local. La coupure, c’est ce premier push de Jules, pas un IDE. **Google Antigravity n’existait pas** : il est sorti le **18 novembre 2025**, le même jour que Gemini 3, comme IDE avec agents. Les vagues de cette note sont envoyées par Jules.

Ma posture technique reste minimaliste :

> **Principe de friction minimale :** *Moins vous empilez d’outils, d’extensions et de réglages intermédiaires, plus vous êtes productif. Moins de temps perdu à débattre de l’éditeur, plus de temps sur le problème.*

Ce printemps-là, Google Labs avait deux choses distinctes. **Jules** est l’agent asynchrone : il clone le dépôt dans une VM et rend une pull request. Il est resté en bêta publique du 20 mai au 6 août 2025. [Google Stitch](https://stitch.withgoogle.com) génère une interface, pas des correctifs sur un dépôt. Il est sorti le même 20 mai.

Nous savions que nous opérions en *early adopters* (« cobayes ») sur une technologie naissante. Le pari de fond était tout aussi net : **Google ne cherchait pas un autre autocomplétion locale. Il mettait le plus grand cloud de la planète sous le développement logiciel.**

---

## 2. Le goulet : GitHub comme bus de calcul

Tout ingénieur qui a confié du travail à 4 ou 5 agents lancés en même temps sur une seule machine locale bute sur le même mur physique : **les collisions de fichiers et l’écrasement de l’état.** Deux agents qui éditent le même fichier en local détruisent l’espace de travail.

Dans cette période, la sortie n’a pas été un système de fichiers virtuel. C’était le pipeline que l’industrie avait déjà résolu : **GitHub**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PIPELINE DISTRIBUIDO DE GOOGLE JULES                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   GitHub Issues          Google Cloud Compute        Pull Requests     │
│  ┌──────────────┐       ┌─────────────────────┐    ┌─────────────────┐ │
│  │ Spec atómico │ ────► │ Sandbox Aislado     │ ──►│ Diff limpio +   │ │
│  │ + Criterios  │       │ (Jules Agent Run)   │    │ Tests verdes    │ │
│  └──────────────┘       └─────────────────────┘    └─────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

En transformant le flux en **issue → tâche d’agent isolée → pull request**, chaque instance de Jules tourne dans son propre conteneur éphémère, dans les datacenters de Google. Les agents ne se gênent plus.

Cet isolement est celui de cette période : une branche et une pull request par agent. Gestalt VFS, pour que plusieurs agents éditent le même fichier, est venu après. L’article de clôture raconte cette partie.

### Le plafond de 15 tâches concurrentes

Ce nombre n’existait pas le 11 juin. Il est arrivé le **6 août 2025**, quand Jules est sorti de bêta. Sur Google AI Pro, le quota est devenu **15 tâches concurrentes**. Le plan gratuit est resté à 3. Depuis, les vagues se montent contre ce plafond : un agent ferme un jalon borné, pas un sous-système entier.

À cette sortie, Jules utilisait **Gemini 2.5 Pro**. Une fenêtre de plus de 1M de tokens suffisait pour un crate ou un module, avec ses types et ses tests, si l’issue ne prétendait pas être le système complet.

---

## 3. Du chaos au harnais : GitCore et les sprints de 30 minutes

Quand le volume de PR a grandi, les anomalies sont apparues : *context drift*, dépendances croisées et branches orphelines. On ne pouvait pas compter sur la chance.

C’est là que j’ai construit le harnais d’ingénierie autour de **GitCore**, et transformé le processus en **cycle déterministe de vérification formelle** :

1. **Matrice de features (`features.json`) :** chaque projet définit son avancement en pourcentage et des critères d’acceptation vérifiables.
2. **Nettoyage automatisé des branches :** réconciliation continue des branches distantes après chaque merge.
3. **Suites E2E et compilation stricte :** aucune PR n’est approuvée si elle ne passe pas 100 % de la suite de tests automatisés.

```
┌──────────────────────────────────────────────────────────────────┐
│             AI SPRINT LIFECYCLE (OLEADA DE 30 MINUTOS)           │
├──────────────────────────────────────────────────────────────────┤
│  1. Lectura de estado previo en Xavier (Memoria) y features.json  │
│  2. Fragmentación en 3-4 micro-issues por feature (Islas)         │
│  3. Auditoría pre-dispatch (0 colisiones de archivos)             │
│  4. Dispatch paralelo a Jules con label 'jules' (hasta 15 tasks) │
│  5. Monitoreo asíncrono y resolución de suites de tests           │
│  6. Merge secuencial ordenado: Tipos ➔ Core ➔ API ➔ E2E          │
│  7. Actualización de métricas en features.json y cierre de sprint│
└──────────────────────────────────────────────────────────────────┘
```

Le constat a été immédiat : **organiser une vague d’agents, c’est exactement planifier un sprint agile de deux semaines**, à ceci près que le cycle d’estimation, de développement, de test et de livraison tient en **30 minutes**.

---

## 4. Métriques à la clôture (28 août 2026)

Les comptes de commits sont un scan du workspace à la date de cette note. Ce n’est pas un recomptage depuis le 11 juin, et les heures ne sortent pas de `git log`.

| Métrique de l’écosystème | Valeur |
| :--- | :--- |
| **Premier push de Jules** | 11 juin 2025, 02:05 UTC |
| **Clôture de cette coupe** | 28 août 2026 (443 jours depuis le premier push) |
| **Dépôts dans le scan** | **81 dépôts** |
| **Commits dans ces dépôts** | **11 240 commits** |
| **Commits de vagues (Jules et d’autres agents)** | **1 391 commits** |
| **Features dans `features.json`** | **1 723 spécifications** |
| **Pull requests mergées** | **1 000+ PR** |
| **Heures équivalentes de travail manuel** | **~6 250 h, une estimation, hors du scan** |
| **Multiplicateur** | **6,5x – 8,0x, une estimation** |

### Dépôts publics avec le plus d’activité d’agents

La liste ci-dessous ne contient que du code public. Les totaux du tableau mélangent ce code avec un autre travail qui n’est pas publié. Cet autre travail n’a ni nom, ni lien, ni compte.

1. **[Xavier](https://github.com/iberi22/xavier) :** 1 922 commits au total / 255 commits de Jules *(mémoire cognitive vectorielle en Rust)*.
2. **[OrionHealth](https://github.com/iberi22/OrionHealth) :** 1 243 commits au total / 61 commits de Jules *(santé offline-first en Flutter)*.
3. **[WorldExams](https://github.com/iberi22/worldexams) :** 844 commits au total / 85 commits de Jules *(pratique d’examens, offline-first)*.
4. **[Gestalt](https://github.com/iberi22/gestalt) :** 635 commits au total / 200 commits de Jules *(orchestrateur multi-agent en Rust)*.

L’inventaire local-first est sur [Shelf](https://estante-inventario.vercel.app).

---

## 5. Motifs clés : micro-fragmentation et îlots de fichiers disjoints

Pour que 15 agents concurrents travaillent sans se détruire, le harnais applique deux règles qui ne plient pas :

### A. Micro-fragmentation

Aucune issue ne dépasse 150 lignes d’impact ni plus de deux couches d’architecture. Chaque grande feature est découpée en :

- `[Micro-A]` : contrats de types, traits et structs.
- `[Micro-B]` : logique de domaine pure et algorithmes.
- `[Micro-C]` : adaptateurs d’entrée/sortie (HTTP, IPC, CLI).
- `[Micro-D]` : suites de tests unitaires et mocks.

### B. Îlots de fichiers disjoints

Avant d’envoyer une vague avec le label `jules`, un script vérifie que l’intersection des fichiers assignés à chaque issue est un ensemble vide :

```python
# Verificación de Islas de Archivos Disjuntas (Pre-Dispatch QA)
islands = {
    '#issue-101': ['crates/core/src/types.rs'],
    '#issue-102': ['crates/core/src/codec.rs'],
    '#issue-103': ['crates/api/src/routes.rs'],
    '#issue-104': ['crates/core/tests/e2e_test.rs'],
}

for i1, f1 in islands.items():
    for i2, f2 in islands.items():
        if i1 < i2 and set(f1) & set(f2):
            raise SystemExit(f"❌ COLISIÓN DETECTADA: {i1} y {i2} tocan {set(f1) & set(f2)}")
print("✅ 100% Islas Disjuntas Verificadas.")
```

---

## 6. La triade d’infrastructure : GitCore, Hermes et Xavier

Jules ne tourne pas dans le vide. Tout l’écosystème tient sur trois piliers faits pour ça :

```
                  ┌──────────────────────────────┐
                  │    XAVIER (Memoria Viva)     │
                  │  Contexto histórico & Vector │
                  └──────────────┬───────────────┘
                                 │ Context Feed
                                 ▼
┌──────────────────┐      ┌──────────────┐      ┌──────────────────┐
│  HERMES GATEWAY  │ ───► │  GITCORE CLI │ ───► │   GOOGLE JULES   │
│  Despacho Rápido │      │ State Engine │      │ 15 Parallel PRs  │
└──────────────────┘      └──────────────┘      └──────────────────┘
```

1. **GitCore :** le harnais maître. Il gouverne le contrat **1 issue → 1 branche → 1 PR**, met à jour `features.json` et lance les linters avant le merge.
2. **Hermes :** le dispatcher. Il gère le cycle de vie des agents et les plafonds de quota.
3. **[Xavier](https://github.com/iberi22/xavier) :** mémoire cognitive persistante avec recherche sémantique vectorielle. Il nourrit les issues avec des décisions d’architecture prises des mois plus tôt.

---

## 7. Ce qu’il reste à serrer

Depuis le premier push, le 11 juin 2025, le flux se resserre sur 4 points :

1. **Assertion sémantique en CI :** vérifier la compatibilité des types entre les branches d’une même vague avant le merge vers `main`.
2. **Alertes précoces de timeout :** prédire qu’un agent dépasse 15 minutes sur une compilation lourde.
3. **Ingestion en temps réel dans Xavier :** des webhooks qui indexent le diff de chaque PR approuvée dans la mémoire vectorielle.
4. **Sandbox réseau éphémère :** isoler sockets et ports pour les suites de tests concurrentes.

---

## 8. Conclusion : la nouvelle ère de l’ingénierie

La leçon nette de cette première année : **le vrai saut de productivité n’est pas de taper du code plus vite avec une autocomplétion. C’est de concevoir des harnais stricts capables de faire tourner des essaims autonomes en parallèle.**

Google Jules, porté par Gemini et orchestré par un harnais déterministe comme GitCore, a montré qu’un seul ingénieur, avec la bonne architecture, peut mener et livrer des projets avec la cadence, la robustesse et la qualité d’une équipe d’ingénierie complète.

---

## Continuer la lecture

Les **vagues de 15 issues parallèles** citées dans ce post (Wave 1, Wave 2, Wave 3) ont un article à part : **[Waves : les vagues comme sprints de 30 minutes et Gestalt VFS](/blog/waves-oleadas-sprints-30min-gestalt-vfs/)**. J’y explique pourquoi 30 min × N vagues bat le sprint classique, et je présente Gestalt VFS comme la preuve de concept qui casse le plafond de parallélisme (plusieurs agents sur le même fichier, merge en Rust).
