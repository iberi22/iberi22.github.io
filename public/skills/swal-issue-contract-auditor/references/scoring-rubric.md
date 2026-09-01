# Rúbrica detallada — scoring 0-8 por dimensión

- **8 pts:** patrón presente ≥2 veces, con ejemplo concreto y comando/ruta exacta.
- **5 pts:** patrón mencionado 1 vez, sin comando/ruta verificable.
- **0 pts:** ausente.

### Qué cuenta como “presente” por dimensión

1. **Current State:** fecha de audit + métrica `X/Y` o `CO 402/402`.
2. **Desired State:** “Crear N artefactos en <ruta> con vX.Y y validación 0 errores”.
3. **Web Research:** lista numerada de ≥3 `search:` + instrucción “documentar en PR”.
4. **Skills orden:** lista ordenada con al menos 3 skills/specs con rutas reales.
5. **Reglas críticas:** menciona `15` + `REPLACE` + `validate`.
6. **Anti-errores:** sección con ≥3 bullets de errores purgados.
7. **Territory:** `CREATE/MODIFY/FORBIDDEN` o tabla W con periodo.
8. **Patterns:** ruta a bundle gold-reference vX.Y.
9. **Acceptance:** bloque con ≥2 comandos grep/validate con valor esperado.
10. **Files to Modify:** markdown table con 4 columnas.
11. **DO NOT touch:** lista de globs prohibidos.
12. **Verification:** bloque bash + `porcelain`/`diff --stat` + anti-empty.

**Calibración:** un issue que solo describe “hacer feature X” sin ninguna de las 12 suele dar 5-15/100.
Un issue WorldeXams #1128 real da 88-96/100 + 4 bonus si menciona CodeGraph.
