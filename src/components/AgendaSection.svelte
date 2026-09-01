<script lang="ts">
  import { t } from '../i18n/index';
  import { baseUrl } from '../lib/baseUrl';

  const topics = [
    'agenda.top1',
    'agenda.top2',
    'agenda.top3',
    'agenda.top4',
    'agenda.top5',
    'agenda.top6',
  ];

  const formats = [
    { k: 'agenda.fmtDur', v: 'agenda.fmtDurV' },
    { k: 'agenda.fmtMod', v: 'agenda.fmtModV' },
    { k: 'agenda.fmtLang', v: 'agenda.fmtLangV' },
    { k: 'agenda.fmtFol', v: 'agenda.fmtFolV' },
  ];

  const tracks = [
    {
      badge: 'agenda.track1Badge',
      title: 'agenda.track1Title',
      desc: 'agenda.track1Desc',
      icon: '🤝',
      accent: true,
      price: 'agenda.track1Price'
    },
    {
      badge: 'agenda.track2Badge',
      title: 'agenda.track2Title',
      desc: 'agenda.track2Desc',
      icon: '🎓',
      accent: false,
      price: 'agenda.track2Price'
    },
    {
      badge: 'agenda.track3Badge',
      title: 'agenda.track3Title',
      desc: 'agenda.track3Desc',
      icon: '🛠️',
      accent: false,
      price: 'agenda.track3Price'
    }
  ];

  const pillars = [
    { icon: '🌐', t: 'agenda.p1t', d: 'agenda.p1d' },
    { icon: '💡', t: 'agenda.p2t', d: 'agenda.p2d' },
    { icon: '⚡', t: 'agenda.p3t', d: 'agenda.p3d' },
  ];

  const tools = [
    'Applied AI',
    'AI Engineering',
    'Software Architecture',
    'Autonomous Agents',
    'RAG & LLMs',
    'Cloud Native',
    'Developer Tooling',
    'Automation & Workflows',
    'Open Source'
  ];

  const slots = ['agenda.slot1', 'agenda.slot2', 'agenda.slot3'];

  let sent = $state(false);
  let selectedService = $state('diagnostic');

  function handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const name = data.get('name');
    const email = data.get('email');
    const profile = data.get('profile');
    const service = data.get('service');
    const infra = data.get('infra');
    const topic = data.get('topic');
    const message = data.get('message');

    const subject = encodeURIComponent(`${t('agenda.mailSubject')}: ${service} — ${name}`);
    const body = encodeURIComponent(
      `${t('agenda.mailHeader')}\n` +
      `=========================================================\n\n` +
      `${t('agenda.formName')}: ${name}\n` +
      `${t('agenda.formEmail')}: ${email}\n` +
      `${t('agenda.formProfile')}: ${profile}\n` +
      `${t('agenda.formService')}: ${service}\n` +
      `${t('agenda.formInfra')}: ${infra}\n` +
      `${t('agenda.mailArea')}: ${topic}\n\n` +
      `${t('agenda.formMsg')}:\n${message}\n\n` +
      `---\n` +
      `${t('agenda.mailFooter1')}\n` +
      `${t('agenda.mailFooter2')}`
    );

    window.location.href = `mailto:iberi22@gmail.com?subject=${subject}&body=${body}`;
    sent = true;
  }
</script>

<section class="relative pt-32 pb-20 px-6">
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="text-center entry-rise">
      <div class="flex flex-wrap items-center justify-center gap-2 mb-4">
        <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono tracking-widest uppercase bg-accent/10 text-accent border border-accent/30 shadow-lg shadow-accent/10">
          <span class="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
          {t('agenda.badgeHeader')}
        </span>
        <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          {t('agenda.badgeFree')}
        </span>
      </div>

      <h1 class="section-title mt-4 text-3xl md:text-5xl font-bold tracking-tight">
        {t('agenda.title')}
      </h1>
      <p class="text-text-secondary text-lg mt-4 max-w-3xl mx-auto leading-relaxed">
        {t('agenda.subtitle')}
      </p>

      <!-- Tools Marquee / Badge Strip -->
      <div class="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
        {#each tools as tool}
          <span class="px-3 py-1 rounded-full text-[11px] font-mono bg-bg-surface-dark border border-white/10 text-text-muted hover:border-accent/40 hover:text-accent transition-colors">
            {tool}
          </span>
        {/each}
      </div>
    </div>

    <!-- Networking & Professional Collaboration Card Notice -->
    <div class="glass-card p-6 mt-10 border-accent/30 bg-accent/5 entry-rise">
      <div class="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div class="w-12 h-12 rounded-2xl bg-accent text-black flex items-center justify-center text-2xl font-bold shrink-0">
          🤝
        </div>
        <div>
          <h3 class="text-base font-bold text-white">{t('agenda.noticeTitle')}</h3>
          <p class="text-xs text-text-secondary mt-1 leading-relaxed">
            {@html t('agenda.noticeTextHtml')}
          </p>
        </div>
      </div>
    </div>

    <!-- 3 Service Tracks -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      {#each tracks as track, i}
        <div class="glass-card p-8 entry-rise flex flex-col justify-between border transition-all duration-300 group {track.accent ? 'border-accent/40 bg-accent/5 hover:border-accent' : 'border-white/10 hover:border-accent/40'}" style={`animation-delay: ${100 + i * 90}ms`}>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-mono font-bold tracking-widest px-2.5 py-1 rounded {track.accent ? 'bg-accent text-black' : 'bg-white/10 text-text-muted'}">
                {t(track.badge)}
              </span>
              <span class="text-2xl group-hover:scale-110 transition-transform">{track.icon}</span>
            </div>
            <h3 class="text-lg font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">{t(track.title)}</h3>
            <p class="text-text-secondary text-sm leading-relaxed mb-6">{t(track.desc)}</p>
          </div>
          <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
            <span class="text-text-muted">{t('agenda.modalityLabel')}</span>
            <span class="font-bold text-text-primary {track.accent ? 'text-accent text-sm' : ''}">{t(track.price)}</span>
          </div>
        </div>
      {/each}
    </div>

    <!-- Pillars Breakdown -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      {#each pillars as p, i}
        <div class="glass-card p-8 entry-rise flex flex-col justify-between border border-white/10 hover:border-accent/30 transition-all" style={`animation-delay: ${280 + i * 80}ms`}>
          <div>
            <div class="text-3xl mb-4">{p.icon}</div>
            <h3 class="text-base font-bold text-text-primary mb-2">{t(p.t)}</h3>
            <p class="text-text-secondary text-xs leading-relaxed">{t(p.d)}</p>
          </div>
        </div>
      {/each}
    </div>

    <!-- Format + Key Scope Areas -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
      <div class="glass-card p-8 entry-rise" style="animation-delay: 350ms">
        <h3 class="text-accent text-sm tracking-widest uppercase mb-6 font-mono font-bold flex items-center gap-2">
          <span>// 01.</span> {t('agenda.fmtTitle')}
        </h3>
        <ul class="space-y-4">
          {#each formats as f}
            <li class="flex flex-col gap-1 border-l-2 border-accent/30 pl-4 py-1">
              <span class="text-xs uppercase tracking-wider text-text-muted font-mono">{t(f.k)}</span>
              <span class="text-text-primary text-sm font-semibold">{t(f.v)}</span>
              {#if f.k === 'agenda.fmtLang'}
                <span class="text-text-muted text-xs leading-relaxed mt-1">{t('agenda.fmtLangNote')}</span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>

      <div class="glass-card p-8 entry-rise" style="animation-delay: 430ms">
        <h3 class="text-accent text-sm tracking-widest uppercase mb-6 font-mono font-bold flex items-center gap-2">
          <span>// 02.</span> {t('agenda.topTitle')}
        </h3>
        <ul class="space-y-3">
          {#each topics as topic}
            <li class="text-text-secondary text-sm leading-relaxed flex items-start gap-2.5">
              <span class="text-accent mt-0.5">▹</span>
              <span>{t(topic)}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>

    <!-- Availability bar -->
    <div class="glass-card p-6 mt-10 entry-rise" style="animation-delay: 500ms">
      <div class="flex flex-wrap items-center gap-x-8 gap-y-3 justify-center text-center">
        <span class="text-xs font-mono uppercase tracking-widest text-text-muted">{t('agenda.slotsLabel')}</span>
        {#each slots as s}
          <span class="flex items-center gap-2 text-sm text-text-secondary font-mono">
            <span class="w-2 h-2 rounded-full bg-accent inline-block"></span>{t(s)}
          </span>
        {/each}
      </div>
    </div>

    <!-- Data-Driven Decision & Scenario Simulation Methodology (Comentado temporalmente)
    <div class="glass-card p-8 md:p-10 mt-12 border-accent/20 bg-bg-surface-dark/80 entry-rise" style="animation-delay: 540ms">
      <div class="flex items-center gap-3 mb-4">
        <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase bg-accent/10 text-accent border border-accent/30">
          {t('agenda.methodologyBadge')}
        </span>
        <span class="text-xs font-mono text-text-muted tracking-wider">SWAL Simulation Framework</span>
      </div>

      <h3 class="text-xl md:text-2xl font-bold text-text-primary mb-3">
        {t('agenda.methodologyTitle')}
      </h3>
      <p class="text-text-secondary text-sm md:text-base leading-relaxed mb-8 max-w-3xl">
        {t('agenda.methodologySub')}
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col justify-between">
          <div>
            <span class="text-accent text-xs font-mono font-bold block mb-2">{t('agenda.m1Label')}</span>
            <h4 class="text-text-primary text-sm font-bold mb-2">{t('agenda.m1t')}</h4>
            <p class="text-text-muted text-xs leading-relaxed">{t('agenda.m1d')}</p>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-accent/30 bg-accent/5 flex flex-col justify-between">
          <div>
            <span class="text-accent text-xs font-mono font-bold block mb-2">{t('agenda.m2Label')}</span>
            <h4 class="text-text-primary text-sm font-bold mb-2">{t('agenda.m2t')}</h4>
            <p class="text-text-muted text-xs leading-relaxed">{t('agenda.m2d')}</p>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col justify-between">
          <div>
            <span class="text-accent text-xs font-mono font-bold block mb-2">{t('agenda.m3Label')}</span>
            <h4 class="text-text-primary text-sm font-bold mb-2">{t('agenda.m3t')}</h4>
            <p class="text-text-muted text-xs leading-relaxed">{t('agenda.m3d')}</p>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-white/10 bg-black/40 flex flex-col justify-between">
          <div>
            <span class="text-accent text-xs font-mono font-bold block mb-2">{t('agenda.m4Label')}</span>
            <h4 class="text-text-primary text-sm font-bold mb-2">{t('agenda.m4t')}</h4>
            <p class="text-text-muted text-xs leading-relaxed">{t('agenda.m4d')}</p>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-accent/5 -mx-4 md:-mx-6 -mb-4 md:-mb-6 p-6 rounded-b-2xl border-t border-accent/20">
        <div class="space-y-1.5 text-center sm:text-left">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <span class="text-lg">🧪</span>
            <h4 class="text-base font-bold text-text-primary">{t('agenda.diagCtaTitle')}</h4>
          </div>
          <p class="text-xs text-text-secondary max-w-xl leading-relaxed">
            {t('agenda.diagCtaDesc')}
          </p>
        </div>
        <a
          href={baseUrl('resources')}
          class="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-accent-light transition-all shadow-lg shadow-accent/20 hover:scale-[1.02]"
        >
          <span>{t('agenda.diagCtaBtn')}</span>
          <span class="text-sm">→</span>
        </a>
      </div>
    </div>
    -->

    <!-- Booking Form -->
    <div class="mt-14 max-w-3xl mx-auto entry-rise" style="animation-delay: 570ms">
      <div class="glass-card p-8 md:p-12 border-accent/30 bg-bg-surface-dark/95 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>

        {#if sent}
          <div class="text-center py-10 space-y-6">
            <div class="text-5xl">🎯</div>
            <h3 class="text-2xl font-bold text-text-primary">{t('agenda.okTitle')}</h3>
            <p class="text-text-secondary text-base max-w-lg mx-auto leading-relaxed">{t('agenda.okText')}</p>
          </div>
        {:else}
          <div class="text-center mb-8">
            <h3 class="text-2xl font-bold text-text-primary">{t('agenda.formTitle')}</h3>
            <p class="text-xs text-text-muted font-mono mt-2">{t('agenda.formPayNote')}</p>
          </div>

          <form onsubmit={handleSubmit} class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="agenda-name" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formName')}</label>
                <input id="agenda-name" type="text" name="name" required placeholder="Brahyans B." class="field w-full" />
              </div>
              <div>
                <label for="agenda-email" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formEmail')}</label>
                <input id="agenda-email" type="email" name="email" required placeholder="tu-correo@empresa.com" class="field w-full" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="agenda-service" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formService')}</label>
                <select id="agenda-service" name="service" required bind:value={selectedService} class="field w-full appearance-none cursor-pointer">
                  <option value="diagnostic" class="bg-[#121212]">{t('agenda.formService1')}</option>
                  <option value="training" class="bg-[#121212]">{t('agenda.formService2')}</option>
                  <option value="harness" class="bg-[#121212]">{t('agenda.formService3')}</option>
                  <option value="architecture" class="bg-[#121212]">{t('agenda.formService4')}</option>
                </select>
              </div>

              <div>
                <label for="agenda-profile" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formProfile')}</label>
                <select id="agenda-profile" name="profile" required class="field w-full appearance-none cursor-pointer">
                  <option value={t('agenda.formProfile1')} class="bg-[#121212]">{t('agenda.formProfile1')}</option>
                  <option value={t('agenda.formProfile2')} class="bg-[#121212]">{t('agenda.formProfile2')}</option>
                  <option value={t('agenda.formProfile3')} class="bg-[#121212]">{t('agenda.formProfile3')}</option>
                  <option value={t('agenda.formProfile4')} class="bg-[#121212]">{t('agenda.formProfile4')}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label for="agenda-topic" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.topTitle')}</label>
                <select id="agenda-topic" name="topic" required class="field w-full appearance-none cursor-pointer">
                  {#each topics as topic}
                    <option value={t(topic)} class="bg-[#121212]">{t(topic)}</option>
                  {/each}
                </select>
              </div>

              <div>
                <label for="agenda-infra" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formInfra')}</label>
                <input
                  id="agenda-infra"
                  type="text"
                  name="infra"
                  required
                  placeholder={t('agenda.formInfraPh')}
                  class="field w-full"
                />
              </div>
            </div>

            <div>
              <label for="agenda-message" class="block text-xs font-mono text-text-muted mb-2 uppercase tracking-wider">{t('agenda.formMsg')}</label>
              <textarea
                id="agenda-message"
                name="message"
                rows="4"
                required
                placeholder={t('agenda.formMsgPh')}
                class="field w-full resize-none"
              ></textarea>
            </div>

            <div class="pt-4 space-y-4">
              <button
                type="submit"
                class="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-accent text-black font-mono font-bold text-sm tracking-wider uppercase hover:bg-accent-light transition-all duration-300 shadow-xl shadow-accent/20 cursor-pointer"
              >
                <span>{t('agenda.formSubmit')}</span>
                <span class="text-base font-extrabold font-sans">→</span>
              </button>

              <div class="flex flex-wrap items-center justify-center gap-6 pt-2">
                <span class="flex items-center gap-1.5 text-xs text-text-muted font-mono">
                  <svg class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  {t('agenda.meetFooterNote')}
                </span>
                <span class="flex items-center gap-1.5 text-xs text-text-muted font-mono">
                  <svg class="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {t('agenda.responseFooterNote')}
                </span>
              </div>

              <p class="text-text-muted text-xs text-center leading-relaxed">
                {t('agenda.formNote')}
              </p>
            </div>
          </form>
        {/if}
      </div>
    </div>
  </div>
</section>
