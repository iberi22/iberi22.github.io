# [Ola 3.04] test(e2e-simulator): Comprehensive Matrix & Concurrency Assertion Suite

> Ola 3 — Quality Assurance & Testing.
> Labels: `ola3`, `wave-3` (pre-dispatch)

---

## Current State (MEDIBLE)
- Vitest suite covers 12 unit tests across `tests/simulator.test.ts` and `tests/i18n.test.ts`.
- Need deep validation across subscription edge cases (e.g. Free-Tier $0 guarantee, memory hardware scaling, budget limit penalty, clean prompt assertions).

## Desired State (DELTA)
- **Specific Addition**: Expand assertion matrix validating all 5 developer subscriptions, 5 workload profiles, 3 context depths, and pure English prompt outputs without decorative bloat.
- **File Target**: `tests/simulator.test.ts`, `tests/i18n.test.ts`

## Web Research Required
1. search: "Vitest parameter matrix testing best practices"
2. search: "LLM prompt assertion and regression testing"

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `pnpm test` — all 12+ tests passing with 0 failures
- [ ] `grep -rn "describe('Resource Simulator" tests/simulator.test.ts` >= 1 match

## Files to Modify
| File | Current State | Change | Risk |
|------|--------------|--------|------|
| `tests/simulator.test.ts` | Base tests | Expand parameter coverage | LOW |
| `tests/i18n.test.ts` | 4 tests | Check 10-language integrity | LOW |

## DO NOT touch
- `src/layouts/Layout.astro` — assigned to Issue #12
- `.github/` — assigned to Issue #15

## Anti-Hallucination Guard
1. Do not mock internal calculations with fake values; test the actual arithmetic and prompt generators.

## Merge Order
- **Merge order within wave:** 4
- **Expected effort:** Small (<25m)
- **Parallel with:** Issues #11, #12, #13, #15
