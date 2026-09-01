<script lang="ts">
  import { t } from '../i18n/index';

  const baseStackCategories = [
    {
      catKey: 'cat1',
      items: ['PHP (Senior / Core)', 'TypeScript', 'JavaScript (Node.js)', 'Python', 'Rust', 'Shell / Bash', 'Dart', 'SQL']
    },
    {
      catKey: 'cat2',
      items: ['WordPress (Custom Plugins & Themes)', 'React 19', 'Svelte 5', 'Astro 6', 'Flutter', 'Tailwind CSS 4', 'REST APIs / Webhooks']
    },
    {
      catKey: 'cat3',
      items: ['PostgreSQL', 'MySQL / MariaDB', 'SQLite', 'pgvector', 'SQLite-vec', 'SurrealDB', 'Redis', 'HNSW Cosine Search']
    },
    {
      catKey: 'cat4',
      items: ['Hermes Gateway', 'OpenClaw Browser', 'GitCore Engine', 'Gestalt Orchestrator', 'Google Jules', 'OpenRouter', 'Amazon Bedrock', 'Google Vertex AI', 'Smart API Key Management', 'Custom Skills Authoring', 'Claude Code', 'OpenCode']
    },
    {
      catKey: 'cat5',
      items: ['VPS Linux (Ubuntu / NixOS)', 'cPanel / WHM', 'Nginx & Apache', 'PHP-FPM Tuning', 'Docker', 'Vulnerability Scanning', 'Antivirus & MCP Security Protocols']
    }
  ];

  let stackCategories = $derived(
    baseStackCategories.map(c => ({
      category: t(`about.stackCategories.${c.catKey}`),
      items: c.items
    }))
  );

  const specialtyCodes = ['0x01', '0x02', '0x03', '0x04', '0x05', '0x06'];

  let specialties = $derived(
    specialtyCodes.map(code => ({
      code,
      title: t(`about.specialties.${code}.title`),
      desc: t(`about.specialties.${code}.desc`)
    }))
  );
</script>

<section id="about" class="relative py-32 px-6">
  <div class="max-w-6xl mx-auto">
    <div class="entry-clip">
      <span class="text-accent text-sm tracking-widest mb-4 block">{t('about.heading')}</span>
      <h2 class="section-title">
        {t('about.title')}<span class="text-accent">{t('about.titleAccent')}</span>{t('about.titleSuffix')}
      </h2>
    </div>

    <div class="grid md:grid-cols-2 gap-16 mt-16">
      <div>
        <p class="entry-rise text-text-secondary text-lg leading-relaxed mb-8" style="animation-delay: 120ms">
          {t('about.bio')}
        </p>
        <p class="entry-rise text-text-muted leading-relaxed" style="animation-delay: 220ms">
          {t('about.philosophy')}
          <span class="text-text-primary"> {t('about.philosophyAccent')}</span>
        </p>
        <div class="entry-scan mt-12 flex gap-4" style="animation-delay: 320ms">
          <div class="flex flex-col">
            <span class="text-accent text-2xl font-bold">10+</span>
            <span class="text-text-muted text-xs uppercase tracking-tighter">{t('about.yearsInProduction')}</span>
          </div>
          <div class="w-px h-10 bg-white/10 mx-4"></div>
          <div class="flex flex-col">
            <span class="text-secondary text-2xl font-bold">Full-Stack</span>
            <span class="text-text-muted text-xs uppercase tracking-tighter">{t('about.fullStackLabel')}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="glass-card p-8 entry-rise" style="animation-delay: 180ms">
          <h3 class="text-xs mb-8 text-text-muted uppercase tracking-[0.2em]">{t('about.competencies')}</h3>
          <div class="space-y-6">
            {#each specialties as s}
              <div class="group flex items-start gap-5">
                <span class="text-accent text-xs mt-1 transition-transform group-hover:translate-x-1 font-mono">{s.code}</span>
                <div>
                  <h4 class="text-text-primary font-bold text-base mb-1">{s.title}</h4>
                  <p class="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Categorized Stack Index -->
    <div class="mt-32 entry-scan" style="animation-delay: 420ms">
      <h3 class="text-center text-[10px] text-text-muted tracking-[0.3em] mb-12 uppercase">{t('about.stackIndex')}</h3>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each stackCategories as cat}
          <div class="glass-card p-6 space-y-3">
            <h4 class="text-accent text-xs font-mono uppercase tracking-wider">{cat.category}</h4>
            <div class="flex flex-wrap gap-2">
              {#each cat.items as item}
                <span
                  class="px-2.5 py-1 rounded border border-white/5 bg-bg-surface-dark/60 text-[11px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent transition-all duration-200 cursor-default"
                >
                  {item}
                </span>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
