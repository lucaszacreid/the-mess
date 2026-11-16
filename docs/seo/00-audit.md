# Phase 0: SEO audit, The Mess (Glasgow West End)

Audited 16 November 2026, the day after opening. No site changes were made in this phase.

## 1. Stack

| Area | Finding |
|---|---|
| Framework | Astro 7 (`astro@^7.4.8`), static output (`output: 'static'`), no adapter |
| Rendering | Fully pre-rendered HTML at build time (SSG). All copy, hours, address and headings are in the HTML; JS only adds smooth scroll, the menu, reveal animations, the opening countdown and the animated coffee-bar sketch |
| Routes / router | File-based. Pages: `src/pages/index.astro` (the whole site), `robots.txt.ts`, `sitemap.xml.ts` |
| Hosting / deploy | Vercel project `the-mess`, auto-deploys on push to `main` (GitHub `lucaszacreid/the-mess`). No `vercel.json` |
| Domain / DNS | `www.themessconcept.co.uk` is canonical. The apex and `http://` redirect 308 to it. DNS and proxy run through Cloudflare. `the-mess-six.vercel.app` still serves a duplicate 200 copy |
| Security headers | HTTPS everywhere, HSTS `max-age=63072000` (no `includeSubDomains`/`preload` on the custom domain) |
| Images | No raster images on the page (0 `<img>`). The only artwork is the inline SVG sketch, plus `og.jpg` for link previews and `logo.png` for structured data. **No real photos of the venue anywhere** |
| Fonts | Self-hosted via Fontsource (Inter 700, Jost 300/400), Latin subset, `font-display: swap`. Not preloaded |
| CSS / JS | CSS is inlined (`inlineStylesheets: 'always'`). Two JS bundles: about 21 KB (page) and 26 KB (sketch animation) |
| Existing SEO | Hand-written: title, meta description, canonical, Open Graph and Twitter tags, geo meta, a JSON-LD `@graph` (WebSite, WebPage, CafeOrCoffeeShop with three `department`s), sitemap, robots.txt. Hooks exist for `googleVerification` and `googleReviewUrl`, both empty |
| Analytics / consent | None. No GA4, no tag manager, no cookie banner (none needed until analytics is added) |
| Booking / menu systems | None integrated. No menu, timetable, prices or booking links anywhere in the code |

## 2. Page inventory

| URL | Status | Title | Meta description | H1 | Canonical | Indexable | Words (visible) | Internal links |
|---|---|---|---|---|---|---|---|---|
| `/` | 200 | THE MESS \| Coffee Shop & Concept Store, Glasgow West End (60) | Speciality coffee and artisan pastries… Open daily 8am–6pm. (159) | THE MESS Concept Store | `https://www.themessconcept.co.uk/` | Yes | **≈196** | 13 in-page `#anchor` links only (menu, hero tags). No links to other pages because none exist |
| `/robots.txt` | 200 | n/a | n/a | n/a | n/a | n/a | n/a | Points to the sitemap |
| `/sitemap.xml` | 200 | n/a | n/a | n/a | n/a | n/a | n/a | Lists `/` only |
| `/index.html` | 200 (duplicate) | Same as `/` | | | Points to `/` | Covered by the canonical | | |
| `https://the-mess-six.vercel.app/` | 200 (duplicate) | Same as `/` | | | Points to www domain | Covered by the canonical, but should redirect | | |
| Any unknown URL | 404 | Vercel's default 404 | | | | | | No links back to the site |

Headings on `/`: H2 About, What we do (screen-reader only), Opening Times, Visit. H3 Coffee, Interiors, Pilates, Wellness.

Crawler access: robots.txt allows all bots. With crawler user agents, Googlebot, GPTBot, ClaudeBot and PerplexityBot all got a 200. Cloudflare can block verified AI bots by IP even when the user agent passes, so the Cloudflare **AI Crawl Control / Bot settings** still need checking in the dashboard (see SEO_TODO).

## 3. Business facts

### Known (in the code)
- Trading name on site: **The Mess Concept**, branded **THE MESS**, plus "Concept Store"
- Address: **37 Otago Street, Glasgow G12 8JJ** (Hillhead / West End; about 55.8747, −4.2816)
- Phone: **+44 7856 050231**. Email: **hello@themessconcept.co.uk**
- Instagram: **instagram.com/themessconcept**
- Hours on site: **Monday–Sunday 08.00–18.00** (one set of hours for everything)
- Opened: **Sunday 15 November 2026**
- About copy (from you): reformer pilates, speciality coffee and food, curated homeware, interior design services, wellbeing including Reiki
- Café: speciality coffee, artisan pastries
- Interiors: furniture, objects and homeware sourced worldwide in limited quantities, plus interior design services
- Equipment: La Marzocco espresso machine

### Missing (none of this is invented; all logged in `SEO_TODO.md`)
- **Google Business Profile**: the exact listing name, the profile/Maps URL, the review link, chosen categories, and whether there is one profile or several
- Café menu with items and prices, coffee roaster and bean origins, and dietary options (oat milk, vegan, gluten-free)
- Pilates: class types actually offered (reformer only, or mat as well), class length, class size, prices and intro offer, timetable, booking system, studio hours if they differ from the café, and private or duet sessions
- Wellness: therapies offered beyond Reiki, session lengths, prices, practitioner, and booking method
- Team: names, roles and qualifications of instructors, practitioners and baristas, with permission to publish them
- Real photos of the shopfront, counter, coffee, studio and treatment room
- Amenities: Wi-Fi, dog-friendly, step-free access, accessible toilet, laptop policy, card-only or cash
- Other profiles: Facebook, TikTok, ClassPass, Fresha, Treatwell, TripAdvisor
- Gift vouchers, private hire, events: whether any of these exist
- Interior design services: what's offered and how people enquire

## 4. Top 20 issues, ranked by impact

1. **The site is one thin page (≈196 words).** It can't rank for separate searches for coffee, Pilates and Reiki, and there's nothing for Google or AI answers to quote.
2. **No real facts for Pilates and wellness.** The site gives no class types, prices, timetable or booking route, and the Pilates and Wellness blurbs are still placeholders. Searches like "reformer pilates West End" need real detail to rank and convert.
3. **No real photos.** That hurts the Business Profile, image search, link previews and trust. The only visuals are illustrations.
4. **No menu in HTML.** "Coffee shop" and "brunch" searches, Google's menu link and AI answers all depend on readable menu text.
5. **No booking or conversion path.** There's no "Book a class" or "Book a session" link anywhere.
6. **The site isn't confirmed to match your Google Business Profile.** The name, categories, hours and website link need to match the site exactly. Google gives the Business Profile the most weight in the local map results.
7. **No reviews strategy is live.** The review link hook is empty, and new reviews coming in steadily is the strongest review signal.
8. **The site's name may not match your profile.** The site and its data say "The Mess Concept" and "THE MESS". The brief suggests "The Mess Glasgow" or "The Mess West End". Your profile name has to match your signage, so the site has to follow whatever the profile says.
9. **A Pilates studio on the same street may compete.** A studio called "Otago Street Pilates" appears in the brief's competitor list, and "Otago Street" plus "Pilates" overlaps. Our Pilates page has to make our brand unmistakable.
10. **The Interiors business line isn't in the brief.** Homeware and interior design are on the site but missing from the brief's plan. They need a decision: their own section, or kept light.
11. **The page still says "Opening Sunday 15 November".** That text is in the HTML Google reads; the JavaScript swaps it to "Now Open" only in browsers. The opening countdown should be retired now that you're open.
12. **The structured data is too generic.** Every department claims the café's hours. There's no `hasMenu` and no `hasOfferCatalog`, `HealthClub` is a weak fit for a Pilates studio, and `sameAs` has only Instagram. It also includes a `keywords` field that Google ignores.
13. **No Search Console or Bing Webmaster Tools yet.** The verification hook is empty and the sitemap hasn't been submitted.
14. **No analytics.** Without GA4 we can't measure bookings, calls or direction clicks.
15. **The vercel.app copy of the site is still live.** It's handled by the canonical link but should redirect to the domain (a Vercel domain setting).
16. **Vercel's default 404 page.** It has no links back to the site and no business details.
17. **No breadcrumbs or internal link structure.** That's expected for a single page, but it needs to be designed in when the site grows to several pages.
18. **No FAQ content.** That's missed coverage for common "People also ask" questions (opening hours, pricing, beginners, dogs).
19. **Main fonts aren't preloaded,** and the animation script runs on the homepage. Both are minor for loading speed; Lighthouse in Phase 1 will confirm.
20. **HSTS on the custom domain lacks `includeSubDomains` and `preload`.** This is a minor hardening step, done in Cloudflare or Vercel.

## 5. Phase plan, adapted to this site

| Phase | What I'll do | Blocked on you? |
|---|---|---|
| 1. Technical | Move the business facts into one data file. Retire the countdown text in the HTML. Add a custom 404. Preload fonts. Run a Lighthouse baseline. Recommend the vercel.app redirect and HSTS settings. Document the AI crawler policy | No (the Vercel and Cloudflare settings need your OK) |
| 2. Architecture + keyword map | Turn the single page into hubs for Café, Pilates, Wellness, Interiors (if wanted) and Visit, plus FAQ, Team and Journal. Keep the homepage design, change the menu links from page sections to separate pages, and add breadcrumbs. Only pages for services that exist | **Yes:** which services exist and the Interiors decision |
| 3. On-page | Titles, descriptions, H1s and copy of 400–800+ words per page in the brand voice, with local landmarks, booking calls to action and a sticky mobile button | **Yes:** menu, prices, timetable, booking links |
| 4. Structured data | Separate entities per business line, a menu, a list of offers and prices, services, team members, breadcrumbs, events, and a build-time test for missing fields | Partly: needs facts from Phases 2–3 |
| 5. Journal | 12 article drafts with direct answers up front, FAQs and author bylines, plus a 12-month content calendar | Partly: quotes from your team, and photos |
| 6. Compliance | ASA/CAP-safe wording for wellness claims, a disclaimer, and review policy guardrails | No |
| 7. Off-site playbook | Business Profile optimisation (already set up), review routine, local listings, press pitch list, partnerships | No (you carry it out) |
| 8. Measurement | Search Console and Bing verification, GA4 with consent mode and key events, IndexNow, checks on every pull request, a tracking plan | Partly: account access and verification codes |

**Recommendation:** Phases 1, 6 and 7 can go ahead now. Phases 2–4 should wait until the facts marked **High** in `SEO_TODO.md` are filled in. Pages built without real class types, prices and booking links would be thin, and could promise services you don't offer.
