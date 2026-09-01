# Kimi K2.6 Redesign Task - iberi22 Portfolio

## Context

You are redesigning the portfolio for **Samuel Belalcazar (iberi22)** — a systems architect and developer at SouthWest AI Labs.

## Codebase

- **Location**: `E:\scripts-python\portfolio-iberi22`
- **Stack**: Astro + Svelte 4 + Tailwind CSS 3
- **GitHub**: `https://github.com/iberi22/portfolio-iberi22`
- **Deployed at**: `https://iberi22.github.io/portfolio-iberi22/`

## Task

1. **Evaluate the current design** — If you consider it basic, proceed with a full redesign. If it's already good enough, make targeted improvements.

2. **Update all dependencies to latest stable**:
   - astro: `^4.16.0` → latest (6.x)
   - @astrojs/svelte: `^5.7.0` → latest (8.x)
   - @astrojs/tailwind: `^5.1.0` → latest (6.x)
   - svelte: `^4.2.0` → latest (5.x) — BREAKING, need to migrate Svelte 4→5 syntax
   - tailwindcss: `^3.4.0` → latest (4.x) — BREAKING, need to migrate Tailwind config
   - typescript: `^5.5.0` → latest (6.x)

   Update `package.json` and run `npm install` to apply.

3. **Apply the OrionHealth design language** — Use these colors and design patterns from the OrionHealth landing page (`iberi22.github.io/OrionHealth/`):

### Color Palette (OrionHealth Cyber-Minimalism)
```css
background: '#121212'        /* Deep charcoal */
surface: '#1E1E1E'          /* Card/section background */
surface-dark: '#0A0A0A'     /* Darker sections */
surface-light: '#2A2A2A'    /* Hover states */
bone: '#F5F5DC'             /* Primary text - warm off-white */
bone-dark: '#E8E8C0'        /* Secondary text */
accent: '#10B981'           /* Emerald-500 - PRIMARY CTA */
accent-light: '#34D399'     /* Hover/glow */
accent-dark: '#059669'      /* Active/pressed */
secondary: '#06B6D4'        /* Cyan-500 - SECONDARY */
error: '#F87171'            /* Error states */
```

### Design Patterns (must implement)
- **Noise overlay**: Fixed SVG noise texture at 5% opacity
- **Grid pattern**: Subtle emerald grid `rgba(16,185,129,0.02)` at 40px
- **Animated blobs**: 3 blurred circles (accent, secondary, accent-dark) that float
- **Glassmorphism**: `background: rgba(30,30,30,0.6)` with `backdrop-filter: blur(20px)`
- **Flashlight cards**: Cards with radial gradient border on hover - uses `--mouse-x`/`--mouse-y` CSS variables
- **Mono font**: Fira Code for ALL text (global `font-family: 'Fira Code', monospace`)
- **Buttons**: `btn-primary` (emerald gradient, pill shape, hover scale + glow), `btn-secondary` (border, transparent bg)
- **Animations**: `fadeInUp` (blur→clear, translateY), `blob` (floating), stagger delays (.1s-.6s)
- **Typography**: `hero-title` with `clamp(2.5rem, 8vw, 6rem)`, `section-title` with `clamp(2rem, 6vw, 4rem)`
- **Containers**: `container-custom` with responsive padding
- **Trust badges**: Pill-shaped badges with accent border/background

### Specific UI Elements to Port
1. **Hero**: Name + gradient role title, animated blobs, grid pattern, CTA buttons (primary + secondary)
2. **Projects timeline**: Keep existing project data but restyle with OrionHealth card patterns
3. **Blog section**: Replace hardcoded "Coming Soon" posts — keep the structure but style consistently
4. **About section**: Professional bio with tech stack visualization
5. **Contact section**: Clean form with OrionHealth glass inputs
6. **Navigation**: Fixed top navbar with glass effect, mobile responsive

### Structure (keep existing pages)
- `/` (index.astro) — Hero + About + Projects Timeline + Blog + Contact
- `/projects` (projects.astro) — Full projects grid
- `/blog` (blog.astro) — Blog listing
- `/contact` (contact.astro) — Contact form

### Requirements
- ✅ Mobile-first responsive
- ✅ Dark theme only (OrionHealth palette is dark-only)
- ✅ Smooth scroll navigation
- ✅ SEO meta tags in Layout
- ✅ Performance: keep build under 5s
- ✅ Accessible contrast ratios
- ✅ Intersection Observer for scroll-triggered animations

## OrionHealth Layout Reference

The `BaseLayout.astro` from OrionHealth has:
- SVG noise overlay div (`position: fixed, pointer-events: none`)
- CSS grid background pattern
- 3 animated blob divs (fixed, -z-10)
- Fira Code font loaded from Google Fonts
- CSS reset and utility classes in `<style is:global>`
- Flashlight cursor effect via JS on `.flashlight-card` elements
- IntersectionObserver for animation triggers
- Safe area insets for mobile

## Verification

After changes, verify:
1. `npm run build` completes without errors
2. `git status` shows only intentional changes
3. Changes are committed with conventional commit messages
4. Push to `main` branch (CI will auto-deploy)

## Notes

- Do NOT replace the project data (Samuel Belalcazar, Xavier2, Gestalt, GOS, OrionHealth)
- Do NOT change the `base: '/portfolio-iberi22'` in astro.config.mjs
- Keep Svelte components but migrate Svelte 4→5 syntax if updating to Svelte 5
- If Tailwind v4 breaks your config, use `@tailwindcss/vite` plugin approach
