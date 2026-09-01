// Full canonical site URL (GitHub Pages project base included), with trailing
// slash normalization matching Astro static directory output.
export const SITE_ORIGIN = 'https://iberi22.github.io';

function hasTrailingSlashNeeded(path: string): boolean {
  const last = path.split('/').pop() ?? '';
  return !last.includes('.'); // file routes (rss.xml, sitemap.xml) keep no slash
}

export function siteUrl(path = '') {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const clean = path.replace(/^\//, '');
  const full = clean === '' ? base : `${base}${clean}`;
  const url = `${SITE_ORIGIN}${full}`;
  if (!hasTrailingSlashNeeded(full)) return url;
  return url.endsWith('/') ? url : `${url}/`;
}

// Canonical URL for a built page: Astro.url.pathname already includes the
// configured base, so only the origin is prepended.
export function canonicalFromPath(pathname: string) {
  return `${SITE_ORIGIN}${pathname.endsWith('/') ? pathname : `${pathname}/`}`;
}

export function baseUrl(path = '') {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${path}`;
}
