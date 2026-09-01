<script lang="ts">
  import { t } from '../i18n/index';
  import { baseUrl } from '../lib/baseUrl';
</script>

<footer class="relative py-16 px-6 border-t border-white/5 bg-bg-surface-dark/20">
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Navigation & Links -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <div>
        <span class="text-lg font-bold text-accent">iberi22</span>
        <p class="text-text-muted text-sm mt-1">{t('footer.tagline')}</p>
      </div>

      <div class="flex flex-wrap items-center gap-6 text-xs uppercase font-mono tracking-wider text-text-muted">
        <a href="#about" class="hover:text-accent transition-colors">{t('nav.about')}</a>
        <a href="#projects" class="hover:text-accent transition-colors">{t('nav.projects')}</a>
        <a href={baseUrl('blog')} class="hover:text-accent transition-colors">{t('nav.blog')}</a>
        <!-- <a href={baseUrl('resources')} class="text-accent hover:text-accent-light transition-colors">{t('nav.resources')}</a> -->
        <a href="#contact" class="hover:text-accent transition-colors">{t('nav.contact')}</a>
        <a href={baseUrl('agenda')} class="text-accent hover:text-accent-light transition-colors">{t('nav.agenda')}</a>
      </div>

      <a href="https://github.com/iberi22" target="_blank" rel="noopener noreferrer" class="text-text-muted hover:text-accent transition-colors">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
      </a>
    </div>

    <!-- Agent & Human Friendly Manifesto Statement -->
    <div class="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px]">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Friend for Agents & Humans</span>
        </span>
        <span class="text-text-muted hidden sm:inline">·</span>
        <span class="text-text-muted hidden sm:inline">Markdown-Native & Local-First Architecture</span>
      </div>
      <p class="text-center md:text-right text-[11px] text-text-muted max-w-md">
        Diseñado para humanos, optimizado para agentes de codificación autónomos (Jules, Claude Code, Hermes, OpenCode).
      </p>
    </div>

    <!-- Copyright & Attribution -->
    <div class="pt-4 border-t border-white/5 text-center">
      <p class="text-text-muted text-xs">
        <span class="text-accent/40">&copy;</span> {new Date().getFullYear()} <span class="text-accent/70">iberi22</span>
        <span class="text-text-muted mx-2">/</span>
        {t('footer.partOf')} <span class="text-text-secondary">SouthWest AI Labs</span>
        <span class="text-text-muted mx-2">/</span>
        {t('footer.builtWith')} <span class="text-accent/70">Astro</span> + <span class="text-secondary/70">Svelte</span>
      </p>
    </div>
  </div>
</footer>
