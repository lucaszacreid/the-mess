# Phase 1: Technical foundation

Done 16 November 2026. Live at https://www.themessconcept.co.uk (commit `016e406`).

## Lighthouse, before and after

Lighthouse 12 run locally in Chrome against the live site. PageSpeed Insights' API quota was exhausted.

| Profile | Run | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|---|
| Mobile | Before (×2) | 99 / 100 | 100 | **96** | 100 | 1.4 / 0.8 s | 1.6 / 0.9 s | 0–10 ms | **0.033** |
| Mobile | After (×2) | **100** | 100 | **100** | 100 | 1.0 s | 1.1 s | 0 ms | **0** |
| Desktop | After (×3) | 100 (one run 57*) | 100 | 100 | 100 | 0.3 s | 0.4 s | 0 ms | 0 |

\*The 57 came from a single 5.4 s server response on a cold cache. 99% of that run's LCP was time to first byte. Two re-runs and five `curl` samples showed responses of 0.09–0.29 s. Worth watching in Search Console's Core Web Vitals report once there's real-user data.

Core Web Vitals targets (LCP < 2.5 s, INP < 200 ms, CLS < 0.1) are all met with a wide margin. INP can't be measured in a lab test, but total blocking time is 0 ms.

## What changed

| Item | Change |
|---|---|
| Single source of truth | `src/data/business.ts` holds the name, address, geo, phone, email, hours, opening date and links. The page, footer, structured data and 404 all read from it. The build fails if a required local-SEO field is missing or the phone number is malformed |
| Countdown text | The opening countdown is retired. The server-rendered HTML said "Opening Sunday 15 November" to crawlers; it now says "Now open daily 08.00 – 18.00" with machine-readable `<time datetime>` values, and the countdown script is gone |
| Email hidden from crawlers | Cloudflare **Email Obfuscation** was replacing the address with `[email protected]` in the HTML Google reads and adding a script. The address is now wrapped in `<!--email_off-->`, so it's readable and the script is gone. The structured data was never affected |
| Fonts | Jost Light and Inter Bold (the faces used above the fold) are preloaded. This removed the 0.033 layout shift on the hero tags |
| Legible text on mobile | Body-type text is now at least 12px under 768px (offerings, local note, footer, hours, links, hero tags). Lighthouse's legible-font check now passes. Desktop sizes are unchanged |
| Tap targets | Hero tags, menu links, Visit links, email/phone and footer phone link all have at least 44–48px of tap area. The header wordmark went from 36px to 52px |
| 404 | A branded `/404` page with the wordmark, links home, to opening times and to Visit, plus name, address and phone. It's `noindex` and returns a real 404 status |
| Redirects / URLs | `vercel.json`: `cleanUrls` (`/index.html` → `/` with a 308) and `trailingSlash: true`, so one URL form is enforced before more pages are added. Files with extensions (`/sitemap.xml`, `/robots.txt`) are unaffected |
| Security headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (no camera, mic, geolocation or topics). HSTS was already on |
| Caching | `/_astro/*` (fingerprinted JS and fonts) is served `public, max-age=31536000, immutable` |

## Already in place (checked, no change needed)

- **Indexability:** `index, follow, max-image-preview:large`, no `noindex` anywhere public, and robots.txt allows all.
- **Host:** one canonical host, `https://www.themessconcept.co.uk/`. The apex and `http://` redirect 308 to it, and every page has a self-referencing absolute canonical.
- **Rendering:** fully static HTML. H1, copy, hours, address and phone are all in the server response. JS only enhances the page.
- **Sitemap:** generated at build, canonical URLs only, `lastmod` set to the build date. The 404 is excluded.
- **Mobile basics:** no horizontal scroll at 375px. Click-to-call (`tel:`) and click-to-map (Google Maps directions) links exist.
- **Accessibility:** one H1, logical H2/H3 order, `lang="en-GB"`, skip link, labelled menu button with `aria-expanded` and focus trap. Lighthouse Accessibility is 100.
- **Cookie consent:** there's no analytics or marketing tags yet, so no banner is needed. One becomes necessary when GA4 is added in Phase 8, with Consent Mode v2.

## AI crawler policy

`robots.txt` allows every crawler, including Googlebot, Google-Extended, GPTBot, ClaudeBot, PerplexityBot and Bingbot. This is deliberate, so AI assistants and AI Overviews can read and cite The Mess. To opt out of AI training later while staying in search, add for example:

```
User-agent: GPTBot
Disallow: /
User-agent: Google-Extended
Disallow: /
```

Cloudflare can block verified AI bots by IP even when robots.txt allows them, so check **Cloudflare → Security → Bots / AI Crawl Control** (in SEO_TODO).

## Not done (needs your OK or account access)

| Item | Why |
|---|---|
| Redirect `the-mess-six.vercel.app` to the www domain | A production domain setting in Vercel (Project → Settings → Domains → redirect). The canonical tag already covers it for Google |
| HSTS `includeSubDomains; preload` | A Cloudflare SSL/TLS setting that affects every subdomain, including email-related ones. Decide deliberately |
| Turn off Cloudflare Email Obfuscation site-wide | Optional now that the code opts out. Cloudflare → Scrape Shield |
| Image pipeline (AVIF/WebP, `srcset`, `fetchpriority`) | There are no photos yet. `astro:assets` `<Picture>` will be set up when real photos arrive in Phase 3 |
| Custom domain for the 404 test of trailing-slash paths | Unknown paths 308 to the trailing-slash form, then 404. That's one extra hop, which is harmless |

## Next

Phase 2 (site architecture and keyword map) needs the **High** items in `SEO_TODO.md`: which services exist, prices, timetable, booking links and the Interiors decision. Phases 6 and 7 (compliance wording and the off-site playbook) can go ahead now.
