<script lang="ts">
  import { t } from '../i18n/index';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { baseUrl } from '../lib/baseUrl';
  import { onMount } from 'svelte';

  let mounted = $state(false);
  let scrolled = $state(false);
  let mobileOpen = $state(false);

  const navItems = [
    { key: 'about', href: '#about' },
    { key: 'projects', href: '#projects' },
    { key: 'blog', href: baseUrl('blog') },
    { key: 'contact', href: '#contact' },
    { key: 'agenda', href: baseUrl('agenda') },
  ];

  function handleScroll() {
    scrolled = window.scrollY > 50;
  }

  onMount(() => {
    mounted = true;
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<nav
  class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 nav-glass"
  class:scrolled={scrolled}
>
  <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href={import.meta.env.BASE_URL} class="text-xl font-bold tracking-tight group">
      <span class="text-accent group-hover:text-accent-light transition-colors">iberi22</span>
      <span class="text-text-muted text-xs ml-2">/architect</span>
    </a>

    <div class="hidden md:flex items-center gap-8">
      {#each navItems as item}
        <a href={item.href} class="nav-link text-xs uppercase tracking-widest text-text-muted hover:text-accent transition-all">
          {t('nav.' + item.key)}
        </a>
      {/each}
      <a
        href="https://github.com/iberi22"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold hover:bg-accent/20 hover:border-accent/40 transition-all"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        {t('nav.git')}
      </a>
      <LanguageSwitcher />
    </div>

    <button
      class="md:hidden text-text-muted hover:text-accent transition-colors"
      aria-label="Toggle navigation"
      aria-expanded={mobileOpen}
      onclick={() => (mobileOpen = !mobileOpen)}
    >
      {#if mobileOpen}
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      {:else}
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      {/if}
    </button>
  </div>

  {#if mobileOpen && mounted}
    <div class="mobile-panel md:hidden bg-bg-surface-dark border-t border-white/5">
      <div class="px-6 py-6 space-y-6">
        {#each navItems as item}
          <a
            href={item.href}
            class="block text-sm uppercase tracking-widest text-text-muted hover:text-accent transition-colors"
            onclick={() => (mobileOpen = false)}
          >
            {t('nav.' + item.key)}
          </a>
        {/each}
        <a
          href="https://github.com/iberi22"
          target="_blank"
          rel="noopener noreferrer"
          class="block text-sm text-accent"
          onclick={() => (mobileOpen = false)}
        >
          {t('nav.github')} /
        </a>
        <LanguageSwitcher />
      </div>
    </div>
  {/if}
</nav>

<style>
  /* Fondo glass permanente: difumina el contenido al pasar por debajo
     sin taparlo del todo. Al scrollear se refuerza la legibilidad. */
  nav.nav-glass {
    background: rgba(18, 18, 18, 0.55);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  nav.scrolled {
    background: rgba(18, 18, 18, 0.88);
    backdrop-filter: blur(28px) saturate(1.6);
    -webkit-backdrop-filter: blur(28px) saturate(1.6);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .nav-link {
    position: relative;
  }

  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--color-accent);
    transition: all 300ms ease;
  }

  .nav-link:hover::after {
    width: 100%;
  }

  .mobile-panel {
    animation: slideDown 260ms cubic-bezier(.16, 1, .3, 1) both;
  }

  @keyframes slideDown {
    from { clip-path: inset(0 0 100% 0); opacity: 0; }
    to { clip-path: inset(0 0 0 0); opacity: 1; }
  }
</style>
