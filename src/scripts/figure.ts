// Detailed fine-line person for the coffee bar sketch, seen side-on and facing right
// in local coordinates (feet on y = 600). Arms and legs are two-bone limbs with
// elbows and knees, so walking bends the knees and lifts the heels, and hands can be
// placed on a target (a cup, a portafilter, a barista's outstretched hand).

import { cupMarkup } from '../lib/sketch';

const NS = 'http://www.w3.org/2000/svg';
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

type V = { x: number; y: number };
const v = (x: number, y: number): V => ({ x, y });
const f = (n: number) => n.toFixed(1);

// ---------- Skeleton ----------
const SHOULDER = v(2, 328);
const UPPER_ARM = 58;
const FOREARM = 52;
const HIP = v(0, 470);
const THIGH = 62;
const SHIN = 58; // ankle at y 590, sole at 600

const fk = (p: V, len: number, ang: number): V => v(p.x + len * Math.sin(ang), p.y + len * Math.cos(ang));

/** Two-bone IK. Angles are measured from straight down, positive = forward (+x). */
function ik(s: V, t: V, l1: number, l2: number): { e: V; w: V } {
  let dx = t.x - s.x;
  let dy = t.y - s.y;
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 0.5;
  const min = Math.abs(l1 - l2) + 1;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  if (d < min) { dx *= min / d; dy *= min / d; d = min; }
  const base = Math.atan2(dx, dy);
  const off = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const a = base - off; // elbow sits below / behind the line to the hand
  const e = fk(s, l1, a);
  return { e, w: v(s.x + dx, s.y + dy) };
}

/**
 * A whole bent limb (upper arm + forearm, or thigh + shin) as one outline: the
 * outside of the joint is rounded, the inside meets at a crease, and there are no
 * lines across the joint. Rounded at the root (shoulder / hip), open at the end
 * where a hand or shoe takes over.
 */
function limb2(a: V, b: V, c: V, wa: number, wbA: number, wbB: number, wc: number) {
  const unit = (p: V, q: V) => {
    const dx = q.x - p.x, dy = q.y - p.y, l = Math.hypot(dx, dy) || 1;
    return v(dx / l, dy / l);
  };
  const dA = unit(a, b), dB = unit(b, c);
  const nA = v(-dA.y, dA.x), nB = v(-dB.y, dB.x);
  const cross = dA.x * dB.y - dA.y * dB.x;
  const inner = cross >= 0 ? 1 : -1;
  const add = (p: V, n: V, w: number) => v(p.x + n.x * w, p.y + n.y * w);

  const joint = (side: 1 | -1, back = false) => {
    const p1 = add(b, nA, side * wbA);
    const p2 = add(b, nB, side * wbB);
    const [u1, u2] = back ? [p2, p1] : [p1, p2];
    if (Math.abs(cross) < 0.02) return `L${f(u1.x)},${f(u1.y)} L${f(u2.x)},${f(u2.y)}`;
    if (side === inner) {
      // crease: where the two offset edges meet, kept close to the joint
      const q1 = add(a, nA, side * wa);
      const r1 = v(p1.x - q1.x, p1.y - q1.y);
      const q2 = add(c, nB, side * wc);
      const r2 = v(q2.x - p2.x, q2.y - p2.y);
      const den = r1.x * r2.y - r1.y * r2.x;
      if (Math.abs(den) > 1e-6) {
        const t = ((p2.x - q1.x) * r2.y - (p2.y - q1.y) * r2.x) / den;
        const i = v(q1.x + r1.x * t, q1.y + r1.y * t);
        if (Math.hypot(i.x - b.x, i.y - b.y) < Math.max(wbA, wbB) * 2.2) return `L${f(i.x)},${f(i.y)}`;
      }
      const m = v((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      const pull = v(b.x + (m.x - b.x) * 0.4, b.y + (m.y - b.y) * 0.4);
      return `L${f(pull.x)},${f(pull.y)}`;
    }
    // outside of the bend: a rounded elbow / knee
    let m = v(nA.x + nB.x, nA.y + nB.y);
    const ml = Math.hypot(m.x, m.y);
    m = ml < 0.25 ? v(dA.x, dA.y) : v((m.x / ml) * side, (m.y / ml) * side);
    const r = (wbA + wbB) / 2;
    const ctrl = v(b.x + m.x * r * 1.35, b.y + m.y * r * 1.35);
    return `L${f(u1.x)},${f(u1.y)} Q${f(ctrl.x)},${f(ctrl.y)} ${f(u2.x)},${f(u2.y)}`;
  };

  const s0 = add(a, nA, wa), s1 = add(c, nB, wc), e1 = add(c, nB, -wc), e0 = add(a, nA, -wa);
  return (
    `M${f(s0.x)},${f(s0.y)} ${joint(1)} L${f(s1.x)},${f(s1.y)} L${f(e1.x)},${f(e1.y)} ${joint(-1, true)}` +
    ` L${f(e0.x)},${f(e0.y)} A${wa},${wa} 0 0 0 ${f(s0.x)},${f(s0.y)}`
  );
}

/** A short line across a limb at point p (cuffs, hems). */
function across(a: V, b: V, p: V, w: number) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  const n = v(-dy / l, dx / l);
  return `M${f(p.x + n.x * w)},${f(p.y + n.y * w)} L${f(p.x - n.x * w)},${f(p.y - n.y * w)}`;
}
const lerpV = (a: V, b: V, t: number) => v(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);

// ---------- Motion helpers ----------
/** Damped spring, used for anything that should lag, swing and settle (hems, bags, hair). */
class Spring {
  x = 0;
  vel = 0;
  constructor(private k = 60, private c = 8) {}
  step(target: number, dt: number) {
    if (dt <= 0) return this.x;
    const steps = Math.ceil(dt / 0.02);
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      this.vel += (this.k * (target - this.x) - this.c * this.vel) * h;
      this.x += this.vel * h;
    }
    return this.x;
  }
}
const approach = (cur: number, target: number, rate: number, dt: number) => cur + (target - cur) * Math.min(1, rate * dt);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const deg = (r: number) => (r * 180) / Math.PI;

// ---------- Wardrobe ----------
export type OutfitName = 'wool' | 'puffer' | 'trench' | 'knit' | 'blazer' | 'dress' | 'barista';
export type HairName = 'bob' | 'pony' | 'bun' | 'crop' | 'curly' | 'long' | 'beanie' | 'cap';
export type ShoeName = 'trainer' | 'loafer' | 'ankleboot' | 'boot';
export type BottomName = 'straight' | 'jeans' | 'wide' | 'tights';

/** The part of a long garment below the waist, redrawn every frame so it can swing. */
interface Skirt {
  y0: number; back0: number; front0: number; // at the waist
  y1: number; back1: number; front1: number; // at the hem
  lines?: number[]; // solid lines from waist to hem, as fractions back→front
  faint?: number[]; // faint lines (seams, pleats)
  pocket?: [number, number, number]; // [down fraction, from, to]
  buttons?: number[]; // down fractions, on the front edge
}

interface Outfit {
  upper: string; // shoulders to waist (or to the hem for short garments)
  skirt?: Skirt;
  sleeve: [number, number, number];
  sleeveStyle: 'full' | 'rolled' | 'knit' | 'puffer';
  bottoms: BottomName[];
  shoes: ShoeName[];
}

const OUTFITS: Record<OutfitName, Outfit> = {
  wool: {
    upper:
      '<path class="ln o" d="M-4,314 C-15,317 -23,328 -24,350 L-25,444 L27,444 C27,400 27,360 22,336 C19,324 14,317 8,315 Z"/>' +
      '<path class="ln" d="M8,315 L16,338 L11,350 L19,362 M-4,314 Q-9,306 -3,299"/>' +
      '<circle class="ln" cx="23" cy="392" r="1.6"/><circle class="ln" cx="24" cy="428" r="1.6"/>' +
      '<path class="ln faint" d="M-2,346 Q-6,400 -5,442"/>',
    skirt: { y0: 440, back0: -25, front0: 27, y1: 540, back1: -28, front1: 30, faint: [0.42], pocket: [0.36, 0.55, 0.92], buttons: [0.24] },
    sleeve: [8.5, 7.5, 6.8],
    sleeveStyle: 'full',
    bottoms: ['straight', 'wide'],
    shoes: ['loafer', 'ankleboot', 'boot'],
  },
  puffer: {
    upper:
      '<path class="ln o" d="M-6,312 C-22,316 -31,330 -31,354 L-31,476 Q0,485 33,476 L32,354 C32,330 23,316 10,312 Z"/>' +
      '<path class="ln" d="M-31,352 Q0,359 32,352 M-31,384 Q0,391 32,384 M-31,416 Q0,423 32,416 M-31,448 Q0,455 32,448"/>' +
      '<path class="ln o" d="M-7,313 L-7,298 Q2,293 11,298 L11,313 Z"/><path class="ln faint" d="M31,318 L32,474 M-7,305 L11,305"/>',
    sleeve: [10, 9.5, 8],
    sleeveStyle: 'puffer',
    bottoms: ['jeans', 'straight'],
    shoes: ['trainer'],
  },
  trench: {
    upper:
      '<path class="ln o" d="M-4,314 C-15,317 -22,328 -23,350 L-24,434 L25,434 C27,395 26,358 21,336 C18,324 14,317 8,315 Z"/>' +
      '<path class="ln" d="M8,315 L22,346 L18,351 M-11,320 L4,317"/>' +
      '<circle class="ln" cx="20" cy="372" r="1.5"/><circle class="ln" cx="13" cy="374" r="1.5"/><circle class="ln" cx="21" cy="400" r="1.5"/><circle class="ln" cx="14" cy="402" r="1.5"/>' +
      '<path class="ln o" d="M-24,422 L26,422 L26,436 L-24,436 Z"/><path class="ln o" d="M12,420 L19,420 L19,437 L12,437 Z"/><path class="ln" d="M15.5,424 L15.5,433"/>',
    skirt: { y0: 437, back0: -24, front0: 26, y1: 528, back1: -31, front1: 33, lines: [0.66], faint: [0.1] },
    sleeve: [8, 7, 6.2],
    sleeveStyle: 'full',
    bottoms: ['straight', 'tights'],
    shoes: ['ankleboot', 'loafer'],
  },
  knit: {
    upper:
      '<path class="ln o" d="M-4,316 C-15,318 -21,330 -21,350 L-21,468 Q0,472 22,468 L21,352 C21,334 15,320 8,316 Z"/>' +
      '<path class="ln" d="M-4,316 Q2,322 8,316 M-21,459 Q0,463 22,459"/>' +
      '<path class="ln faint" d="M-17,460 L-17,468 M-12,461 L-12,469 M-7,462 L-7,470 M-2,462 L-2,470 M3,462 L3,470 M8,462 L8,470 M13,461 L13,469 M18,460 L18,468"/>' +
      '<path class="ln faint" d="M14,330 q-3,10 0,20 q3,10 0,20 q-3,10 0,20 q3,10 0,20 q-3,10 0,20 M8,332 q3,10 0,20 q-3,10 0,20 q3,10 0,20 q-3,10 0,20 q3,10 0,20"/>',
    sleeve: [7.5, 6.8, 6],
    sleeveStyle: 'knit',
    bottoms: ['wide', 'jeans'],
    shoes: ['trainer', 'loafer'],
  },
  blazer: {
    upper:
      '<path class="ln o" d="M-4,314 C-14,317 -20,328 -20,348 L-20,488 L23,486 L22,350 C22,332 15,319 8,315 Z"/>' +
      '<path class="ln" d="M8,315 L11,305 M8,315 L15,340 L12,344 L19,352 L15,410"/>' +
      '<circle class="ln" cx="17" cy="422" r="1.6"/><path class="ln" d="M3,452 L19,451 M-6,360 L4,359"/>' +
      '<path class="ln faint" d="M-20,470 L22,470"/>',
    sleeve: [7, 6.3, 5.6],
    sleeveStyle: 'full',
    bottoms: ['straight', 'wide'],
    shoes: ['ankleboot', 'loafer'],
  },
  dress: {
    upper:
      '<path class="ln o" d="M-4,316 C-14,318 -19,330 -19,350 L-17,432 Q0,436 18,432 L19,352 C19,334 14,320 8,316 Z"/>' +
      '<path class="ln" d="M-4,316 Q3,324 8,316"/><path class="ln faint" d="M-17,424 Q0,428 18,424"/>',
    skirt: { y0: 428, back0: -17, front0: 18, y1: 550, back1: -31, front1: 33, faint: [0.2, 0.4, 0.6, 0.8] },
    sleeve: [6.5, 5.8, 5],
    sleeveStyle: 'full',
    bottoms: ['tights'],
    shoes: ['boot', 'ankleboot'],
  },
  barista: {
    upper:
      '<path class="ln o" d="M-4,316 C-15,318 -21,330 -21,350 L-21,480 L22,480 L21,352 C21,334 15,320 8,316 Z"/>' +
      '<path class="ln" d="M8,316 L12,306 M-4,316 L-8,307"/>' +
      '<path class="ln o" d="M12,334 L25,338 L28,482 L13,482 Z"/>' +
      '<path class="ln" d="M4,305 L12,334 M-21,402 L13,402 M-21,402 l-9,-5 l1,10 Z M-21,402 l-6,12"/>' +
      '<path class="ln faint" d="M15,360 L24,361 L24,374 L15,373 Z M20,356 L20,368"/>',
    sleeve: [7.4, 6.8, 4.6],
    sleeveStyle: 'rolled',
    bottoms: ['straight'],
    shoes: ['trainer'],
  },
};

const BOTTOMS: Record<BottomName, [number, number, number]> = {
  straight: [11, 9, 8],
  jeans: [10.5, 8.5, 7.5],
  wide: [12.5, 12.5, 13.5],
  tights: [7.5, 5.5, 4.5],
};

// Shoes, drawn with the ankle at the origin and the sole on y = 10, toe toward +x.
const SHOES: Record<ShoeName, string> = {
  trainer:
    '<path class="ln o" d="M-7,-6 C-8,2 -8,10 -6,10 L19,10 C23,10 24,7 22,4 C19,1 12,-1 6,-3 L3,-7 Z"/>' +
    '<path class="ln" d="M-7,7 L23,7"/><path class="ln faint" d="M5,-2 l3,-3 M9,-1 l3,-3 M13,0 l3,-2"/>',
  loafer:
    '<path class="ln o" d="M-6,-3 L-7,10 L19,10 C22,10 22,6 19,4 C14,1 8,0 3,-2 Z"/>' +
    '<path class="ln" d="M-7,8 L21,8"/><path class="ln faint" d="M6,0 q5,3 10,3"/>',
  ankleboot:
    '<path class="ln o" d="M-6,-14 L-6,2 L-5,10 L-1,10 L-1,6 L18,9 C21,9 21,6 18,4 C12,1 8,-1 6,-4 L6,-14 Z"/>' +
    '<path class="ln faint" d="M-6,-14 l-2,-4 M0,-14 L0,-2"/>',
  boot:
    '<path class="ln o" d="M-6,-32 L-7,2 L-6,10 L-1,10 L-1,6 L18,9 C21,9 21,6 18,4 C12,1 8,-1 6,-6 L6,-32 Z"/>' +
    '<path class="ln faint" d="M-6,-28 L6,-28 M2,-30 L2,-8"/>',
};

const HEAD =
  '<path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C14,261 18,269 18,278 L21,286 C21,288 19,289 18,289 C18,291 18,292 17,293 C18,295 17,297 16,298 C15,303 11,306 5,306 C-4,306 -11,300 -12,286 Z"/>' +
  '<path class="ln faint" d="M-1,283 C-5,282 -6,288 -4,292 C-3,294 -2,294 -1,293"/>' +
  '<path class="ln faint" d="M11,277 q3,-1.5 6,0 M12,282 l3,0"/>';
const NECK = '<path class="ln o" d="M-2,298 L-4,320 L11,320 L10,301 Z"/>';

// Hair: static part, plus an optional part that swings from a pivot.
const HAIR: Record<HairName, { fixed: string; swing?: { markup: string; pivot: V } }> = {
  bob: { fixed: '<path class="ln o" d="M-14,296 C-17,276 -9,261 4,260 C14,260 19,267 19,276 C14,271 8,271 4,274 C2,284 -1,292 -4,300 C-7,303 -12,302 -14,296 Z"/><path class="ln faint" d="M-9,268 Q-11,282 -10,298 M-3,264 Q-6,280 -6,296"/>' },
  pony: {
    fixed: '<path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,271 4,272 -2,278 Z"/><path class="ln" d="M-12,276 l3,6"/>',
    swing: { markup: '<path class="ln o" d="M-11,276 C-22,278 -27,294 -22,312 C-20,300 -16,290 -9,284 Z"/><path class="ln faint" d="M-14,282 Q-20,292 -21,304"/>', pivot: v(-11, 279) },
  },
  bun: { fixed: '<circle class="ln o" cx="-10" cy="265" r="7.5"/><path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,272 4,273 -3,279 Z"/><path class="ln faint" d="M-14,263 q4,4 8,0 M-4,266 Q-8,274 -10,282"/>' },
  crop: { fixed: '<path class="ln o" d="M-12,289 C-14,272 -6,261 4,261 C13,261 18,267 17,275 C13,272 9,272 6,275 C2,276 -4,280 -7,290 Z"/><path class="ln faint" d="M-6,268 l4,-3 M0,266 l4,-3"/>' },
  curly: { fixed: '<path class="ln o" d="M-15,292 q-5,-7 0,-12 q-3,-9 6,-12 q4,-8 13,-5 q8,-2 11,6 q6,3 3,10 q-6,-3 -12,0 q-6,3 -9,11 q-5,4 -12,2 Z"/><path class="ln faint" d="M-8,276 q3,-2 4,2 M0,268 q3,-2 4,2"/>' },
  long: {
    fixed: '<path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,272 4,274 -2,280 L-3,290 L-14,292 Z"/>',
    swing: { markup: '<path class="ln o" d="M-14,286 C-17,300 -17,322 -12,344 C-8,344 -5,343 -3,342 C-3,322 -3,300 -2,282 Z"/><path class="ln faint" d="M-10,292 Q-12,316 -10,338 M-6,290 Q-7,314 -6,340"/>', pivot: v(-8, 284) },
  },
  beanie: { fixed: '<path class="ln o" d="M-14,284 C-15,264 -5,255 5,255 C15,255 20,264 19,278 Z"/><path class="ln o" d="M-15,284 Q2,276 20,279 L20,272 Q2,269 -15,277 Z"/><path class="ln faint" d="M-8,262 L-9,276 M-1,258 L-2,274 M6,257 L6,272 M13,259 L14,272"/>' },
  cap: { fixed: '<path class="ln o" d="M-11,282 C-12,266 -4,259 5,259 C12,259 16,265 16,276 Z"/><path class="ln o" d="M14,273 L31,276 Q30,281 15,279 Z"/><path class="ln faint" d="M3,259 L5,276 M-12,284 q-2,6 1,10"/>' },
};

const EXTRAS = {
  glasses: '<path class="ln o" d="M10,279 L19,279 L19,285 L10,285 Z"/><path class="ln" d="M10,281 L-1,283"/>',
  scarfWrap: '<path class="ln o" d="M-7,308 C-3,320 12,320 15,308 L16,320 C9,328 -3,328 -8,320 Z"/>',
  scarfTail: '<path class="ln o" d="M10,320 L13,366 L22,365 L17,319 Z"/><path class="ln faint" d="M14,366 l0,5 M17,366 l0,5 M20,365 l0,5"/>',
  earring: '<circle class="ln" cx="-1" cy="297" r="1.4"/>',
  tote:
    '<path class="ln" d="M-2,322 L-27,418 M4,322 L-12,418"/>' +
    '<path class="ln o" d="M-42,412 L-6,412 L-3,480 L-45,480 Z"/>' +
    '<text class="cup-text" x="-24" y="446" font-size="6">THE</text><text class="cup-text" x="-24" y="454" font-size="6">MESS</text>',
  crossbody: '<path class="ln o" d="M14,434 L33,434 L33,452 L14,452 Z"/><path class="ln" d="M14,434 L33,434 L31,443 L16,443 Z"/>',
};
export type Extra = 'glasses' | 'scarf' | 'earring' | 'tote' | 'crossbody';

const HAND = '<path class="ln o" d="M-4,-1 C-5,5 -4,10 -1,12 C2,13 5,10 5,5 L4,-1 Z"/><path class="ln" d="M4,3 q3,2 2,6"/>';
const PHONE = '<path class="ln o" d="M-4,-1 L4,-1 L4,15 L-4,15 Z"/><path class="ln faint" d="M-2,1 L2,1"/>';

export interface Look {
  outfit: OutfitName;
  hair: HairName;
  bottom: BottomName;
  shoe: ShoeName;
  extras: Extra[];
  height: number; // overall scale
  build: number; // horizontal scale (slim < 1 < broad)
}

export function randomLook(): Look {
  const outfit = pick<OutfitName>(['wool', 'puffer', 'trench', 'knit', 'blazer', 'dress', 'knit', 'wool']);
  const o = OUTFITS[outfit];
  const extras: Extra[] = [];
  if (Math.random() < 0.3) extras.push('glasses');
  if (Math.random() < 0.25 && outfit !== 'puffer') extras.push('scarf');
  if (Math.random() < 0.3) extras.push('earring');
  const bag = Math.random();
  if (bag < 0.22) extras.push('tote');
  else if (bag < 0.36) extras.push('crossbody');
  return {
    outfit,
    hair: pick<HairName>(['bob', 'pony', 'bun', 'crop', 'curly', 'long', 'beanie', 'cap', 'crop', 'pony']),
    bottom: pick(o.bottoms),
    shoe: pick(o.shoes),
    extras,
    height: rand(0.93, 1.05),
    build: rand(0.9, 1.16),
  };
}

// ---------- Figure ----------
export type ArmMode =
  | { kind: 'swing' } // arms by the sides (swinging when walking)
  | { kind: 'target'; near: V; far?: V } // hands placed on points (local coords)
  | { kind: 'hold' } // holding a cup in front
  | { kind: 'sip' }
  | { kind: 'phone' } // looking at a phone
  | { kind: 'gesture' }; // talking with the hands

export class Figure {
  x = 0;
  y = 0; // extra vertical offset (seated people sit lower)
  dir: 1 | -1 = 1; // the way they want to face; they turn toward it
  speed = 0; // current walking speed, svg units / s
  accel = 0;
  seated = false;
  arms: ArmMode = { kind: 'swing' };
  hasCup = false;
  nod = 0; // extra head nod (ordering, chatting)
  gaze = 0; // where they're looking: + down, - up (degrees)
  look: Look;
  /** Where the near hand ended up last frame, in world coordinates. */
  handWorld: V = v(0, 0);

  phase = rand(0, Math.PI * 2);
  private t = rand(0, 100);
  private seed = rand(0, 10);
  private facing = 1;
  private blend = 0; // 0 standing … 1 full stride
  private bob = 0;
  private gazeNow = 0;
  private hem = new Spring(70, 7);
  private bagSwing = new Spring(38, 3.6);
  private hairSwing = new Spring(55, 4.5);
  private scarfSwing = new Spring(46, 4);
  private armSmooth = { nx: 0, ny: 0, fx: 0, fy: 0, init: false };

  g: SVGGElement;
  private q: Record<string, SVGElement> = {};
  private legs: { path: SVGPathElement; hem: SVGPathElement; crease: SVGPathElement; shoe: SVGGElement }[];

  constructor(parent: SVGGElement, look: Look = randomLook()) {
    this.look = look;
    const o = OUTFITS[look.outfit];
    const has = (e: Extra) => look.extras.includes(e);
    const hair = HAIR[look.hair];
    const leg = () =>
      `<g data-leg><path class="ln o" d=""/><path class="ln faint" d=""/><path class="ln faint" d=""/><g>${SHOES[look.shoe]}</g></g>`;
    this.g = document.createElementNS(NS, 'g');
    this.g.innerHTML =
      // far arm, behind everything
      `<g data-lean1><path class="ln o" data-k="farArm" d=""/><g data-k="farHand">${HAND}</g></g>` +
      leg() + leg() +
      `<g data-lean2>` +
      (hair.swing && look.hair === 'long' ? `<g data-k="hairSwing">${hair.swing.markup}</g>` : '') +
      o.upper +
      (o.skirt ? '<g data-k="skirt"><path class="ln o" d=""/><path class="ln" d=""/><path class="ln faint" d=""/></g>' : '') +
      (has('tote') ? `<g data-k="tote">${EXTRAS.tote}</g>` : '') +
      `<g data-k="head">${NECK}` +
      (hair.swing && look.hair !== 'long' ? `<g data-k="hairSwing">${hair.swing.markup}</g>` : '') +
      `${HEAD}${hair.fixed}` +
      (has('glasses') ? EXTRAS.glasses : '') +
      (has('earring') && !['beanie', 'long', 'bob'].includes(look.hair) ? EXTRAS.earring : '') +
      `</g>` +
      (has('scarf') ? `${EXTRAS.scarfWrap}<g data-k="scarfTail">${EXTRAS.scarfTail}</g>` : '') +
      (has('crossbody') ? `<path class="ln" data-k="strap" d="M-8,320 L22,436"/><g data-k="crossbody">${EXTRAS.crossbody}</g>` : '') +
      `</g>` +
      `<g data-lean3>` +
      `<g data-k="cup">${cupMarkup(0, 0)}</g><g data-k="phone">${PHONE}</g>` +
      `<path class="ln o" data-k="nearArm" d=""/><path class="ln" data-k="cuff" d=""/><path class="ln faint" data-k="folds" d=""/>` +
      `<g data-k="nearHand">${HAND}</g>` +
      `</g>`;
    this.g.querySelectorAll('[data-k]').forEach((el) => (this.q[(el as HTMLElement).dataset.k!] = el as SVGElement));
    ['lean1', 'lean2', 'lean3'].forEach((k) => (this.q[k] = this.g.querySelector(`[data-${k}]`) as SVGElement));
    this.legs = Array.from(this.g.querySelectorAll('[data-leg]')).map((el) => ({
      path: el.children[0] as SVGPathElement,
      hem: el.children[1] as SVGPathElement,
      crease: el.children[2] as SVGPathElement,
      shoe: el.children[3] as SVGGElement,
    }));
    this.facing = this.dir;
    parent.appendChild(this.g);
  }

  /** Snap facing (for figures placed already facing a way). */
  face(d: 1 | -1) {
    this.dir = d;
    this.facing = d;
  }

  private get scaleX() {
    const f0 = Math.abs(this.facing) < 0.08 ? 0.08 * Math.sign(this.facing || 1) : this.facing;
    return f0 * this.look.height * this.look.build;
  }

  /** Convert a world point into this figure's local (unmirrored) coordinates. */
  toLocal(p: V): V {
    return v((p.x - this.x) / this.scaleX, (p.y - 600 - this.y - this.bob) / this.look.height + 600);
  }
  private toWorld(p: V): V {
    return v(this.x + p.x * this.scaleX, (p.y - 600) * this.look.height + 600 + this.y + this.bob);
  }

  render(dt: number) {
    const o = OUTFITS[this.look.outfit];
    const { height: s, build: b } = this.look;
    this.t += dt;
    const t = this.t;

    // Turning: face toward dir over ~0.2s (the figure narrows as they turn)
    if (this.facing !== this.dir) {
      const step = dt * 9;
      this.facing = Math.abs(this.dir - this.facing) <= step ? this.dir : this.facing + Math.sign(this.dir - this.facing) * step;
    }

    // Gait: stride length follows speed so feet stay planted
    const targetBlend = this.seated ? 0 : clamp(this.speed / 85, 0, 1);
    this.blend = approach(this.blend, targetBlend, 7, dt);
    const bl = this.blend;
    const stepLen = 84 * Math.max(0.4, bl);
    this.phase += (Math.PI * this.speed * dt) / stepLen;
    const ph = this.phase;
    const stride = 0.36;

    const walkLeg = (p: number) => {
      const swing = Math.max(0, Math.cos(p));
      return {
        t: stride * Math.sin(p),
        k: 0.52 * Math.pow(swing, 1.4) + 0.06,
        foot: -6 * swing + (Math.cos(p) <= 0 ? 10 * Math.max(0, -Math.sin(p)) : 0),
      };
    };
    // Standing: weight shifts slowly from foot to foot
    const shift = Math.sin(t * 0.55 + this.seed);
    const standNear = { t: 0.035 + 0.03 * shift, k: 0.03 + 0.02 * Math.max(0, -shift), foot: 0 };
    const standFar = { t: -0.035 + 0.02 * shift, k: 0.03 + 0.03 * Math.max(0, shift), foot: 0 };
    const mix = (a: { t: number; k: number; foot: number }, w: { t: number; k: number; foot: number }) => ({
      t: a.t + (w.t - a.t) * bl, k: a.k + (w.k - a.k) * bl, foot: a.foot + (w.foot - a.foot) * bl,
    });
    const near = this.seated ? { t: 1.38, k: 1.38, foot: 0 } : mix(standNear, walkLeg(ph));
    const far = this.seated ? { t: 1.3, k: 1.42, foot: 0 } : mix(standFar, walkLeg(ph + Math.PI));
    // Body dips at double support, rises over the planted leg
    this.bob = bl * (THIGH + SHIN) * (1 - Math.cos(stride * Math.abs(Math.sin(ph)))) * 0.85;

    this.g.setAttribute(
      'transform',
      `translate(${f(this.x)} ${f(600 + this.y + this.bob)}) scale(${this.scaleX.toFixed(3)} ${s.toFixed(3)}) translate(0 -600)`,
    );

    // Lean into the walk, a touch more when speeding up; breathe when still
    const lean = this.seated ? 0 : bl * 3.2 + clamp(this.accel * 0.006, -2.5, 2.5);
    const breath = 1 + 0.006 * Math.sin(t * 1.6 + this.seed);
    const leanT = `rotate(${f(lean)} 0 470) translate(0 470) scale(1 ${breath.toFixed(4)}) translate(0 -470)`;
    this.q.lean1.setAttribute('transform', leanT);
    this.q.lean2.setAttribute('transform', leanT);
    this.q.lean3.setAttribute('transform', leanT);

    // Legs
    const lw = BOTTOMS[this.look.bottom];
    let kneeMax = -99, kneeMin = 99;
    [far, near].forEach((a, i) => {
      const knee = fk(HIP, THIGH, a.t);
      const ankle = fk(knee, SHIN, a.t - a.k);
      kneeMax = Math.max(kneeMax, knee.x + lw[1]);
      kneeMin = Math.min(kneeMin, knee.x - lw[1]);
      const L = this.legs[i];
      L.path.setAttribute('d', limb2(HIP, knee, ankle, lw[0], lw[1], lw[1], lw[2]));
      L.hem.setAttribute(
        'd',
        this.look.bottom === 'jeans'
          ? across(knee, ankle, lerpV(knee, ankle, 0.86), lw[2]) + ' ' + across(knee, ankle, lerpV(knee, ankle, 0.93), lw[2])
          : this.look.bottom === 'tights' ? '' : across(knee, ankle, lerpV(knee, ankle, 0.97), lw[2]),
      );
      L.crease.setAttribute('d', this.look.bottom === 'tights' ? '' : folds(HIP, knee, ankle, a.k, lw[1]));
      L.shoe.setAttribute('transform', `translate(${f(ankle.x)} ${f(ankle.y)}) rotate(${f(a.foot)})`);
    });

    // Long garments swing: the hem trails the walk, kicks with each stride and
    // gets pushed out by the knees, then settles when they stop.
    if (o.skirt) {
      const sk = o.skirt;
      const sway = this.hem.step(-this.speed * 0.04 + 4 * Math.sin(ph) * bl - this.accel * 0.01, dt);
      const flare = 2.6 * bl * Math.abs(Math.sin(ph));
      const back1 = Math.min(sk.back1 + sway - flare, kneeMin - 3);
      const front1 = Math.max(sk.front1 + sway + flare, kneeMax + 3);
      const midX = (back1 + front1) / 2 + sway * 0.3;
      const cb = v((sk.back0 + back1) / 2 + sway * 0.25, (sk.y0 + sk.y1) / 2);
      const cf = v((sk.front0 + front1) / 2 + sway * 0.25, (sk.y0 + sk.y1) / 2);
      const kids = this.q.skirt.children;
      kids[0].setAttribute(
        'd',
        `M${f(sk.back0)},${sk.y0} Q${f(cb.x)},${f(cb.y)} ${f(back1)},${sk.y1} Q${f(midX)},${sk.y1 + 6} ${f(front1)},${sk.y1} Q${f(cf.x)},${f(cf.y)} ${f(sk.front0)},${sk.y0}`, // open top: joins the jacket with no seam
      );
      const line = (fr: number) => {
        const x0 = sk.back0 + (sk.front0 - sk.back0) * fr;
        const x1 = back1 + (front1 - back1) * fr;
        const yb = sk.y1 + 6 * (1 - Math.pow(2 * fr - 1, 2)) * 0.75;
        return `M${f(x0)},${sk.y0} Q${f((x0 + x1) / 2 + sway * 0.25)},${f((sk.y0 + sk.y1) / 2)} ${f(x1)},${f(yb)}`;
      };
      let solid = (sk.lines ?? []).map(line).join(' ');
      if (sk.pocket) {
        const [d0, a0, a1] = sk.pocket;
        const y = sk.y0 + (sk.y1 - sk.y0) * d0;
        const bx = sk.back0 + (back1 - sk.back0) * d0, fx = sk.front0 + (front1 - sk.front0) * d0;
        solid += ` M${f(bx + (fx - bx) * a0)},${f(y)} L${f(bx + (fx - bx) * a1)},${f(y - 1)}`;
      }
      for (const d0 of sk.buttons ?? []) {
        const y = sk.y0 + (sk.y1 - sk.y0) * d0;
        const fx = sk.front0 + (front1 - sk.front0) * d0 - 4;
        solid += ` M${f(fx + 1.6)},${f(y)} A1.6,1.6 0 1 0 ${f(fx - 1.6)},${f(y)} A1.6,1.6 0 1 0 ${f(fx + 1.6)},${f(y)}`;
      }
      kids[1].setAttribute('d', solid);
      kids[2].setAttribute('d', (sk.faint ?? []).map(line).join(' '));
    }

    // Bags, hair and scarf ends swing from their pivots
    const fwd = this.speed;
    if (this.q.tote) {
      const a = this.bagSwing.step(fwd * 0.05 + 5 * Math.sin(2 * ph) * bl, dt);
      this.q.tote.setAttribute('transform', `rotate(${f(a)} -2 322)`);
    }
    if (this.q.crossbody) {
      const a = this.bagSwing.step(fwd * 0.03 + 3 * Math.sin(2 * ph) * bl, dt);
      this.q.crossbody.setAttribute('transform', `rotate(${f(a)} 22 436)`);
    }
    if (this.q.hairSwing) {
      const hs = HAIR[this.look.hair].swing!;
      const a = this.hairSwing.step(fwd * (this.look.hair === 'long' ? 0.05 : 0.09) + 7 * Math.sin(2 * ph) * bl, dt);
      this.q.hairSwing.setAttribute('transform', `rotate(${f(a)} ${hs.pivot.x} ${hs.pivot.y})`);
    }
    if (this.q.scarfTail) {
      const a = this.scarfSwing.step(fwd * 0.08 + 4 * Math.sin(ph) * bl, dt);
      this.q.scarfTail.setAttribute('transform', `rotate(${f(a)} 14 320)`);
    }

    // Arms
    const [sw0, sw1, sw2] = o.sleeve;
    const swingArm = (a: number, k: number) => {
      const e = fk(SHOULDER, UPPER_ARM, a);
      return { e, w: fk(e, FOREARM, a + k) };
    };
    // Arms swing opposite the legs, forearms lagging a little behind
    const swingAmp = 0.34 * bl;
    const farSwing = swingArm(swingAmp * Math.sin(ph) - 0.02, 0.14 + 0.2 * bl + 0.14 * bl * Math.max(0, Math.sin(ph - 0.5)));
    let farE = farSwing.e, farW = farSwing.w;
    let nearE: V = SHOULDER, nearW: V = SHOULDER;

    const holdT = v(30 + 1.5 * Math.sin(ph * 2) * bl, 384);
    const relax = Math.sin(t * 0.7 + this.seed) * 0.03;
    let nearTarget: V | null = null;
    switch (this.arms.kind) {
      case 'swing':
        if (this.hasCup) nearTarget = holdT;
        else ({ e: nearE, w: nearW } = swingArm(-swingAmp * Math.sin(ph) + 0.04 + relax, 0.14 + 0.2 * bl + 0.14 * bl * Math.max(0, -Math.sin(ph - 0.5))));
        break;
      case 'hold':
        nearTarget = holdT;
        break;
      case 'sip':
        nearTarget = v(23, 322);
        break;
      case 'phone':
        nearTarget = v(27, 366);
        break;
      case 'gesture':
        nearTarget = v(34 + 7 * Math.sin(t * 3.1 + this.seed), 372 + 6 * Math.sin(t * 4.3));
        break;
      case 'target':
        nearTarget = this.arms.near;
        if (this.arms.far) ({ e: farE, w: farW } = ik(SHOULDER, this.arms.far, UPPER_ARM, FOREARM));
        break;
    }
    if (nearTarget) {
      // Hands move toward their target rather than jumping there
      const A = this.armSmooth;
      if (!A.init) { A.nx = nearTarget.x; A.ny = nearTarget.y; A.init = true; }
      A.nx = approach(A.nx, nearTarget.x, 16, dt || 1);
      A.ny = approach(A.ny, nearTarget.y, 16, dt || 1);
      ({ e: nearE, w: nearW } = ik(SHOULDER, v(A.nx, A.ny), UPPER_ARM, FOREARM));
    } else {
      this.armSmooth.nx = nearW.x;
      this.armSmooth.ny = nearW.y;
      this.armSmooth.init = true;
    }

    const rolled = o.sleeveStyle === 'rolled';
    const armD = (e: V, w: V) => (rolled ? limb2(SHOULDER, e, w, sw0, sw1, 4.6, 3.6) : limb2(SHOULDER, e, w, sw0, sw1, sw1, sw2));
    this.q.farArm.setAttribute('d', armD(farE, farW));
    this.q.nearArm.setAttribute('d', armD(nearE, nearW));
    const cuffAt = rolled ? lerpV(SHOULDER, nearE, 0.86) : lerpV(nearE, nearW, 0.9);
    let cuff = rolled ? across(SHOULDER, nearE, cuffAt, sw1) : across(nearE, nearW, cuffAt, sw2);
    if (o.sleeveStyle === 'knit') cuff += ' ' + across(nearE, nearW, lerpV(nearE, nearW, 0.82), sw2);
    if (o.sleeveStyle === 'puffer') cuff += ' ' + across(SHOULDER, nearE, lerpV(SHOULDER, nearE, 0.5), sw0) + ' ' + across(nearE, nearW, lerpV(nearE, nearW, 0.45), sw1);
    if (rolled) cuff += ' ' + across(SHOULDER, nearE, lerpV(SHOULDER, nearE, 0.74), sw1);
    this.q.cuff.setAttribute('d', cuff);
    // Fabric bunches at the inside of a bent elbow
    const elbowBend = Math.PI - angleAt(SHOULDER, nearE, nearW);
    this.q.folds.setAttribute('d', rolled ? '' : folds(SHOULDER, nearE, nearW, elbowBend, sw1));

    const handRot = (e: V, w: V) => -deg(Math.atan2(w.x - e.x, w.y - e.y));
    this.q.nearHand.setAttribute('transform', `translate(${f(nearW.x)} ${f(nearW.y)}) rotate(${f(handRot(nearE, nearW))})`);
    this.q.farHand.setAttribute('transform', `translate(${f(farW.x)} ${f(farW.y)}) rotate(${f(handRot(farE, farW))})`);
    this.handWorld = this.toWorld(nearW);

    // Phone in hand
    const onPhone = this.arms.kind === 'phone' && !this.hasCup;
    (this.q.phone as SVGGElement).style.display = onPhone ? '' : 'none';
    if (onPhone) this.q.phone.setAttribute('transform', `translate(${f(nearW.x + 2)} ${f(nearW.y - 8)}) rotate(-62)`);

    // Head: steadies against the bob, looks where it's told, nods when talking
    const gazeTarget = this.gaze + (onPhone ? 12 : 0) + (this.arms.kind === 'sip' ? -9 : 0);
    this.gazeNow = approach(this.gazeNow, gazeTarget, 6, dt || 1);
    const headA = this.gazeNow + this.nod - 1.2 * Math.sin(2 * ph) * bl;
    this.q.head.setAttribute('transform', `rotate(${f(headA)} 4 318)`);

    // Cup in the near hand; scale keeps the lettering readable and in proportion
    (this.q.cup as SVGGElement).style.display = this.hasCup ? '' : 'none';
    if (this.hasCup) {
      // Tip the rim back toward the mouth (the base lifts away from the face)
      const tilt = this.arms.kind === 'sip' ? -26 : 0;
      const sgn = Math.sign(this.facing) || 1;
      this.q.cup.setAttribute(
        'transform',
        `translate(${f(nearW.x + 1)} ${f(nearW.y + 13)}) scale(${(sgn / b).toFixed(3)} 1) rotate(${tilt * sgn} 0 -13)`,
      );
    }
  }

  bringToFront() {
    this.g.parentNode?.appendChild(this.g);
  }
  remove() {
    this.g.remove();
  }
}

/** Interior angle at joint b (radians). */
function angleAt(a: V, b: V, c: V) {
  const u = v(a.x - b.x, a.y - b.y), w = v(c.x - b.x, c.y - b.y);
  const d = (u.x * w.x + u.y * w.y) / ((Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y)) || 1);
  return Math.acos(clamp(d, -1, 1));
}

/** Two little crease lines on the inside of a bent joint. */
function folds(a: V, b: V, c: V, bend: number, w: number) {
  if (bend < 0.35) return '';
  const mid = v((a.x + c.x) / 2 - b.x, (a.y + c.y) / 2 - b.y);
  const l = Math.hypot(mid.x, mid.y) || 1;
  const u = v(mid.x / l, mid.y / l);
  const n = v(-u.y, u.x);
  const len = Math.min(w * 0.85, 2 + bend * 4);
  const p = (k: number, off: number) => v(b.x + u.x * k + n.x * off, b.y + u.y * k + n.y * off);
  const s1 = p(1, -2.2), e1 = p(len, -3.4), s2 = p(1, 2.2), e2 = p(len, 3.4);
  return `M${f(s1.x)},${f(s1.y)} L${f(e1.x)},${f(e1.y)} M${f(s2.x)},${f(s2.y)} L${f(e2.x)},${f(e2.y)}`;
}
