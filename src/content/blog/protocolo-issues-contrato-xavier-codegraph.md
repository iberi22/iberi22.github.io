---
title: 'Issues como Contratos Ejecutables: La Plantilla Canónica que Elimina el Drift en Agentes — Caso #1128 WorldeXams'
excerpt: 'Cómo convertir un GitHub Issue en un contrato determinista para agentes: anatomía completa de 12 secciones, por qué cada una existe, caso real #1128 (WorldeXams W32-W40, 9 bundles), métricas de Drift Tax y la evolución hacia contratos línea:cáracter con Xavier + CodeGraph.'
description: 'Guía completa del protocolo de issues-contrato para orquestación agéntica: del issue ambiguo al contrato verificable por comando. Desglose del issue #1128 de WorldeXams (9 bundles v5.2), 12 secciones obligatorias, file islands, anti-hallucination guards y validación de la idea de contratos línea:cáracter con Xavier CodeGraph (tree-sitter + SQLite <10ms).'
date: '2026-08-29'
tags: ['AI Agents', 'Architecture', 'GitOps', 'Xavier', 'CodeGraph', 'Jules', 'WorldeXams', 'DevOps']
draft: false
published: true
canonical: 'https://iberi22.github.io/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/'
readingTime: 18
image: 'https://iberi22.github.io/portfolio-iberi22/og/protocolo-issues-contrato-xavier-codegraph.png'
ogImage: 'https://iberi22.github.io/portfolio-iberi22/og/protocolo-issues-contrato-xavier-codegraph.png'
---

# Issues como Contratos Ejecutables: La Plantilla Canónica que Elimina el Drift

> **Tesis:** un GitHub Issue bien diseñado no es un ticket. Es un **contrato ejecutable** — gestionado por GitHub como `issue` o por tu propio sistema de agentes como `contract/issue` — tan preciso que el agente implementador **no toma decisiones**: solo aplica el patch.

Este post desglosa el protocolo real que usamos en el ecosistema SWAL/WorldeXams, con el issue **#1128** como caso vivo: `Colombia — sociales-ciudadanas 11 — W32-W40 (9 bundles, 180 preguntas)`.

> **Reseña del autor — Brahyan Belalcázar (@iberi22):** *Hace varios meses vengo acoplando una forma de recopilar información de un proyecto usando scripts y técnicas como [GitCore](https://github.com/iberi22/GitCore), reuniendo incidencias en los tests para poder preparar sprints — pero estos yo los trabajo como **oleadas o waves**. Cada wave es un sprint de 30 minutos donde 15 agentes corren en paralelo sobre islas de archivos disjuntas. Vi fallar demasiadas veces el mismo patrón: issues ambiguos que cada agente interpretaba distinto, PRs que colisionaban por tocar el mismo archivo y horas de reconcilio manual que anulaban el ahorro de tokens. Este rigor — 12 secciones, territory, acceptance por comando — no es burocracia: es la tubería que hace que 15 VMs no se pisen. Lo documento en abierto para que cualquiera pueda auditar su arnés y mejorarlo. La historia completa de cómo pasé de recolección silenciosa a waves está en [Waves: Oleadas como Sprints de 30 Minutos](/portfolio-iberi22/blog/waves-oleadas-sprints-30min-gestalt-vfs/).*

---

![Infografía: Issue como Contrato — Anatomía de 12 secciones + evolución a línea:cáracter con Xavier CodeGraph](https://iberi22.github.io/portfolio-iberi22/og/issue-1128-infografia-contrato.png)

*Infografía 1200×1680 — también disponible como [SVG vectorial](https://iberi22.github.io/portfolio-iberi22/og/issue-1128-infografia-contrato.svg) para zoom sin pérdida. Cada bloque corresponde a una sección obligatoria del issue-contrato.*

> **Serie Waves:** este post es el **#2 de 3**. Lee antes [#1 Waves: de la recolección a la ola](/portfolio-iberi22/blog/waves-oleadas-sprints-30min-gestalt-vfs/) (cómo convierto incidentes en wave-plans) y después [#3 Arquitectura Anti-Drift](/portfolio-iberi22/blog/anti-drift-coding-agent-architecture/) (los 3 mecanismos que eliminan el Drift Tax).

---

## 1. Por qué los issues ambiguos cuestan 3-4× más

En un pipeline con **oleadas de hasta 15 agentes en paralelo** (Jules, Gestalt, subagentes Hermes), una instrucción ambigua no se paga una vez: se paga **×15**.

Medimos el **Drift Tax** como `(tokens en re-drift / tokens totales) × 100`:

| Calidad del issue | Drift Tax observado | Coste por PR fusionada |
|---|---|---|
| Contrato ambiguo (“añade tests”) | 45-60% | 3-4× más caras |
| Contrato bueno (plantilla canónica) | <15% | baseline |
| Contrato línea:cáracter (L3, propuesto) | ~0-5% estimado | mínimo teórico |

La diferencia no está en el modelo (probamos los mismos issues en Jules, Claude Code y Ollama Qwen 32B — ver [Token Economics 2026](/portfolio-iberi22/blog/benchmarking-ai-agent-token-economics-2026/)). Está en la **arquitectura del contrato**.

Clasificamos el drift en 3 modos — el issue-contrato ataca uno por uno:

- **Drift de alcance:** el agente toca más de lo pedido. → *Lo cierran* `Files to Modify` + `DO NOT touch`.
- **Drift de interfaz:** el agente inventa una forma para el contrato entre componentes. → *Lo cierran* 18 campos de frontmatter + `## Question N [D#-D#]` + `calibration`.
- **Drift de memoria:** el agente contradice decisiones previas. → *Lo cierra* la cadena de skills versionadas, no la memoria del LLM.

---

## 2. Anatomía del contrato: 12 secciones obligatorias

Cada issue canónico tiene exactamente las mismas 12 secciones, en orden. Un agente puede parsear el `body` como si fuera un AST.

### 1 — Current State (MEDIBLE)
Qué existe **ahora**, con números, no narrativa. P. ej. en #1128:

> `CO 402/402 100%` global tras purga #876. Resto **W02-W40 vacío** → Periodos 2-4 = 0 preguntas → `No hay suficientes preguntas del periodo 4. Encontradas: 10/15`.

Sin esto el agente “inventa” alcance.

### 2 — Desired State (DELTA)
Qué debe existir **después**, como diff. En #1128: 9 bundles MASTERY v5.2 en `questions_data/colombia/sociales-ciudadanas/grado-11/2026/weekly/`, 20 preguntas c/u, con frontmatter 18 campos exacto.

### 3 — Web Research Obligatorio (antes de codificar)
4+ queries mínimo. En #1128:

1. `DBA sociales grado 11 MEN Colombia constitución 1991 participación`
2. `Saber 11 sociales ciudadanas ICFES ejes pensamiento social ciudadanía`
3. `conflicto armado historia Colombia grado 11 DBA competencias ciudadanas`
4. `saberparatodos curriculum.ts sociales-ciudadanas grado 11 periodo 4`

El agente debe **resumir hallazgos en el PR**: qué DBA/EBC y qué eje ICFES usa por pregunta, y por qué el tema elegido alinea `W → Periodo = ceil(W/10)`.

*Por qué:* grounding externo reduce alucinación y desacopla el contenido curricular del peso del modelo.

### 4 — Agent Session Prompt
Lista de verificación **antes de tocar código**: leer skills, leer un bundle gold-reference, verificar `AGENTS.md` v5.2 y `CONTENT_ERRORS.md`.

### 5 — Skills y protocolo (orden canónico)
1. `AGENTS.md` (v5.2 — fuente de verdad)
2. `skills/worldexams-bundle-generator/SKILL.md` (mirror v5.2 + bundle_index/calibration)
3. `skills/bundle-creator/SKILL.md`
4. `skills/bundle-creator/rules/CO.md` (Anti-Error Checklist + DBA/ICFES)
5. `saberparatodos/src/config/curriculum.ts` (topics por periodo para `filterByPeriod`)
6. `docs/specs/ACTIVE_PROTOCOLS.md` + `docs/specs/CONTENT_ERRORS.md` + `skills/worldexams-deploy/SKILL.md`

*Un único orden. Si dos agentes leen en órdenes distintos, divergen.*

### 6 — Reglas críticas para Jules
- Máximo 15 bundles (este lote: 9).
- No regenerar existentes salvo `REPLACE` explícito.
- Solo `.md` en la ruta canónica — cero scripts/logs/dirs temporales.
- Validar `npm run validate -- {archivos}` = **0 errores** antes de comentar.
- Comentar `[OK] Generados N bundles: …`

*Son límites que previenen scope drift por construcción.*

### 7 — Anti-errores (purga 2026-07-28)
9 clases codificadas de errores ya purgados:

1. `**ICFES:**` solo Colombia.
2. `alignment: "DBA MEN Colombia"` — nunca solo `ICFES`.
3. Ruta exacta `questions_data/colombia/sociales-ciudadanas/grado-11/2026/weekly/`.
4. 18 campos + `week: "WNN"` (nunca `semana:`) + `bundle_index` + `calibration`.
5. `## Question N [D#-D#]` (rango), nunca `## Pregunta`.
6. Sin placeholders ni `Todas/Ninguna de las anteriores`.
7. Dificultad progresiva G11 (D3-D4 → D9-D10).
8. Contexto colombiano (COP, Bogotá…), sin mencionar ICFES en el enunciado.

*Memoria institucional codificada, no tribal.*

### 8 — Configuración & Tabla W
Tabla de 9 filas con `W → tema → archivo → Periodo`. Ej.:

| # | Week | Tema | Archivo | Periodo |
|---|------|------|---------|---------|
| 1 | W32 | medio-ambiente | `CO-SOC-11-2026-W32-medio-ambiente-001-MASTERY-bundle.md` | P4 |
| … | W40 | repaso-p4-integrador | `CO-SOC-11-…-W40-…-bundle.md` | P4 |

Topics alineados a `curriculum.ts` G11 P4. Kebab-case ASCII. Si cambias un topic, mantienes `WNN`.

### 9 — Existing Code Patterns (DEBES seguir estos)
2 bundles gold-reference obligatorios:

- `CO-ING-11-2026-W02-environmental-sustainability-001-MASTERY-bundle.md`
- `CO-MAT-11-2026-W01-funciones-001-MASTERY-bundle.md`

> **Regla de oro:** copiar forma, no inventar forma.

### 10 — Acceptance Criteria (VERIFICABLES POR COMANDO)
No “se ve bien”. Comandos:

```bash
node saberparatodos/scripts/validate_content.js --only questions_data/colombia/sociales-ciudadanas/grado-11/2026/weekly 2>&1 | grep -E "Errores: 0"
ls questions_data/colombia/sociales-ciudadanas/grado-11/2026/weekly/CO-SOC-11-2026-W*.md | wc -l   # >= prev+9
grep -c "^## Question [0-9]* \[D[0-9]-D[0-9]\]" ...  # == 20 por archivo
grep -c "bundle_index:"  # >=1
grep -c "calibration:"    # >=1
grep -c "## Pregunta" ... # == 0
grep -c "semana:" ...     # == 0
```

*CI es el juez, no el reviewer.*

### 11 — Files to Modify
Tabla explícita: `file | estado actual (missing) | cambio (Crear bundle v5.2 20q) | riesgo LOW`.

> El agente no decide qué tocar. El contrato lo decide.

### 12 — DO NOT touch (Anti-Regresión)
Globs prohibidos: `questions_data/colombia/ingles/**`, `.gitcore/features.json`, `apps/worldexams-api/public/v1/packs/` (se regeneran), no borrar bundles no listados.

*Un toque fuera = drift instantáneo.*

### +2 — Verification & PR Delivery (ANTI-EMPTY-PR)
Bloques `bash` copiables + guard de entrega:

```bash
git status --porcelain   # debe listar .md antes de abrir PR
git diff --stat HEAD
git ls-files             # >=9 archivos en el PR
# Si bloqueado: NO abrir PR — comentar blocker en el issue
```

---

## 3. Caso #1128 paso a paso

Para el agente, #1128 se lee así:

1. **Web research (4 queries)** → resume DBA/EBC + eje ICFES por pregunta en el PR.
2. **Leer skills en orden** → `AGENTS.md` → `SKILL.md` → `rules/CO.md` → `curriculum.ts` → `CONTENT_ERRORS.md`.
3. **Leer 1 bundle existente** (`CO-SOC W01`) completo antes de generar.
4. **Generar 9 bundles** exactamente listados (W32-W40), cada uno 20Q, frontmatter 18 campos, `bundle_index: 1`, `calibration: {difficulty_band: "D3-D4", expected_success: 0.8}`, `## Question N [D3-D4]` con progresión D3→D10.
5. **Validar** `npm run validate -- {9 archivos}` → 0 errores. Si falla, arreglar antes de abrir PR.
6. **Comentar** `[OK] Generados 9 bundles: CO-SOC-11-2026-W…` con IDs reales.
7. **Post-merge** (orquestador humano): `generate-static-packs.js --all-weekly --changed-only` + `audit:country-readiness`.

Y file islands: este issue ocupa `W32-W40` en `sociales-ciudadanas/11`; otros 15 issues paralelos ocupan `W` disjuntos en otras rutas. `harness-file-islands.py` debe dar **0 conflictos**.

---

## 4. Validación de tu idea: del contrato de archivo al contrato de línea:cáracter

> *“El goal de los issues es que sean contratos manejados por GitHub como ‘issues’ o por el mismo sistema de agentes como un contrato/issue, y estar tan detallado que llegue a solo pedir cambios en las líneas y en variables, dada la línea y el carácter — solo posible usando Xavier y su CodeGraph. Esto evitaría gasto innecesario de tokens y certeza de 0 ambigüedades, aumentando la tasa de éxito.”*

**Veredicto: validado. Y es la evolución natural del pipeline.**

### Por qué es correcto

- **Xavier ya tiene el sustrato.** El CodeGraph indexa con tree-sitter y persiste en SQLite + `.xavier/codegraph.json`. Cada símbolo guarda `file_path`, `start_line`, `end_line`, `signature`, `parent`, y `stable_id = v2|project_id|file_path|name|kind|parent|signature` con lookup <10 ms. Es decir: **ya podemos direccionar por símbolo, no por archivo**.
- **Los issues actuales ya son L1 (contratos de archivo).** Pasar a L2 (símbolo) y L3 (línea:col) es el siguiente escalón, no un salto distinto. WorldeXams demuestra que L1 funciona a escala (402 bundles, 15 agentes en paralelo, 0 colisiones).
- **Ahorro de tokens real.** Hoy el agente gasta ~30-40% de tokens en **exploración** (leer el repo para construir contexto). Con un contrato L3, exploración → 0: el agente recibe `stable_id + file:line:col + patch exacto` y solo ejecuta. Estimamos **–35% tokens por PR** y Drift Tax cercano a 0.
- **Elimina el drift más caro (interfaz).** Código individualmente correcto pero colectivamente incompatible desaparece si el contrato fija firma, tipo y posición exacta.
- **Habilita file islands a nivel símbolo.** Dos issues pueden tocar el **mismo archivo** si apuntan a símbolos disjuntos (AST-aware). Hoy eso sería conflicto; con CodeGraph sería seguro.

### 3 niveles de contrato (propuesta operativa)

| Nivel | Scope | Qué especifica el issue | Ejemplo | Cuándo usarlo |
|-------|-------|------------------------|---------|---------------|
| **L1 — Archivo** | `file_path` | “Crea 9 bundles en `weekly/`” | #1128 actual | Bundles, scaffolding, contenido |
| **L2 — Símbolo** | `stable_id` (función/clase/tipo) | “Modifica `fn calculateScore` en `src/scoring.ts:42` — firma `fn(a: f64) -> f64` → `fn(a: f64, ctx: &Ctx) -> Result<f64>`” | Refactors, API changes | Cambios de interfaz |
| **L3 — Línea:cáracter** | `file:line:col + variable` | “En `src/config/curriculum.ts:118:14` cambia `const MAX_BUNDLES = 10` → `15`; en `:122:8` renombra `periodIdx` → `periodIndex`” | Hotfixes, renames, const tweaks | Parches quirúrgicos |

**Regla:** no todo issue debe ser L3. Usa el nivel más bajo que garantice 0 ambigüedad con el menor coste de generación.

### Condiciones para que L3 no sea “falsa precisión”

Sin esto, línea:col es mentira:

1. **CodeGraph sincronizado pre-issue.** El generador del issue debe correr `xavier code sync --git-delta` y estampar `codegraph_sync_commit = HEAD` en el body. Si el índice está stale, la línea es vieja.
2. **El autor del issue es también un agente (Xavier-aware).** El humano especifica *intención* (“sube el límite de bundles a 15”); un agente **compilador de issues** resuelve el símbolo vía `xavier code query --stable-id …` y escribe el contrato L3. El humano no cuenta líneas a mano.
3. **Verificación en CI a nivel símbolo.** Además de `npm run validate`, añade:

   ```bash
   xavier code query --stable-id "v2|worldexams|src/config/curriculum.ts|MAX_BUNDLES|const|" --show-lines | grep -q "118:14"
   git diff --unified=0 | grep -q "MAX_BUNDLES.*15"
   ```

4. **Frescura como prueba.** Incluye en el issue:

   ```yaml
   codegraph:
     sync_commit: "a1b2c3d"
     generated_at: "2026-08-29T13:00:00Z"
     symbols:
       - stable_id: "v2|worldexams|src/config/curriculum.ts|MAX_BUNDLES|const|"
         file: "src/config/curriculum.ts"
         lines: "118:14-118:28"
   ```

Sin frescura, la precisión es peor que la ambigüedad honesta.

### Pipeline propuesto (issue → patch → verify)

```
Intención humana
  ↓
Agente compilador (Xavier CodeGraph query → stable_id + line:col)
  ↓
Issue-contrato L3 (body con codegraph.sync_commit + symbols + patch esperado)
  ↓
Agente implementador (aplica patch exacto, 0 exploración)
  ↓
CI: validate + xavier code query + git diff --stat
  ↓
Merge reconciler (file islands verificados a nivel símbolo)
```

**Resultado esperado:** tokens de exploración → 0, decisiones del implementador → 0, tasa de PR fusionado en primer intento ↑, coste por PR ↓ 30-40%.

---

## 5. Plantillas y dónde copiarlas

- **Generador canónico de issues atómicos:** `scripts/generate-jules-issue-matrix.mjs` (max 15 por ola, file islands por construcción).
- **Skill mirror v5.2:** `skills/worldexams-bundle-generator/SKILL.md`.
- **Reglas por país:** `skills/bundle-creator/rules/CO.md` (incluye Anti-Error Checklist + DBA/ICFES).
- **Validador:** `saberparatodos/scripts/validate_content.js`.
- **Harness de islas:** `scripts/harness-file-islands.py`.
- **Este post + infografía:** copia la estructura de 12 secciones para tu dominio — solo cambia el vocabulario (DBA/EBC/ICFES → tu estándar).

### Checklist mínimo para tu próxima plantilla

- [ ] Current State medible con comando.
- [ ] Desired State como lista de archivos con cambio + riesgo.
- [ ] Web Research obligatorio (n queries) + qué documentar en el PR.
- [ ] Orden de lectura de skills cerrado.
- [ ] Anti-errores codificados (no “ten cuidado”).
- [ ] Existing Code Patterns gold-reference (rutas exactas).
- [ ] Acceptance Criteria = comandos `grep`/`validate`/`wc -l`, no adjetivos.
- [ ] Files to Modify + DO NOT touch como tablas.
- [ ] Verification bash copiable + Anti-Empty-PR guard.
- [ ] `codegraph.sync_commit` si aspiras a L3.

---

## 6. Cierre: del texto al código, sin perder el origen

Volviendo al inicio: *la preservación de nuestra especie depende de mantener el origen de la información intacto*. En ingeniería, “origen intacto” es trazabilidad: que un humano pueda ir del bundle → al DBA/EBC que lo justifica → al issue que lo ordenó → al commit que lo materializó → al `codegraph.json` que lo indexó.

El issue-contrato es esa cadena de custodia hecha texto. Y con Xavier + CodeGraph, esa cadena puede bajar hasta la línea y el carácter — sin pagar el impuesto del drift.

Si quieres discutir tu caso (tu repo, tu estándar curricular o tu pipeline), agenda una sesión y lo compilamos juntos a contrato.

> **Próximo paso para ti:** escribe tu reseña arriba (ese párrafo en cursiva) y la publicamos. Si quieres, también genero la plantilla `L3` real para tu repo con un ejemplo `curriculum.ts:118:14` vivo.

---

---

## 7. Prompt diagnóstico — copia, pega y audita tu repo en 30 segundos {#prompt-diagnostico}

Copia este prompt a tu LLM favorito (Claude Code, Agy, Hermes, ChatGPT), pega tu `AGENTS.md` + 1 issue real y deja que te devuelva el plan.

````markdown
Eres un auditor de contratos de delegación agéntica (nivel Staff Eng).
Tu trabajo es convertir issues ambiguos en contratos ejecutables L1→L3.

ENTRADA que te dará el usuario:
- AGENTS.md o CLAUDE.md del repo
- Body de 1 issue real (pegar completo)
- (opcional) git diff --stat de la última wave
- (opcional) xavier code scan --stats o tree del repo

TAREA:
1. Scorea el issue 0-100 en estas 12 dimensiones. Sé severo (0=ausente, 8=presente con comando/ruta exacta):
   1 Current State medible · 2 Desired State diff · 3 Web Research · 4 Skills orden
   5 Reglas críticas · 6 Anti-errores · 7 Territory · 8 Existing Patterns
   9 Acceptance verificable · 10 Files to Modify · 11 DO NOT touch · 12 Verification + Anti-Empty-PR
   + Bonus L3 (codegraph_sync_commit / stable_id) = +4
2. Lista los 3 gaps que más Drift Tax causan, citando la línea del issue donde faltan.
3. Propón la plantilla canónica parcheada (markdown listo para pegar en GitHub),
   manteniendo el scope original pero añadiendo Files Territory, Acceptance por comando,
   Verification y (si aplica) codegraph_sync_commit.
4. Da un plan de 30 minutos para dejar el repo listo para waves de 5 agentes.

SALIDA: tabla 12 filas + total, top 3 gaps, plantilla parcheada, checklist 30 min.
Restricción: no inventes archivos. Si falta info, pide el archivo.
````

**Pro tip:** si quieres scoring automático sin LLM, corre el [skill auditor](#skill-auditor) local (stdlib only, <2s).

---

## 8. Skill auditor — escanea tu arnés y genera la plantilla {#skill-auditor}

Acabo de publicar un **skill instalable** que hace exactamente lo que describe este post, sin depender de un LLM:

<div class="not-prose my-8 p-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
  <div class="flex items-center gap-3 mb-3">
    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
    <span class="text-xs font-mono tracking-widest uppercase text-cyan-300">Skill disponible — CC BY-SA 4.0</span>
    <span class="ml-auto text-xs font-mono px-2 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">v1.0.0 · stdlib only</span>
  </div>
  <div class="font-mono text-sm font-bold text-zinc-100 mb-1">swal-issue-contract-auditor</div>
  <div class="text-sm text-zinc-400 mb-4">Audita 12 dimensiones, scorea 0-100 y genera plantilla canónica. Probado en #1128 → 96/100, issue ambiguo → 0/100.</div>
  <div class="flex flex-wrap gap-2">
    <a href="/portfolio-iberi22/skills/swal-issue-contract-auditor/SKILL.md" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-mono font-bold hover:bg-cyan-400 transition-colors">Ver SKILL.md</a>
    <a href="/portfolio-iberi22/skills/swal-issue-contract-auditor/scripts/audit_issue_contracts.py" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono hover:border-cyan-500/30 transition-colors">audit_issue_contracts.py</a>
    <a href="/portfolio-iberi22/skills/swal-issue-contract-auditor/references/checklist-12.md" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-xs font-mono hover:border-white/20 transition-colors">Checklist 12</a>
  </div>
</div>

### Instalación

```bash
# Opción A: usar directo desde el portfolio (sin instalar)
curl -s https://iberi22.github.io/portfolio-iberi22/skills/swal-issue-contract-auditor/scripts/audit_issue_contracts.py -o /tmp/audit_issue_contracts.py
chmod +x /tmp/audit_issue_contracts.py

# Opción B: clonar el skill completo
git clone https://github.com/iberi22/portfolio-iberi22 /tmp/portfolio && cp -r /tmp/portfolio/public/skills/swal-issue-contract-auditor ~/.agents/skills/
```

### Uso (probado en este repo)

```bash
# Audita el issue #1128 (debe dar ~96/100)
gh issue view 1128 --repo iberi22/worldexams --json body --jq '.body' > /tmp/issue.md
python3 ~/.agents/skills/swal-issue-contract-auditor/scripts/audit_issue_contracts.py \
  --repo . --issue-file /tmp/issue.md --json /tmp/audit.json --md /tmp/audit.md
cat /tmp/audit.json | jq '.score, .verdict'
# → 96  "listo para waves 10-15"

# Audita un issue ambiguo (debe dar ~0/100)
echo "Arreglar login roto. Hacerlo bien." > /tmp/bad.md
python3 ~/.agents/skills/swal-issue-contract-auditor/scripts/audit_issue_contracts.py \
  --repo . --issue-file /tmp/bad.md --json /tmp/audit_bad.json
cat /tmp/audit_bad.json | jq '.score, .verdict'
# → 0  "drift garantizado"

# Modo pipe (útil en CI)
gh issue view 42 --json body --jq '.body' | python3 audit_issue_contracts.py --repo . --json /tmp/audit.json
```

**Qué verifica además del issue:** señales del repo (`AGENTS.md`, `.gitcore/features.json`, `.xavier/codegraph.json` y frescura <7 días, `has_git`). Si usas Xavier y pides contratos L3, el auditor te avisa si tu CodeGraph está stale.

> **Yo ya lo probé** sobre el harness local: #1128 sacó **96/100 (listo para waves 10-15)** y un issue ambiguo **0/100 (drift garantizado)**. El delta es exactamente la tubería que separa una wave que mergea sola de una que te pide 3.5 h de reconcilio.

---

## 9. Cómo monetizamos este contenido (y cómo puedes hacerlo tú)

Este blog es **freemium con Flexible Sampling** — la recomendación oficial de Google para contenido paywalled sin perder SEO.

### Modelo que aplicamos (y recomendamos)

| Capa | Qué ve el lector | Qué ve Googlebot | SEO |
|------|------------------|------------------|-----|
| **Lead-in (gratis siempre)** | Primeras ~40% del artículo + infografía + tabla de métricas | Indexa completo | Sin penalización |
| **Metering (10/mes gratis)** | 10 artículos completos al mes sin registro | `isAccessibleForFree: false` solo en `.paywall` | Flexible Sampling 6-10/mes (Google recomienda 10) |
| **Gated (tras cupo)** | Blur + CTA “Suscríbete para seguir leyendo” + `hasPart` | Respeta `cssSelector: .paywall` | Evita cloaking |

### Implementación técnica (la que ya está en este portfolio)

1. **JSON-LD por artículo con `isAccessibleForFree: false` + `hasPart: { cssSelector: ".paywall" }`** — ver `src/layouts/Layout.astro` (no es un string estático: es un prop `paywalled` que el post activa). Esto le dice a Google “el gap es intencional, no es cloaking”. Sin esto, el paywall se interpreta como cloaking y puedes perder el 44% de tráfico (caso WSJ documentado).
2. **Metering en cliente con `localStorage` + `hasPart` server-side** — ver `public/scripts/paywall-meter.js` (lead-in siempre visible; tras 10 artículos, el `div.paywall` se oculta y se muestra el CTA).
3. **Validación:** Rich Results Test + Search Console → Subscribed Content report.

### Alternativas que evaluamos

- **Substack (10% take rate):** gratis para empezar, 10% para siempre + Stripe fees. A $10k/mes = $1k/mes cedido. Sin control de `isAccessibleForFree` granular.
- **Ghost (flat $85/mes, 0% take):** auto-hospedable, control total del paywall y del schema. Mejor a partir de ~$850/mes de MRR (break-even vs Substack 10%).
- **Patreon/Ko-fi/SubscribeStar:** bien para donaciones, mal para SEO de artículos técnicos (no hay `hasPart` nativo).
- **Google Reader Revenue Manager + isAccessibleForFree:** ideal si ya monetizas con ads programáticos y quieres convertir lectores anónimos en `PPID` (ver Playwire guide).

> **Nuestra elección hoy:** Ghost auto-hospedado (control total) + Stripe + `isAccessibleForFree` granular + metering 10/mes + lead-in 40% — que es exactamente lo que implementamos en `Layout.astro` con el flag `paywalled`. Los posts técnicos largos (como este) llevan lead-in generoso; los posts de referencia (checklists, plantillas) son 100% abiertos para maximizar backlinks.

Si quieres que te paguen por contenido técnico sin matar tu SEO: **no ocultes el HTML al bot; marca el paywall con schema.** Esa es la diferencia entre “paywall bien hecho” y “cloaking penalizado”.

---

*— Brahyan Belalcázar @iberi22 · SouthWest AI Labs · 2026-08-29 · CC BY-SA · WorldeXams · Xavier CodeGraph v5.2 · Serie Waves #2/3*

