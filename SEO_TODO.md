# SEO to-do: facts and tasks needed from The Mess

Every placeholder the SEO rollout depends on. Nothing here is invented on the site. Fill in the blanks, or reply with the answers, and they'll go into one data file that feeds every page and the structured data.

Owner: **You** = owner/team. **Claude** = done in code once you supply the fact.
Priority: **High** blocks the main pages (Phases 2–4). **Med** improves rankings. **Low** is nice to have.

## Google Business Profile (set up, now needs linking)

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| ~~`{{GBP_NAME}}`~~ ✅ **The Mess Concept** (confirmed from the profile; matches the site) | The exact name on the profile, character for character (e.g. "The Mess Concept" or "THE MESS"). The site, its data and every listing must match it | You | High |
| ~~`{{GBP_URL}}`~~ ✅ place ID `ChIJe6kB_TFFiEgR_J8gQLLPoFE`, linked from Get Directions and the structured data | The profile's Google Maps link (Share → copy link) | You | High |
| ~~`{{GBP_REVIEW_URL}}`~~ ✅ https://g.page/r/CfyfIECyz6BREBM/review, live on the site plus print cards in `brand-assets/print/` | The "Ask for reviews" link from the profile dashboard. Turns on the LEAVE A REVIEW link | You | High |
| `{{GBP_CATEGORIES}}` | Primary and secondary categories you chose | You | Med |
| `{{GBP_PROFILES}}` | One profile, or separate ones for café, Pilates and wellness? If separate, send each name and link | You | High |
| `{{GBP_WEBSITE_LINK}}` | Confirm the profile's website link is `https://www.themessconcept.co.uk/?utm_source=google&utm_medium=organic&utm_campaign=gbp` | You | Med |

## Café

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{MENU}}` | ✅ **Drinks added** (from the menu board, in `src/data/menu.ts`). Still needed: pastries and food with prices | You | Med |
| `{{ROASTER}}` | Coffee roaster and bean origins, plus any signature drinks | You | Med |
| `{{DIETARY}}` | Oat/plant milks, vegan, gluten-free options (only what's true) | You | Med |
| `{{BAKER}}` | Who supplies the pastries (name, or keep it as "artisan") | You | Low |
| `{{CAFE_HOURS}}` | Confirm café hours are Mon–Sun 08.00–18.00, plus any holiday hours | You | High |

## Pilates

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{PILATES_CLASS_TYPES}}` | Reformer? Mat? Beginners? Pre/postnatal? (only what's actually offered) | You | High |
| `{{PILATES_PRICES}}` | Drop-in price, class packs, memberships, intro offer | You | High |
| `{{PILATES_TIMETABLE}}` | Weekly timetable (days, times, class names, length) | You | High |
| `{{PILATES_CLASS_SIZE}}` | Max people per class / number of reformers | You | Med |
| `{{PILATES_BOOKING_URL}}` | Booking system and link (Mindbody, Momence, ClassPass, Acuity…) | You | High |
| `{{PILATES_PRIVATE}}` | 1:1 or duet sessions offered? Price? | You | Med |
| `{{STUDIO_HOURS}}` | Studio hours if they differ from the café | You | Med |
| `{{STUDIO_LOCATION}}` | Where the studio sits in the building (e.g. upstairs, back room) | You | Low |

## Wellness

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{THERAPIES}}` | Every therapy offered (Reiki, plus any others) | You | High |
| `{{THERAPY_PRICES}}` | Price and length of each session | You | High |
| `{{THERAPY_BOOKING_URL}}` | How to book (link, phone, Fresha, Treatwell…) | You | High |
| `{{PRACTITIONERS}}` | Who delivers each therapy | You | Med |

## Interiors

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{INTERIORS_PAGES}}` | Should interiors (homeware + interior design) get its own section? The SEO brief left it out | You | High |
| `{{DESIGN_SERVICE}}` | What the interior design service includes and how people enquire | You | Med |
| `{{SHOP_ONLINE}}` | Any online shop, or in-store only? | You | Low |

## Team (credibility pages)

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{TEAM}}` | Name, role, short bio and qualifications for each instructor, practitioner and head barista, with their OK to publish | You | Med |
| `{{TEAM_PHOTOS}}` | Headshots (optional but strongly recommended) | You | Low |

## Venue details

| Placeholder | What's needed | Owner | Priority |
|---|---|---|---|
| `{{PHOTOS}}` | Real photos: shopfront with signage, counter, La Marzocco, coffee, pastries, interiors stock, studio, treatment room, team. 20–30 to start | You | High |
| `{{AMENITIES}}` | Wi-Fi? Dog-friendly? Step-free access? Accessible toilet? Laptops welcome? Card-only? | You | Med |
| `{{SOCIALS}}` | Facebook, TikTok, TripAdvisor, ClassPass/Fresha/Treatwell profile links | You | Med |
| `{{VOUCHERS}}` | Do you sell gift vouchers (online or in store)? | You | Med |
| `{{PRIVATE_HIRE}}` | Is the space available to hire? | You | Low |
| `{{EVENTS}}` | Any workshops, sound baths, pop-ups or run clubs with dates | You | Low |

## Accounts and settings (off-site)

| Task | Owner | Priority |
|---|---|---|
| ✅ Verified in Search Console (17 Nov 2026). Keep the tag in `business.ts`. Submit the sitemap if not done. ~~Verify the domain in **Google Search Console** (a DNS TXT record in Cloudflare is easiest, or send the HTML tag code for `googleVerification`) and submit `https://www.themessconcept.co.uk/sitemap.xml`~~ | You | High |
| Verify in **Bing Webmaster Tools** (can import from Search Console) and submit the sitemap | You | Med |
| Create a **GA4** property and send the measurement ID (`G-…`) so analytics and consent mode can be added | You | Med |
| In **Vercel**, redirect `the-mess-six.vercel.app` to `www.themessconcept.co.uk` (Project → Settings → Domains), or OK Claude to do it via the CLI | You / Claude | Med |
| In **Cloudflare**, check Security → Bots / AI Crawl Control isn't blocking Googlebot, Google-Extended, GPTBot, ClaudeBot or PerplexityBot (you want AI assistants to cite you) | You | Med |
| Optional: turn on HSTS `includeSubDomains` + `preload` in Cloudflare SSL/TLS → Edge Certificates | You | Low |
| Optional: turn off Cloudflare **Scrape Shield → Email Address Obfuscation** (the site already opts out in code, since it was hiding the email from Google) | You | Low |
