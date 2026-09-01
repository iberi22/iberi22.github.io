import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteUrl } from '../lib/baseUrl';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  // Rutas core
  const routes = [
    { loc: siteUrl(), changefreq: 'weekly', priority: '1.0' },
    { loc: siteUrl('projects/'), changefreq: 'weekly', priority: '0.9' },
    { loc: siteUrl('simulator/'), changefreq: 'daily', priority: '0.95' },
    { loc: siteUrl('agenda/'), changefreq: 'weekly', priority: '0.85' },
    { loc: siteUrl('blog/'), changefreq: 'daily', priority: '0.9' },
    { loc: siteUrl('contact/'), changefreq: 'monthly', priority: '0.7' },
  ];

  for (const p of posts) {
    routes.push({
      loc: siteUrl(`blog/${p.id}/`),
      changefreq: 'monthly',
      priority: '0.9',
    });
  }
  routes.push({ loc: siteUrl('rss.xml'), changefreq: 'daily', priority: '0.6' });

  const urls = routes
    .map(
      (r) => `  <url>\n    <loc>${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
