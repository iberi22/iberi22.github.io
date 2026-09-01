# DAILY ENGINEERING CHRONICLE — Pipeline Design

> **Auto-documentación técnica generativa:** captura el trabajo diario, lo analiza, y genera blog posts con screenshots, diagrams, infografías y clips.

## Architecture Overview

```
cron (2 AM / 6 PM daily)
  │
  ├── HARVEST ───────────────────┐
  │   ├── Git commits (all repos) │
  │   ├── Session transcripts     │
  │   ├── Xavier2 memory dump     │
  │   ├── CI/CD run logs          │
  │   ├── Terminal history        │
  │   └── File change delta       │
  │                               │
  ├── ANALYZE ────────────────────┤
  │   ├── LLM summarizer          │
  │   ├── Technical pattern       │
  │   │   detection               │
  │   ├── Decision extraction     │
  │   └── Key metrics             │
  │                               │
  ├── GENERATE ───────────────────┤
  │   ├── Blog post (markdown)    │
  │   ├── Architecture diagrams   │
  │   │   (Mermaid.js)            │
  │   ├── Code snippets           │
  │   ├── Infographics            │
  │   └── OG image                │
  │                               │
  ├── MEDIA ──────────────────────┤
  │   ├── Screenshots (Playwr.)   │
  │   ├── Terminal recording      │
  │   ├── Video clips (asciinema) │
  │   └── Dashboard captures      │
  │                               │
  └── PUBLISH ────────────────────┘
      ├── Commit to portfolio
      ├── Push → auto-deploy
      └── Notify (Telegram)
```

## Stage 1: HARVEST

### Data Sources

| Source | Method | Tool |
|--------|--------|------|
| Git commits | `git log --since="00:00" --format=format:"%H %s"` | Shell |
| Session transcripts | OpenClaw sessions history API | `sessions_list` + `sessions_history` |
| Xavier2 memory | HTTP query: `/memory/search?date=today` | curl |
| CI/CD logs | `gh run list --limit 10 --json` | gh CLI |
| File changes | `git diff --stat HEAD~$(git rev-list --count --since=00:00 HEAD)` | Git |
| Terminal history | PSReadLine history or OpenClaw exec logs | Shell |
| System health | `openclaw status`, Docker ps, service checks | CLI |

### Script: `scripts/daily-harvest.js`

```javascript
// Pseudocode structure
const harvest = {
  async gitLogs() {
    const repos = [
      'E:\\scripts-python\\portfolio-iberi22',
      'E:\\scripts-python\\xavier2',
      'E:\\scripts-python\\gestalt',
      'E:\\scripts-python\\gos',
      'E:\\scripts-python\\worldexams',
    ];
    for (const repo of repos) {
      const log = await exec(`cd ${repo} && git log --since="00:00" --stat`);
      harvestData.commits[repo] = log;
    }
  },

  async sessions() {
    // Fetch today's OpenClaw sessions
    const sessions = await sessions_list({ activeMinutes: 1440 });
    for (const s of sessions) {
      const history = await sessions_history(s.sessionKey);
      harvestData.sessions.push(history);
    }
  },

  async xavier2Memory() {
    const today = new Date().toISOString().split('T')[0];
    const memories = await fetch(`http://localhost:8006/memory/search?query=${today}`);
    harvestData.memories = memories;
  },

  async fileDiffs() {
    // Track what files changed today
    const diff = await exec(`git diff --stat HEAD~1`);
    harvestData.diff = diff;
  },

  async deployments() {
    const runs = await exec(`gh run list --limit 5 --json conclusion,displayTitle,headBranch`);
    harvestData.deployments = runs;
  }
};
```

## Stage 2: ANALYZE

### LLM-Based Analysis Pipeline

Uses **MiniMax-M2.7** (primary) or **DeepSeek** (fallback) to analyze raw data.

**Prompt structure:**

```
You are a technical documentation engineer. Analyze today's engineering work.

INPUT:
- Git commits: {commits}
- Session summaries: {sessions}
- Memory entries: {memories}
- File changes: {diff}
- Deployments: {deployments}

TASK:
1. Identify 3-5 key technical decisions made today
2. Extract architecture patterns and trade-offs discussed
3. Summarize problems solved and approaches used
4. Identify code patterns, refactors, or migrations
5. Note any bugs found and how they were fixed
6. Extract metrics: lines changed, features added, tests written

OUTPUT FORMAT (JSON):
{
  "title": "Daily Chronicle: <date>",
  "summary": "2-paragraph overview",
  "keyDecisions": [{ "decision": "...", "rationale": "...", "tradeoffs": "..." }],
  "technicalDeepDives": [{ "topic": "...", "explanation": "...", "codeSnippet": "..." }],
  "architectureChanges": [{ "component": "...", "before": "...", "after": "..." }],
  "bugsFixed": [{ "issue": "...", "rootCause": "...", "fix": "..." }],
  "metrics": { "commits": N, "filesChanged": N, "deployments": N },
  "mermaidDiagrams": ["graph TD; ..."]
}
```

### Script: `scripts/daily-analyze.js`

```javascript
const { getBestProvider } = require('./llm-router.js');

async function analyze(harvestData) {
  const prompt = buildAnalysisPrompt(harvestData);
  const provider = await getBestProvider('reasoning', 8000);
  const result = await provider.call(prompt);
  return JSON.parse(extractJSON(result));
}
```

## Stage 3: GENERATE

### Blog Post Generation

Takes analyzed data and produces a complete markdown blog post.

**Frontmatter:**
```yaml
---
title: 'Daily Chronicle: 2026-05-07'
excerpt: 'Rust refactors, i18n pipeline, and blog automation — today\'s engineering deep dive.'
date: '2026-05-07'
tags: ['daily', 'rust', 'architecture', 'automation']
draft: false
published: true
ogImage: '/images/daily/2026-05-07-og.png'
---
```

**Post structure:**
```markdown
## Summary
{LLM-generated 2-paragraph overview}

## Key Technical Decisions
### 1. {decision title}
**Rationale:** {why it was chosen}
**Trade-offs:** {what was sacrificed}

\`\`\`rust
// Code snippet demonstrating the decision
\`\`\`

## Architecture Changes
{Before/after analysis with diagrams}

## Bugs & Fixes
- **Issue:** {description}
- **Root cause:** {analysis}
- **Fix:** {solution}

## Metrics
- Commits: 12
- Files changed: 34
- Deployments: 2
- Lines added: 1200
- Lines removed: 400
```

### Media Generation

| Media Type | Tool | Output |
|-----------|------|--------|
| Architecture diagram | Mermaid.js CLI | `docs/diagrams/daily-*.svg` |
| Code snippet cards | Carbon.now.sh API | `public/images/daily/carbon-*.png` |
| OG Image | Satori + sharp | `public/images/daily/og-*.png` |
| Infographic | D3.js or Plottable | `public/images/daily/info-*.svg` |
| Terminal recording | asciinema SVG | `public/images/daily/term-*.svg` |

### Screenshot Pipeline (Playwright)

```javascript
const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, 900 } });

  // Capture deployed portfolio
  await page.goto('https://iberi22.github.io/portfolio-iberi22/');
  await page.screenshot({ path: 'public/images/daily/portfolio-home.png', fullPage: true });

  // Capture Xavier2 health
  await page.goto('http://localhost:8006/health');
  await page.screenshot({ path: 'public/images/daily/xavier2-health.png' });

  // Capture CI/CD status
  // ... gh CLI output rendered to HTML then screenshot

  await browser.close();
}
```

## Stage 4: CRON SCHEDULER

### Frequency

| Schedule | Trigger | Purpose |
|----------|---------|---------|
| 6:00 PM daily (work end) | `0 18 * * 1-5` | Primary: end-of-day report |
| 2:00 AM daily (overnight) | `0 2 * * *` | Secondary: batch + heavy processing |
| Manual trigger | `node scripts/daily-chronicle.js --force` | On-demand |

### Integration with Portfolio Cron

Already have `scripts/swal-project-manager.js` — add new cron entry:

```javascript
const dailyChronicleCron = {
  name: 'BPM-DailyChronicle',
  project: 'Portfolio',
  frequency: '6h (checks) / daily (generates)',
  script: 'scripts/daily-chronicle.js',
  enabled: true,
};
```

## Stage 5: DISTRIBUTION

### Pipeline Script: `scripts/daily-chronicle.js`

```javascript
#!/usr/bin/env node

async function main() {
  console.log('[DAILY CHRONICLE] Starting...');

  // 1. Collect data
  console.log('  HARVEST: collecting from all sources...');
  const data = await harvest();

  // 2. Analyze with LLM
  console.log('  ANALYZE: extracting patterns and decisions...');
  const analysis = await analyze(data);

  // 3. Generate blog post
  console.log('  GENERATE: creating markdown...');
  const slug = `daily-chronicle-${today()}`;
  await generateBlogPost(slug, analysis);

  // 4. Capture screenshots
  console.log('  MEDIA: capturing screenshots...');
  await captureScreenshots();

  // 5. Generate diagrams
  console.log('  DIAGRAMS: rendering Mermaid...');
  await generateDiagrams(analysis.mermaidDiagrams);

  // 6. Commit and push
  console.log('  PUBLISH: committing to portfolio...');
  await exec(`git add -A && git commit -m "chronicle: daily report ${today()}" && git push`);

  // 7. Notify
  console.log('  NOTIFY: sending to Telegram...');
  await notify(`📝 Daily Chronicle ${today()} published`);

  console.log('[DAILY CHRONICLE] Complete ✅');
}
```

## File Structure

```
portfolio-iberi22/
├── scripts/
│   ├── daily-chronicle.js      ← Main orchestrator
│   ├── daily-harvest.js        ← Data collection
│   ├── daily-analyze.js        ← LLM analysis
│   ├── daily-generate.js       ← Blog post generation
│   ├── daily-media.js          ← Screenshots + diagrams
│   └── daily-publish.js        ← Git + deploy
├── src/
│   └── content/
│       └── blog/               ← Auto-generated chronicle posts
├── public/
│   └── images/
│       └── daily/              ← Auto-generated media assets
├── docs/
│   └── daily-chronicle.md      ← This plan
└── .github/
    └── workflows/
        └── daily-chronicle.yml ← GitHub Action (alternative trigger)
```

## GitHub Action (Alternative)

```yaml
name: Daily Chronicle
on:
  schedule:
    - cron: '0 22 * * *'  # 10 PM UTC = 5 PM Bogotá
  workflow_dispatch:

jobs:
  chronicle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full git history for analysis

      - uses: actions/setup-node@v4

      - name: Generate daily report
        run: node scripts/daily-chronicle.js
        env:
          GROQ_API_KEY: ${{ secrets.GROQ_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit report
        run: |
          git config user.email "chronicle@swal.io"
          git config user.name "SWAL Chronicle Bot"
          git add -A
          git diff --staged --quiet || git commit -m "chronicle: daily $(date +%Y-%m-%d)"
          git push
```

## Implementation Order

| Phase | What | Time |
|-------|------|------|
| P1 | `daily-harvest.js` — collect all data sources | ~2h |
| P2 | `daily-analyze.js` — LLM integration | ~2h |
| P3 | `daily-generate.js` — blog output | ~2h |
| P4 | Mermaid diagram generation | ~1h |
| P5 | Playwright screenshot capture | ~1h |
| P6 | `daily-chronicle.js` — main orchestrator | ~1h |
| P7 | Cron integration + scheduling | ~30m |
| P8 | Video/terminal recording | ~1h |
| P9 | Infographics (D3) | ~2h |
| P10 | Testing + refinement | ~2h |

**Total estimate: ~14h**

## Decision Record

### Why not use existing tools like Obsidian/Day One?
- No automation API for scheduling and posting to portfolio
- Need custom LLM analysis of technical decisions
- Must integrate with our specific stack (Astro content collections)

### Why Playwright over Puppeteer?
- Already in our dependency tree via OpenClaw
- Better Windows support
- Built-in `fullPage: true` screenshots

### Why Mermaid over PlantUML?
- Native Markdown support (GitHub renders it)
- SVG output, lightweight
- Active development, good for architecture diagrams
