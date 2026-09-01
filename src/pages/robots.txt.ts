import type { APIContext } from 'astro';
import { siteUrl } from '../lib/baseUrl';

export async function GET(context: APIContext) {
  const sitemap = siteUrl('sitemap.xml');
  const body = `User-agent: *
Allow: /

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
