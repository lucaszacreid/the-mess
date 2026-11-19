import type { APIRoute } from 'astro';
import { offerings } from '../data/offerings';

// Home plus one page per offering, dated at each build.
export const GET: APIRoute = ({ site }) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const pages = [
    { path: '/', priority: '1.0' },
    ...offerings.map((o) => ({ path: `/${o.slug}/`, priority: '0.8' })),
  ];
  const urls = pages
    .map(
      ({ path, priority }) => `  <url>
    <loc>${new URL(path, site).href}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${path === '/' ? `\n    <image:image><image:loc>${new URL('/og.jpg', site).href}</image:loc></image:image>` : ''}
  </url>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
