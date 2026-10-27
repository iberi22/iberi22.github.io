#!/usr/bin/env node
// Refreshes src/data/github-stats.json from public GitHub data only.
//
// Sources:
//   - REST API: public repositories of the user and the SWAL org, language bytes, releases and tags.
//   - https://github.com/users/<user>/contributions: the public contribution calendar shown on the profile.
//
// A token (GITHUB_TOKEN or GH_TOKEN) only raises the rate limit. Queries are restricted to public
// repositories so no private names or numbers can leak into the snapshot, even with a broader token.
//
// On any failure the script exits non-zero and leaves the committed snapshot untouched, so the site
// always builds with the last known good data.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const USER = 'iberi22';
const ORG = 'southwest-ai-labs';
// Projects shown in the timeline whose version comes from their latest release or tag.
const FEATURED = ['xavier', 'gestalt', 'photon-core', 'edge-mesh', 'OrionHealth', 'worldexams', 'shelf', 'gastronomic-open-standard-GOS'];

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-portfolio-stats`,
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status}`);
  return res.json();
}

async function listPublicRepos(kind, name) {
  const repos = [];
  for (let page = 1; page < 10; page++) {
    const q = kind === 'user' ? `type=owner` : `type=public`;
    const batch = await api(`/${kind === 'user' ? 'users' : 'orgs'}/${name}/repos?${q}&per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => !r.private && r.visibility !== 'private');
}

// Parses "1.2.3" out of a tag such as "v1.2.3-stable"; returns null for non-version tags.
export function parseVersion(tag) {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?/.exec(tag ?? '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)] : null;
}

export function cleanTag(tag) {
  const v = parseVersion(tag);
  return v ? `v${v.join('.')}` : null;
}

function newer(a, b) {
  const va = parseVersion(a), vb = parseVersion(b);
  if (!va) return b;
  if (!vb) return a;
  for (let i = 0; i < 3; i++) if (va[i] !== vb[i]) return va[i] > vb[i] ? a : b;
  return a;
}

async function latestVersion(owner, repo) {
  const [releases, tags] = await Promise.all([
    api(`/repos/${owner}/${repo}/releases?per_page=100`),
    api(`/repos/${owner}/${repo}/tags?per_page=100`),
  ]);
  const published = releases.filter((r) => !r.draft && !r.prerelease);
  const latestRelease = published[0] ?? null;
  const bestTag = tags.map((t) => t.name).filter(parseVersion).reduce((acc, t) => (acc ? newer(acc, t) : t), null);
  const best = latestRelease ? newer(latestRelease.tag_name, bestTag) : bestTag;
  return {
    version: cleanTag(best),
    releases: published.length,
    latestReleaseDate: latestRelease ? latestRelease.published_at.slice(0, 10) : null,
  };
}

// The public contribution calendar: one <td data-date> per day with a matching <tool-tip>.
export function parseCalendar(html) {
  const dates = new Map();
  for (const m of html.matchAll(/<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"/g)) dates.set(m[2], m[1]);
  for (const m of html.matchAll(/<td[^>]*id="([^"]+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g)) dates.set(m[1], m[2]);
  const days = [];
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const date = dates.get(m[1]);
    if (!date) continue;
    const n = /^([\d,]+) contributions?/.exec(m[2].trim());
    days.push({ date, count: n ? Number(n[1].replace(/,/g, '')) : 0 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));
  const monthly = new Map();
  for (const d of days) monthly.set(d.date.slice(0, 7), (monthly.get(d.date.slice(0, 7)) ?? 0) + d.count);
  return {
    total: days.reduce((s, d) => s + d.count, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    from: days[0]?.date ?? null,
    to: days.at(-1)?.date ?? null,
    monthly: [...monthly].map(([month, count]) => ({ month, count })),
  };
}

async function main() {
  const OUT = fileURLToPath(new URL('../src/data/github-stats.json', import.meta.url));
  const [user, org, userRepos, orgRepos] = await Promise.all([
    api(`/users/${USER}`),
    api(`/orgs/${ORG}`),
    listPublicRepos('user', USER),
    listPublicRepos('org', ORG),
  ]);

  const original = userRepos.filter((r) => !r.fork);
  const active = original.filter((r) => !r.archived);
  const sources = [...active.map((r) => [USER, r.name]), ...orgRepos.filter((r) => !r.fork && !r.archived).map((r) => [ORG, r.name])];

  const languageBytes = {};
  for (const [owner, name] of sources) {
    const langs = await api(`/repos/${owner}/${name}/languages`);
    for (const [lang, bytes] of Object.entries(langs)) languageBytes[lang] = (languageBytes[lang] ?? 0) + bytes;
  }
  const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(languageBytes).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 7).map(([name, bytes]) => ({ name, share: Math.round((bytes / totalBytes) * 1000) / 10 }));
  const otherShare = Math.round((100 - top.reduce((s, l) => s + l.share, 0)) * 10) / 10;
  if (otherShare > 0) top.push({ name: 'Other', share: otherShare });

  const projects = {};
  for (const repo of FEATURED) {
    if (!original.some((r) => r.name === repo)) continue; // only public repos are queried
    projects[repo] = await latestVersion(USER, repo);
  }

  const calRes = await fetch(`https://github.com/users/${USER}/contributions`, { headers: { 'User-Agent': headers['User-Agent'] } });
  if (!calRes.ok) throw new Error(`contributions calendar -> ${calRes.status}`);
  const contributions = parseCalendar(await calRes.text());
  if (!contributions.total) throw new Error('contributions calendar parsed as empty');

  const stats = {
    generatedAt: new Date().toISOString().slice(0, 10),
    user: USER,
    githubSince: user.created_at.slice(0, 4),
    publicRepos: { original: original.length, active: active.length, archived: original.length - active.length },
    org: { name: ORG, publicRepos: org.public_repos },
    stars: original.reduce((s, r) => s + r.stargazers_count, 0),
    contributions,
    languages: top,
    projects,
  };
  await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n');
  console.log(`github-stats: ${contributions.total} contributions, ${original.length} public repos, ${top.length} languages -> ${OUT}`);
}

if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`github-stats: keeping the committed snapshot (${err.message})`);
    process.exit(1);
  });
}
