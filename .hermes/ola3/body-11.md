# [Ola 3.01] feat(i18n-simulator): Complete Reactive 10-Locale UI Binding in ResourceSimulator

> Ola 3 — Core/UI Internationalization.
> Labels: `ola3`, `wave-3` (pre-dispatch)

---

## Current State (MEDIBLE)
- Language switcher toggles between 10 world languages (`es`, `en`, `zh`, `hi`, `ar`, `fr`, `pt`, `bn`, `ru`, `ur`).
- Component `src/components/ResourceSimulator.svelte` previously had hardcoded Spanish strings that failed to update when the user selected English or another locale in the top navbar.

## Desired State (DELTA)
- **Specific Addition**: Fully bind all UI headers, cards, toolbars, and badges in `src/components/ResourceSimulator.svelte` to dynamic translation keys (`t('simulator.xxx')`).
- **File Target**: `src/components/ResourceSimulator.svelte`, `src/i18n/*.json`

## Web Research Required
1. search: "Svelte 5 runes dynamic i18n reactivity pattern"
2. search: "RTL layout handling for Arabic and Urdu in modern web apps"

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `pnpm test` — 12/12 passing tests across `tests/i18n.test.ts` and `tests/simulator.test.ts`
- [ ] `pnpm run build` — 10 static routes generated with 0 errors
- [ ] `grep -rn "t('simulator." src/components/ResourceSimulator.svelte` >= 8 matches

## Files to Modify
| File | Current State | Change | Risk |
|------|--------------|--------|------|
| `src/components/ResourceSimulator.svelte` | Hardcoded labels | Bind to `t('simulator.xxx')` | LOW |
| `src/i18n/es.json` | Base keys | Add enriched simulator labels | LOW |
| `src/i18n/en.json` | Base keys | Add enriched simulator labels | LOW |

## DO NOT touch
- `src/layouts/Layout.astro` — assigned to Issue #12
- `public/skills/` — assigned to Issue #13

## Anti-Hallucination Guard
1. READ before write: Inspect `src/i18n/index.ts` to ensure `t()` and fallback resolution work deterministically.
2. Maintain English output for generated prompts while translating UI wrappers.

## Merge Order
- **Merge order within wave:** 1
- **Expected effort:** Small (<30m)
- **Parallel with:** Issues #12, #13, #14, #15
