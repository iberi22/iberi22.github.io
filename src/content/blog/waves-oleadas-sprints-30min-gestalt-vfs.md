---
title: 'Waves: Oleadas como Sprints de 30 Minutos — De 15 Tareas Paralelas a Cientos con Gestalt VFS'
excerpt: 'Cómo pasé de recopilar manualmente incidencias y sprints a orquestar oleadas deterministas de 15 agentes en 30 minutos con GitCore + Hermes + Xavier — y por qué Gestalt VFS es la pieza experimental que permitirá que cientos de agentes toquen el mismo archivo sin colisionar.'
description: 'Guía completa del sistema de Waves de SouthWest AI Labs: cómo recolecto incidencias via tests y GitCore para preparar sprints que ejecuto como oleadas de 30 minutos en Jules, la triada GitCore-Hermes-Xavier, de 15 tareas paralelas con islas disjuntas a N tareas con Gestalt VFS (OverlayFs + StateDbVfs + SerialMergeQueue + merge-tree) — estado experimental y roadmap.'
date: '2026-08-29'
tags: ['Waves', 'GitCore', 'Gestalt', 'VFS', 'AI Agents', 'Jules', 'Architecture', 'DevOps']
draft: false
published: true
canonical: 'https://iberi22.github.io/portfolio-iberi22/blog/waves-oleadas-sprints-30min-gestalt-vfs/'
readingTime: 22
image: 'https://iberi22.github.io/portfolio-iberi22/og/waves-oleadas-sprints-30min-gestalt-vfs.png'
ogImage: 'https://iberi22.github.io/portfolio-iberi22/og/waves-oleadas-sprints-30min-gestalt-vfs.png'
---

# Waves: Oleadas como Sprints de 30 Minutos

> **Reseña del autor — Brahyan Belalcázar (@iberi22):** *Hace varios meses vengo acoplando una forma de recopilar información de un proyecto usando scripts y técnicas como [GitCore](https://github.com/iberi22/GitCore), reuniendo incidencias en los tests para poder preparar sprints — pero estos yo los trabajo como **oleadas o waves**. Cada wave es un sprint de 30 minutos donde 15 agentes corren en paralelo sobre islas de archivos disjuntas. Este post documenta cómo llegamos ahí, qué sostiene la tubería hoy y hacia dónde vamos con Gestalt VFS: que muchos agentes puedan tocar el mismo archivo en versiones diferentes y que el sistema las mergee con lógica propia. Es experimental — y precisamente por eso lo documento en abierto.*

Si vienes de [1 Año Usando Jules](/portfolio-iberi22/blog/1-ano-usando-jules/) o de [Arquitectura Anti-Drift](/portfolio-iberi22/blog/anti-drift-coding-agent-architecture/), este artículo es el eslabón que conecta ambos: **cómo convierto incidencias reales en oleadas ejecutables**.

---

![Diagrama Waves: recolecta → GitCore → wave 30min → Gestalt VFS → cientos de tareas](https://iberi22.github.io/portfolio-iberi22/og/waves-oleadas-sprints-30min-gestalt-vfs.png)

*Oleadas = sprints comprimidos. La colección nunca para; el despacho es en ráfagas.*

---



> **Lee primero la base que hace posible esta escala**: [Arquitectura anti-drift para agentes de código](/blog/anti-drift-coding-agent-architecture/) (micro-fragmentación, files territory, merge reconciler) y [Issues como contratos ejecutables con Xavier CodeGraph](/blog/protocolo-issues-contrato-xavier-codegraph/) (cómo se redacta un issue para que un agente no necesite reinterpretarlo). Si vienes de [1 año usando Jules](/blog/1-ano-usando-jules/), este post es la continuación natural — las waves de 15-30 issues paralelos que se describen allí, las formalizamos aquí y las rompemos con Gestalt VFS.
## 1. De la recolección silenciosa al despacho en ráfagas

La mayoría de pipelines agénticos empiezan al revés: crean un issue y despachan un agente. Nosotros empezamos **meses antes**, sin agente a la vista.

### 1.1 Recolectando señal antes de pedir trabajo

Tres fuentes alimentan el backlog de forma continua:

| Fuente | Qué captura | Dónde vive | Script que la cosecha |
|---|---|---|---|
| **Tests** | Incidencias, flaky, deuda de tipos, cobertura por isla | `vitest run` / `cargo test` / `flutter test` + JUnit XML | `scripts/collect-test-incidents.mjs` → normaliza a `features.json` |
| **GitCore** | Features, estados (`planning`→`doing`→`review`), métricas de avance | `.gitcore/features.json` + `.gitcore/STATE.md` | `gitcore status --json` + `xavier memory search "pending"` |
| **Xavier CodeGraph** | Drift de tipos, símbolos huérfanos, imports rotos | `.xavier/codegraph.json` + SQLite | `xavier code scan && xavier code query --stale` |

No hay “reunión de grooming”. Hay un **colector** que corre tras cada `push` o `nightly CI` y deja un `incidents.json` con la forma:

```json
{
  "source": "vitest",
  "file": "apps/worldexams-api/src/packs/weekly.ts",
  "symbol": "filterByPeriod",
  "kind": "type-error",
  "count": 3,
  "suggested_island": "packs/weekly"
}
```

Ese es el “bloque crudo”. No es un issue todavía.

### 1.2 Del incidente al micro-corte

Una vez a la semana (o cuando `incidents.json` supera un umbral), corro un **paso de acoplamiento** — manual por ahora, cada vez más asistido por Hermes:

1. Agrupo incidentes por **isla** (conjunto de archivos que siempre cambian juntos).
2. Verifico que cada isla tenga **contrato previo** (tipos/schemas) o la creo como wave 0.
3. Fragmento cada isla en cortes **<150 LOC** verificables con `tldr` de 3 líneas: *qué toca, qué prueba, qué comando lo verifica*.

El resultado es un `wave-plan.md` con N micro-tareas que ya son **islas disjuntas por construcción** — no por promesa en un prompt.

> **Principio que me ahorró cientos de horas:** *si dos tareas van a tocar el mismo archivo, no son dos tareas. Es una.*

---

## 2. Qué es exactamente una wave

Una **wave** es un sprint ágil completo comprimido en **~30 minutos**:

```
┌──────────────────────────────────────────────────────────────────┐
│              CICLO DE VIDA DE UNA WAVE (30 MIN)                  │
├──────────────────────────────────────────────────────────────────┤
│  0. PRE:  Lectura de Xavier + features.json (contexto vivo)      │
│  1. PLAN: Fragmentación en 3-15 micro-issues con territorio      │
│  2. QA:   Validador de islas disjuntas (0 colisiones)            │
│  3. DISPATCH:  Label 'jules' → Google Jules (hasta 15 VMs)      │
│  4. WATCH: Monitoreo asíncrono + fix de CI en caliente           │
│  5. MERGE: Reconciliador neutral (orden Tipos→Core→API→E2E)      │
│  6. POST: features.json + Xavier archival + cierre de sprint     │
└──────────────────────────────────────────────────────────────────┘
```

Compáralo con un sprint tradicional:

| Dimensión | Sprint ágil (2 semanas) | Wave (30 min) |
|---|---|---|
| **Planificación** | Poker, refinamiento | `wave-plan.md` + islands check (script, <30s) |
| **Ejecución** | Daily standups | Jules VMs aisladas (sin standup; el bus es el standup) |
| **Integración** | Merge Friday doloroso | `SerialMergeQueue` + `git merge-tree --write-tree` |
| **Retrospectiva** | Post-mortem | `Xavier archival` + Drift Tax del benchmark |

La metáfora no es casual: **organizar una wave es planificar un sprint**, solo que el equipo son agentes y el “tiempo de foco” son minutos, no días.

Más contexto histórico y métricas de 12 meses (81 repos, 11k commits, 1.3k commits agénticos) en [1 Año Usando Jules](/portfolio-iberi22/blog/1-ano-usando-jules/).

---

## 3. La triada que sostiene la wave: GitCore · Hermes · Xavier

Ninguna wave sobrevive sin los tres pilares — y ninguno de los tres sirve solo.

```
                  ┌──────────────────────────────┐
                  │    XAVIER (Memoria Viva)     │
                  │  .xavier/codegraph.json      │
                  │  Vector + CodeGraph + Docs   │
                  └──────────────┬───────────────┘
                                 │ contexto PRE + archival POST
                                 ▼
┌──────────────────┐      ┌──────────────┐      ┌──────────────────┐
│  HERMES GATEWAY  │ ───► │  GITCORE CLI │ ───► │   GOOGLE JULES   │
│  Despacho rápido │      │ State Engine │      │  15 VMs paralelas│
│  + rate-limit    │      │ features.json│      │  1 issue = 1 PR │
└──────────────────┘      └──────────────┘      └──────────────────┘
         ▲                       │                       │
         └───── bus de eventos ──┴───── timeline ─────────┘
```

- **GitCore** — el arnés que impone `1 issue = 1 rama = 1 PR`, mantiene `features.json` como fuente de verdad del avance, limpia ramas remotas y bloquea PRs sin CI verde. Ver skill canónica en `/public/skills/swal-pipeline-orchestrator/SKILL.md`.
- **Hermes** — el dispatcher que gestiona rotación de credenciales, cuotas (Jules 15/100 por día, Claude Code 5 subagentes, Ollama local ilimitado) y el `swal-rate-limiter.sh`. Sin Hermes, la wave se estrella contra un 429.
- **Xavier** — la memoria que evita que cada wave empiece de cero: `PRE` hace `xavier memory search` con el plan de la wave; `POST` archiva decisiones y diffs. Su [CodeGraph](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/) (tree-sitter + SQLite <10ms) es el que permite direccionar por símbolo, no por archivo.

El bus entre los tres es **GitHub**: issues como contratos, PRs como paquetes de trabajo, branches como prueba de entrega. Detalle de por qué GitHub y no un FS exótico en [1 Año Usando Jules §2](/portfolio-iberi22/blog/1-ano-usando-jules/).

Los tres mecanismos anti-drift que hacen que 15 PRs paralelos no colisionen están en [Arquitectura Anti-Drift](/portfolio-iberi22/blog/anti-drift-coding-agent-architecture/): micro-fragmentación <150 LOC, islas disjuntas por construcción y verificación mecánica.

---

## 4. Por qué hoy son 15 y queremos cientos

**15 no es una meta. Es un límite de cuota.**

Google AI Pro/Jules permite **15 tareas concurrentes y 100 runs/24h** por cuenta. En la práctica, saturamos las 15 en cada wave “gorda” de WorldeXams (p. ej. 9 bundles de contenido + 4 de tooling + 2 de docs = 15).

El cuello de botella real no es Jules: es **el archivo compartido**.

Con islas disjuntas, 15 es seguro porque garantizamos `conjunto_archivos(issue_A) ∩ conjunto_archivos(issue_B) = ∅`. Pero si quiero 50 tareas, la combinatoria de islas se vuelve intratable: todo toca `src/types.ts`, `package.json`, `tailwind.config`, `i18n/*.json`, `schema.prisma`… Serializar todo anula la ganancia.

Dos salidas:

1. **Escalar horizontalmente** — más cuentas, más runners (Hermes ya soporta rotación multi-proveedor; ver [Token Economics](/portfolio-iberi22/blog/benchmarking-ai-agent-token-economics-2026/) para comparar Jules vs Claude Code vs Ollama local).
2. **Escalar verticalmente** — que **un mismo archivo pueda ser tocado por N agentes en paralelo**, cada uno en su versión, y que el sistema mergee con lógica. Ahí entra **Gestalt VFS**.

La opción 2 es la que cambia el juego: pasar de `N archivos disjuntos` a `N ediciones disjuntas del mismo archivo`.

---

## 5. Gestalt VFS — la prueba de concepto experimental

> **Estado: experimental. No usar en producción sin leer esta sección completa.**

### 5.1 La idea en una frase

*Gestalt VFS deja que muchos agentes toquen el mismo archivo a la vez — cada uno en su overlay — y mergea las versiones con lógica propia (no con `git merge` textual).*

Si Jules te da **aislamiento por VM/contenedor**, Gestalt te da **aislamiento por sistema de archivos virtual** dentro de un mismo host — útil para agentes locales (Claude Code subagentes, Ollama, Codex) que hoy sí pisan el mismo `worktree`.

### 5.2 Piezas que ya existen (y puedes inspeccionar)

| Capa | Qué hace | Dónde está en el repo |
|---|---|---|
| **VFS trait** | `read / write / list / exists / flush / acquire_lock` — contrato que todo FS debe implementar | `gestalt_core/src/ports/outbound/vfs.rs` |
| **OverlayFs** | FS en memoria con `text_files + binary_files + dirs + locks` + `version: u64`; `flush()` escribe al disco real en paralelo con `JoinSet` | `gestalt_core/src/ports/outbound/vfs.rs` (`struct OverlayFs`) |
| **StateDbVfs** | VFS persistente en SQLite: tabla `file_versions(path, version_hash, content, agent_id, created_at)` + SHA-256 por versión + `read_file / write_block / list_versions / get_diff` | `gestalt-state/src/virtual_fs.rs` (566 líneas) |
| **WriteSetValidator** | Valida que cada `write_block` respete el `allowed_paths` declarado por el agente; rechaza out-of-scope antes de tocar el worktree | `gestalt-router/src/worktree.rs` |
| **SerialMergeQueue** | Cola que mergea ramas una-a-una con `git merge-tree --write-tree` (git ≥2.38, en memoria, sin checkout); en conflicto hace rollback y no avanza | `gestalt-router/src/router.rs` |
| **CleanSlateRetry** | Si la cola falla, reintenta desde un base limpio reaplicando todo con una `SerialMergeQueue` fresca | `gestalt-router/src/integrate.rs` |
| **AtomicCheckpointer** | Checkpoint git-aware con rollback `git reset --mixed` si la escritura del manifest falla | `gestalt-router/src/checkpoint.rs` |

### 5.3 Flujo con VFS (vs sin VFS)

**Sin VFS (hoy, Jules):**

```
Repo en main (commit abc)
  ├─ agent-1 worktree → edita src/i18n/es.json → PR-1
  ├─ agent-2 worktree → edita src/i18n/es.json → PR-2  ← CONFLICTO si ambos tocan la misma key
  └─ reconciliador: merge PR-1, rebase PR-2, resolver a mano
```

**Con VFS (Gestalt, experimental):**

```
Repo en main (commit abc)  +  StateDbVfs (SQLite)
  ├─ agent-1 Overlay → write_block(es.json, BlockEdit{old:"greeting.hi", new:"Hola"}) → version aa1 → lock(es.json, agent-1)
  ├─ agent-2 Overlay → write_block(es.json, BlockEdit{old:"greeting.bye", new:"Adiós"}) → version bb2 → lock(es.json, agent-2) — distinta key, permite
  ├─ agent-3 Overlay → write_block(es.json, BlockEdit{old:"greeting.hi", new:"¡Hola!"}) → RECHAZADO (lock HeldByOther)
  └─ flush + SerialMergeQueue: merge-tree(tree₀, aa1) → tree₁, merge-tree(tree₁, bb2) → tree₂ → commit-tree(tree₂) → refs/heads/gestalt/run-xyz
```

El truco está en `BlockEdit` (`old_string → new_string + context + agent_id`): no es “reescribe el archivo”, es “reemplaza este bloque si aún está ahí”. Si otro agente ya cambió ese bloque, el `context` no matchea y el write se rechaza — no se corrompe.

### 5.4 Qué falta y por qué es experimental

- **Merge semántico:** hoy `merge-tree` es textual. Si dos agentes cambian dos funciones distintas del mismo `src/api.ts`, mergea bien. Si cambian la misma función, hay conflicto aunque el AST podría mergear. El roadmap apunta a `mergiraf` (tree-sitter) + modelo 3-capas (merge-tree → tree-sitter → LLM supervisor) — ver `gestalt/docs/REFINEMENTS.md`.
- **`gestalt-merge` crate:** aún es placeholder (`Fase 2: not yet implemented`). La lógica real vive en `gestalt-router`.
- **Escala probada:** las waves con Jules han corrido con 15 agentes × 81 repos. Gestalt VFS ha sido probado en integración con 2-4 agentes locales; no en 50. No hay garantías de rendimiento con `JoinSet` masivo ni con `file_versions` de 10k filas.
- **Observabilidad:** existe `gestalt bus serve` + `StateDbEventLog` (timeline), pero no hay dashboard de contención de locks por archivo.

Si quieres experimentar: `gestalt run --task "..." --max-parallel 4` con `RUST_LOG=debug` y revisa `~/.gestalt/state.db`. No lo pongas delante de tu `main` sin un `dry_run`.

---

## 6. Roadmap: de 15 a 50+ tareas por wave

| Fase | Qué cambia | Métrica de éxito | ETA |
|---|---|---|---|
| **Hoy** | 15 Jules + islas disjuntas | Drift Tax 7%, 0.2 PRs rehechas/ola | hecho |
| **+VFS local** | 15 Jules + 5 Claude Code subagentes vía VFS (mismo repo, archivos distintos) | 20 tareas/wave, 0 locks HeldByOther | Q4 2026 |
| **+AST merge** | Mismo archivo, funciones distintas → merge automático | 30 tareas/wave, <5% conflictos manuales | Q1 2027 |
| **+Many waves** | N waves solapadas con `codegraph_sync_commit` como cerca | 50+ tareas/día, frescura CodeGraph <5min | Q2 2027 |

El norte es el que describes en tu idea de [Issues como Contratos L3](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/): que un issue pueda pedir `file:line:col` y que el implementador no explore, solo aplique. VFS es el que hace posible que esos L3 convivan sin pisarse.

---

## 7. Cómo replicar waves en tu repo (checklist de 30 minutos)

Si vienes de cero, no intentes montar Gestalt. Empieza por la wave más tonta que funcione:

- [ ] Crea `.gitcore/features.json` con 1 feature y 1 criterio verificable (`grep -q "foo" src/bar.ts && echo ok`).
- [ ] Escribe 1 script que convierta `vitest --reporter=json` en `incidents.json` agrupado por isla (20 líneas de `jq` bastan).
- [ ] Escribe 1 validador de islas disjuntas (el de [Anti-Drift §3](/portfolio-iberi22/blog/anti-drift-coding-agent-architecture/) son 20 líneas de Python).
- [ ] Crea 2 issues con `Files Territory` disjuntos + `Acceptance: npm run validate` y despáchalos a Jules (o a 2 terminales con Claude Code).
- [ ] Haz de reconciliador neutral: mergea en orden, cosecha deltas, archiva en Xavier/`features.json`.

Cuando eso te dé 2 PRs sin conflicto, repite con 5, luego 10. **La wave se aprende por repeticiones, no por diseño previo.**

---

## 8. Sigue leyendo

- **Protocolo de issues-contrato** (12 secciones + evolución a `file:line:col` con Xavier CodeGraph): [Issues como Contratos Ejecutables — Caso #1128](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/) — incluye [infografía 1200×1680](/portfolio-iberi22/og/issue-1128-infografia-contrato.svg) y un skill auditable que puedes correr sobre tu repo.
- **Anti-drift** (micro-fragmentación <150 LOC, islas, verificación mecánica): [Arquitectura Anti-Drift](/portfolio-iberi22/blog/anti-drift-coding-agent-architecture/)
- **Coste real por PR** (Jules vs Claude Code vs Ollama Qwen 32B, Drift Tax): [Token Economics 2026](/portfolio-iberi22/blog/benchmarking-ai-agent-token-economics-2026/)
- **Un año de historia** (de chat a fábrica asíncrona): [1 Año Usando Jules](/portfolio-iberi22/blog/1-ano-usando-jules/)
- **Memoria viva** (por qué Xavier existe): [Construyendo Xavier: Núcleo de Memoria Cognitiva](/portfolio-iberi22/blog/xavier2-memory-core/)
- **Orquestación multi-agente** (por qué Gestalt y no un bash): [Orquestación Multi-Agente con Gestalt](/portfolio-iberi22/blog/multi-agent-orchestration-gestalt/)

---

*¿Quieres tu wave 0? Agenda una sesión y la diseñamos con tus incidentes reales. Mientras tanto, prueba el [skill auditor del post de contratos](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/#skill-auditor) — te dice en 10 segundos si tu repo está listo para oleadas.*

*— Brahyan Belalcázar @iberi22 · SouthWest AI Labs · 2026-08-29 · CC BY-SA*
