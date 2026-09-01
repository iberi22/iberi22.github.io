# [Ola 3.02] perf(pagespeed-mobile): Core Web Vitals & Mobile Performance Optimization

> Ola 3 — Performance/Core Web Vitals.
> Labels: `ola3`, `wave-3` (pre-dispatch)

---

## Current State (MEDIBLE)
- PageSpeed mobile audit flagged render-blocking Google Fonts loading and unoptimized asset preloading on mobile devices.
- Need LCP < 2.5s, CLS < 0.1, and FID/INP optimal responsiveness on mobile networks.

## Desired State (DELTA)
- **Specific Addition**: Implement non-blocking font loading (`media="print" onload="this.media='all'"`), preload critical CSS styles, add font-display swap, and optimize viewport metadata.
- **File Target**: `src/layouts/Layout.astro`, `src/styles/global.css`

## Web Research Required
1. search: "Google fonts non blocking loading performance web.dev"
2. search: "Astro static site Core Web Vitals mobile LCP optimization 2026"

## Acceptance Criteria (VERIFICABLES POR COMANDO)
- [ ] `pnpm run build` — 10 static routes generated with 0 errors
- [ ] `grep -rn "media=\"print\"" src/layouts/Layout.astro` >= 1 match
- [ ] `grep -rn "rel=\"preload\"" src/layouts/Layout.astro` >= 1 match

## Files to Modify
| File | Current State | Change | Risk |
|------|--------------|--------|------|
| `src/layouts/Layout.astro` | Standard font link | Non-blocking preloaded font | LOW |
| `src/styles/global.css` | Global rules | Responsive fluid font tokens | LOW |

## DO NOT touch
- `src/components/ResourceSimulator.svelte` — assigned to Issue #11
- `public/skills/` — assigned to Issue #13

## Anti-Hallucination Guard
1. Do NOT delete or modify client-side inline scripts responsible for theme or direction handling.
2. Verify all CSS styles compile with zero Vite/PostCSS warnings.

## Merge Order
- **Merge order within wave:** 2
- **Expected effort:** Small (<20m)
- **Parallel with:** Issues #11, #13, #14, #15
