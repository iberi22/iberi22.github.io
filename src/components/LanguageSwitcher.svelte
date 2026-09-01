<script lang="ts">
  import { localeNames, getCurrentLocale, setCurrentLocale, t, updateDocumentDirection } from '../i18n/index';
  import type { Locale } from '../i18n/index';
  import { onMount } from 'svelte';

  let open = $state(false);
  let current = $state(getCurrentLocale());
  const locales = Object.keys(localeNames) as Locale[];

  onMount(() => {
    current = getCurrentLocale();
    updateDocumentDirection(current);
  });

  function select(locale: Locale) {
    setCurrentLocale(locale);
    current = locale;
    open = false;
    updateDocumentDirection(locale);
    window.location.reload();
  }
</script>

<div class="relative">
  <button
    onclick={() => (open = !open)}
    aria-label={t('locale.label')}
    class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs uppercase tracking-widest border border-white/10 text-text-muted hover:text-accent hover:border-accent/30 transition-all cursor-pointer"
  >
    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    <span>{localeNames[current]}</span>
  </button>

  {#if open}
    <div
      class="absolute top-full end-0 mt-2 w-44 glass-card p-2 z-50 max-h-64 overflow-y-auto"
      style="background: rgba(18, 18, 18, 0.95); backdrop-filter: blur(24px);"
    >
      {#each locales as locale}
        <button
          onclick={() => select(locale)}
          class={`w-full text-start px-3 py-2 rounded text-xs transition-all flex items-center justify-between cursor-pointer ${
            locale === current
              ? 'bg-accent/10 text-accent font-bold'
              : 'text-text-muted hover:text-accent hover:bg-white/5'
          }`}
        >
          <span>{localeNames[locale]}</span>
          {#if locale === current}
            <svg class="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<svelte:window onclick={(e) => { if (!(e.target as Element | null)?.closest?.('.relative')) open = false; }} />
