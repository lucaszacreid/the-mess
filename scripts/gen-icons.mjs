// Generates favicon / apple-touch-icon / OG image into public/.
// If brand-assets/logo-square.jpg and logo-wide.jpg exist, they are used (and copied
// into public/brand). Otherwise a wordmark rendered from SVG is used as a fallback.
import sharp from 'sharp';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';

const BG = '#0A0A0A';
const FG = '#B9B3B1';
const src = 'brand-assets';
mkdirSync('public/brand', { recursive: true });

const square = `${src}/logo-square.jpg`;
const wide = `${src}/logo-wide.jpg`;

// Stacked wordmark, as on the menu board. Tracking is added after each letter, so shift
// each line left by half a letter-space to centre it optically.
const svgSquare = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BG}"/>
  <g font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="21" letter-spacing="3.6" fill="${FG}" text-anchor="middle">
    <text x="51.8" y="46.5">THE</text>
    <text x="51.8" y="71">MESS</text>
  </g>
</svg>`;

const svgWide = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <text x="630" y="300" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="84" letter-spacing="42" fill="${FG}">THE MESS</text>
  <line x1="520" y1="350" x2="680" y2="350" stroke="${FG}" stroke-width="1.5"/>
  <text x="604" y="405" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="300" font-size="20" letter-spacing="8" fill="#8A8584">COFFEE - INTERIORS - WELLBEING</text>
</svg>`;

const sqInput = existsSync(square) ? square : Buffer.from(svgSquare(512));
const wideInput = existsSync(wide) ? wide : Buffer.from(svgWide);

if (existsSync(square)) copyFileSync(square, 'public/brand/logo-square.jpg');
if (existsSync(wide)) copyFileSync(wide, 'public/brand/logo-wide.jpg');

const hi = existsSync(square) ? sqInput : Buffer.from(svgSquare(1024));
const png = (size, out) => sharp(hi).resize(size, size, { fit: 'cover' }).png().toFile(out);
await png(180, 'public/apple-touch-icon.png');
await png(32, 'public/favicon-32.png');
await png(48, 'public/favicon-48.png');   // Google Search shows favicons at multiples of 48px
await png(96, 'public/favicon-96.png');
await png(192, 'public/icon-192.png');
await png(512, 'public/icon-512.png');
await png(512, 'public/logo.png');        // Organization logo in the structured data
mkdirSync('brand-assets/google', { recursive: true });
await png(720, 'brand-assets/google/logo-720.png'); // upload as the Google Business Profile logo

// favicon.ico holding PNG images (16, 32, 48): the format every crawler and browser understands
const icoSizes = [16, 32, 48];
const imgs = await Promise.all(icoSizes.map((s) => sharp(hi).resize(s, s).png().toBuffer()));
const head = Buffer.alloc(6 + 16 * imgs.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
let off = head.length;
imgs.forEach((b, i) => {
  const e = 6 + 16 * i, s = icoSizes[i];
  head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(b.length, e + 8); head.writeUInt32LE(off, e + 12); off += b.length;
});
writeFileSync('public/favicon.ico', Buffer.concat([head, ...imgs]));
await sharp(wideInput).resize(1200, 630, { fit: 'contain', background: BG }).jpeg({ quality: 88 }).toFile('public/og.jpg');
if (!existsSync(square)) writeFileSync('public/favicon.svg', svgSquare(64));

console.log(existsSync(square) ? 'Icons generated from brand-assets.' : 'Brand assets not found: generated wordmark fallbacks.');
