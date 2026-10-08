<script lang="ts">
  import { onMount } from 'svelte';
  import { t, getCurrentLocale } from '../i18n/index';

  function applyKey(key: string | undefined): string | null {
    if (!key) return null;
    const value = t(key);
    if (!value || value === key) return null;
    return value;
  }

  onMount(() => {
    const locale = getCurrentLocale();

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      const value = applyKey(el.dataset.i18n);
      if (value) el.textContent = value;
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-title]').forEach((el) => {
      const value = applyKey(el.dataset.i18nTitle);
      if (value) el.setAttribute('title', value);
    });

    document.querySelectorAll<HTMLElement>('[data-i18n-aria]').forEach((el) => {
      const value = applyKey(el.dataset.i18nAria);
      if (value) el.setAttribute('aria-label', value);
    });

    const copyText = document.getElementById('copy-text');
    if (copyText) {
      const copy = applyKey('blog.copy');
      const copied = applyKey('blog.copied');
      if (copy) copyText.dataset.copy = copy;
      if (copied) copyText.dataset.copied = copied;
    }

    const bodies = document.querySelectorAll<HTMLElement>('[data-blog-body]');
    if (bodies.length > 1) {
      const list = Array.from(bodies);
      const chosen = list.find((el) => el.dataset.locale === locale) ?? list.find((el) => el.dataset.locale === 'es');
      list.forEach((el) => {
        el.hidden = el !== chosen;
      });
    }

    if (locale !== 'es') {
      const copyEl = document.getElementById('blog-locale-copy');
      if (copyEl?.textContent) {
        try {
          const copy = JSON.parse(copyEl.textContent) as Record<string, { title?: string; excerpt?: string }>;
          const item = copy[locale];
          if (item?.title) {
            const h1 = document.querySelector<HTMLElement>('[data-blog-title]');
            if (h1) h1.textContent = item.title;
            const marker = ' | Brahyan Belalcázar (iberi22)';
            if (document.title.includes(marker)) document.title = item.title + marker;
            const excerpt = item.excerpt ?? '';
            const pageUrl = window.location.href;
            const x = document.querySelector<HTMLAnchorElement>('[data-share="x"]');
            if (x) {
              const url = new URL(x.href);
              url.searchParams.set('text', `${item.title} por @iberi22 — ${excerpt.slice(0, 110)}`);
              x.href = url.toString();
            }
            const wa = document.querySelector<HTMLAnchorElement>('[data-share="wa"]');
            if (wa) {
              const url = new URL(wa.href);
              url.searchParams.set('text', `${item.title} — ${pageUrl}`);
              wa.href = url.toString();
            }
            const tg = document.querySelector<HTMLAnchorElement>('[data-share="tg"]');
            if (tg) {
              const url = new URL(tg.href);
              url.searchParams.set('text', item.title);
              tg.href = url.toString();
            }
          }
        } catch {
          /* the Spanish body stays */
        }
      }

      const indexEl = document.getElementById('blog-locale-index');
      if (indexEl?.textContent) {
        try {
          const index = JSON.parse(indexEl.textContent) as Record<string, Record<string, { title?: string; excerpt?: string }>>;
          document.querySelectorAll<HTMLElement>('[data-post-slug][data-post-field]').forEach((el) => {
            const slug = el.dataset.postSlug ?? '';
            const field = el.dataset.postField;
            if (field !== 'title' && field !== 'excerpt') return;
            const value = index[slug]?.[locale]?.[field];
            if (value) el.textContent = value;
          });
        } catch {
          /* cards stay in Spanish */
        }
      }
    }
  });
</script>
