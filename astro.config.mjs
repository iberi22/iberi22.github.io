import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [svelte(), mdx()],
  site: 'https://iberi22.github.io',
  base: '/',
  output: 'static',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@astrojs/svelte'],
    },
  },
});
