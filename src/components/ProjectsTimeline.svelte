<script lang="ts">
  import { t, tArray } from '../i18n/index';

  let selectedCategory = $state<'all' | 'production' | 'opensource'>('all');
  let expandedProject = $state<string | null>('xavier2');

  interface BaseProject {
    id: string;
    name: string;
    version: string;
    category: 'production' | 'opensource';
    status: 'live' | 'beta' | 'active' | 'production';
    tech: string[];
    github?: string;
    demoUrl?: string;
    color: string;
    researchUrls?: { url: string }[];
    isFlagship?: boolean;
  }

  const baseProjects: BaseProject[] = [
    {
      id: 'xavier2',
      name: 'Xavier',
      version: 'v0.6.0-beta',
      category: 'opensource',
      status: 'active',
      isFlagship: true,
      tech: ['Rust', 'Docker', 'SQLite-vec', 'pgvector', 'HNSW', 'SurrealDB', 'REST API'],
      github: 'https://github.com/iberi22/xavier',
      color: 'var(--color-accent)'
    },
    {
      id: 'gitcore',
      name: 'GitCore',
      version: 'v3.8.0',
      category: 'opensource',
      status: 'active',
      tech: ['Rust', 'Agent Orchestration', 'Git/GitHub API', 'Jules Waves', 'Automated QA', 'Shell'],
      github: 'https://github.com/iberi22/GitCore',
      color: 'var(--color-secondary)'
    },
    {
      id: 'gestalt',
      name: 'Gestalt',
      version: 'v0.4.0',
      category: 'opensource',
      status: 'active',
      tech: ['Rust', 'SurrealDB', 'Tokio Async', 'CLI Tools', 'Multi-Agent Protocols'],
      github: 'https://github.com/iberi22/gestalt',
      color: 'var(--color-accent-light)'
    },
    {
      id: 'photon-core',
      name: 'Photon-Core',
      version: 'v1.0.0-poc',
      category: 'opensource',
      status: 'active',
      tech: ['Rust', 'Physics Sim', 'Reed-Solomon ECC', 'Steganography', 'Rayon Parallelism', 'Optical Voxel Math'],
      github: 'https://github.com/iberi22/photon-core',
      color: 'var(--color-accent)',
      researchUrls: [
        { url: 'https://www.southampton.ac.uk/news/2016/02/5d-data-storage-hundred-billion-years.page' },
        { url: 'https://www.microsoft.com/en-us/research/project/project-silica/' },
        { url: 'https://opg.optica.org/optica/fulltext.cfm?uri=optica-8-11-1424' }
      ]
    },
    {
      id: 'edge-mesh',
      name: 'edge-mesh',
      version: 'v0.5.0',
      category: 'opensource',
      status: 'beta',
      tech: ['Rust', 'TypeScript', 'CRDT', 'P2P Mesh', 'ML-DSA-65 Crypto', 'WebRTC'],
      github: 'https://github.com/iberi22/edge-mesh',
      color: 'var(--color-secondary)'
    },
    {
      id: 'orion',
      name: 'OrionHealth',
      version: 'v0.5.0',
      category: 'opensource',
      status: 'active',
      tech: ['Flutter', 'Dart', 'SQLite / SQLCipher', 'Offline-First', 'Health Metrics'],
      github: 'https://github.com/iberi22/OrionHealth',
      color: 'var(--color-accent-light)'
    },
    {
      id: 'worldexams',
      name: 'WorldExams (SaberParaTodos)',
      version: 'v1.0.0',
      category: 'opensource',
      status: 'active',
      tech: ['Astro 6', 'Svelte 5', 'TypeScript', 'Tailwind CSS', 'Cloudflare Workers', 'Offline-First'],
      github: 'https://github.com/iberi22/worldexams',
      demoUrl: 'https://saberparatodos.space',
      color: 'var(--color-accent)'
    },
    {
      id: 'shelf',
      name: 'Shelf',
      version: 'v0.4.0',
      category: 'opensource',
      status: 'active',
      tech: ['React 19', 'TypeScript', 'Yjs', 'CRDT', 'P2P WebRTC', 'Post-Quantum Crypto', 'PWA'],
      github: 'https://github.com/iberi22/shelf',
      demoUrl: 'https://estante-inventario.vercel.app',
      color: 'var(--color-secondary)'
    },
    {
      id: 'gos',
      name: 'GOS (Gastronomic Open Standard)',
      version: 'v0.3.0',
      category: 'opensource',
      status: 'active',
      tech: ['Astro', 'JSON Schema', 'Flutter PWA', 'Offline-First', 'Design System'],
      github: 'https://github.com/iberi22/gastronomic-open-standard-GOS',
      color: 'var(--color-accent-light)'
    },
    /* OCULTO TEMPORALMENTE: GARA-G
    {
      id: 'gara-g',
      name: 'GARA-G',
      version: 'v0.3.0',
      category: 'opensource',
      status: 'active',
      tech: ['Rust', 'Flutter', 'P2P V2V', 'Polygon', 'Automotive Telemetry'],
      github: 'https://github.com/iberi22/gara-g',
      color: 'var(--color-accent)'
    },
    */
    {
      id: 'tripro-mining',
      name: 'Tripro SPA (Chile)',
      version: 'Producción',
      category: 'production',
      status: 'production',
      tech: ['PostgreSQL', 'Next.js', 'React', 'Astro', 'Python', 'n8n', 'Node.js', 'Flow Payments', 'Tailwind CSS'],
      demoUrl: 'https://www.tripro.cl',
      color: 'var(--color-accent)'
    },
    {
      id: 'smartax-mobile',
      name: 'Restrepo y Londoño / Smartax',
      version: 'Producción',
      category: 'production',
      status: 'production',
      tech: ['REST APIs', 'Google Play Console', 'Android SDK Compliance', 'PHP', 'WordPress Plugins', 'PDF Engine', 'JavaScript'],
      demoUrl: 'http://smartax.com.co',
      color: 'var(--color-secondary)'
    },
    {
      id: 'siesa-ecommerce',
      name: 'Siesa Ecommerce (E-Solutions)',
      version: 'Producción',
      category: 'production',
      status: 'production',
      tech: ['PHP (Yii2)', 'Angular', 'Linux (CentOS 7)', 'LAMP Stack', 'CI/CD Git', 'SSL & VPN', 'MySQL'],
      color: 'var(--color-accent-light)'
    },
    {
      id: 'logicalsoft-siip',
      name: 'LogicalSoft',
      version: 'Producción',
      category: 'production',
      status: 'production',
      tech: ['PHP', 'JavaScript', 'MySQL', 'ReactJS', 'Electron', 'Android Play Store', 'IndexedDB', 'AWS & GCP'],
      color: 'var(--color-accent)'
    },
    {
      id: 'los-tres-editores',
      name: 'Los Tres Editores SAS',
      version: 'Producción',
      category: 'production',
      status: 'production',
      tech: ['PostgreSQL (Triggers/Functions)', 'Java EE', 'PHP (FPDF)', 'Moodle', 'Linux Debian', 'iReport'],
      color: 'var(--color-secondary)'
    }
  ];

  function getProjectLocalized(p: BaseProject) {
    const key = `projects.${p.id}`;
    const nameVal = t(`${key}.name`);
    return {
      ...p,
      name: nameVal !== `${key}.name` ? nameVal : p.name,
      tagline: t(`${key}.tagline`),
      companyOrContext: t(`${key}.companyOrContext`),
      period: t(`${key}.period`),
      description: t(`${key}.description`),
      architecture: t(`${key}.architecture`),
      metrics: tArray<string>(`${key}.metrics`),
      researchLinks: p.researchUrls ? tArray<{ title: string; source: string }>(`${key}.researchLinks`).map((r, i) => ({
        ...r,
        url: p.researchUrls![i]?.url || '#'
      })) : [],
      timeline: tArray<{ date: string; label: string }>(`${key}.timeline`)
    };
  }

  let projects = $derived(baseProjects.map(getProjectLocalized));

  let filteredProjects = $derived(
    selectedCategory === 'all'
      ? projects
      : projects.filter((p) => p.category === selectedCategory)
  );

  function toggleProject(id: string) {
    expandedProject = expandedProject === id ? null : id;
  }

  function handleMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  }
</script>

<section id="projects" class="relative py-32 px-6">
  <div class="max-w-6xl mx-auto">
    <!-- SWAL Mission Banner -->
    <div class="text-center mb-20 max-w-3xl mx-auto">
      <a
        href="https://southwest-ai-labs.github.io"
        target="_blank"
        rel="noopener noreferrer"
        class="glass-card p-8 md:p-10 space-y-5 text-center block transition-all duration-300 hover:border-accent/40 hover:-translate-y-1 group cursor-pointer"
      >
        <p class="text-text-secondary text-sm leading-relaxed">
          {t('locale.announcement')}
        </p>
        <div class="w-12 h-px bg-accent/30 mx-auto"></div>
        <p class="text-text-muted text-sm leading-relaxed">
          {t('locale.mission')}
        </p>
        <div class="flex items-center justify-center gap-2 text-accent text-sm font-bold tracking-wider group-hover:underline">
          <span>{t('locale.accelerate')}</span>
          <span class="text-xs">↗</span>
        </div>
      </a>
    </div>

    <!-- Section Heading -->
    <div class="entry-clip">
      <span class="text-accent text-sm tracking-widest mb-4 block">{t('projects.heading')}</span>
      <h2 class="section-title">
        {t('projects.title')} <span class="text-accent">{t('projects.titleAccent')}</span> {t('projects.titleSuffix')}
      </h2>
      <p class="text-text-secondary text-lg mt-4 max-w-2xl">
        {t('projects.subtitle')}
      </p>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex flex-wrap gap-3 mt-10 mb-12">
      <button
        onclick={() => (selectedCategory = 'all')}
        class="px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border {selectedCategory === 'all' ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' : 'bg-bg-surface-dark border-white/10 text-text-muted hover:border-accent/40 hover:text-white'}"
      >
        {t('projects.filter.all')} ({projects.length})
      </button>
      <button
        onclick={() => (selectedCategory = 'production')}
        class="px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border {selectedCategory === 'production' ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' : 'bg-bg-surface-dark border-white/10 text-text-muted hover:border-accent/40 hover:text-white'}"
      >
        {t('projects.filter.production')}
      </button>
      <button
        onclick={() => (selectedCategory = 'opensource')}
        class="px-5 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer border {selectedCategory === 'opensource' ? 'bg-accent text-black border-accent shadow-lg shadow-accent/20' : 'bg-bg-surface-dark border-white/10 text-text-muted hover:border-accent/40 hover:text-white'}"
      >
        {t('projects.filter.opensource')}
      </button>
    </div>

    <!-- Projects List -->
    <div class="project-list">
      {#each filteredProjects as project, i (project.id)}
        <!-- Section Delimiter for Open Source -->
        {#if selectedCategory === 'all' && i === 0 && project.category === 'opensource'}
          <div class="pt-2 pb-4 flex items-center gap-3">
            <span class="text-xs font-mono font-bold tracking-widest text-accent uppercase">
              {t('projects.section.opensource')}
            </span>
            <div class="flex-1 h-px bg-accent/20"></div>
          </div>
        {/if}

        <!-- Section Delimiter for Labor Experience -->
        {#if selectedCategory === 'all' && project.category === 'production' && (i === 0 || filteredProjects[i - 1].category !== 'production')}
          <div class="pt-10 pb-4 flex items-center gap-3">
            <span class="text-xs font-mono font-bold tracking-widest text-secondary uppercase">
              {t('projects.section.production')}
            </span>
            <div class="flex-1 h-px bg-secondary/30"></div>
          </div>
        {/if}

        <article class="project-row entry-rise" style="animation-delay: {i * 70}ms">
          <div
            onmousemove={handleMouseMove}
            class="w-full text-start glass-card p-6 md:p-8 transition-all duration-500 rounded-xl"
            style:border-color={expandedProject === project.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.08)'}
          >
            <!-- Card Header -->
            <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 class="text-2xl font-bold text-text-primary">{project.name}</h3>
                  {#if project.isFlagship}
                    <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-accent/20 border border-accent text-accent shadow-sm shadow-accent/30 tracking-wider">
                      ★ PROYECTO ESTRELLA
                    </span>
                  {/if}
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-mono bg-bg-surface border border-white/10 text-text-muted">
                    {project.period}
                  </span>
                  {#if project.status === 'production'}
                    <span class="status-chip status-live"><span></span>{t('projects.status.production')}</span>
                  {:else if project.status === 'active'}
                    <span class="status-chip status-live"><span></span>{t('projects.status.active')}</span>
                  {:else if project.status === 'beta'}
                    <span class="status-chip status-beta">{t('projects.status.beta')}</span>
                  {:else}
                    <span class="status-chip status-prototype"><span></span>{t('projects.status.prototype')}</span>
                  {/if}
                  <span class="text-xs font-mono text-accent/80">
                    // {project.companyOrContext}
                  </span>

                  <!-- Direct Web Link Pill -->
                  {#if project.demoUrl}
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono text-accent bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors"
                      onclick={(e) => e.stopPropagation()}
                    >
                      <span>{project.demoUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                      <span class="text-[10px]">↗</span>
                    </a>
                  {/if}
                </div>
                <p class="text-accent text-sm font-mono mb-3">{project.tagline}</p>
                <p class="text-text-muted leading-relaxed text-sm md:text-base">{project.description}</p>
              </div>

              <div class="flex flex-col md:items-end gap-3 shrink-0">
                <div class="flex flex-wrap gap-1.5 max-w-[280px] md:justify-end">
                  {#each project.tech.slice(0, 4) as tech}
                    <span class="tech-badge">{tech}</span>
                  {/each}
                  {#if project.tech.length > 4}
                    <span class="tech-badge opacity-75">+{project.tech.length - 4}</span>
                  {/if}
                </div>
                
                <button
                  onclick={() => toggleProject(project.id)}
                  class="mt-2 inline-flex items-center gap-2 text-xs font-mono font-bold text-accent hover:text-white px-3 py-1.5 rounded-lg border border-accent/30 hover:border-accent bg-accent/5 transition-all duration-200 cursor-pointer"
                >
                  <span>{expandedProject === project.id ? t('projects.btn.hideDetails') : t('projects.btn.showDetails')}</span>
                  <svg
                    class="w-4 h-4 transition-transform duration-300"
                    style:transform={`rotate(${expandedProject === project.id ? 180 : 0}deg)`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Expandable Deep Dive Panel -->
            {#if expandedProject === project.id}
              <div class="details-panel mt-8 pt-8 border-t border-white/10 space-y-8">
                <!-- Architecture & Metrics Grid -->
                <div class="grid md:grid-cols-2 gap-8">
                  <!-- Architecture Breakdown -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-mono text-accent uppercase tracking-wider flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      {t('projects.label.architecture')}
                    </h4>
                    <p class="text-text-secondary text-sm leading-relaxed bg-bg-surface-dark/60 p-4 rounded-lg border border-white/5 font-mono">
                      {project.architecture}
                    </p>

                    <h4 class="text-xs font-mono text-accent uppercase tracking-wider pt-2 flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      {t('projects.label.stack')}
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      {#each project.tech as tech}
                        <span class="tech-badge tech-badge-strong">{tech}</span>
                      {/each}
                    </div>
                  </div>

                  <!-- Key Metrics & Insights -->
                  <div class="space-y-4">
                    <h4 class="text-xs font-mono text-secondary uppercase tracking-wider flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      {t('projects.label.metrics')}
                    </h4>
                    <div class="space-y-2.5">
                      {#each project.metrics as metric}
                        <div class="flex items-start gap-2.5 text-sm text-text-secondary bg-bg-surface-dark/40 p-3 rounded border border-white/5">
                          <span class="text-secondary font-mono text-xs mt-0.5">✓</span>
                          <span>{metric}</span>
                        </div>
                      {/each}
                    </div>

                    <!-- Links & Actions -->
                    <div class="pt-3 flex flex-wrap gap-3">
                      {#if project.github}
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="repo-link"
                        >
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                          <span>{t('projects.btn.viewRepo')}</span>
                        </a>
                      {/if}
                      {#if project.demoUrl}
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="repo-link border-accent/30 text-accent hover:border-accent"
                        >
                          <span class="text-xs">↗</span>
                          <span>{t('projects.btn.visitDemo')}</span>
                        </a>
                      {/if}
                    </div>
                  </div>
                </div>

                <!-- Academic Research & News References (if available) -->
                {#if project.researchLinks && project.researchLinks.length > 0}
                  <div class="pt-6 border-t border-white/5 space-y-3">
                    <h4 class="text-xs font-mono text-accent uppercase tracking-wider flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      {t('projects.label.research')}
                    </h4>
                    <p class="text-text-muted text-xs font-mono leading-relaxed">
                      {t('projects.label.researchDesc')}
                    </p>
                    <div class="grid md:grid-cols-3 gap-3 pt-1">
                      {#each project.researchLinks as link}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="flex flex-col justify-between p-3.5 rounded-lg bg-bg-surface-dark/70 border border-white/10 hover:border-accent/50 hover:bg-accent/5 transition-all text-xs font-mono group cursor-pointer"
                        >
                          <div class="space-y-1">
                            <span class="text-text-primary group-hover:text-accent font-bold leading-snug line-clamp-2 block">
                              {link.title}
                            </span>
                            <span class="text-text-muted text-[11px] block">
                              {link.source}
                            </span>
                          </div>
                          <div class="flex items-center gap-1 text-accent text-[11px] font-bold mt-3 pt-2 border-t border-white/5">
                            <span>{t('projects.btn.readStudy')}</span>
                            <span>↗</span>
                          </div>
                        </a>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Timeline & Milestones -->
                <div class="pt-6 border-t border-white/5">
                  <h4 class="text-xs font-mono text-text-muted mb-4 uppercase tracking-wider">{t('projects.label.timeline')}</h4>
                  <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {#each project.timeline as event}
                      <div class="p-3.5 rounded bg-bg-surface-dark/50 border border-white/5 space-y-1">
                        <span class="text-xs font-mono font-bold" style:color={project.color}>{event.date}</span>
                        <p class="text-xs text-text-secondary leading-relaxed">{event.label}</p>
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .project-list {
    display: grid;
    gap: 1.5rem;
  }

  .status-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    border-radius: 9999px;
    border-width: 1px;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-family: monospace;
  }

  .status-chip span {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 9999px;
    animation: pulse 1500ms ease-in-out infinite;
  }

  .status-live {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: var(--color-accent);
  }

  .status-live span {
    background: var(--color-accent);
  }

  .status-beta {
    background: rgba(6, 182, 212, 0.1);
    border-color: rgba(6, 182, 212, 0.3);
    color: var(--color-secondary);
  }

  .status-prototype {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.3);
    color: #f59e0b;
  }

  .status-prototype span {
    background: #f59e0b;
  }

  .tech-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    border-radius: 9999px;
    border: 1px solid rgba(16, 185, 129, 0.15);
    background: rgba(16, 185, 129, 0.05);
    padding: 0.2rem 0.6rem;
    color: var(--color-accent);
    font-size: 10px;
    font-family: monospace;
    font-weight: 700;
    transition: color 200ms ease, border-color 200ms ease;
  }

  .tech-badge-strong {
    border-color: rgba(16, 185, 129, 0.3);
    background: rgba(16, 185, 129, 0.1);
    color: var(--color-accent);
  }

  .repo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.5rem 1rem;
    color: var(--color-text-primary);
    font-size: 0.8rem;
    font-family: monospace;
    transition: color 200ms ease, border-color 200ms ease, transform 200ms ease;
    background: rgba(255, 255, 255, 0.03);
  }

  .repo-link:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-1px);
  }

  .details-panel {
    animation: detailsOpen 300ms cubic-bezier(.16, 1, .3, 1) both;
  }

  @keyframes detailsOpen {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    50% { opacity: 0.45; }
  }
</style>
