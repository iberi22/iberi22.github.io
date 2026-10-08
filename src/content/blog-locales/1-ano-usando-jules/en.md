---
title: 'One Year Using Google Jules: From Experimentation to Autonomous Development in Parallel Waves'
excerpt: 'Retrospective from the first Jules push (11 Jun 2025, public beta) through 28 Aug 2026: GitCore, waves of 15 tasks, and metrics across 81 repositories. Antigravity arrived on 18 Nov 2025.'
locale: en
entry: 1-ano-usando-jules
---

On **11 June 2025, at 02:05 UTC**, Jules made the first push on my account. The pull request was merged at 03:50 UTC that same day. Jules had been in public beta since Google I/O on 20 May. The first change that carried a feature landed 22 minutes later, in the same pull request.

By **28 August 2026**, with **11,240 commits** counted across 81 repositories, the flow is no longer a chat. It is an **asynchronous, deterministic software factory** that dispatches **waves of up to 15 parallel micro-tasks** to [Google Jules](https://jules.google), coordinated by **Hermes** and checked by the **GitCore** state machine.

This is the technical retrospective of that stretch: how the tools evolved, how context collisions were avoided, the metrics at the close, and what I learned.

---

## 1. The start: a minimalist stance and the first tools

By June 2025 I was already trying coding agents locally. The cut was that first Jules push, not an IDE. **Google Antigravity did not exist**: it shipped on **18 November 2025**, the same day as Gemini 3, as an IDE with agents. The waves in this note are dispatched by Jules.

My technical stance is still minimalist:

> **Minimum-friction principle:** *The fewer tools, extensions, and intermediate settings you pile up, the more productive you are. Less time lost arguing about which editor to use, and more time on the problem.*

That spring Google Labs had two different things. **Jules** is the asynchronous agent: it clones the repo in a VM and returns a pull request. It was in public beta from 20 May to 6 August 2025. [Google Stitch](https://stitch.withgoogle.com) generates an interface, not patches for a repository. It shipped the same 20 May.

We knew we were operating as *early adopters* ("guinea pigs") on a technology that was just being born. The underlying bet was also clear: **Google was not trying to build another local code autocomplete. It was putting the largest cloud on the planet under software development.**

---

## 2. The bottleneck: GitHub as the compute bus

Any engineer who has tried to hand work to 4 or 5 agents running at once on the same local machine hits the same physical wall: **file collisions and overwritten state.** Two agents editing the same file locally destroy the workspace.

In that stretch the way out was not a virtual filesystem. It was the pipeline the industry had already solved: **GitHub**.

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

Turning the flow into **issue → isolated agent task → pull request**, each Jules instance runs in its own ephemeral container on Google's datacenters, so agents do not interfere with each other.

That isolation is the one for this stretch: one branch and one pull request per agent. Gestalt VFS, so that several agents can edit the same file, came later. The closing article tells that part.

### The ceiling of 15 concurrent tasks

That number did not exist on 11 June. It arrived on **6 August 2025**, when Jules left beta. On Google AI Pro the cap became **15 concurrent tasks**. The free plan stayed at 3. From then on, waves are built against that ceiling: one agent closes a bounded milestone, not a whole subsystem.

At that launch Jules used **Gemini 2.5 Pro**. A window of more than 1M tokens was enough for a crate or a module, with its types and its tests, if the issue did not pretend to be the whole system.

---

## 3. From chaos to a harness: GitCore and 30-minute sprints

As the volume of PRs grew, anomalies showed up: *context drift*, crossed dependencies, and orphan branches. We could not depend on luck.

That is when I built the engineering harness around **GitCore**, and turned the process into a **deterministic cycle of formal verification**:

1. **Feature matrix (`features.json`):** each project defines its percentage of progress and acceptance criteria that can be checked.
2. **Automated branch cleanup:** continuous reconciliation of remote branches after every merge.
3. **E2E suites and a strict build:** no PR is approved unless it passes 100% of the automated test suite.

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

The realization was immediate: **organizing a wave of agents is exactly like planning a two-week agile sprint**, except the cycle of estimation, development, testing, and delivery runs in **30 minutes**.

---

## 4. Metrics at the close (28 August 2026)

The commit counts are a workspace scan at the date of this note. They are not a recount from 11 June, and the hours do not come from `git log`.

| Ecosystem metric | Value |
| :--- | :--- |
| **First Jules push** | 11 June 2025, 02:05 UTC |
| **Close of this cut** | 28 August 2026 (443 days since the first push) |
| **Repositories in the scan** | **81 repositories** |
| **Commits in those repositories** | **11,240 commits** |
| **Wave commits (Jules and other agents)** | **1,391 commits** |
| **Features in `features.json`** | **1,723 specifications** |
| **Merged pull requests** | **1,000+ PRs** |
| **Equivalent hours of manual work** | **~6,250 h, an estimate, outside the scan** |
| **Multiplier** | **6.5x – 8.0x, an estimate** |

### Public repositories with the most agent activity

The list below is public code only. The totals in the table mix that code with other work that is not published. That other work has no name, no link, and no count.

1. **[Xavier](https://github.com/iberi22/xavier):** 1,922 total commits / 255 Jules commits *(vector cognitive memory in Rust)*.
2. **[OrionHealth](https://github.com/iberi22/OrionHealth):** 1,243 total commits / 61 Jules commits *(offline-first health in Flutter)*.
3. **[WorldExams](https://github.com/iberi22/worldexams):** 844 total commits / 85 Jules commits *(exam practice, offline-first)*.
4. **[Gestalt](https://github.com/iberi22/gestalt):** 635 total commits / 200 Jules commits *(multi-agent orchestrator in Rust)*.

The local-first inventory is at [Shelf](https://estante-inventario.vercel.app).

---

## 5. Key patterns: micro-fragmentation and disjoint file islands

To let 15 concurrent agents work without destroying each other, the harness implements two rules that do not bend:

### A. Micro-fragmentation

No issue exceeds 150 lines of impact or spans more than two architectural layers. Each large feature is split into:

- `[Micro-A]`: type contracts, traits, and structs.
- `[Micro-B]`: pure domain logic and algorithms.
- `[Micro-C]`: input/output adapters (HTTP, IPC, CLI).
- `[Micro-D]`: unit-test suites and mocks.

### B. Disjoint file islands

Before dispatching a wave with the `jules` label, a script checks that the intersection of files assigned to each issue is an empty set:

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

## 6. The infrastructure triad: GitCore, Hermes, and Xavier

Jules does not run in a vacuum. The whole ecosystem hangs on three pillars built for this:

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

1. **GitCore:** the master harness. It governs the contract **1 issue → 1 branch → 1 PR**, updates `features.json`, and runs the pre-merge linters.
2. **Hermes:** the dispatcher. It manages the agent lifecycle and the quota limits.
3. **[Xavier](https://github.com/iberi22/xavier):** persistent cognitive memory with vector semantic search. It feeds issues with architectural decisions made months earlier.

---

## 7. What to improve next

Since the first push, on 11 June 2025, these are the 4 areas where the flow is being tightened:

1. **Semantic assertion in CI:** check type compatibility across branches of the same wave before merging to `main`.
2. **Early timeout alerts:** predict when an agent spends more than 15 minutes on a heavy compile.
3. **Realtime ingestion into Xavier:** webhooks that index the diff of every approved PR into vector memory.
4. **Ephemeral network sandboxing:** isolate sockets and ports for concurrent test suites.

---

## 8. Conclusion: the new era of engineering

The hard lesson of this first year: **the real productivity jump is not typing code faster with autocomplete. It is designing strict harnesses that can run autonomous swarms in parallel.**

Google Jules, backed by Gemini and orchestrated by a deterministic harness like GitCore, showed that one engineer with the right architecture can lead and ship projects with the cadence, the robustness, and the quality of a full engineering team.

---

## Keep reading

The **waves of 15 parallel issues** mentioned in this post (Wave 1, Wave 2, Wave 3) have their own article: **[Waves: waves as 30-minute sprints and Gestalt VFS](/blog/waves-oleadas-sprints-30min-gestalt-vfs/)**. There I explain why 30 min × N waves beats the classic sprint, and I present Gestalt VFS as the proof of concept that breaks the parallelism ceiling (many agents on the same file, merge in Rust).
