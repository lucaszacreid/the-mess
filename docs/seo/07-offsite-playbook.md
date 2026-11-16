# Phase 7: Off-site playbook

Google's local map results (the "Map Pack") depend more on your Google Business Profile (GBP) and your reviews than on the website. This is the step-by-step routine for everything that happens off the site. Work through sections 1–3 in the first two weeks, then keep up the routine in section 7.

**Your name, address and phone, character for character, everywhere:**

```
The Mess Concept
37 Otago Street
Glasgow G12 8JJ
+44 7856 050231
https://www.themessconcept.co.uk/
```

If the Google profile name is different (e.g. "THE MESS"), change it here, in `src/data/business.ts`, and on every listing below, so all of them match exactly.

---

## 1. Google Business Profile (set up, now optimise it)

### 1.1 One profile or several?
Google allows separate profiles only for genuinely distinct, customer-facing operations. Each needs its own category, and in practice its own hours, booking and signage. Splitting without meeting that bar risks a **suspension**.

- **Recommended now:** one profile for The Mess Concept, with the café as primary category and the others as secondary categories.
- **Revisit** if the Pilates studio gets its own entrance or signage, its own published hours and its own booking system. A separate "The Mess Concept Pilates" profile could then help with "pilates West End" searches.

### 1.2 Categories
- **Primary:** `Coffee shop`. Coffee is the daily footfall, the opening hours and the biggest search volume.
- **Secondary** (only what's true): `Pilates studio`, `Reiki therapist`, `Wellness center`, `Home goods store`, `Interior designer`, `Café`.
- After 4–6 weeks, compare Insights (searches and views per category). If Pilates drives most bookings, test it as primary for a few weeks and watch the Map Pack positions.

### 1.3 Fill in every field
- [ ] **Name:** exactly the real-world signage name, no keywords added (adding "Coffee Shop Glasgow" breaks Google's rules)
- [ ] **Website:** `https://www.themessconcept.co.uk/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- [ ] **Hours:** Mon–Sun 08:00–18:00, plus **special hours** for Christmas, New Year and bank holidays, entered at least a week ahead
- [ ] **Description** (up to 750 characters). Ready to paste:

  > The Mess Concept is a concept store on Otago Street in Glasgow's West End, a short walk from Kelvinbridge Subway. We bring speciality coffee and artisan pastries together with reformer Pilates, curated homeware and interior design services, and calm wellbeing sessions including Reiki, all under one roof. Come in for a flat white, stay for a class, and leave with something beautiful for your home. Open every day, 8am–6pm.

  (Edit the class and therapy wording once the details in `SEO_TODO.md` are confirmed, and no health claims; see `06-compliance.md`.)
- [ ] **Services**, each with a short description and price:
  - Coffee & pastries; Reformer Pilates class `{{price}}`; Private Pilates `{{price}}` (if offered); Reiki session `{{length}} / {{price}}`; Interior design consultation `{{price / "enquire"}}`
- [ ] **Products:** add 6–10 standout interiors pieces with photo, price and short description. These show in the profile and help "homeware West End Glasgow" searches
- [ ] **Menu:** use the menu editor (items + prices), and link to the menu page once Phase 3 builds `/cafe/menu/`
- [ ] **Booking link:** the Pilates and therapy booking URL (`{{PILATES_BOOKING_URL}}`)
- [ ] **Attributes:** tick only what's true: Wi-Fi, wheelchair-accessible entrance and toilet, dog-friendly, laptop-friendly, takeaway, vegan options, oat milk, NFC/card payments, LGBTQ+ friendly, etc.
- [ ] **Opening date:** 15 November 2026
- [ ] **Social links:** Instagram (and Facebook or TikTok if you have them)

### 1.4 Photos (the most-clicked part of a profile)
Upload **30+** real photos in the first fortnight, then **3–5 new ones every week**.
- Shopfront with signage (in daylight, and lit at dusk), so people recognise it on Otago Street
- The counter and the La Marzocco, coffee being poured, latte art, pastries
- Interiors: wide shots plus close-ups of pieces
- The Pilates studio (empty and in a class, with consent), and the reformers
- The calm wellness room
- The team (with consent)
- A short 10–30 second video of the space

The same photos (renamed descriptively) will feed the website in Phase 3.

### 1.5 Posts, Q&A and messages
- **Posts:** one a week (a new class time, a seasonal drink, a new interiors piece, an event). Include a photo and a button (Book, Learn more, Call).
- **Q&A** (if your profile still shows it): add and answer common questions from the owner account, e.g. *Is there Wi-Fi? Can I bring my dog? Do I need to book Pilates? Are beginners welcome? Do you do oat milk?*
- **Messages and calls:** turn on chat only if someone will answer within a few hours.

### 1.6 Apple Maps (Apple Business Connect)
iPhone users searching in Apple Maps or Siri see Apple's listing, not Google's. Claim **The Mess Concept** at businessconnect.apple.com and fill in the same name, address, phone, hours, photos, website (with `utm_source=apple`) and categories. **High priority.**

---

## 2. Review engine

Recent reviews, coming in week after week, count more than the total. Follow the rules in `06-compliance.md`: ask everyone, offer no incentives, never filter who gets asked.

### 2.1 Set up (week 1)
- [ ] Copy the **review link** from the GBP dashboard ("Ask for reviews") and send it over. Claude will:
  - add it to the site (the **LEAVE A REVIEW** link in Visit);
  - make a printable **QR card** for the counter, the studio and the wellness room.
- [ ] Booking system: add an automatic follow-up after **every** class and session, sent the same way to everyone:

  > Thanks for coming to The Mess today. If you have a minute, we'd really value a Google review. It helps people in the West End find us: {{GBP_REVIEW_URL}}

- [ ] Café: the QR card by the till, and a line on receipts if your till supports it. Staff can mention it naturally: "If you enjoyed it, we'd love a review."

### 2.2 Replying (within 48 hours, every review)
- **Positive:** thank them by name, mention something specific, and invite them back.
  > Thanks so much, Sarah. Lovely to hear you enjoyed the oat flat white after reformer. See you at the next class!
- **Negative:** thank them, acknowledge the issue without arguing, say what you'll change, and offer to take it offline.
  > Thank you for the honest feedback, and sorry the wait was longer than it should have been on Saturday. We've added an extra person on the bar at weekends. We'd love the chance to make it right: hello@themessconcept.co.uk.
- **Never** mention anything about a client's health, body or session details in a public reply.

**Target:** a steady **3–5+ new reviews a week**, spread across coffee, Pilates and wellness.

---

## 3. Directory listings and consistent details

Create or claim each listing with **exactly** the details at the top of this file. The same categories, hours, description (lightly varied) and website go everywhere. Track them in a simple spreadsheet (platform, login owner, date, status).

| Priority | Platform | Notes |
|---|---|---|
| High | Apple Business Connect | Apple Maps and Siri (see 1.6) |
| High | Bing Places for Business | Can import from Google. Also feeds ChatGPT and Copilot search |
| High | Facebook page | Add the address, hours and check-in location |
| High | Instagram | Business account with the address on the profile, and the website link with `?utm_source=instagram` |
| High | TripAdvisor | Visitors to Glasgow use it heavily for cafés |
| Med | Yelp UK | |
| Med | Foursquare / Swarm | Feeds many apps and car navigation systems |
| Med | Yell | |
| Med | Thomson Local | |
| Med | Scoot | Feeds several UK directories |
| Med | FreeIndex | Good for the wellness and interior design services |
| Med | People Make Glasgow / VisitScotland | Apply for a listing as a West End café / concept store |
| Med | The List | Also covers events (workshops, pop-ups) |
| Med | What's On Glasgow | Events |
| Studio / wellness | ClassPass, Mindbody, Fresha, Treatwell | Only the ones you actually take bookings through; each listing is also a citation |
| Studio / wellness | WhatClinic | Only for the therapy side, with compliant wording |

Search Google for `"Otago Street" "The Mess"` and `"7856 050231"` every couple of months, and fix any listing with an old or wrong name, address or phone.

---

## 4. Local press and "best of" lists

**The angle:** *a speciality coffee bar with a reformer Pilates studio, a Reiki room and a curated interiors shop under one roof on Otago Street, the West End's first "coffee-and-wellness" concept store.* Check that "first" is true before you use it, or drop it.

### 4.1 Who to pitch
- **News / features:** Glasgow Live, Glasgow Times, The Herald, The Scotsman (Food & Drink), The National
- **Listings / culture:** Time Out Glasgow, The Skinny, The List, Secret Glasgow, Glasgow World
- **Coffee and wellness writers:** Brian's Coffee Spot, Batch Coffee's guides, Double Skinny Macchiato, Faraway Lucy, Justin Plus Lauren, plus local Instagram food and wellness accounts
- **Ask existing roundups** ("best coffee shops in Glasgow's West End", "best Pilates in Glasgow") to consider adding The Mess. These pages already rank and are what AI assistants quote.

### 4.2 Pitch email (fill the blanks, keep it short)

> **Subject:** New on Otago Street: coffee, reformer Pilates and Reiki under one roof
>
> Hi {{name}},
>
> We've just opened The Mess Concept at 37 Otago Street in the West End (15 November). It's a concept store bringing together speciality coffee and artisan pastries, a reformer Pilates studio, calm wellbeing sessions including Reiki, and a small curated homeware shop.
>
> {{one specific, true detail: e.g. the roaster, the La Marzocco, where the interiors pieces come from, the founder's story}}
>
> Happy to host you for a coffee and a class, and we have photos ready to use. {{press pack link}}
>
> {{your name}} · The Mess Concept · +44 7856 050231 · themessconcept.co.uk

### 4.3 Press pack (prepare once)
10–15 high-res photos (landscape and portrait), the logo, a 150-word description, founder quote(s), and facts (opening date, address, hours, prices). Put it in a shared folder and link it in every pitch.

---

## 5. Partnerships (natural local links and footfall)

- University of Glasgow and Glasgow Caledonian student unions and sports clubs (student discount, intro Pilates)
- West End running clubs (post-run coffee; "Pilates for runners" sessions)
- West End Festival (June) events or a stall
- Nearby physios, osteopaths and yoga teachers (cross-referrals; they may link to you as a "where to go after rehab" option)
- Independent shops on Byres Road, Great Western Road and Gibson Street (joint events, a West End shop trail)
- Local makers whose pieces you stock (they'll often link to stockists)

Every partnership should end in a mention or a link on **their** website or Instagram. Ask for that politely.

---

## 6. Social signals

- **Handle:** use `@themessconcept` everywhere you can.
- **Link in bio:** `https://www.themessconcept.co.uk/?utm_source=instagram&utm_medium=social&utm_campaign=bio`
- **Geotag** every post and story to The Mess Concept, 37 Otago Street.
- **Tag** suppliers, roasters, makers and partners so they share you.

---

## 7. Ongoing routine

| When | Task | Owner |
|---|---|---|
| Daily | Reply to new reviews and messages | Manager |
| Weekly | 1 GBP post; 3–5 new photos; check reviews are still coming in; Instagram posts geotagged | Manager |
| Monthly | Check GBP Insights (calls, directions, website clicks, searches); update special hours; check Search Console (Phase 8) | Owner |
| Quarterly | Check listings stay consistent (section 3); pitch one story to press; review categories | Owner |
| Seasonal | Christmas and Mother's Day gift posts; January wellness; West End Festival | Owner |
