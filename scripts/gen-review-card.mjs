// Printable "leave us a Google review" cards with a QR code to the review link.
// Output: brand-assets/print/ (A6 cards at 300dpi as PNG + SVG, dark and light,
// and an A4 sheet of four light cards for cutting). Wording follows
// docs/seo/06-compliance.md: everyone is asked, nothing is offered in return.
import QRCode from 'qrcode';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const REVIEW_URL = 'https://g.page/r/CfyfIECyz6BREBM/review';
const out = 'brand-assets/print';
mkdirSync(out, { recursive: true });

// QR as path data on a 1-unit grid, always dark modules on white (most reliable to scan)
const qr = QRCode.create(REVIEW_URL, { errorCorrectionLevel: 'Q' });
const n = qr.modules.size;
let d = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(y, x)) d += `M${x},${y}h1v1h-1z`;

const font = 'Helvetica Neue, Helvetica, Arial, sans-serif';
// A6 portrait in mm-based units (105 x 148)
const card = (dark) => {
  const bg = dark ? '#0A0A0A' : '#FFFFFF';
  const fg = dark ? '#FFFFFF' : '#0A0A0A';
  const dim = dark ? '#B9B3B1' : '#6B6766';
  const qrSize = 52, qrX = (105 - qrSize) / 2, qrY = 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="105mm" height="148mm" viewBox="0 0 105 148">
  <rect width="105" height="148" fill="${bg}"/>
  <text x="53.6" y="22" text-anchor="middle" font-family="${font}" font-weight="700" font-size="7.6" letter-spacing="3.8" fill="${fg}">THE MESS</text>
  <text x="53" y="28" text-anchor="middle" font-family="${font}" font-weight="300" font-size="2.6" letter-spacing="1.6" fill="${dim}">CONCEPT STORE</text>
  <line x1="45" y1="34" x2="61" y2="34" stroke="${dim}" stroke-width="0.25"/>
  <text x="53" y="44" text-anchor="middle" font-family="${font}" font-weight="300" font-size="3.6" letter-spacing="1.4" fill="${fg}">HOW WAS YOUR VISIT?</text>
  <text x="53" y="50.5" text-anchor="middle" font-family="${font}" font-weight="300" font-size="2.7" letter-spacing="0.9" fill="${dim}">WE'D LOVE TO HEAR WHAT YOU THINK</text>
  <rect x="${qrX - 4}" y="${qrY - 4}" width="${qrSize + 8}" height="${qrSize + 8}" rx="2" fill="#FFFFFF"/>
  <path transform="translate(${qrX} ${qrY}) scale(${qrSize / n})" d="${d}" fill="#0A0A0A"/>
  <text x="53" y="124" text-anchor="middle" font-family="${font}" font-weight="400" font-size="3.4" letter-spacing="1.3" fill="${fg}">LEAVE US A GOOGLE REVIEW</text>
  <text x="53" y="130" text-anchor="middle" font-family="${font}" font-weight="300" font-size="2.5" letter-spacing="0.8" fill="${dim}">SCAN WITH YOUR PHONE CAMERA</text>
  <text x="53" y="141" text-anchor="middle" font-family="${font}" font-weight="300" font-size="2.2" letter-spacing="0.8" fill="${dim}">37 OTAGO STREET · GLASGOW G12 8JJ</text>
</svg>`;
};

const px = (mm) => Math.round((mm / 25.4) * 300); // 300 dpi
for (const [name, dark] of [['review-card-dark', true], ['review-card-light', false]]) {
  const svg = card(dark);
  writeFileSync(`${out}/${name}.svg`, svg);
  await sharp(Buffer.from(svg), { density: 300 }).resize(px(105), px(148)).png().toFile(`${out}/${name}.png`);
}

// A4 sheet with four light A6 cards and faint cut marks
const light = card(false).replace(/<svg[^>]*>/, '').replace('</svg>', '');
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297">
  <rect width="210" height="297" fill="#FFFFFF"/>
  ${[[0, 0], [105, 0], [0, 148.5], [105, 148.5]].map(([x, y]) => `<g transform="translate(${x} ${y})">${light}</g>`).join('')}
  <path d="M105,0 V297 M0,148.5 H210" stroke="#D8D4D2" stroke-width="0.2" stroke-dasharray="1 1.5"/>
</svg>`;
writeFileSync(`${out}/review-cards-a4.svg`, sheet);
await sharp(Buffer.from(sheet), { density: 300 }).resize(px(210), px(297)).png().toFile(`${out}/review-cards-a4.png`);
console.log(`QR ${n}x${n} → ${REVIEW_URL}\nWrote cards to ${out}/`);
