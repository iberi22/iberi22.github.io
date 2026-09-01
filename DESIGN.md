# Portfolio Redesign Brief — iberi22 (Samuel Belalcazar)

## Stack
Astro 6 + Svelte 5 + Tailwind CSS 4 + Fira Code monospace (global)

## Design Language: OrionHealth Cyber-Minimalism

### Color Palette (dark theme ONLY)
```css
--bg-primary: #121212;
--bg-surface: #1E1E1E;
--bg-surface-dark: #0A0A0A;
--bg-surface-light: #2A2A2A;
--text-primary: #F5F5DC;      /* Bone/warm off-white */
--text-secondary: #E8E8C0;
--text-muted: #9CA3AF;
--accent: #10B981;            /* Emerald-500 PRIMARY */
--accent-light: #34D399;
--accent-dark: #059669;
--secondary: #06B6D4;         /* Cyan-500 */
--error: #F87171;
```

### Design Elements (MANDATORY)
1. **Noise Overlay**: Fixed SVG noise at 5% opacity (as base64 data URI)
2. **Grid Background**: Subtle emerald grid rgba(16,185,129,0.02) at 40px
3. **Animated Blobs**: 3 blurred circles (accent, secondary, accent-dark) that float
4. **Glassmorphism Cards**: rgba(30,30,30,0.6) + backdrop-filter blur(20px) + 1px border
5. **Flashlight Effect**: Cards track mouse via --mouse-x/--mouse-y CSS vars, radial gradient border on hover
6. **Typography**: Hero title clamp(2.5rem,8vw,6rem), section title clamp(2rem,6vw,4rem), body 16px
7. **Buttons**: pill-shaped, emerald gradient primary with glow shadow, bordered secondary

### Animations (2026 CSS-First)
- `@starting-style` for entry animations
- CSS scroll-driven animations where possible
- Kinetic typography on hero
- Varied hover states (not just scale+shadow)
- Staggered animations per section

### ANTI-PATTERNS (NEVER use)
- No purple-blue/pink gradients
- No Inter/Roboto/Arial fonts (use Fira Code globally)
- No emoji 🚀✨
- No fake testimonials ("Sarah J. — CEO")
- No equal-sized 3×3 card grid
- No glassmorphism on every element (use selectively)
- No fadeIn+translateY on everything
- No invented statistics

### Pages & Data (DO NOT CHANGE)
Route → File:
- `/` → `src/pages/index.astro` — Hero + About + Timeline + Blog + Contact
- `/projects` → `src/pages/projects.astro`
- `/blog` → `src/pages/blog.astro`
- `/contact` → `src/pages/contact.astro`

Projects to preserve:
1. Xavier2 — Rust memory core, v0.6.0-beta, active
2. Gestalt — Rust agent orchestrator, v0.3.0, development
3. GOS — Flutter PWA culinary standard, v1.0.0, beta
4. OrionHealth — Flutter health tracker, v0.5.0, development

### Verification
```bash
npm run build  # Must pass
git add -A && git commit -m "feat: redesign with OrionHealth design language + 2026 animations"
git push
```
