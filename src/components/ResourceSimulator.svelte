<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '../i18n/index';

  interface ProviderItem {
    id: string;
    family: string;
    description: string;
    category: 'cloud' | 'router' | 'specialized' | 'local' | 'free';
    costInputAvg: number; // USD per 1M tokens
    costOutputAvg: number; // USD per 1M tokens
    speedScore: number; // 1-10
    qualityScore: number; // 1-10
    freeTierAvailable: boolean;
    active: boolean;
  }

  interface SubscriptionsState {
    googleAiPro: boolean;    // Jules 15 parallel tasks + 100 runs/24h
    claudePro: boolean;      // Claude Code CLI subagents / Sonnet
    openaiPlus: boolean;     // OpenAI Plus/Pro / o-series subagents
    openrouter: boolean;     // OpenRouter API smart routing
    localHardware: boolean;  // Ollama / vLLM / LM Studio
  }

  interface HardwareState {
    type: 'gpu_high' | 'mac_studio' | 'cpu_only' | 'vps_linux' | 'cloud_ec2';
    ramGb: number;
    gpuVramGb: number;
  }

  interface DiagnosticState {
    workloadType: 'fullstack' | 'frontend' | 'backend' | 'systems' | 'data_ml';
    contextDepth: 'short' | 'medium' | 'deep';
    dailyPrompts: number;
    budgetLimitUsd: number;
    currentMonthlySpendUsd: number;
    useFreeTiers: boolean;
  }

  interface ContextState {
    srcPath: string;
    testPath: string;
    docsUrl: string;
    envKeys: string;
    selectedCli: 'jules' | 'claude_code' | 'hermes' | 'openclaw' | 'gitcore' | 'opencode';
  }

  interface UserProfile {
    version: string;
    subscriptions: SubscriptionsState;
    providers: Record<string, boolean>;
    hardware: HardwareState;
    diagnostic: DiagnosticState;
    context: ContextState;
  }

  // Top 20 Generic Model Families (Zero-Obsolescence)
  const initialProvidersList: ProviderItem[] = [
    { id: 'gemini_family', family: 'Google Gemini Family (Flash / Pro Lines)', description: 'Modelos multimodales de alta velocidad y ventanas de contexto masivas', category: 'cloud', costInputAvg: 0.15, costOutputAvg: 0.60, speedScore: 9.6, qualityScore: 9.3, freeTierAvailable: true, active: true },
    { id: 'claude_family', family: 'Anthropic Claude Family (Sonnet / Haiku / Opus)', description: 'Referente en razonamiento arquitectónico, refactor y seguimiento de instrucciones', category: 'cloud', costInputAvg: 3.00, costOutputAvg: 15.00, speedScore: 8.9, qualityScore: 9.8, freeTierAvailable: false, active: true },
    { id: 'openai_family', family: 'OpenAI Family (GPT / o-series Reasoning)', description: 'Modelos líderes de propósito general y series de razonamiento paso a paso', category: 'cloud', costInputAvg: 2.50, costOutputAvg: 10.00, speedScore: 8.7, qualityScore: 9.4, freeTierAvailable: false, active: true },
    { id: 'openrouter_meta', family: 'OpenRouter (Multi-Provider Smart Router)', description: 'Enrutador universal con failover automático, balanceo de carga y subastas de precio', category: 'router', costInputAvg: 0.40, costOutputAvg: 1.20, speedScore: 9.2, qualityScore: 9.5, freeTierAvailable: true, active: true },
    { id: 'deepseek_family', family: 'DeepSeek Family (V-Chat & R-Reasoning Direct)', description: 'Modelos abiertos de altísima capacidad a precios ultra-competitivos de centavos', category: 'cloud', costInputAvg: 0.14, costOutputAvg: 0.28, speedScore: 8.5, qualityScore: 9.2, freeTierAvailable: false, active: true },
    { id: 'groq_lpu', family: 'Groq LPU (Ultra-Low Latency Inference)', description: 'Procesamiento casi instantáneo para triage, lints y micro-validaciones', category: 'specialized', costInputAvg: 0.08, costOutputAvg: 0.20, speedScore: 9.9, qualityScore: 8.8, freeTierAvailable: true, active: true },
    { id: 'bedrock_family', family: 'Amazon Bedrock (Enterprise AWS Managed)', description: 'Infraestructura cloud gobernada con cumplimiento SOC2 y modelos multi-proveedor', category: 'cloud', costInputAvg: 1.50, costOutputAvg: 6.00, speedScore: 9.1, qualityScore: 9.5, freeTierAvailable: false, active: false },
    { id: 'vertex_family', family: 'Google Cloud Vertex AI (Enterprise GCP)', description: 'Plataforma empresarial de Google con cuotas dedicadas y seguridad privada', category: 'cloud', costInputAvg: 1.20, costOutputAvg: 5.00, speedScore: 9.3, qualityScore: 9.4, freeTierAvailable: false, active: false },
    { id: 'mistral_family', family: 'Mistral AI (Codestral / Large Family)', description: 'Modelos eficientes europeos especializados en código y razonamiento denso', category: 'cloud', costInputAvg: 0.30, costOutputAvg: 0.90, speedScore: 9.0, qualityScore: 9.0, freeTierAvailable: true, active: false },
    { id: 'together_cloud', family: 'Together AI (Open Models GPU Cloud)', description: 'Inferencia cloud de modelos abiertos con despliegues dedicados', category: 'specialized', costInputAvg: 0.20, costOutputAvg: 0.60, speedScore: 9.1, qualityScore: 8.9, freeTierAvailable: false, active: false },
    { id: 'fireworks_speed', family: 'Fireworks AI (Fast Speculative Engine)', category: 'specialized', description: 'Inferencia ultra-rápida mediante decodificación especulativa', costInputAvg: 0.20, costOutputAvg: 0.50, speedScore: 9.4, qualityScore: 8.9, freeTierAvailable: false, active: false },
    { id: 'perplexity_search', family: 'Perplexity AI (Sonar Live Search API)', category: 'specialized', description: 'Modelos conectados a la web en tiempo real con citación de fuentes', costInputAvg: 1.00, costOutputAvg: 5.00, speedScore: 8.8, qualityScore: 9.1, freeTierAvailable: false, active: false },
    { id: 'cohere_family', family: 'Cohere (Command R+ & Embeddings)', category: 'specialized', description: 'Especialistas en RAG empresarial y recuperación semántica de contexto', costInputAvg: 0.40, costOutputAvg: 1.50, speedScore: 8.6, qualityScore: 8.8, freeTierAvailable: false, active: false },
    { id: 'xai_family', family: 'xAI Grok Family (Grok Foundation)', category: 'cloud', description: 'Modelos con ventanas de contexto amplias y acceso a datos en vivo', costInputAvg: 2.00, costOutputAvg: 10.00, speedScore: 8.7, qualityScore: 9.1, freeTierAvailable: false, active: false },
    { id: 'cerebras_wse', family: 'Cerebras (Wafer-Scale Fast Compute)', category: 'specialized', description: 'Velocidad de generación masiva basada en chips a escala de oblea', costInputAvg: 0.10, costOutputAvg: 0.30, speedScore: 9.9, qualityScore: 8.7, freeTierAvailable: true, active: false },
    { id: 'cloudflare_workers', family: 'Cloudflare Workers AI (Serverless Edge)', category: 'router', description: 'Inferencia serverless distribuida en cientos de ciudades a nivel global', costInputAvg: 0.15, costOutputAvg: 0.45, speedScore: 9.0, qualityScore: 8.5, freeTierAvailable: true, active: false },
    { id: 'github_models', family: 'GitHub Models / Azure OpenAI', category: 'cloud', description: 'Integración nativa con repositorios GitHub y entornos de desarrollo CI', costInputAvg: 1.80, costOutputAvg: 7.00, speedScore: 8.8, qualityScore: 9.2, freeTierAvailable: true, active: false },
    { id: 'ollama_local', family: 'Ollama Local (Qwen / Llama / DeepSeek R1)', category: 'local', description: 'Ejecución 100% en tu máquina local sin llamadas externas ni costos', costInputAvg: 0.00, costOutputAvg: 0.00, speedScore: 7.8, qualityScore: 8.6, freeTierAvailable: true, active: true },
    { id: 'vllm_cluster', family: 'vLLM Local Server (High-Throughput PagedAttention)', category: 'local', description: 'Motor de inferencia local de alto rendimiento con memoria optimizada', costInputAvg: 0.00, costOutputAvg: 0.00, speedScore: 8.9, qualityScore: 8.8, freeTierAvailable: true, active: false },
    { id: 'free_tier_endpoints', family: 'Free-Tier Endpoints (Google AI Studio / Groq Free / OpenRouter Free)', category: 'free', description: 'Endpoints gratuitos comunitarios sujetos a límites de RPM y colas de espera', costInputAvg: 0.00, costOutputAvg: 0.00, speedScore: 7.2, qualityScore: 8.3, freeTierAvailable: true, active: false },
  ];

  const defaultProfile: UserProfile = {
    version: '3.0.0',
    subscriptions: {
      googleAiPro: true,
      claudePro: true,
      openaiPlus: true,
      openrouter: true,
      localHardware: true,
    },
    providers: {
      gemini_family: true,
      claude_family: true,
      openai_family: true,
      openrouter_meta: true,
      deepseek_family: true,
      groq_lpu: true,
      ollama_local: true,
    },
    hardware: {
      type: 'mac_studio',
      ramGb: 64,
      gpuVramGb: 24,
    },
    diagnostic: {
      workloadType: 'fullstack',
      contextDepth: 'medium',
      dailyPrompts: 120,
      budgetLimitUsd: 60,
      currentMonthlySpendUsd: 40,
      useFreeTiers: false,
    },
    context: {
      srcPath: './src',
      testPath: './tests',
      docsUrl: 'https://github.com/iberi22/portfolio-iberi22',
      envKeys: 'OPENROUTER_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY, GROQ_API_KEY',
      selectedCli: 'claude_code',
    },
  };

  let profile = $state<UserProfile>(JSON.parse(JSON.stringify(defaultProfile)));
  let providersList = $state<ProviderItem[]>(JSON.parse(JSON.stringify(initialProvidersList)));
  let selectedTierIndex = $state<number>(0);
  let activeTab = $state<'sim' | 'prompt' | 'websearch' | 'metrics' | 'cliaudit' | 'skill' | 'env'>('sim');
  let copyFeedback = $state<string | null>(null);
  let fileInputRef = $state<HTMLInputElement | null>(null);

  const STORAGE_KEY = 'swal_sim_profiles_v4';

  onMount(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        profile = {
          ...defaultProfile,
          ...parsed,
          subscriptions: { ...defaultProfile.subscriptions, ...(parsed.subscriptions || {}) }
        };
      }
      syncProvidersState();
    } catch (e) {
      console.error('Failed to load profile from localStorage', e);
    }
  });

  function syncProvidersState() {
    providersList.forEach((p) => {
      p.active = !!profile.providers[p.id];
    });
  }

  function saveProfile() {
    try {
      providersList.forEach((p) => {
        profile.providers[p.id] = p.active;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile to localStorage', e);
    }
  }

  function toggleProvider(id: string) {
    const p = providersList.find((x) => x.id === id);
    if (p) {
      p.active = !p.active;
      saveProfile();
    }
  }

  function resetProfile() {
    profile = JSON.parse(JSON.stringify(defaultProfile));
    syncProvidersState();
    saveProfile();
    showFeedback(t('simulator.resetFeedback'));
  }

  function exportProfileJson() {
    providersList.forEach((p) => {
      profile.providers[p.id] = p.active;
    });
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `swal_sim_profile_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function triggerImport() {
    fileInputRef?.click();
  }

  function handleImportFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const file = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported = JSON.parse(content);
        if (imported && typeof imported === 'object') {
          profile = {
            ...defaultProfile,
            ...imported,
            subscriptions: { ...defaultProfile.subscriptions, ...(imported.subscriptions || {}) }
          };
          syncProvidersState();
          saveProfile();
          showFeedback(t('simulator.importFeedback'));
        }
      } catch (err) {
        alert(t('simulator.invalidJsonError'));
      }
    };
    reader.readAsText(file);
  }

  function showFeedback(msg: string) {
    copyFeedback = msg;
    setTimeout(() => {
      if (copyFeedback === msg) copyFeedback = null;
    }, 3000);
  }

  // --- Dynamic Algorithmic Simulation & Scoring Engine ---
  const simulationResults = $derived.by(() => {
    const subs = profile.subscriptions;
    const activeProviders = providersList.filter((p) => p.active);
    const hasLocal = subs.localHardware || activeProviders.some((p) => p.category === 'local');
    const useFree = profile.diagnostic.useFreeTiers;

    const multiplierContext = profile.diagnostic.contextDepth === 'deep' ? 4000 : profile.diagnostic.contextDepth === 'medium' ? 2000 : 1000;
    const totalDailyTokens = profile.diagnostic.dailyPrompts * multiplierContext;
    const monthlyTokensM = (totalDailyTokens * 30) / 1_000_000;

    // Dynamic Concurrency & Routing based on user's actual subscriptions
    const julesConcurrency = subs.googleAiPro ? 15 : 4;
    const claudeConcurrency = subs.claudePro ? 5 : 2;
    const openAiConcurrency = subs.openaiPlus ? 4 : 2;
    const openrouterConcurrency = subs.openrouter ? 8 : 3;
    const localConcurrency = profile.hardware.ramGb >= 64 ? 4 : profile.hardware.ramGb >= 32 ? 2 : 1;

    // Realistic Subscription Monthly Base Economics (as of 2026)
    // Google AI Pro: $20/mo (Jules 15-Wave, 100 runs/24h included)
    // Claude Pro / Team: $20 / $30/mo (Claude 3.7 Sonnet + Claude Code CLI)
    // OpenAI Plus / Pro: $20 / $200/mo (GPT-4o + o-series reasoning)
    // OpenRouter: $0 base / Pay-as-you-go (DeepSeek V3 @ $0.14/M in, $0.28/M out)
    // Local Hardware: $0/mo (Ollama / vLLM on own GPU/RAM)
    const activeSubBase = (subs.googleAiPro ? 20 : 0) + (subs.claudePro ? 20 : 0) + (subs.openaiPlus ? 20 : 0);

    // Build dynamic tailored scenarios
    const tiers = [
      {
        id: 'tier_velocity',
        title: subs.googleAiPro
          ? '⚡ Tier 1: Wave Parallelism (Google Jules Swarm + Gemini)'
          : subs.claudePro
          ? '⚡ Tier 1: Multi-Subagent Swarm (Claude Code CLI + Sonnet)'
          : '⚡ Tier 1: Multi-Worker Concurrent Pipeline',
        tagline: subs.googleAiPro
          ? 'Oleadas masivas de hasta 15 tareas paralelas con Google Jules (100 ejecuciones/24h incluidas en $20/mes)'
          : subs.claudePro
          ? 'Orquestación de subagentes paralelos en CLI con Claude Code y chequeo de contexto'
          : 'Ejecución concurrente optimizada por CLI según cuotas activas',
        description: subs.googleAiPro
          ? 'Aprovecha tu suscripción Google AI Pro ($20/mes) para disparar hasta 15 micro-tareas autónomas simultáneas con suite E2E en la nube sin costo adicional de tokens dentro de tu cuota.'
          : subs.claudePro
          ? 'Aprovecha tu suscripción Claude Pro/Team ($20-$30/mes) para coordinar subagentes especializados con Claude Code reduciendo el context drift.'
          : 'Paralelismo dinámico balanceado para entrega rápida de código.',
        costEstUsd: useFree ? 0 : subs.googleAiPro ? 20 : subs.claudePro ? 20 : Math.round(monthlyTokensM * 1.2),
        estLatencyMs: subs.googleAiPro ? 180 : 320,
        concurrencyLimit: subs.googleAiPro ? julesConcurrency : subs.claudePro ? claudeConcurrency : openrouterConcurrency,
        antiDriftScore: 94,
        e2eVerificationRate: 97,
        costEfficiencyScore: subs.googleAiPro ? 92 : 86,
        devVelocityScore: subs.googleAiPro ? 99 : 92,
        resilienceScore: 93,
        primaryRouting: subs.googleAiPro
          ? 'Google Jules 15-Wave Parallel Engine ($20/mo incluido) → Gemini Flash / Pro'
          : subs.claudePro
          ? 'Claude Code CLI Subagent Swarm ($20/mo incluido) → Claude Sonnet'
          : 'OpenRouter Multi-Model Wave Routing',
        recommendedCli: subs.googleAiPro ? 'jules' : subs.claudePro ? 'claude_code' : 'hermes',
      },
      {
        id: 'tier_hybrid',
        title: '⚖️ Tier 2: Balanced Hybrid Orchestrator (Claude + OpenRouter / DeepSeek)',
        tagline: 'Razonamiento arquitectónico en Claude/OpenAI + ejecución económica vía OpenRouter/Local',
        description: 'El flujo más eficiente entre desarrolladores: diseña contratos y planes con modelos premium y delega micro-tareas a modelos de centavos ($0.14-$0.55/M tokens).',
        costEstUsd: useFree ? 0 : (subs.claudePro || subs.openaiPlus ? 20 : 0) + Math.round(monthlyTokensM * 0.35),
        estLatencyMs: 340,
        concurrencyLimit: Math.max(claudeConcurrency, openrouterConcurrency),
        antiDriftScore: 98,
        e2eVerificationRate: 98,
        costEfficiencyScore: 94,
        devVelocityScore: 91,
        resilienceScore: 96,
        primaryRouting: 'Claude Sonnet / OpenAI o-series (Arquitectura) → OpenRouter DeepSeek V3 / Groq (Workers)',
        recommendedCli: 'hermes',
      },
      {
        id: 'tier_cost',
        title: '💰 Tier 3: Ultra-Cost Optimizer (Local Ollama + DeepSeek / Groq LPU)',
        tagline: 'Ollama local para triage, lints y tests + APIs de centavos para síntesis',
        description: 'Reduce hasta un 85% tu gasto mensual delegando validaciones a hardware propio y usando subastas de OpenRouter (DeepSeek V3 @ $0.14/M in, Groq LPU).',
        costEstUsd: useFree ? 0 : hasLocal ? Math.round(monthlyTokensM * 0.15) : Math.round(monthlyTokensM * 0.30),
        estLatencyMs: hasLocal ? 720 : 380,
        concurrencyLimit: hasLocal ? localConcurrency : 4,
        antiDriftScore: 90,
        e2eVerificationRate: 94,
        costEfficiencyScore: 98,
        devVelocityScore: 79,
        resilienceScore: 89,
        primaryRouting: 'Local Ollama (Qwen 2.5 Coder / Llama 3.3) → OpenRouter (DeepSeek V3 / Groq LPU)',
        recommendedCli: 'openclaw',
      },
      {
        id: 'tier_local',
        title: '🛡️ Tier 4: Sovereign Local-First (100% On-Premise)',
        tagline: 'Cero fugas de código a la nube. Runtimes locales (vLLM / Ollama) + Memoria Xavier',
        description: 'Ideal para proyectos con estricto NDA y privacidad absoluta. Todo el ciclo corre en tu hardware local sin llamadas externas.',
        costEstUsd: 0,
        estLatencyMs: profile.hardware.type === 'mac_studio' || profile.hardware.type === 'gpu_high' ? 580 : 1100,
        concurrencyLimit: localConcurrency,
        antiDriftScore: 95,
        e2eVerificationRate: 96,
        costEfficiencyScore: 99,
        devVelocityScore: 74,
        resilienceScore: 97,
        primaryRouting: 'Local vLLM / Ollama (Qwen / DeepSeek R1) → SQLite-vec Local',
        recommendedCli: 'gitcore',
      },
      {
        id: 'tier_enterprise',
        title: '🏢 Tier 5: Enterprise Governance & Resilient Failover',
        tagline: 'Ruteo multi-cuenta con failover automático y rotación de credenciales',
        description: 'Diseñado para squads que requieren alta disponibilidad, trazabilidad estricta y conmutación por error ante límites de cuota.',
        costEstUsd: Math.round(monthlyTokensM * 2.8),
        estLatencyMs: 270,
        concurrencyLimit: 12,
        antiDriftScore: 99,
        e2eVerificationRate: 99,
        costEfficiencyScore: 72,
        devVelocityScore: 94,
        resilienceScore: 99,
        primaryRouting: 'OpenRouter Multi-Account / AWS Bedrock → GitCore State Engine → Gated CI/CD',
        recommendedCli: 'gitcore',
      },
    ];

    const scored = tiers.map((tier) => {
      const budgetPenalty = tier.costEstUsd > profile.diagnostic.budgetLimitUsd ? 18 : 0;
      const score = Math.round(
        tier.costEfficiencyScore * 0.35 +
        tier.devVelocityScore * 0.35 +
        tier.resilienceScore * 0.30 -
        budgetPenalty
      );
      return { ...tier, overallScore: Math.max(10, score) };
    });

    return scored.sort((a, b) => b.overallScore - a.overallScore);
  });

  const currentSelectedTier = $derived(simulationResults[selectedTierIndex] || simulationResults[0]);

  // Active Providers Summary String
  const activeProvidersString = $derived(
    providersList.filter((p) => p.active).map((p) => p.family).join(', ') || 'Local Ollama / OpenRouter'
  );

  // Active Subscriptions Summary
  const activeSubscriptionsString = $derived.by(() => {
    const s = profile.subscriptions;
    const list: string[] = [];
    if (s.googleAiPro) list.push('Google AI Pro (Jules 15-Wave, 100/24h)');
    if (s.claudePro) list.push('Anthropic Claude Pro/Team (Claude Code CLI)');
    if (s.openaiPlus) list.push('OpenAI Plus/Pro (Codegen & Reasoning)');
    if (s.openrouter) list.push('OpenRouter API (Smart Multi-Provider Routing)');
    if (s.localHardware) list.push('Hardware Local (Ollama / vLLM)');
    return list.join(' | ') || 'Pago por Uso (Pay-as-you-go)';
  });

  // 1. MASTER SYSTEM PROMPT (Pure English, Pragmatic & Deterministic)
  const generatedMasterPrompt = $derived.by(() => {
    const tier = currentSelectedTier;
    const p = profile;
    return `# Role: Senior Software Engineer & AI Orchestrator

## Runtime Environment & Context
- Assigned Architecture: ${tier.title}
- Primary Routing: ${tier.primaryRouting}
- Active CLI Harness: ${p.context.selectedCli.toUpperCase()}
- Workspace: \`${p.context.srcPath}\` | Test Suite: \`${p.context.testPath}\`
- Concurrency Limit: Maximum ${tier.concurrencyLimit} simultaneous tasks
- Available Resources & Subscriptions: ${activeSubscriptionsString}
- Free-Tier Mode: ${p.diagnostic.useFreeTiers ? 'ACTIVE (Warning: reduced context window, rate limiting and peak throttling)' : 'INACTIVE (Prioritize low latency and high quality)'}

## Core Operational Directives
1. Code Micro-Fragmentation: 1 Issue → 1 Branch → 1 PR with automated verification.
2. Surgical File Operations: Read targeted line ranges; never perform bulk rewrites of untouched files.
3. Zero Credential Leaks: All API keys and secrets must strictly be read from environment variables (${p.context.envKeys}).
4. Mandatory Verification: Execute the local test suite (\`${p.context.testPath}\`) before committing or proposing any changes.
5. Anti-Drift Threshold: Maintain a minimum stability rating of ${tier.antiDriftScore}%.`;
  });

  // 2. LIVE WEB-SEARCH AGENT PROMPT (Pure English, Real-Time Market & Model Audit)
  const generatedWebSearchPrompt = $derived.by(() => {
    const p = profile;
    return `Act as a Senior AI Infrastructure & Agentic Architecture Consultant.

MY CURRENT TECHNICAL SETUP:
- Hardware: ${p.hardware.type} (${p.hardware.ramGb}GB RAM, ${p.hardware.gpuVramGb}GB VRAM).
- Workload Profile: ${p.diagnostic.workloadType} (Context Depth: ${p.diagnostic.contextDepth}).
- Active Subscriptions / Accounts: ${activeSubscriptionsString}.
- Current Monthly AI Spend: $${p.diagnostic.currentMonthlySpendUsd} USD/month (Target Budget: $${p.diagnostic.budgetLimitUsd} USD/month).
- Daily Request Volume: ~${p.diagnostic.dailyPrompts} prompts/day.
- Free-Tier Priority: ${p.diagnostic.useFreeTiers ? 'Yes, maximize free endpoints where viable.' : 'No, prioritize dedicated paid endpoints for speed and reliability.'}

LIVE RESEARCH DIRECTIVES (AS OF TODAY):
1. Search the web for current, active model releases across my subscriptions (Google Gemini/Jules, Anthropic Claude Sonnet, OpenAI GPT/o-series, DeepSeek, Groq LPU, and OpenRouter).
2. Fetch up-to-date pricing per 1M tokens (Input / Output) and current RPM/RPD rate limits.
3. Propose an optimal routing strategy to reduce my monthly spend ($${p.diagnostic.currentMonthlySpendUsd} USD/month) while maintaining architectural fidelity.
4. Identify which open-weights models I can run locally at $0 cost on my hardware (${p.hardware.type}) using Ollama/vLLM for fast linting, triage, and unit tests.
5. Provide actionable configuration recommendations for my CLI harness (${p.context.selectedCli.toUpperCase()}).`;
  });

  // 3. CLI HARDWARE AUTO-SCAN SCRIPT (Pure English Output)
  const generatedCliAuditScript = $derived.by(() => {
    return `#!/usr/bin/env bash
# ==============================================================================
# SWAL Local Hardware & AI Runtimes Auditor (100% Local-First)
# ==============================================================================
echo "🔍 Scanning local hardware specifications and AI runtimes..."

echo "--- CPU & Operating System ---"
uname -s -r -m
nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null

echo "--- System RAM ---"
free -h 2>/dev/null || vm_stat 2>/dev/null

echo "--- GPU Accelerators & VRAM ---"
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader
elif [[ "$(uname)" == "Darwin" ]]; then
    system_profiler SPDisplaysDataType | grep "Chipset Model\\|VRAM"
else
    echo "No dedicated NVIDIA/Apple GPU detected (CPU-only mode)"
fi

echo "--- Local AI Runtimes ---"
if command -v ollama &> /dev/null; then
    echo "✓ Ollama is installed. Local models:"
    ollama list
else
    echo "✗ Ollama is not installed"
fi

if command -v vllm &> /dev/null; then
    echo "✓ vLLM is installed"
fi

echo "✅ Hardware audit complete. Copy these values into your simulator."
`;
  });

  // 4. WORKSPACE & REPO METRICS SCANNER PROMPT (Pure English)
  const generatedMetricsPrompt = $derived.by(() => {
    const p = profile;
    return `Act as a DevOps Engineer & Repository Audit Agent.

OBJECTIVE:
Extract precise workspace metrics from the local repositories located in \`${p.context.srcPath}\` to feed the SWAL Agentic Simulator.

EXECUTION INSTRUCTIONS:
1. Write and execute a local script (Python, Node.js, or Bash utilizing tokei/cloc/find) that recursively inspects all project directories in \`${p.context.srcPath}\`.
2. Extract the following metrics:
   - Total count of active repositories and projects.
   - Total Lines of Code (LOC) broken down by primary programming language.
   - Total repository disk size (MB), excluding node_modules, .git, target, vendor, and dist directories.
   - Configuration file inventory (.env, docker-compose, tsconfig, package.json).
3. Produce a structured Markdown summary report and a sanitized JSON payload ready for import.
4. CRITICAL: Never read, print, or leak secret values from .env files (only list variable names).`;
  });

  // 5. SKILL.MD TEMPLATE (Pure English)
  const generatedSkillMd = $derived.by(() => {
    const tier = currentSelectedTier;
    const p = profile;
    return `---
name: swal-resource-orchestrator-${p.context.selectedCli}
description: Deterministic engineering protocol for ${p.diagnostic.workloadType.toUpperCase()} on ${p.hardware.type.toUpperCase()}.
---

# SKILL: SWAL RESOURCE ORCHESTRATOR (${p.context.selectedCli.toUpperCase()})

## 1. Model Routing & Workload Allocation
- Fast Tasks / Lints / Triage: Lightweight models (Flash / DeepSeek / Groq) or local Ollama.
- Complex Architecture / Heavy Refactor: Claude Sonnet / OpenAI o-series via OpenRouter or direct subscription.
- Primary Assigned Route: \`${tier.primaryRouting}\`

## 2. Execution Guardrails
- Max Concurrency Limit: ${tier.concurrencyLimit} simultaneous tasks.
- Source Workspace: \`${p.context.srcPath}\`
- Test Suite Path: \`${p.context.testPath}\`

## 3. Anti-Drift & Privacy Protocol
- Always run and pass the test suite before submitting a pull request.
- Zero credential leaks: Secrets must strictly remain in environment variables (.env).
`;
  });

  // 6. SANITIZED .ENV.EXAMPLE (Pure English)
  const generatedEnvExample = $derived.by(() => {
    const p = profile;
    let env = `# .env.example — SWAL Simulation Framework (100% Client-Side)\n\n`;
    env += `SWAL_SIMULATOR_VERSION=${p.version}\n`;
    env += `SWAL_SELECTED_CLI=${p.context.selectedCli}\n`;
    env += `SWAL_WORKLOAD_TYPE=${p.diagnostic.workloadType}\n`;
    env += `SWAL_MONTHLY_BUDGET_USD=${p.diagnostic.budgetLimitUsd}\n\n`;
    env += `# Sanitized Provider Credentials:\n`;

    if (p.subscriptions.openrouter) env += `OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.subscriptions.googleAiPro || p.providers.gemini_family) env += `GEMINI_API_KEY=AIzaSyXxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.subscriptions.claudePro || p.providers.claude_family) env += `ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.subscriptions.openaiPlus || p.providers.openai_family) env += `OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.providers.deepseek_family) env += `DEEPSEEK_API_KEY=sk-ds-xxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.providers.groq_lpu) env += `GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx\n`;
    if (p.subscriptions.localHardware || p.providers.ollama_local) env += `OLLAMA_HOST=http://localhost:11434\n`;

    return env;
  });

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      showFeedback(`¡${label} copiado al portapapeles!`);
    }).catch((err) => {
      console.error('Failed to copy', err);
    });
  }

  function downloadAllArtifacts() {
    const files = [
      { name: 'MASTER_SYSTEM_PROMPT.txt', content: generatedMasterPrompt },
      { name: 'LIVE_WEBSEARCH_PROMPT.txt', content: generatedWebSearchPrompt },
      { name: 'WORKSPACE_METRICS_PROMPT.txt', content: generatedMetricsPrompt },
      { name: 'swal-audit-env.sh', content: generatedCliAuditScript },
      { name: 'SKILL.md', content: generatedSkillMd },
      { name: '.env.example', content: generatedEnvExample },
    ];

    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    showFeedback('¡Paquete completo descargado!');
  }
</script>

<div class="max-w-6xl mx-auto px-6 py-12 space-y-12">
  <!-- Privacy & Free Community Tool Banner -->
  <div class="space-y-4 text-center md:text-left border-b border-white/10 pb-8">
    <div class="flex flex-wrap items-center gap-2.5">
      <span class="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-amber-400 text-black shadow-lg shadow-amber-400/20">
        🧪 {t('simulator.betaBadge')}
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-accent/10 border border-accent/30 text-accent">
        ⚡ {t('simulator.freeCommunity')}
      </span>
      <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
        🔒 {t('simulator.serverless')}
      </span>
    </div>

    <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
      {t('simulator.title')} <span class="text-xs font-mono text-amber-400 font-normal px-2.5 py-0.5 border border-amber-400/30 rounded-full align-middle">BETA</span>
    </h1>
    <p class="text-text-muted max-w-3xl text-sm md:text-base leading-relaxed">
      {t('simulator.subtitle')}
    </p>

    <!-- Beta Purpose & Meeting Prep Card -->
    <div class="glass-card p-5 mt-4 border-amber-500/30 bg-amber-500/5 text-xs text-amber-200/90 leading-relaxed space-y-2 rounded-xl">
      <div class="flex items-center gap-2 font-bold text-white font-mono uppercase tracking-wider">
        <span>🎯</span> {t('simulator.betaPurposeTitle')}
      </div>
      <p>
        {t('simulator.betaPurposeDesc')}
      </p>
    </div>

    <!-- Toolbar: Save / Reset / Export / Import -->
    <div class="flex flex-wrap items-center gap-3 pt-4">
      <button
        onclick={saveProfile}
        class="px-4 py-2 text-xs font-bold rounded-md bg-accent text-black hover:bg-accent-light transition-all shadow-md cursor-pointer"
      >
        💾 {t('simulator.saveProfile')}
      </button>
      <button
        onclick={exportProfileJson}
        class="px-4 py-2 text-xs font-semibold rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        📥 {t('simulator.exportProfile')}
      </button>
      <button
        onclick={triggerImport}
        class="px-4 py-2 text-xs font-semibold rounded-md bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
      >
        📤 {t('simulator.importProfile')}
      </button>
      <input
        type="file"
        accept=".json"
        bind:this={fileInputRef}
        onchange={handleImportFile}
        class="hidden"
      />
      <button
        onclick={resetProfile}
        class="px-4 py-2 text-xs font-semibold rounded-md bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
      >
        🔄 {t('simulator.resetDefaults')}
      </button>

      {#if copyFeedback}
        <span class="text-xs text-accent font-mono animate-fade-in ml-auto">
          ✓ {copyFeedback}
        </span>
      {/if}
    </div>
  </div>

  <!-- SECTION 1: Subscriptions, Diagnostic Questions, Hardware & Providers -->
  <div class="bg-bg-surface-dark border border-white/10 rounded-xl p-6 md:p-8 space-y-8 shadow-xl">
    <div class="flex items-center justify-between border-b border-white/10 pb-4">
      <h2 class="text-xl font-bold text-accent flex items-center gap-2">
        <span>⚙️</span> {t('simulator.sectionResources')}
      </h2>
      <span class="text-xs font-mono text-emerald-400">0% External Server Calls</span>
    </div>

    <!-- Active Subscriptions & Tools Selector -->
    <div class="p-5 rounded-xl border border-accent/20 bg-accent/5 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs uppercase tracking-wider text-accent font-bold">
          🔑 {t('simulator.subsTitle')}
        </h3>
        <span class="text-[11px] text-text-muted">{t('simulator.subsSub')}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <label class="flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer {profile.subscriptions.googleAiPro ? 'border-accent bg-accent/15 text-white' : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20'}">
          <input
            type="checkbox"
            bind:checked={profile.subscriptions.googleAiPro}
            onchange={saveProfile}
            class="accent-accent w-4 h-4 mt-0.5"
          />
          <div>
            <span class="text-xs font-bold block text-white">Google AI Pro</span>
            <span class="text-[10px] text-text-muted leading-tight block mt-0.5">Jules 15 parallel waves (100 runs/24h)</span>
          </div>
        </label>

        <label class="flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer {profile.subscriptions.claudePro ? 'border-accent bg-accent/15 text-white' : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20'}">
          <input
            type="checkbox"
            bind:checked={profile.subscriptions.claudePro}
            onchange={saveProfile}
            class="accent-accent w-4 h-4 mt-0.5"
          />
          <div>
            <span class="text-xs font-bold block text-white">Claude Pro / Team</span>
            <span class="text-[10px] text-text-muted leading-tight block mt-0.5">Claude Code CLI & Sonnet subagents</span>
          </div>
        </label>

        <label class="flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer {profile.subscriptions.openaiPlus ? 'border-accent bg-accent/15 text-white' : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20'}">
          <input
            type="checkbox"
            bind:checked={profile.subscriptions.openaiPlus}
            onchange={saveProfile}
            class="accent-accent w-4 h-4 mt-0.5"
          />
          <div>
            <span class="text-xs font-bold block text-white">OpenAI Plus / Pro</span>
            <span class="text-[10px] text-text-muted leading-tight block mt-0.5">GPT / o-series CLI subagents</span>
          </div>
        </label>

        <label class="flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer {profile.subscriptions.openrouter ? 'border-accent bg-accent/15 text-white' : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20'}">
          <input
            type="checkbox"
            bind:checked={profile.subscriptions.openrouter}
            onchange={saveProfile}
            class="accent-accent w-4 h-4 mt-0.5"
          />
          <div>
            <span class="text-xs font-bold block text-white">OpenRouter API</span>
            <span class="text-[10px] text-text-muted leading-tight block mt-0.5">Multi-model routing & spot auction</span>
          </div>
        </label>

        <label class="flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all cursor-pointer {profile.subscriptions.localHardware ? 'border-accent bg-accent/15 text-white' : 'border-white/10 bg-black/40 text-text-muted hover:border-white/20'}">
          <input
            type="checkbox"
            bind:checked={profile.subscriptions.localHardware}
            onchange={saveProfile}
            class="accent-accent w-4 h-4 mt-0.5"
          />
          <div>
            <span class="text-xs font-bold block text-white">Local Hardware</span>
            <span class="text-[10px] text-text-muted leading-tight block mt-0.5">Ollama / vLLM ($0 on your machine)</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Generic Model Families Selector -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs uppercase tracking-wider text-text-muted font-bold">
          {t('simulator.providersTitle')} ({providersList.filter(p => p.active).length}/{providersList.length})
        </h3>
        <span class="text-[11px] text-text-muted">{t('simulator.providersSub')}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto p-1 border border-white/5 rounded-lg bg-black/20">
        {#each providersList as p}
          <button
            type="button"
            onclick={() => toggleProvider(p.id)}
            class="flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer {p.active ? 'border-accent/60 bg-accent/10 text-white' : 'border-white/5 bg-black/40 text-text-muted hover:border-white/20'}"
          >
            <div class="truncate mr-2">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 {p.active ? 'border-accent bg-accent text-black text-[9px] font-bold' : 'border-white/20'}">
                  {p.active ? '✓' : ''}
                </span>
                <span class="text-xs font-medium truncate">{p.family}</span>
              </div>
              <p class="text-[10px] text-text-muted truncate mt-0.5 pl-5">{p.description}</p>
            </div>
            <span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 {p.category === 'local' ? 'bg-emerald-500/20 text-emerald-300' : p.category === 'router' ? 'bg-indigo-500/20 text-indigo-300' : p.category === 'free' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'}">
              {p.category}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Fine-Grained Diagnostic Questions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
      <!-- 1. Diagnostic Questionnaire -->
      <div class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-text-muted font-bold">{t('simulator.workloadDiagTitle')}</h3>
        <div>
          <label class="block text-xs text-text-muted mb-1">{t('simulator.primaryDevType')}</label>
          <select
            bind:value={profile.diagnostic.workloadType}
            onchange={saveProfile}
            class="w-full bg-black/40 border border-white/15 rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="fullstack">Full-Stack (Frontend UI + Backend APIs)</option>
            <option value="frontend">Frontend UI / Componentes & Estilos</option>
            <option value="backend">Backend & Arquitectura de Bases de Datos</option>
            <option value="systems">Sistemas & Performance (Rust / C / Shell)</option>
            <option value="data_ml">Datos, RAG & Machine Learning</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-text-muted mb-1">{t('simulator.contextDepthLabel')}</label>
          <select
            bind:value={profile.diagnostic.contextDepth}
            onchange={saveProfile}
            class="w-full bg-black/40 border border-white/15 rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="short">Corto (&lt;32k tokens - Scripts y módulos pequeños)</option>
            <option value="medium">Medio (32k - 128k tokens - Repositorios estándar)</option>
            <option value="deep">Profundo (128k+ tokens - Monorepos y documentación densa)</option>
          </select>
        </div>
      </div>

      <!-- 2. Hardware & Compute -->
      <div class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-text-muted font-bold">{t('simulator.hardwareTitle')}</h3>
        <div>
          <label class="block text-xs text-text-muted mb-1">{t('simulator.computeEnv')}</label>
          <select
            bind:value={profile.hardware.type}
            onchange={saveProfile}
            class="w-full bg-black/40 border border-white/15 rounded-md px-3 py-2 text-xs text-white focus:border-accent focus:outline-none cursor-pointer"
          >
            <option value="mac_studio">Apple Silicon Mac (M1/M2/M3/M4 Studio/Pro)</option>
            <option value="gpu_high">Workstation Linux con GPU (NVIDIA RTX / CUDA)</option>
            <option value="vps_linux">VPS Linux Cloud (Ubuntu / Debian / NixOS)</option>
            <option value="cpu_only">Laptop / PC Estándar (CPU-Only)</option>
            <option value="cloud_ec2">Instancias Dedicadas AWS EC2 / GCP</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] text-text-muted mb-1">RAM (GB): <span class="text-accent font-mono">{profile.hardware.ramGb}</span></label>
            <input type="number" bind:value={profile.hardware.ramGb} onchange={saveProfile} min="8" max="512" class="w-full bg-black/40 border border-white/15 rounded px-2 py-1 text-xs text-white" />
          </div>
          <div>
            <label class="block text-[11px] text-text-muted mb-1">VRAM GPU (GB): <span class="text-accent font-mono">{profile.hardware.gpuVramGb}</span></label>
            <input type="number" bind:value={profile.hardware.gpuVramGb} onchange={saveProfile} min="0" max="192" class="w-full bg-black/40 border border-white/15 rounded px-2 py-1 text-xs text-white" />
          </div>
        </div>
      </div>

      <!-- 3. Budget & Free Tier Controls -->
      <div class="space-y-4">
        <h3 class="text-xs uppercase tracking-wider text-text-muted font-bold">{t('simulator.expensesTitle')}</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] text-text-muted mb-1">{t('simulator.currentSpend')}</label>
            <input type="number" bind:value={profile.diagnostic.currentMonthlySpendUsd} onchange={saveProfile} min="0" max="2000" class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 text-xs text-accent font-bold font-mono" />
          </div>
          <div>
            <label class="block text-[11px] text-text-muted mb-1">{t('simulator.budgetLimit')}</label>
            <input type="number" bind:value={profile.diagnostic.budgetLimitUsd} onchange={saveProfile} min="0" max="2000" class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 text-xs text-emerald-400 font-bold font-mono" />
          </div>
        </div>

        <div>
          <div class="flex justify-between text-xs text-text-muted mb-1">
            <span>Prompts / Tareas Diarias:</span>
            <span class="text-accent font-mono font-bold">{profile.diagnostic.dailyPrompts}</span>
          </div>
          <input
            type="range"
            min="10"
            max="600"
            step="10"
            bind:value={profile.diagnostic.dailyPrompts}
            onchange={saveProfile}
            class="w-full accent-accent bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div class="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-1.5">
          <label class="flex items-center gap-2 text-xs text-amber-200 font-medium cursor-pointer">
            <input
              type="checkbox"
              bind:checked={profile.diagnostic.useFreeTiers}
              onchange={saveProfile}
              class="accent-amber-400 w-4 h-4"
            />
            Habilitar Enfoque 100% Free-Tiers
          </label>
          {#if profile.diagnostic.useFreeTiers}
            <p class="text-[10px] text-amber-300/80 leading-relaxed">
              ⚠️ <strong>Advertencia:</strong> Los tiers gratuitos conllevan ventanas de contexto cortas, límites estrictos de RPM/RPD y colas de espera en horas pico.
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Workspace Paths & CLI Harness -->
    <div class="border-t border-white/10 pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      <div>
        <label class="block text-text-muted mb-1 font-mono">Directorio Código</label>
        <input type="text" bind:value={profile.context.srcPath} onchange={saveProfile} class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 font-mono text-white" />
      </div>
      <div>
        <label class="block text-text-muted mb-1 font-mono">Directorio Pruebas</label>
        <input type="text" bind:value={profile.context.testPath} onchange={saveProfile} class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 font-mono text-white" />
      </div>
      <div>
        <label class="block text-text-muted mb-1 font-mono">Arnés CLI Activo</label>
        <select bind:value={profile.context.selectedCli} onchange={saveProfile} class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 font-mono text-white cursor-pointer">
          <option value="claude_code">Claude Code CLI</option>
          <option value="jules">Google Jules Swarm</option>
          <option value="hermes">Hermes Gateway</option>
          <option value="openclaw">OpenClaw Browser</option>
          <option value="gitcore">GitCore Deterministic Engine</option>
          <option value="opencode">OpenCode Go CLI</option>
        </select>
      </div>
      <div>
        <label class="block text-text-muted mb-1 font-mono">Docs / Repo URL</label>
        <input type="text" bind:value={profile.context.docsUrl} onchange={saveProfile} class="w-full bg-black/40 border border-white/15 rounded px-2.5 py-1.5 font-mono text-white" />
      </div>
    </div>
  </div>

  <!-- SECTION 2: Top 5 Dynamic Configuration Ranking Engine -->
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-accent flex items-center gap-2">
        <span>📊</span> {t('simulator.sectionSimulations')}
      </h2>
      <span class="text-xs font-mono text-text-muted">{t('simulator.section2Subtitle')}</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {#each simulationResults as result, idx}
        <button
          onclick={() => (selectedTierIndex = idx)}
          class="text-left bg-bg-surface-dark border rounded-xl p-5 transition-all space-y-3 relative overflow-hidden group cursor-pointer {selectedTierIndex === idx ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10' : 'border-white/10 hover:border-white/20'}"
        >
          {#if idx === 0}
            <div class="absolute top-0 right-0 bg-accent text-black font-extrabold text-[10px] px-2 py-0.5 rounded-bl">
              {t('simulator.top1Recommended')}
            </div>
          {/if}

          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-text-muted">Rank #{idx + 1}</span>
            <span class="text-lg font-extrabold font-mono text-accent">{result.overallScore}<span class="text-xs text-text-muted">/100</span></span>
          </div>

          <h3 class="font-bold text-sm text-white line-clamp-2">{result.title}</h3>
          <p class="text-xs text-text-muted line-clamp-2">{result.tagline}</p>

          <div class="space-y-1.5 pt-2 border-t border-white/10 text-[11px]">
            <div class="flex justify-between">
              <span class="text-text-muted">Costo Est.:</span>
              <span class="font-mono text-white font-semibold">${result.costEstUsd}/mes</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted">Concurrencia:</span>
              <span class="font-mono text-white">{result.concurrencyLimit} tareas</span>
            </div>
            <div class="flex justify-between">
              <span class="text-text-muted">Anti-Drift:</span>
              <span class="font-mono text-accent">{result.antiDriftScore}%</span>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <!-- Active Tier Card Details -->
    <div class="bg-bg-surface-dark border border-accent/30 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <span class="text-xs font-mono text-accent uppercase tracking-widest font-semibold">{t('simulator.activeConfigTitle')}</span>
          <h3 class="text-2xl font-bold text-white mt-1">{currentSelectedTier.title}</h3>
          <p class="text-sm text-text-muted mt-1">{currentSelectedTier.description}</p>
        </div>
        <div class="flex items-center gap-4 bg-black/40 border border-white/10 rounded-lg p-3">
          <div class="text-center px-2">
            <span class="text-[10px] text-text-muted uppercase block">{t('simulator.latency')}</span>
            <span class="text-sm font-bold font-mono text-white">{currentSelectedTier.estLatencyMs} ms</span>
          </div>
          <div class="h-8 w-px bg-white/10"></div>
          <div class="text-center px-2">
            <span class="text-[10px] text-text-muted uppercase block">{t('simulator.verification')}</span>
            <span class="text-sm font-bold font-mono text-accent">{currentSelectedTier.e2eVerificationRate}%</span>
          </div>
          <div class="h-8 w-px bg-white/10"></div>
          <div class="text-center px-2">
            <span class="text-[10px] text-text-muted uppercase block">{t('simulator.score')}</span>
            <span class="text-sm font-bold font-mono text-accent">{currentSelectedTier.overallScore}/100</span>
          </div>
        </div>
      </div>

      <!-- Comparative Progress Meters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-text-muted">{t('simulator.costEfficiency')}</span>
            <span class="font-mono text-white font-bold">{currentSelectedTier.costEfficiencyScore}%</span>
          </div>
          <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div class="bg-emerald-400 h-full transition-all duration-500" style="width: {currentSelectedTier.costEfficiencyScore}%"></div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-text-muted">{t('simulator.devVelocity')}</span>
            <span class="font-mono text-white font-bold">{currentSelectedTier.devVelocityScore}%</span>
          </div>
          <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div class="bg-accent h-full transition-all duration-500" style="width: {currentSelectedTier.devVelocityScore}%"></div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-text-muted">{t('simulator.antiDriftQuality')}</span>
            <span class="font-mono text-white font-bold">{currentSelectedTier.resilienceScore}%</span>
          </div>
          <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
            <div class="bg-indigo-400 h-full transition-all duration-500" style="width: {currentSelectedTier.resilienceScore}%"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 3: Generator Tabs (Pragmatic Master Prompt, Live Search Prompt, CLI Audit Script, SKILL.md, .env) -->
  <div class="bg-bg-surface-dark border border-white/10 rounded-xl p-6 md:p-8 space-y-8 shadow-xl">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div>
        <h2 class="text-xl font-bold text-accent flex items-center gap-2">
          <span>🛠️</span> {t('simulator.sectionArtifacts')}
        </h2>
        <p class="text-xs text-text-muted mt-1">{t('simulator.section3Subtitle')}</p>
      </div>
      <button
        onclick={downloadAllArtifacts}
        class="px-5 py-2 text-xs font-bold rounded-md bg-accent text-black hover:bg-accent-light transition-all shadow-lg flex items-center gap-2 self-start md:self-auto cursor-pointer"
      >
        <span>📦</span> {t('simulator.downloadAll')}
      </button>
    </div>

    <!-- English Accuracy & Token Efficiency Callout -->
    <div class="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-start gap-3 text-xs leading-relaxed text-indigo-200">
      <span class="text-lg shrink-0">💡</span>
      <div>
        <strong class="text-white font-mono uppercase tracking-wider block mb-1">
          {t('simulator.whyEnglishTitle')}
        </strong>
        {t('simulator.whyEnglishText')}
      </div>
    </div>

    <!-- Tabs Header -->
    <div class="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
      <button
        onclick={() => activeTab = 'sim'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'sim' ? 'bg-accent text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        📜 {t('simulator.tabMasterPrompt')}
      </button>
      <button
        onclick={() => activeTab = 'websearch'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'websearch' ? 'bg-emerald-400 text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        🌐 {t('simulator.tabWebSearchPrompt')}
      </button>
      <button
        onclick={() => activeTab = 'metrics'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'metrics' ? 'bg-purple-400 text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        📊 {t('simulator.tabMetricsPrompt')}
      </button>
      <button
        onclick={() => activeTab = 'cliaudit'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'cliaudit' ? 'bg-amber-400 text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        💻 {t('simulator.tabCliAuditScript')}
      </button>
      <button
        onclick={() => activeTab = 'skill'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'skill' ? 'bg-indigo-400 text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        ⚡ {t('simulator.tabSkill')}
      </button>
      <button
        onclick={() => activeTab = 'env'}
        class="px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase rounded-md transition-all cursor-pointer {activeTab === 'env' ? 'bg-sky-400 text-black' : 'bg-white/5 text-text-muted hover:text-white'}"
      >
        🔒 {t('simulator.tabEnv')}
      </button>
    </div>

    <!-- TAB 1: Master System Prompt -->
    {#if activeTab === 'sim'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted">
            Inyéctalo como system prompt en <strong>Claude Code, Antigravity, OpenCode, Jules, Cursor</strong> o agentes CLI:
          </p>
          <button
            onclick={() => copyToClipboard(generatedMasterPrompt, 'Master System Prompt')}
            class="px-3 py-1 text-xs font-semibold rounded bg-white/5 border border-white/15 text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            📋 {t('simulator.copyPrompt')}
          </button>
        </div>
        <pre class="bg-black/60 border border-white/10 rounded-lg p-4 text-xs font-mono text-accent-light overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedMasterPrompt}</pre>
      </div>
    {/if}

    <!-- TAB 2: Live Web Search Optimization Prompt -->
    {#if activeTab === 'websearch'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-emerald-300">
            💡 Pega este prompt en un agente con <strong>búsqueda web en vivo</strong> (Gemini Search, Perplexity, Claude con Search, ChatGPT Search o OpenClaw) para consultar versiones vigentes y precios al día de hoy:
          </p>
          <button
            onclick={() => copyToClipboard(generatedWebSearchPrompt, 'Prompt con Búsqueda Web')}
            class="px-3 py-1 text-xs font-semibold rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
          >
            📋 {t('simulator.copyWebSearch')}
          </button>
        </div>
        <pre class="bg-black/60 border border-emerald-500/20 rounded-lg p-4 text-xs font-mono text-emerald-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedWebSearchPrompt}</pre>
      </div>
    {/if}

    <!-- TAB 3: Metrics Scanner Prompt -->
    {#if activeTab === 'metrics'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-purple-300">
            📊 Pega este prompt en tu agente local (Antigravity, Claude Code, OpenCode, Hermes) para extraer el conteo de LOC, proyectos y tamaño de tus repositorios:
          </p>
          <button
            onclick={() => copyToClipboard(generatedMetricsPrompt, 'Prompt Escáner de Métricas')}
            class="px-3 py-1 text-xs font-semibold rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer"
          >
            📋 {t('simulator.copyMetrics')}
          </button>
        </div>
        <pre class="bg-black/60 border border-purple-500/20 rounded-lg p-4 text-xs font-mono text-purple-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedMetricsPrompt}</pre>
      </div>
    {/if}

    <!-- TAB 4: CLI Hardware Auto-Audit Script -->
    {#if activeTab === 'cliaudit'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-amber-300">
            💻 Ejecuta este script en tu terminal para auto-detectar CPU, RAM, VRAM GPU y modelos locales instalados (Ollama/vLLM):
          </p>
          <button
            onclick={() => copyToClipboard(generatedCliAuditScript, 'Script CLI de Auto-Escaneo')}
            class="px-3 py-1 text-xs font-semibold rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            📋 {t('simulator.copyCliScript')}
          </button>
        </div>
        <pre class="bg-black/60 border border-amber-500/20 rounded-lg p-4 text-xs font-mono text-amber-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedCliAuditScript}</pre>
      </div>
    {/if}

    <!-- TAB 5: SKILL.md -->
    {#if activeTab === 'skill'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted">
            Guarda este archivo como <code>SKILL.md</code> en el directorio de skills de tu arnés o agente:
          </p>
          <button
            onclick={() => copyToClipboard(generatedSkillMd, 'SKILL.md')}
            class="px-3 py-1 text-xs font-semibold rounded bg-white/5 border border-white/15 text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            📋 {t('simulator.copySkill')}
          </button>
        </div>
        <pre class="bg-black/60 border border-white/10 rounded-lg p-4 text-xs font-mono text-indigo-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedSkillMd}</pre>
      </div>
    {/if}

    <!-- TAB 6: .env.example -->
    {#if activeTab === 'env'}
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p class="text-xs text-text-muted">
            Configuración sanitizada de variables de entorno lista para tus agentes:
          </p>
          <button
            onclick={() => copyToClipboard(generatedEnvExample, '.env.example')}
            class="px-3 py-1 text-xs font-semibold rounded bg-white/5 border border-white/15 text-white hover:bg-white/15 transition-all cursor-pointer"
          >
            📋 {t('simulator.copyEnv')}
          </button>
        </div>
        <pre class="bg-black/60 border border-white/10 rounded-lg p-4 text-xs font-mono text-sky-300 overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">{generatedEnvExample}</pre>
      </div>
    {/if}
  </div>
</div>
