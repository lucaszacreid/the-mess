// Generates Apple/Google Wallet loyalty card artwork into brand-assets/wallet/.
// Upload these in the loyalty service's card designer.
// Needs a fresh `npm run build` first (the strip is cut from the built sketch).
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'node:fs';

const out = 'brand-assets/wallet';
mkdirSync(out, { recursive: true });
const BG = '#0A0A0A';
const FG = '#FFFFFF';
const font = "font-family=\"Helvetica Neue, Helvetica, Arial, sans-serif\"";

// Icon (square, shown in notifications and on the lock screen)
const icon = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BG}"/>
  <text x="52.5" y="47" text-anchor="middle" ${font} font-weight="700" font-size="15" letter-spacing="5" fill="${FG}">THE</text>
  <text x="52.5" y="68" text-anchor="middle" ${font} font-weight="700" font-size="15" letter-spacing="5" fill="${FG}">MESS</text>
</svg>`;

// Logo (top-left of the card, transparent so it sits on the card colour)
const logo = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 160 50">
  <text x="2" y="31" ${font} font-weight="700" font-size="15" letter-spacing="7" fill="${FG}">THE MESS</text>
</svg>`;

// Strip (the wide image across the card) cut from the coffee bar sketch
const html = readFileSync('dist/index.html', 'utf8');
const sketch = html.match(/<svg viewBox="0 130 1200 480"[\s\S]*?<\/svg>/)[0];
const css = `<style>.ln{fill:none;stroke:${FG};stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.o{fill:${BG}}.faint{stroke-opacity:.4}.sign{fill:none;stroke:${FG};stroke-width:1.4;font-family:Helvetica Neue;font-weight:700;text-anchor:middle}.sign-sub{fill:${FG};font-family:Helvetica Neue;font-weight:300;text-anchor:middle}.cup-text{fill:${FG};font-family:Helvetica Neue;font-weight:700;text-anchor:middle}</style>`;
const strip = (w, h) =>
  sketch
    .replace(/<svg ([^>]*)>/, (m, a) =>
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
      a.replace(/viewBox="[^"]*"/, 'viewBox="330 237 760 250"').replace(/role="img"|aria-labelledby="[^"]*"|preserveAspectRatio="[^"]*"/g, '') +
      ` preserveAspectRatio="xMidYMid slice">${css}<rect x="0" y="0" width="1200" height="610" fill="${BG}"/>`)
    .replace(/<title[\s\S]*?<\/title>/, '');

const jobs = [
  ['icon.png', icon(29)], ['icon@2x.png', icon(58)], ['icon@3x.png', icon(87)],
  ['logo.png', logo(160, 50)], ['logo@2x.png', logo(320, 100)], ['logo@3x.png', logo(480, 150)],
  ['strip.png', strip(375, 123)], ['strip@2x.png', strip(750, 246)], ['strip@3x.png', strip(1125, 369)],
  ['google-hero.png', strip(1032, 336)],
  ['icon-1024.png', icon(1024)],
];
for (const [name, svg] of jobs) await sharp(Buffer.from(svg)).png().toFile(`${out}/${name}`);
console.log(`Wrote ${jobs.length} files to ${out}/`);
