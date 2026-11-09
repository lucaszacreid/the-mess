import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://the-mess.vercel.app',
  output: 'static',
  build: { inlineStylesheets: 'always' },
});
