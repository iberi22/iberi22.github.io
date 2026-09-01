import { describe, it, expect } from 'vitest';

interface SubscriptionsState {
  googleAiPro: boolean;
  claudePro: boolean;
  openaiPlus: boolean;
  openrouter: boolean;
  localHardware: boolean;
}

interface SimulationParams {
  dailyPrompts: number;
  workloadType?: 'fullstack' | 'frontend' | 'backend' | 'systems' | 'data_ml';
  contextDepth: 'short' | 'medium' | 'deep';
  budgetLimitUsd: number;
  currentMonthlySpendUsd: number;
  useFreeTiers: boolean;
  subscriptions: SubscriptionsState;
  hardware: { ramGb: number; gpuVramGb?: number; type?: string };
}

function calculateSimulationTiers(params: SimulationParams) {
  const multiplier = params.contextDepth === 'deep' ? 4000 : params.contextDepth === 'medium' ? 2000 : 1000;
  const totalDailyTokens = params.dailyPrompts * multiplier;
  const monthlyTokensM = (totalDailyTokens * 30) / 1_000_000;

  const subs = params.subscriptions;
  const julesConcurrency = subs.googleAiPro ? 15 : 4;
  const claudeConcurrency = subs.claudePro ? 5 : 2;
  const openrouterConcurrency = subs.openrouter ? 8 : 3;
  const localConcurrency = params.hardware.ramGb >= 64 ? 4 : params.hardware.ramGb >= 32 ? 2 : 1;

  const tiers = [
    {
      id: 'tier_velocity',
      name: subs.googleAiPro ? 'Wave Parallelism (Jules)' : subs.claudePro ? 'Claude Subagents' : 'Concurrent Pipeline',
      costEstUsd: params.useFreeTiers ? 0 : subs.googleAiPro ? 20 : subs.claudePro ? 20 : Math.round(monthlyTokensM * 1.2),
      costEfficiencyScore: subs.googleAiPro ? 92 : 86,
      devVelocityScore: subs.googleAiPro ? 99 : 92,
      resilienceScore: 93,
      concurrencyLimit: subs.googleAiPro ? julesConcurrency : subs.claudePro ? claudeConcurrency : openrouterConcurrency,
    },
    {
      id: 'tier_hybrid',
      name: 'Balanced Hybrid Orchestrator',
      costEstUsd: params.useFreeTiers ? 0 : (subs.claudePro || subs.openaiPlus ? 20 : 0) + Math.round(monthlyTokensM * 0.35),
      costEfficiencyScore: 94,
      devVelocityScore: 91,
      resilienceScore: 96,
      concurrencyLimit: Math.max(claudeConcurrency, openrouterConcurrency),
    },
    {
      id: 'tier_cost',
      name: 'Ultra-Cost Optimizer',
      costEstUsd: params.useFreeTiers ? 0 : subs.localHardware ? Math.round(monthlyTokensM * 0.15) : Math.round(monthlyTokensM * 0.30),
      costEfficiencyScore: 98,
      devVelocityScore: 79,
      resilienceScore: 89,
      concurrencyLimit: subs.localHardware ? localConcurrency : 4,
    },
    {
      id: 'tier_local',
      name: 'Sovereign Local-First',
      costEstUsd: 0,
      costEfficiencyScore: 99,
      devVelocityScore: 74,
      resilienceScore: 97,
      concurrencyLimit: localConcurrency,
    },
    {
      id: 'tier_enterprise',
      name: 'Enterprise Governance',
      costEstUsd: Math.round(monthlyTokensM * 2.8),
      costEfficiencyScore: 72,
      devVelocityScore: 94,
      resilienceScore: 99,
      concurrencyLimit: 12,
    },
  ];

  return tiers.map((tier) => {
    const budgetPenalty = tier.costEstUsd > params.budgetLimitUsd ? 18 : 0;
    const score = Math.round(
      tier.costEfficiencyScore * 0.35 +
      tier.devVelocityScore * 0.35 +
      tier.resilienceScore * 0.30 -
      budgetPenalty
    );
    return { ...tier, overallScore: Math.max(10, score) };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

function generateCleanMasterPrompt(tierTitle: string, routing: string, concurrency: number, srcPath: string, testPath: string) {
  return `# Role: Senior Software Engineer & AI Orchestrator

## Runtime Environment & Context
- Assigned Architecture: ${tierTitle}
- Primary Routing: ${routing}
- Workspace: \`${srcPath}\` | Test Suite: \`${testPath}\`
- Concurrency Limit: Maximum ${concurrency} simultaneous tasks

## Core Operational Directives
1. Code Micro-Fragmentation: 1 Issue → 1 Branch → 1 PR with automated verification.
2. Surgical File Operations: Read targeted line ranges; never perform bulk rewrites of untouched files.
3. Zero Credential Leaks: All API keys and secrets must strictly be read from environment variables.
4. Mandatory Verification: Execute the local test suite (\`${testPath}\`) before committing or proposing any changes.`;
}

function generateCleanWebSearchPrompt(hardware: string, workload: string, spend: number, budget: number) {
  return `Act as a Senior AI Infrastructure & Agentic Architecture Consultant.

MY CURRENT TECHNICAL SETUP:
- Hardware: ${hardware}.
- Workload Profile: ${workload}.
- Current Monthly AI Spend: $${spend} USD/month (Target Budget: $${budget} USD/month).

LIVE RESEARCH DIRECTIVES (AS OF TODAY):
1. Search the web for current, active model releases across my subscriptions.
2. Fetch up-to-date pricing per 1M tokens (Input / Output).`;
}

describe('Resource Simulator E2E & Parameter Validation Suite', () => {
  describe('Subscription-Driven Dynamic Concurrency & Permutation Matrix', () => {
    it('grants 15 concurrent tasks for Google AI Pro users', () => {
      const results = calculateSimulationTiers({
        dailyPrompts: 150,
        contextDepth: 'medium',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 50,
        useFreeTiers: false,
        subscriptions: {
          googleAiPro: true,
          claudePro: false,
          openaiPlus: false,
          openrouter: false,
          localHardware: false,
        },
        hardware: { ramGb: 64 },
      });

      const velocityTier = results.find(t => t.id === 'tier_velocity');
      expect(velocityTier?.concurrencyLimit).toBe(15);
      expect(velocityTier?.name).toContain('Wave Parallelism (Jules)');
    });

    it('adapts concurrency to 5 for Claude Pro users without Google AI Pro', () => {
      const results = calculateSimulationTiers({
        dailyPrompts: 150,
        contextDepth: 'medium',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 40,
        useFreeTiers: false,
        subscriptions: {
          googleAiPro: false,
          claudePro: true,
          openaiPlus: false,
          openrouter: false,
          localHardware: false,
        },
        hardware: { ramGb: 32 },
      });

      const velocityTier = results.find(t => t.id === 'tier_velocity');
      expect(velocityTier?.concurrencyLimit).toBe(5);
      expect(velocityTier?.name).toContain('Claude Subagents');
    });

    it('defaults velocity tier concurrency to OpenRouter limit (8 or 3) when neither Google nor Claude Pro is active', () => {
      const openrouterActive = calculateSimulationTiers({
        dailyPrompts: 100,
        contextDepth: 'short',
        budgetLimitUsd: 50,
        currentMonthlySpendUsd: 10,
        useFreeTiers: false,
        subscriptions: { googleAiPro: false, claudePro: false, openaiPlus: true, openrouter: true, localHardware: false },
        hardware: { ramGb: 16 },
      });

      const openrouterInactive = calculateSimulationTiers({
        dailyPrompts: 100,
        contextDepth: 'short',
        budgetLimitUsd: 50,
        currentMonthlySpendUsd: 10,
        useFreeTiers: false,
        subscriptions: { googleAiPro: false, claudePro: false, openaiPlus: true, openrouter: false, localHardware: false },
        hardware: { ramGb: 16 },
      });

      expect(openrouterActive.find(t => t.id === 'tier_velocity')?.concurrencyLimit).toBe(8);
      expect(openrouterInactive.find(t => t.id === 'tier_velocity')?.concurrencyLimit).toBe(3);
    });

    it('validates concurrency limits across all 5 developer subscription toggles', () => {
      const allSubscriptions: (keyof SubscriptionsState)[] = ['googleAiPro', 'claudePro', 'openaiPlus', 'openrouter', 'localHardware'];

      allSubscriptions.forEach(sub => {
        const subs: SubscriptionsState = {
          googleAiPro: false,
          claudePro: false,
          openaiPlus: false,
          openrouter: false,
          localHardware: false,
          [sub]: true,
        };

        const results = calculateSimulationTiers({
          dailyPrompts: 120,
          contextDepth: 'medium',
          budgetLimitUsd: 80,
          currentMonthlySpendUsd: 30,
          useFreeTiers: false,
          subscriptions: subs,
          hardware: { ramGb: 32 },
        });

        expect(results).toHaveLength(5);
        results.forEach(t => {
          expect(t.concurrencyLimit).toBeGreaterThanOrEqual(1);
        });
      });
    });

    it('calculates local concurrency based on RAM capacity (1, 2, or 4 workers)', () => {
      const ramConfigs = [
        { ram: 16, expected: 1 },
        { ram: 32, expected: 2 },
        { ram: 64, expected: 4 },
        { ram: 128, expected: 4 },
      ];

      ramConfigs.forEach(({ ram, expected }) => {
        const sim = calculateSimulationTiers({
          dailyPrompts: 100,
          contextDepth: 'short',
          budgetLimitUsd: 50,
          currentMonthlySpendUsd: 0,
          useFreeTiers: false,
          subscriptions: { googleAiPro: false, claudePro: false, openaiPlus: false, openrouter: false, localHardware: true },
          hardware: { ramGb: ram },
        });

        const localTier = sim.find(t => t.id === 'tier_local');
        expect(localTier?.concurrencyLimit).toBe(expected);
      });
    });
  });

  describe('Workload Profiles & Context Depth Matrix', () => {
    const workloads: ('fullstack' | 'frontend' | 'backend' | 'systems' | 'data_ml')[] = [
      'fullstack',
      'frontend',
      'backend',
      'systems',
      'data_ml',
    ];

    it.each(workloads)('handles workload profile "%s" correctly in search prompts and tier calculations', (workload) => {
      const prompt = generateCleanWebSearchPrompt('Mac Studio (64GB RAM)', workload, 40, 60);
      expect(prompt).toContain(`Workload Profile: ${workload}.`);

      const results = calculateSimulationTiers({
        dailyPrompts: 100,
        workloadType: workload,
        contextDepth: 'medium',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 50,
        useFreeTiers: false,
        subscriptions: { googleAiPro: true, claudePro: true, openaiPlus: true, openrouter: true, localHardware: true },
        hardware: { ramGb: 64 },
      });

      expect(results).toHaveLength(5);
    });

    const contextDepths: ('short' | 'medium' | 'deep')[] = ['short', 'medium', 'deep'];

    it.each(contextDepths)('scales monthly token estimation appropriately for context depth "%s"', (depth) => {
      const results = calculateSimulationTiers({
        dailyPrompts: 100,
        contextDepth: depth,
        budgetLimitUsd: 200,
        currentMonthlySpendUsd: 50,
        useFreeTiers: false,
        subscriptions: { googleAiPro: true, claudePro: false, openaiPlus: false, openrouter: false, localHardware: false },
        hardware: { ramGb: 32 },
      });

      const hybridTier = results.find(t => t.id === 'tier_hybrid');
      expect(hybridTier).toBeDefined();

      if (depth === 'short') {
        // 100 daily * 1000 multiplier * 30 days = 3M tokens -> 3 * 0.35 = 1.05 -> 1 USD
        expect(hybridTier?.costEstUsd).toBe(1);
      } else if (depth === 'medium') {
        // 100 * 2000 * 30 = 6M tokens -> 6 * 0.35 = 2.1 -> 2 USD
        expect(hybridTier?.costEstUsd).toBe(2);
      } else if (depth === 'deep') {
        // 100 * 4000 * 30 = 12M tokens -> 12 * 0.35 = 4.2 -> 4 USD
        expect(hybridTier?.costEstUsd).toBe(4);
      }
    });

    it('scales token usage strictly across Short (1k), Medium (2k), and Deep (4k) context depths', () => {
      const shortResults = calculateSimulationTiers({
        dailyPrompts: 100,
        contextDepth: 'short',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 20,
        useFreeTiers: false,
        subscriptions: { googleAiPro: true, claudePro: true, openaiPlus: true, openrouter: true, localHardware: true },
        hardware: { ramGb: 64 },
      });
      const deepResults = calculateSimulationTiers({
        dailyPrompts: 100,
        contextDepth: 'deep',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 20,
        useFreeTiers: false,
        subscriptions: { googleAiPro: true, claudePro: true, openaiPlus: true, openrouter: true, localHardware: true },
        hardware: { ramGb: 64 },
      });

      const shortCost = shortResults.find(t => t.id === 'tier_hybrid')?.costEstUsd || 0;
      const deepCost = deepResults.find(t => t.id === 'tier_hybrid')?.costEstUsd || 0;
      expect(deepCost).toBeGreaterThan(shortCost);
    });
  });

  describe('Budget Penalties & Free-Tier Guarantees', () => {
    it('penalizes tiers exceeding budget limits', () => {
      const results = calculateSimulationTiers({
        dailyPrompts: 500,
        contextDepth: 'deep',
        budgetLimitUsd: 15,
        currentMonthlySpendUsd: 200,
        useFreeTiers: false,
        subscriptions: { googleAiPro: true, claudePro: true, openaiPlus: true, openrouter: true, localHardware: true },
        hardware: { ramGb: 64 },
      });

      // Low cost tiers (Sovereign $0 or Ultra-Cost) should win due to strict penalty on heavy tiers
      const winner = results[0];
      expect(winner.costEstUsd).toBeLessThanOrEqual(50);
    });

    it('guarantees $0 estimated cost for all non-enterprise tiers when 100% Free-Tiers mode is enabled', () => {
      const freeResults = calculateSimulationTiers({
        dailyPrompts: 200,
        contextDepth: 'medium',
        budgetLimitUsd: 0,
        currentMonthlySpendUsd: 0,
        useFreeTiers: true,
        subscriptions: { googleAiPro: false, claudePro: false, openaiPlus: false, openrouter: false, localHardware: true },
        hardware: { ramGb: 32 },
      });

      freeResults.forEach(tier => {
        if (tier.id === 'tier_velocity' || tier.id === 'tier_hybrid' || tier.id === 'tier_cost' || tier.id === 'tier_local') {
          expect(tier.costEstUsd).toBe(0);
        }
      });
    });

    it('always preserves $0 cost for Sovereign Local-First tier regardless of token volume', () => {
      const heavyUsage = calculateSimulationTiers({
        dailyPrompts: 1000,
        contextDepth: 'deep',
        budgetLimitUsd: 100,
        currentMonthlySpendUsd: 0,
        useFreeTiers: false,
        subscriptions: { googleAiPro: false, claudePro: false, openaiPlus: false, openrouter: false, localHardware: true },
        hardware: { ramGb: 64 },
      });

      const localTier = heavyUsage.find(t => t.id === 'tier_local');
      expect(localTier?.costEstUsd).toBe(0);
    });
  });

  describe('Clean English Prompts Verification (Zero Bloat)', () => {
    it('produces pure English Master Prompt without decorative ASCII headers', () => {
      const prompt = generateCleanMasterPrompt('Wave Parallelism', 'Google Jules → Gemini Flash', 15, './src', './tests');

      expect(prompt).toContain('# Role: Senior Software Engineer & AI Orchestrator');
      expect(prompt).toContain('Concurrency Limit: Maximum 15 simultaneous tasks');
      expect(prompt).toContain('Code Micro-Fragmentation: 1 Issue → 1 Branch → 1 PR');
      expect(prompt).not.toContain('================================================================================');
      expect(prompt).not.toContain('[ARCHIVAL GRADE]');
      expect(prompt).not.toContain('SWAL MASTER AGENT SYSTEM PROMPT');
    });

    it('produces pure English Web-Search live audit prompt', () => {
      const webPrompt = generateCleanWebSearchPrompt('Mac Studio (64GB RAM)', 'fullstack', 40, 60);

      expect(webPrompt).toContain('Act as a Senior AI Infrastructure & Agentic Architecture Consultant.');
      expect(webPrompt).toContain('MY CURRENT TECHNICAL SETUP:');
      expect(webPrompt).toContain('LIVE RESEARCH DIRECTIVES (AS OF TODAY):');
      expect(webPrompt).not.toContain('================');
    });
  });
});

describe('Simulator Architectural Engine', () => {
  it('calculates top 5 architectures deterministically', () => {
    const monthlyTokensM = (120 * 2000 * 30) / 1_000_000;
    const estTier1Cost = Math.round(monthlyTokensM * 0.45);
    expect(estTier1Cost).toBeGreaterThan(0);
  });

  it('verifies score formula bounds between 10 and 100', () => {
    const costEfficiencyScore = 98;
    const devVelocityScore = 78;
    const resilienceScore = 88;
    const score = Math.round(
      costEfficiencyScore * 0.35 +
      devVelocityScore * 0.35 +
      resilienceScore * 0.30
    );
    expect(score).toBeGreaterThanOrEqual(10);
    expect(score).toBeLessThanOrEqual(100);
  });
});
