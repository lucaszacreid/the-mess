# Phase 6: Compliance guardrails

These rules apply to the website, the Google Business Profile, Instagram captions, journal articles, flyers and anything else written about The Mess. They exist because breaking them can mean ASA rulings, takedowns, Google profile suspension or fines. Every one of them also keeps the brand credible.

This is a practical guide, not legal advice. If you're unsure about a specific claim, the CAP Copy Advice service gives free guidance on non-broadcast ads.

## 1. Wellness and complementary therapies (Reiki and similar)

**The rule:** under the UK CAP Code (section 12, Medicines, medical devices, health-related products and beauty products), marketing must not claim or imply that a complementary therapy can treat, cure, prevent or relieve any medical condition unless there's robust evidence. For Reiki, there isn't. Referring to conditions for which medical supervision should be sought is also off-limits.

| ✗ Don't write | ✓ Write instead |
|---|---|
| "Reiki heals anxiety and stress" | "A calm, quiet hour many people find relaxing" |
| "Relieves back pain / migraines / insomnia" | "Time to slow down and unwind" |
| "Boosts your immune system", "detoxifies the body" | "A peaceful space to switch off" |
| "Reiki for depression / trauma / cancer support" | "Reiki at The Mess: a gentle, restful session" |
| "Clinically proven", "scientifically shown" | (no evidence claims at all) |
| "An alternative to medication / therapy" | "Not a substitute for medical advice or treatment" |
| "Our healer…" | "Our Reiki practitioner…" |

**Describing the experience is fine:** what happens in a session, how long it lasts, what the room is like, and how people often say they feel (relaxed, calm, rested), framed as experience rather than outcome.

**Disclaimer** (on the site under Wellness, and on every future wellness page):

> Our wellbeing sessions are for relaxation and are not a substitute for medical advice or treatment.

## 2. Pilates

**Allowed:** strength, core stability, posture, flexibility, balance, mobility, body awareness, low-impact exercise, building confidence, and "a good complement to running, cycling…".

**Not allowed** unless the class is delivered by a registered physiotherapist, and then only within their scope:
- rehabilitation, "fixing" injuries, treating back pain, post-surgery recovery, pelvic floor treatment, sciatica, scoliosis "correction";
- weight-loss promises ("drop a dress size in 4 weeks") and guaranteed results;
- pre/postnatal classes **unless** the instructor holds a recognised pre/postnatal qualification. Say who holds it, and advise checking with a GP or midwife first.

Instructor credentials (e.g. Level 3 Mat/Reformer, STOTT, Polestar, BASI) may be stated only if they're true and current. List them in `SEO_TODO.md → {{TEAM}}`.

## 3. Reviews and testimonials

This covers Google's review policies and the **Digital Markets, Competition and Consumers Act 2024**, whose fake-review rules have applied since April 2025. The CMA can fine businesses directly for breaches.

**Never:**
- write, buy or commission fake reviews, including from friends or family posing as customers;
- offer anything in return for a review (discounts, free coffee, prize draws, loyalty stamps), even "for an honest review";
- review-gate: ask only happy customers, or send unhappy ones to a private form instead of Google;
- post reviews of competitors, or ask staff to review their own workplace;
- show a review on the site that you can't trace to a real customer, or edit one's meaning;
- add `AggregateRating`/`Review` structured data about The Mess to our own pages. The build blocks this.

**Always:**
- ask **everyone** the same way (the QR code at the counter and in the studio, and the same follow-up message after every class);
- reply to every review, good or bad, within 48 hours, specifically and politely, without revealing anything about a client's health or sessions;
- show only real, attributable reviews on the site (first name + source), using an approved Google widget or API when we add one.

## 4. Accuracy

Every price, time, class type, qualification, award and claim, in copy and in structured data, must be true at the time of publishing. Unknowns stay as placeholders in `SEO_TODO.md` and stay hidden on the site. During this phase two unverified lines were corrected:

- Pilates: "Small **mat** and reformer classes" became **"Reformer Pilates classes, guided with care."** (mat classes aren't confirmed)
- Wellness: "Quiet **treatments**…" became **"Calm, quiet sessions to relax and unwind, including Reiki."** ("treatment" implies a medical intervention)

## 5. How it's enforced

`scripts/check-claims.mjs` runs automatically after every `npm run build`, including Vercel's production builds, and **fails the deploy** if any built page:

- claims to cure, treat, heal, relieve or prevent a medical condition;
- presents a therapy as being "for" a condition (e.g. "Reiki for anxiety");
- claims clinical or scientific proof, immune boosting or detox;
- mentions rehab, physiotherapy or post-surgery work;
- suggests replacing medication or medical care;
- includes `AggregateRating` or `Review` structured data.

Run it on its own with `npm run check:claims`. If a genuine, compliant need comes up (e.g. a registered physio joins and runs rehab sessions), update the rule in the script and this document together.

Off-site copy (Google profile posts, Instagram, flyers, booking-platform descriptions) isn't checked automatically, so use the table in section 1.
