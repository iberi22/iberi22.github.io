---
name: swal-issue-contract-auditor
description: Audita tu arnés de issues/contratos de delegación agéntica y genera un plan de mejora accionable con scoring 0-100 y plantilla canónica lista para copiar.
version: 1.0.0
author: Brahyan Belalcázar (iberi22) · SouthWest AI Labs
tags: [issues, contracts, delegation, audit, xavier, codegraph, gitcore, waves, gestalt]
license: CC BY-SA 4.0
---

# SKILL: SWAL Issue-Contract Auditor — Diagnóstico y Diseño de Plantillas Canónicas

> **Un issue bien diseñado no es un ticket. Es un contrato ejecutable.** Este skill escanea tu repo/harness y te dice — en <30s — si tus issues están listos para oleadas agénticas, qué drift te está costando tokens y qué plantilla canónica copiar.

---

## 1. Qué audita (12 dimensiones del contrato)

Cada dimensión vale 0-8 pts (total 0-96 + 4 pts bonus por CodeGraph = 100). El score no es vanidad: predice Drift Tax.

| # | Dimensión | Qué busca | Heurística |
|---|-----------|-----------|------------|
| 1 | **Current State medible** | números, no narrativa | `grep -i "current.*state\|audit\|found\|coverage" issue_body` |
| 2 | **Desired State diff** | lista de archivos/artefactos a crear | `Files to Modify` o `Desired State` presente |
| 3 | **Web Research obligatorio** | ≥3 queries/criterios antes de codificar | `web.*research\|queries\|DBA\|ICFES` |
| 4 | **Skills orden canónico** | orden de lectura cerrado | `AGENTS.md.*SKILL\|curriculum\|CONTENT_ERRORS` |
| 5 | **Reglas críticas (límites)** | límites que previenen scope drift | `max.*15\|REPLACE\|validate.*0 errores` |
| 6 | **Anti-errores codificados** | memoria institucional, no “ten cuidado” | `anti-error\|purga\|prohibido\|never.*week.*semana` |
| 7 | **Config + tabla W/territorio** | territorio verificable | `Files.*Territory\|CREATE.*MODIFY.*FORBIDDEN\|periodo.*ceil` |
| 8 | **Existing Code Patterns** | gold-reference copiable | `Existing.*Pattern\|gold.*reference\|read.*before.*write` |
| 9 | **Acceptance verificable** | comandos, no adjetivos | `` `npm.*validate`` \| `grep -c` \| `Errores: 0` `` |
|10 | **Files to Modify** | tabla file\|estado\|cambio\|riesgo | `Files to Modify` con markdown table |
|11 | **DO NOT touch** | globs prohibidos | `DO NOT.*touch\|Anti-Regres\|FORBIDDEN` |
|12 | **Verification + Anti-Empty-PR** | bash copiable + guard | `git status.*porcelain\|git diff --stat\|AN TI-EMPTY-PR` |
| + | **Bonus L3 CodeGraph** | frescura línea:col | `codegraph_sync_commit\|stable_id\|xavier code query` |

**Interpretación:**
- 85-100: listo para waves de 10-15 agentes.
- 65-84: listo para 3-5 agentes; pule 7-11 antes de escalar.
- 40-64: 1 agente a la vez; tus issues son tickets, no contratos.
- <40: el agente decidirá por ti. Drift garantizado.

---

## 2. Uso rápido

### A. Auditoría local (sin LLM, <10s)

```bash
# desde la raíz de tu repo
python3 ~/.agents/skills/swal-issue-contract-auditor/scripts/audit_issue_contracts.py \
  --repo . \
  --issue-file .github/ISSUE_TEMPLATE/bug_report.md \
  --json /tmp/audit.json

cat /tmp/audit.json | jq '.score, .verdict'
```

El script no toca git ni network. Solo lee archivos y el body del issue que le pases (o `--issue-body "..."`).

### B. Auditoría asistida por LLM (recomendada)

Copia el **Prompt Diagnóstico** del post de contratos ([ver post](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/#prompt-diagnostico)), pega estos artefactos y pide el plan:

- `AGENTS.md` (o tu CLAUDE.md)
- Un issue real (body completo)
- `git diff --name-only HEAD` de tu última ola
- Salida de `xavier code scan --stats` si usas Xavier

El LLM actúa como **arquitecto**, no como implementador: te devuelve score, gaps priorizados y la plantilla parcheada.

### C. Como skill de Hermes / Claude Code / Jules

```bash
# Hermes
hermes skill load swal-issue-contract-auditor
hermes run --skill swal-issue-contract-auditor --input "repo=/path/a/tu/repo issue=#1128"

# Claude Code — añadir a CLAUDE.md:
# @skill swal-issue-contract-auditor — audita mis issues antes de generar la wave
```

---

## 3. Prompt diagnóstico (copiar y pegar)

> Lo tienes completo en el post de contratos, sección “Prompt diagnóstico”. Aquí va la versión portátil:

<details>
<summary><strong>クリック para ver prompt completo</strong></summary>

```
Eres un auditor de contratos de delegación agéntica (nivel Staff Eng).
Tu trabajo es convertir issues ambiguos en contratos ejecutables L1→L3.

ENTRADA que te dará el usuario:
- AGENTS.md o CLAUDE.md del repo
- Body de 1 issue real (pegar completo)
- (opcional) git diff --stat de la última wave
- (opcional) xavier code scan --stats o tree del repo

TAREA:
1. Scorea el issue 0-100 en las 12 dimensiones de arriba. Sé severo.
2. Lista los 3 gaps que más Drift Tax causan, con evidencia citada (línea del issue).
3. Propón la plantilla canónica parcheada (markdown listo para pegar en GitHub),
   manteniendo el scope original pero añadiendo:
   - Files Territory (CREATE/MODIFY/FORBIDDEN)
   - Acceptance con comandos copiables
   - Verification + Anti-Empty-PR
   - (si aplica) codegraph_sync_commit placeholder
4. Da un plan de 30 minutos para dejar el repo listo para waves de 5 agentes.

SALIDA:
- Tabla score (12 filas + total)
- Top 3 gaps priorizados
- Plantilla canónica parcheada (bloque markdown)
- Checklist 30 min

Restricción: no inventes archivos que no existen en el repo. Si falta info, dilo y pide el archivo.
```

</details>

---

## 4. Plantilla canónica mínima (para pegar en GitHub)

```markdown
## Current State (MEDIBLE)
- Audit YYYY-MM-DD: … (números, no adjetivos)

## Desired State (DELTA)
- Crear/modificar exactamente N artefactos en <ruta> con <spec> y validación 0 errores.

## Files Territory (hard constraint)
- CREATE: path/a, path/b
- MODIFY: path/c (justificar por qué no es CREATE)
- FORBIDDEN: everything else, incl. lockfiles, barrels, .gitcore/features.json

## Web Research — OBLIGATORIO antes de codificar
1. search: "…"
2. search: "…"
3. search: "…"
Documentar en el PR: qué fuente usaste por decisión y por qué.

## Skills y protocolo (leer en orden)
1. AGENTS.md
2. skills/<tu-skill>/SKILL.md
3. <tu-curriculum-o-spec>.ts

## Reglas críticas
- Máx N artefactos; no regenerar salvo REPLACE explícito.
- Solo <ext> en <ruta canónica>.
- `npm run validate -- {archivos}` = 0 errores antes de comentar.

## Anti-errores (memoria institucional)
1. … (lista cerrada de errores ya purgados)

## Existing Code Patterns (DEBES seguir estos)
- path/a-gold-reference.md — patrón vX.Y completo

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `npm run validate -- {archivos} 2>&1 | grep -E "Errores: 0"`
- [ ] `grep -c "pattern" path | wc -l` == N
- [ ] `grep -c "anti-pattern" path` == 0

## Files to Modify
| File | Current | Change | Risk |
|------|---------|--------|------|
| path/a | missing | create | LOW |

## DO NOT touch
- path/** — ya completo, no tocar.
- .gitcore/features.json (se actualiza post-merge)

## Verification
\`\`\`bash
npm run validate -- path/a path/b
git status --porcelain
git diff --stat HEAD
\`\`\`

## PR Delivery (ANTI-EMPTY-PR)
- [ ] `git ls-files` muestra ≥N archivos nuevos ANTES de push
- [ ] Comentario `[OK] Generados N: …` con IDs reales
```

---

## 5. Integración con Xavier CodeGraph (L3)

Si usas Xavier, el auditor verifica además:

- `xavier code scan --stats` corre sin error y `total_symbols > 0`
- `.xavier/codegraph.json` existe y `< 7 días` de frescura
- El issue menciona `codegraph_sync_commit` si pide cambios `file:line:col`

Sin esto, un contrato L3 es falsa precisión. Ver [Issues como Contratos — §4 L3](/portfolio-iberi22/blog/protocolo-issues-contrato-xavier-codegraph/#4-validacion-de-tu-idea-del-contrato-de-archivo-al-contrato-de-lineacaracter).

---

## 6. Scripts incluidos

- `scripts/audit_issue_contracts.py` — auditor local sin dependencias (stdlib only, Python 3.11+). Genera `audit.json` + `audit.md`.
- `scripts/collect-test-incidents.mjs` — ejemplo de colector de incidencias desde `vitest --reporter=json` → `incidents.json` agrupado por isla (ver post Waves).
- `references/checklist-12.md` — checklist imprimible.
- `references/scoring-rubric.md` — rúbrica detallada.

---

## 7. Qué NO hace este skill

- No reescribe tu backlog por ti. Te da el diagnóstico y la plantilla; tú decides el scope.
- No sustituye `xavier code scan` ni `gitcore status`. Los complementa.
- No promete “0 drift”. Promete drift medible y acotado.

---

## 8. Updates

Este skill se versiona con el blog. Cada mejora al protocolo (nueva clase anti-error, nuevo nivel L3) se documenta en el changelog del post de contratos. Suscríbete al [RSS](/portfolio-iberi22/rss.xml) o mira `CHANGELOG.md` del skill.

---

*SouthWest AI Labs · CC BY-SA 4.0 · Mantainer: @iberi22 · Feedback: abre un issue con `skill:swal-issue-contract-auditor`*
