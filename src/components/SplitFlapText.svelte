<script lang="ts">
  interface Props {
    text: string;
    duration?: number;
    delay?: number;
    class?: string;
  }

  let { text = '', duration = 1800, delay = 0, class: className = '' }: Props = $props();

  const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+=-/_:;~';

  function getRandomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function getInitialScramble(target: string): string {
    let s = '';
    for (let i = 0; i < target.length; i++) {
      const c = target[i];
      if (c === ' ' || c === '\n' || c === '\t' || c === '.' || c === ',' || c === '—' || c === '-') {
        s += c;
      } else {
        s += GLYPHS[(i * 7 + 5) % GLYPHS.length];
      }
    }
    return s;
  }

  // Server-rendered HTML carries the real text so crawlers, link previews and no-JS readers never see
  // the scramble; the animation only starts once the component runs in the browser.
  let displayText = $state(text);
  let isFlapping = $state(false);

  function runFlap(targetText: string) {
    const reducedMotion =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (typeof window === 'undefined' || !targetText || reducedMotion) {
      displayText = targetText;
      isFlapping = false;
      return;
    }

    isFlapping = true;
    displayText = getInitialScramble(targetText);

    const len = targetText.length;
    const startTimestamp = performance.now();
    let animId: number;
    let lastTick = 0;

    function frame(now: number) {
      const elapsed = now - startTimestamp;

      // Flip every ~35ms for mechanical train station tick sound/motion feel
      if (now - lastTick > 35 || elapsed >= duration) {
        lastTick = now;

        const effectiveElapsed = Math.max(0, elapsed - delay);
        const effectiveDuration = Math.max(100, duration - delay);
        const progress = Math.min(effectiveElapsed / effectiveDuration, 1);

        let output = '';
        for (let i = 0; i < len; i++) {
          const targetChar = targetText[i];
          if (targetChar === ' ' || targetChar === '\n' || targetChar === '\t') {
            output += targetChar;
            continue;
          }

          const lockProgress = (i + 1) / len;

          if (elapsed >= delay && progress >= lockProgress) {
            output += targetChar;
          } else {
            output += getRandomGlyph();
          }
        }

        displayText = output;

        if (progress >= 1 && elapsed >= duration) {
          displayText = targetText;
          isFlapping = false;
          return;
        }
      }

      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }

  $effect(() => {
    const cancel = runFlap(text);
    return () => {
      if (cancel) cancel();
    };
  });
</script>

<span class={`split-flap-root ${className}`} class:flapping={isFlapping}>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true">{displayText}</span>
</span>

<style>
  .split-flap-root {
    display: inline-block;
    letter-spacing: normal;
    transition: color 0.15s ease;
    font-variant-numeric: tabular-nums;
  }
  .split-flap-root.flapping {
    text-shadow: 0 0 10px rgba(16, 185, 129, 0.35);
  }
</style>
