# Checklist 12 dimensiones — Issue como Contrato

Marca cada una antes de etiquetar `jules`/`ai-agent`.

- [ ] **1 Current State medible** — `Audit YYYY-MM-DD: …` con números (coverage, counts), no narrativa.
- [ ] **2 Desired State diff** — lista de N artefactos con ruta exacta + spec + `frontmatter X campos`.
- [ ] **3 Web Research** — ≥3 queries/criterios + “documentar en PR qué fuente por decisión”.
- [ ] **4 Skills orden** — `AGENTS.md → SKILL.md → rules/CO.md → curriculum.ts → CONTENT_ERRORS` (orden cerrado).
- [ ] **5 Reglas críticas** — `máx 15`, `REPLACE` explícito, `validate = 0 errores` antes de comentar.
- [ ] **6 Anti-errores** — lista cerrada de errores ya purgados (no “ten cuidado”).
- [ ] **7 Territory** — `CREATE / MODIFY / FORBIDDEN` o tabla W con `periodo = ceil(W/10)`, kebab-case.
- [ ] **8 Existing Patterns** — ≥1 gold-reference con ruta exacta, “copiar forma, no inventar forma”.
- [ ] **9 Acceptance verificable** — comandos `npm run validate` / `grep -c` / `wc -l` con valores esperados.
- [ ] **10 Files to Modify** — tabla `File | Current | Change | Risk`.
- [ ] **11 DO NOT touch** — globs prohibidos, barrels y lockfiles nunca en paralelo.
- [ ] **12 Verification + Anti-Empty-PR** — bloque `bash` copiable + guard `git status --porcelain` / `git ls-files`.

**Bonus L3:** `codegraph_sync_commit` + `stable_id` si pides `file:line:col`.

**Regla de oro:** si tu acceptance no es copiable a la terminal, no es acceptance.
