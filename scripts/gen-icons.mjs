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

const svgSquare = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${BG}"/>
  <text x="50" y="44" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="8" fill="${FG}">THE</text>
  <text x="54" y="70" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="17" letter-spacing="8" fill="${FG}">MESS</text>
</svg>`;

const svgWide = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <text x="630" y="300" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="84" letter-spacing="42" fill="${FG}">THE MESS</text>
  <line x1="520" y1="350" x2="680" y2="350" stroke="${FG}" stroke-width="1.5"/>
  <text x="604" y="405" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="300" font-size="20" letter-spacing="8" fill="#8A8584">COFFEE · SHOP · PILATES · WELLNESS</text>
</svg>`;

const sqInput = existsSync(square) ? square : Buffer.from(svgSquare(512));
const wideInput = existsSync(wide) ? wide : Buffer.from(svgWide);

if (existsSync(square)) copyFileSync(square, 'public/brand/logo-square.jpg');
if (existsSync(wide)) copyFileSync(wide, 'public/brand/logo-wide.jpg');

await sharp(sqInput).resize(180, 180, { fit: 'cover' }).png().toFile('public/apple-touch-icon.png');
await sharp(sqInput).resize(32, 32, { fit: 'cover' }).png().toFile('public/favicon-32.png');
await sharp(sqInput).resize(192, 192, { fit: 'cover' }).png().toFile('public/icon-192.png');
await sharp(wideInput).resize(1200, 630, { fit: 'contain', background: BG }).jpeg({ quality: 88 }).toFile('public/og.jpg');
if (!existsSync(square)) writeFileSync('public/favicon.svg', svgSquare(64));

console.log(existsSync(square) ? 'Icons generated from brand-assets.' : 'Brand assets not found: generated wordmark fallbacks.');
