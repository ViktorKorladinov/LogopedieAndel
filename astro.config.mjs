// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

import turnstile from 'astro-turnstile';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.logopedieandel.pages.dev',
  output: 'static',
  adapter: cloudflare({
    imageService: 'compile',
  }),
  integrations: [sitemap(), turnstile()],
  vite: {
    plugins: [tailwindcss()]
  }
});