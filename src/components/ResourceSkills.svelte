<script lang="ts">
  import { t } from '../i18n/index';
  import { baseUrl } from '../lib/baseUrl';

  let copiedKey = $state<string | null>(null);

  interface SkillItem {
    id: string;
    name: string;
    title: string;
    tag: string;
    description: string;
    cliCompatibility: string[];
    githubUrl: string;
    rawContent: string;
  }

  const skills: SkillItem[] = [
    {
      id: 'pre-meet-diagnostic',
      name: 'pre-meet-diagnostic',
      title: 'Pre-Meet Pipeline & Hardware Diagnostic Skill',
      tag: 'DIAGNOSTIC & AUDIT',
      description: 'Permite a cualquier agente local (Claude Code, Hermes, Jules, OpenCode) auditar autónomamente el hardware, repositorios, dependencias y configuración .env sin exponer secretos ni requerir ingreso manual de datos.',
      cliCompatibility: ['Claude Code', 'Google Jules', 'Hermes Agent', 'OpenCode', 'GitCore'],
      githubUrl: 'https://github.com/iberi22/portfolio-iberi22/tree/main',
      rawContent: `---
name: pre-meet-pipeline-diagnostic
description: Autonomous diagnostic agent skill for auditing local hardware, repositories, and model routing readiness for SWAL 1-on-1 technical exchange sessions.
version: 1.0.0
---

# Pre-Meet Pipeline & Hardware Diagnostic Skill

## Purpose
Execute a 100% automated, read-only diagnostic of the local development environment to extract architectural metrics, active model subscriptions, and system capabilities prior to the 1-on-1 technical session.

## Guardrails
- ZERO SECRET LEAKS: Never read, print, or transmit raw API keys or tokens. Only list variable names (e.g., \`ANTHROPIC_API_KEY=PRESENT\`).
- READ ONLY: Do not modify or delete files.

## 1. Hardware & Local Runtime Audit (Shell)
\`\`\`bash
echo "=== System & Memory ==="
uname -srm
free -h 2>/dev/null || vm_stat

echo "=== Local Accelerators & GPUs ==="
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader
elif [[ "$(uname)" == "Darwin" ]]; then
    system_profiler SPDisplaysDataType | grep -E "Chipset Model|VRAM"
fi

echo "=== Local AI Runtimes ==="
command -v ollama &> /dev/null && echo "✓ Ollama available" && ollama list
command -v vllm &> /dev/null && echo "✓ vLLM available"
\`\`\`

## 2. Workspace & Repo Depth Scan
\`\`\`bash
echo "=== Repository Metric Summary ==="
git status -s 2>/dev/null || echo "Not inside git repo"
find . -maxdepth 2 -name "package.json" -o -name "Cargo.toml" -o -name "composer.json" -o -name "pyproject.toml"
\`\`\`

## 3. Output Synthesis
Generate a clean Markdown summary outlining:
- Detected Stack & Package Managers
- Available Compute (CPU, RAM, GPU/VRAM, Local AI Runtimes)
- Active Subscriptions & API providers ready for deterministic orchestration.`
    },
    {
      id: 'swal-issue-contract',
      name: 'gitcore-jules-issues',
      title: 'Canonical Issue-as-a-Contract Protocol for Coding Agents',
      tag: 'AGENT ORCHESTRATION',
      description: 'Plantilla y protocolo canónico para formular issues de alta precisión con criterios de aceptación verificables por comando y lotes disjuntos para micro-tareas paralelas.',
      cliCompatibility: ['Google Jules', 'Claude Code', 'Hermes', 'Gestalt'],
      githubUrl: 'https://github.com/iberi22/portfolio-iberi22/tree/main',
      rawContent: `---
name: gitcore-jules-issues
description: Canonical protocol for drafting zero-drift, verifiable contract issues for autonomous coding agents (Jules, Claude Code, OpenCode).
version: 3.8.0
---

# Issue Contract Template

## Current State (MEASURABLE)
- Exact file paths, current behavior, and benchmark measurements.

## Desired State (DELTA)
- Precise behavioral and structural changes requested.

## Acceptance Criteria (COMMAND-VERIFIABLE)
- [ ] Automated test passes: \`npm test\` / \`cargo test\`
- [ ] Build succeeds: \`npm run build\`
- [ ] Specific grep/static checks confirm zero regressions.

## Disjoint File Islands
- Explicitly list target files to prevent concurrent editing collisions across micro-agents.`
    },
    {
      id: 'model-routing-strategy',
      name: 'model-routing-strategy',
      title: 'Smart Multi-Provider Routing & Token Budgeting',
      tag: 'TOKEN ECONOMICS',
      description: 'Estrategia determinista de ruteo inteligente de modelos LLM: asignación de tareas rápidas/lints a modelos ligeros y razonamiento arquitectónico denso a modelos de frontera.',
      cliCompatibility: ['OpenRouter', 'Amazon Bedrock', 'Google Vertex AI', 'Ollama Local'],
      githubUrl: 'https://github.com/iberi22/portfolio-iberi22/tree/main',
      rawContent: `---
name: model-routing-strategy
description: Deterministic model tier assignment based on task complexity, latency thresholds, and quota optimization.
version: 2.0.0
---

# Multi-Tier Model Allocation

## 1. Fast Tier (Triage, Micro-Edits, Linters, Summaries)
- Primary: Gemini Flash / DeepSeek-V3 / Groq LPU / Local Ollama (Qwen 2.5)
- Characteristics: Sub-second latency, zero or fractional token cost.

## 2. Reasoning & Deep Architectural Tier
- Primary: Claude 3.7 Sonnet / OpenAI o3-mini / DeepSeek R1
- Characteristics: Multi-step formal planning, cross-file refactoring, invariant verification.

## 3. Local-First Fallback
- Offline or hostile network condition handling via local quantized models with strict hardware memory budgeting.`
    }
  ];

  function copyToClipboard(content: string, id: string) {
    navigator.clipboard.writeText(content);
    copiedKey = id;
    setTimeout(() => {
      if (copiedKey === id) copiedKey = null;
    }, 2500);
  }
</script>

<div class="min-h-screen py-16 px-6 max-w-6xl mx-auto">
  <!-- Header Banner -->
  <div class="space-y-4 mb-12">
    <div class="flex flex-wrap items-center gap-3">
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        🤖 Friend for Agents & Humans
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-accent/10 border border-accent/30 text-accent">
        ⚡ Markdown-Native & Zero-Drift
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-white/5 border border-white/10 text-text-muted">
        🔒 100% Client-Side / Read-Only
      </span>
    </div>

    <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
      Recursos, Skills & Protocolos Agénticos
    </h1>
    <p class="text-text-muted max-w-3xl text-sm md:text-base leading-relaxed">
      Colección canónica de especificaciones, directivas <span class="font-mono text-accent">SKILL.md</span> y prompts de diagnóstico diseñados para ser consumidos tanto por desarrolladores como por agentes autónomos de codificación (<span class="text-white">Claude Code, Jules, Hermes, OpenCode</span>).
    </p>

    <!-- Manifesto Box (Comentado temporalmente)
    <div class="glass-card p-6 mt-6 border-accent/30 bg-accent/5 rounded-2xl">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            🎯 Enfoque Dual: Diseñado para Humanos, Optimizado para Agentes
          </h2>
          <p class="text-xs text-text-secondary leading-relaxed max-w-2xl">
            En lugar de requerir que completes formularios tediosos, proporcionamos skills estandarizados. Tu agente local ejecuta la inspección en 1 paso y genera el reporte técnico para la reunión sin filtrar secretos ni datos privados.
          </p>
        </div>
        <a
          href={baseUrl('agenda')}
          class="shrink-0 px-4 py-2.5 rounded-xl bg-accent text-black font-mono font-bold text-xs hover:bg-accent-light transition-all shadow-md"
        >
          Agendar Meet 1 a 1 →
        </a>
      </div>
    </div>
    -->
  </div>

  <!-- Skills Catalog Grid -->
  <div class="space-y-10">
    <div class="flex items-center justify-between border-b border-white/10 pb-4">
      <h2 class="text-xl font-bold text-text-primary font-mono flex items-center gap-2">
        <span>📦</span> Catálogo de Skills Canónicos
      </h2>
      <span class="text-xs font-mono text-text-muted">
        3 Skills Disponibles · Formato Markdown (.md)
      </span>
    </div>

    <div class="grid grid-cols-1 gap-8">
      {#each skills as skill}
        <div class="glass-card p-6 md:p-8 border-white/10 hover:border-accent/40 transition-all rounded-2xl flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-accent/10 text-accent border border-accent/30">
                  {skill.tag}
                </span>
                <span class="text-xs font-mono text-text-muted">skill: {skill.name}</span>
              </div>
              <div class="flex items-center gap-2">
                <a
                  href={skill.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-text-secondary text-xs font-mono hover:text-white hover:border-white/20 transition-all"
                  title="Ver en GitHub"
                >
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  <span>Ver en GitHub</span>
                  <span class="text-[10px]">↗</span>
                </a>
                <button
                  onclick={() => copyToClipboard(skill.rawContent, skill.id)}
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-black text-xs font-mono font-bold hover:bg-accent-light transition-all shadow cursor-pointer"
                >
                  {#if copiedKey === skill.id}
                    <span>✓ ¡Copiado .md!</span>
                  {:else}
                    <span>📋 Copiar para Agente (.md)</span>
                  {/if}
                </button>
              </div>
            </div>

            <h3 class="text-xl font-bold text-text-primary">
              {skill.title}
            </h3>
            <p class="text-text-secondary text-sm leading-relaxed">
              {skill.description}
            </p>

            <!-- Agent Compatibility Badges -->
            <div class="flex flex-wrap items-center gap-2 pt-2">
              <span class="text-xs font-mono text-text-muted">Compatibilidad:</span>
              {#each skill.cliCompatibility as agent}
                <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-text-secondary">
                  {agent}
                </span>
              {/each}
            </div>
          </div>

          <!-- Raw Code Snippet Preview -->
          <div class="rounded-xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-text-muted overflow-x-auto max-h-60 overflow-y-auto">
            <pre class="whitespace-pre text-text-secondary">{skill.rawContent}</pre>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
