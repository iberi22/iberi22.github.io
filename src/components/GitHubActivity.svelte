<script lang="ts">
  import { t } from '../i18n/index';
  import stats from '../data/github-stats.json';

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = new Intl.NumberFormat('en-US');

  const monthly = stats.contributions.monthly;
  const max = Math.max(...monthly.map((m) => m.count), 1);
  // The calendar window starts and ends mid-month, so the first and last bars cover fewer days.
  const bars = monthly.map((m, i) => {
    const [year, month] = m.month.split('-');
    return {
      ...m,
      label: `${MONTHS[Number(month) - 1]} ${year.slice(2)}`,
      height: Math.max(2, Math.round((m.count / max) * 100)),
      partial: i === 0 || i === monthly.length - 1,
    };
  });

  const xavier = stats.projects.xavier;
  const kpis = [
    { value: fmt.format(stats.contributions.total), label: t('activity.contributions') },
    { value: fmt.format(stats.contributions.activeDays), label: t('activity.activeDays') },
    { value: fmt.format(stats.publicRepos.original), label: t('activity.repos') },
    { value: xavier?.version ?? '—', label: `${t('activity.xavierRelease')} · ${xavier?.releases ?? 0} ${t('activity.releasesSuffix')}`, href: 'https://github.com/iberi22/xavier/releases' },
  ];
</script>

<section id="activity" class="relative py-24 px-6" aria-labelledby="activity-title">
  <div class="max-w-6xl mx-auto">
    <div>
      <span class="text-accent text-sm tracking-widest mb-4 block">{t('activity.heading')}</span>
      <h2 id="activity-title" class="section-title">
        {t('activity.title')}<span class="text-accent">{t('activity.titleAccent')}</span>
      </h2>
      <p class="text-text-secondary text-lg mt-4 max-w-2xl">{t('activity.subtitle')}</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
      {#each kpis as k}
        <div class="glass-card p-6">
          {#if k.href}
            <a href={k.href} target="_blank" rel="noopener noreferrer" class="text-accent text-3xl font-bold font-mono hover:underline">{k.value}</a>
          {:else}
            <span class="text-accent text-3xl font-bold font-mono">{k.value}</span>
          {/if}
          <p class="text-text-muted text-xs mt-2 leading-snug">{k.label}</p>
        </div>
      {/each}
    </div>

    <div class="grid lg:grid-cols-5 gap-6 mt-6">
      <figure class="glass-card p-6 lg:col-span-3">
        <figcaption class="text-xs text-text-muted uppercase tracking-[0.2em] mb-6">{t('activity.monthlyTitle')}</figcaption>
        <div class="chart" aria-hidden="true">
          {#each bars as b}
            <div class="bar-col" title={`${b.label}: ${fmt.format(b.count)}${b.partial ? ` (${t('activity.partial')})` : ''}`}>
              <div class="bar-track">
                <span class="bar-value">{b.count >= 1000 ? `${(b.count / 1000).toFixed(1)}k` : b.count}</span>
                <div class="bar" class:partial={b.partial} style:height={`${b.height}%`}></div>
              </div>
              <span class="bar-label">{b.label}</span>
            </div>
          {/each}
        </div>
        <table class="sr-only">
          <caption>{t('activity.monthlyTitle')}</caption>
          <tbody>
            {#each bars as b}
              <tr><th scope="row">{b.label}</th><td>{b.count}{b.partial ? ` (${t('activity.partial')})` : ''}</td></tr>
            {/each}
          </tbody>
        </table>
      </figure>

      <figure class="glass-card p-6 lg:col-span-2">
        <figcaption class="text-xs text-text-muted uppercase tracking-[0.2em] mb-6">{t('activity.languagesTitle')}</figcaption>
        <ul class="space-y-3">
          {#each stats.languages as l}
            <li>
              <div class="flex justify-between text-xs font-mono mb-1">
                <span class="text-text-secondary">{l.name}</span>
                <span class="text-text-muted">{l.share}%</span>
              </div>
              <div class="h-2 rounded bg-white/5 overflow-hidden" aria-hidden="true">
                <div class="h-full rounded bg-accent/70" style:width={`${l.share}%`}></div>
              </div>
            </li>
          {/each}
        </ul>
      </figure>
    </div>

    <p class="text-text-muted text-xs mt-4">
      {t('activity.source')} {stats.generatedAt} ·
      <a href="https://github.com/iberi22" target="_blank" rel="noopener noreferrer" class="underline hover:text-accent">github.com/iberi22</a>
    </p>
  </div>
</section>

<style>
  .chart {
    display: flex;
    align-items: flex-end;
    gap: 0.4rem;
    height: 14rem;
  }
  .bar-col {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }
  .bar-track {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding-top: 1.1rem;
    min-height: 0;
  }
  .bar {
    width: 100%;
    border-radius: 3px 3px 0 0;
    background: var(--color-accent);
    opacity: 0.8;
  }
  .bar.partial {
    opacity: 0.35;
  }
  .bar-value,
  .bar-label {
    font-family: ui-monospace, monospace;
    font-size: 0.6rem;
    color: var(--color-text-muted, #94a3b8);
    white-space: nowrap;
  }
  .bar-value {
    margin-bottom: 0.25rem;
  }
  @media (max-width: 639px) {
    .bar-value {
      display: none;
    }
  }
  .bar-label {
    margin-top: 0.4rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    height: 2.6rem;
    flex-shrink: 0;
  }
</style>
