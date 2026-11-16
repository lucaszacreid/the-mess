// Compliance guard (runs after every build, locally and on Vercel).
// Fails the build if the built site makes claims the UK ASA/CAP Code doesn't allow
// for complementary therapies or Pilates, or carries self-serving review markup.
// Rules and reasoning: docs/seo/06-compliance.md
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CONDITIONS =
  'anxiety|depression|insomnia|stress disorders?|ptsd|chronic pain|back pain|pain|migraines?|arthritis|fibromyalgia|cancer|tumou?rs?|diabetes|infertility|illness(es)?|diseases?|disorders?|injur(y|ies)|trauma|addiction|high blood pressure|hypertension|ibs|eczema|asthma';

const RULES = [
  { id: 'cure-claim', re: new RegExp(`\\b(cures?|curing|eliminates?|eradicates?)\\b[^.]{0,40}\\b(${CONDITIONS})\\b`, 'i'), why: 'claims to cure a condition' },
  { id: 'treat-claim', re: new RegExp(`\\b(treats?|treating|heals?|healing|fix(es)?|relieves?|reverses?|prevents?)\\b[^.]{0,30}\\b(${CONDITIONS})\\b`, 'i'), why: 'claims to treat, heal or prevent a condition' },
  { id: 'condition-for', re: new RegExp(`\\b(reiki|sound bath|breathwork|reflexology|crystal|energy healing)\\b[^.]{0,40}\\bfor\\s+(${CONDITIONS})\\b`, 'i'), why: 'presents a therapy as being for a medical condition' },
  { id: 'medical-proof', re: /\b(clinically|medically|scientifically) (proven|tested|approved)\b/i, why: 'claims clinical or scientific proof' },
  { id: 'immune-detox', re: /\b(boosts?|strengthens?) (your |the )?immune|\bdetox(ify|ifies|es)? (your |the )?(body|organs|blood)\b/i, why: 'immune / detox claim' },
  { id: 'rehab', re: /\b(rehabilitation|rehab|physiotherapy|post-surgery|post-operative)\b/i, why: 'medical rehab claim (only allowed if delivered by a registered physio; remove from this check if that becomes true)' },
  { id: 'replace-medicine', re: /\b(instead of|alternative to|replace(s)?) (your )?(medication|medicine|doctor|gp|therapy|treatment)\b/i, why: 'suggests replacing medical care' },
];

const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
};
walk('dist');

const problems = [];
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  // Self-serving star ratings for our own business are ignored by Google and can be flagged
  if (/"@type"\s*:\s*"(AggregateRating|Review)"/.test(html)) {
    problems.push(`${file}: structured data contains AggregateRating/Review for our own business`);
  }
  const text = html
    .replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ');
  for (const r of RULES) {
    const m = text.match(r.re);
    if (m) {
      const i = m.index ?? 0;
      problems.push(`${file}: ${r.why} → "…${text.slice(Math.max(0, i - 40), i + m[0].length + 40).trim()}…"`);
    }
  }
}

if (problems.length) {
  console.error('\n✗ Compliance check failed (see docs/seo/06-compliance.md):\n  ' + problems.join('\n  ') + '\n');
  process.exit(1);
}
console.log(`✓ Compliance check passed (${files.length} pages)`);
