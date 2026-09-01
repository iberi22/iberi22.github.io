<script lang="ts">
  import { t } from '../i18n/index';

  const socialLinks = [
    { name: 'GitHub', url: 'https://github.com/iberi22', icon: 'github' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/brahyansbr/', icon: 'linkedin' },
    { name: 'Twitter / X', url: 'https://x.com/x_donberi', icon: 'twitter' },
  ];

  function handleMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  }
</script>

<section id="contact" class="relative py-32 px-6">
  <div class="max-w-6xl mx-auto text-center">
    <div class="entry-clip">
      <span class="text-accent text-sm tracking-widest mb-4 block">{t('contact.heading')}</span>
      <h2 class="section-title">
        {t('contact.title')} <span class="text-accent">{t('contact.titleAccent')}</span> {t('contact.titleSuffix')}
      </h2>
      <p class="text-text-secondary text-lg mt-4 max-w-xl mx-auto">
        {t('contact.subtitle')}
      </p>
    </div>

    <div class="mt-16 max-w-lg mx-auto entry-rise" style="animation-delay: 180ms">
      <div class="glass-card p-10" onmousemove={handleMouseMove}>
        <form
          onsubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const formData = new FormData(form);
            const email = formData.get('email');
            const message = formData.get('message');
            window.location.href = `mailto:iberi22@gmail.com?subject=Contacto desde Portfolio&body=${encodeURIComponent(message + '\n\nDe: ' + email)}`;
          }}
          class="space-y-6"
        >
          <input
            type="email"
            name="email"
            placeholder={t('contact.emailPlaceholder')}
            required
            class="field"
          />
          <textarea
            name="message"
            rows="4"
            placeholder={t('contact.messagePlaceholder')}
            required
            class="field resize-none"
          ></textarea>
          <button type="submit" class="btn-primary w-full">
            {t('contact.submit')}
          </button>
        </form>
      </div>
    </div>

    <div class="mt-16 flex flex-wrap justify-center gap-10 entry-scan" style="animation-delay: 420ms">
      {#each socialLinks as link}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          {#if link.icon === 'github'}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          {:else if link.icon === 'linkedin'}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          {:else if link.icon === 'twitter'}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2H21.5l-7.11 8.13L22.75 22h-6.545l-5.127-6.7L5.21 22H1.952l7.604-8.69L1.54 2h6.71l4.634 6.126L18.244 2zm-1.143 17.91h1.804L7.27 3.98H5.333L17.1 19.91z"/></svg>
          {:else}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 00-2.1-2.12C19.54 3.58 12 3.58 12 3.58s-7.54 0-9.4.5A3 3 0 00.5 6.2 31.2 31.2 0 000 12a31.2 31.2 0 00.5 5.8 3 3 0 002.1 2.12c1.86.5 9.4.5 9.4.5s7.54 0 9.4-.5a3 3 0 002.1-2.12A31.2 31.2 0 0024 12a31.2 31.2 0 00-.5-5.8zM9.6 15.57V8.43L15.86 12 9.6 15.57z"/></svg>
          {/if}
          {link.name}
        </a>
      {/each}
      <a href="mailto:iberi22@gmail.com" class="social-link secondary-link">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        {t('contact.email')}
      </a>
    </div>
  </div>
</section>

<style>
  .field {
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background: var(--color-bg-surface-dark);
    padding: 0.875rem 1.25rem;
    color: var(--color-text-primary);
    font-size: 0.875rem;
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }

  .field::placeholder {
    color: var(--color-text-muted);
    opacity: 0.55;
  }
  .field::-webkit-input-placeholder { color: var(--color-text-muted); opacity: 0.55; }
  .field::-moz-placeholder { color: var(--color-text-muted); opacity: 0.55; }

  .field:focus {
    border-color: var(--color-accent);
    outline: none;
  }

  .field:focus {
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
  }

  .social-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 200ms ease, transform 200ms ease;
  }

  .social-link:hover {
    color: var(--color-accent);
    transform: translateY(-2px);
  }

  .secondary-link:hover {
    color: var(--color-secondary);
  }
</style>
