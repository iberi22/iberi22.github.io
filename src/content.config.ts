import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    published: z.boolean().default(false),
    // SEO / OG fields (optional so legacy posts keep building)
    description: z.string().optional(),
    canonical: z.string().optional(),
    readingTime: z.number().int().positive().optional(),
    image: z.string().optional(),
    ogImage: z.string().optional(),
    // Paywall / Flexible Sampling (Google isAccessibleForFree)
    paywalled: z.boolean().default(false),
    paywallSelector: z.string().default(".paywall"),
  }),
});

export const collections = { blog };
