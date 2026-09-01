<script lang="ts">
  import { t } from '../i18n/index';
  import SplitFlapText from './SplitFlapText.svelte';

  let mouseX = $state(0);
  let mouseY = $state(0);
  let heroRef = $state<HTMLElement | null>(null);

  function handleMouseMove(event: MouseEvent) {
    if (!heroRef) return;
    const rect = heroRef.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / rect.width - 0.5;
    mouseY = (event.clientY - rect.top) / rect.height - 0.5;
  }
</script>

<section
  bind:this={heroRef}
  onmousemove={handleMouseMove}
  class="relative min-h-screen flex items-center justify-center overflow-hidden grid-background"
>
  <div
    class="blob blob-emerald"
    style:--drift-x={`${mouseX * 52}px`}
    style:--drift-y={`${mouseY * 46}px`}
  ></div>
  <div
    class="blob blob-cyan"
    style:--drift-x={`${mouseX * -44}px`}
    style:--drift-y={`${mouseY * -38}px`}
  ></div>
  <div
    class="blob blob-deep"
    style:--drift-x={`${mouseX * 24}px`}
    style:--drift-y={`${mouseY * -22}px`}
  ></div>

  <div class="hero-reveal-container relative z-10 text-center px-6 max-w-5xl mx-auto">
    <div class="entry-scan mb-8">
      <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-sm">
        <span class="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
        <SplitFlapText text={t('hero.badge')} duration={1200} />
      </span>
    </div>

    <h1 class="hero-title mb-6 font-mono">
      <span class="kinetic-word text-accent">
        <SplitFlapText text={t('hero.firstName')} duration={1500} delay={0} />
      </span><br />
      <span class="kinetic-word text-text-primary word-delay">
        <SplitFlapText text={t('hero.lastName')} duration={1500} delay={150} />
      </span>
    </h1>

    <p class="entry-clip text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
      <SplitFlapText text={t('hero.tagline')} duration={1800} delay={100} /><br class="hidden md:block" />
      <SplitFlapText text={t('hero.taglineExtra')} duration={1950} delay={200} />
    </p>

    <div class="entry-rise flex flex-wrap justify-center gap-6" style="animation-delay: 520ms">
      <a href="#projects" class="btn-primary">{t('hero.viewProjects')}</a>
      <a href="#contact" class="btn-secondary">{t('hero.getInTouch')}</a>
    </div>
  </div>

  <a
    href="#about"
    class="scroll-cue absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors"
  >
    <span class="text-xs tracking-widest">{t('hero.scroll')}</span>
    <div class="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5">
      <div class="w-1.5 h-3 bg-current rounded-full"></div>
    </div>
  </a>
</section>

<style>
  .hero-reveal-container {
    animation: heroFadeReveal 450ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes heroFadeReveal {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .hero-title {
    font-size: clamp(2.5rem, 8vw, 6rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.1;
    text-shadow: 0 0 30px rgba(16, 185, 129, 0.12);
  }

  .word-delay {
    animation-delay: 220ms;
  }

  .blob {
    position: absolute;
    border-radius: 9999px;
    filter: blur(100px);
    opacity: 0.5;
    pointer-events: none;
    transform: translate(var(--drift-x), var(--drift-y));
    animation: blobOrbit 10s ease-in-out infinite;
  }

  .blob-emerald {
    top: 24%;
    left: -5rem;
    width: 20rem;
    height: 20rem;
    background: rgba(16, 185, 129, 0.14);
  }

  .blob-cyan {
    right: -5rem;
    bottom: 22%;
    width: 24rem;
    height: 24rem;
    background: rgba(6, 182, 212, 0.12);
    animation-delay: -3s;
  }

  .blob-deep {
    top: 48%;
    left: 48%;
    width: 31rem;
    height: 31rem;
    background: rgba(5, 150, 105, 0.08);
    animation-delay: -6s;
  }

  .scroll-cue {
    animation: cueIn 900ms ease 900ms both;
  }

  .scroll-cue div div {
    animation: scrollTick 1500ms ease-in-out infinite;
  }

  @keyframes blobOrbit {
    0%, 100% { margin-top: 0; margin-left: 0; }
    33% { margin-top: -1.8rem; margin-left: 1.2rem; }
    66% { margin-top: 1rem; margin-left: -1.4rem; }
  }

  @keyframes cueIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scrollTick {
    0%, 100% { transform: translateY(0); opacity: 0.45; }
    50% { transform: translateY(0.85rem); opacity: 1; }
  }
</style>
