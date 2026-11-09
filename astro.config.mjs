import { defineConfig } from 'astro/config';

// The public address of the site. Set SITE_URL (for example in Vercel's environment
// variables) once a custom domain like https://themessconcept.co.uk is connected;
// canonical links, the sitemap, robots.txt and structured data all follow it.
const site = process.env.SITE_URL || 'https://the-mess-six.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  build: { inlineStylesheets: 'always' },
});
