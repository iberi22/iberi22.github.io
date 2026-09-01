import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteUrl } from '../lib/baseUrl';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'iberi22 Engineering Blog',
    description:
      'Análisis técnicos, arquitecturas de sistemas, infraestructura de IA y metodologías de ingeniería agéntica en producción por Brahyan Belalcázar (iberi22).',
    site: context.site ? siteUrl() : siteUrl(),
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.excerpt,
      pubDate: new Date(post.data.date),
      link: siteUrl(`blog/${post.id}/`),
      author: 'Brahyan Belalcázar <iberi22@gmail.com> (Brahyan Belalcázar)',
      categories: post.data.tags,
    })),
    customData: [
      '<language>es</language>',
      '<lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>',
      '<ttl>1440</ttl>',
    ].join(''),
  });
}
