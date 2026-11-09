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

/** One limb segment from a to b, rounded at a so joints read as elbows and knees. */
function seg(a: V, b: V, wa: number, wb: number) {
  const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
  const n = v(-dy / l, dx / l);
  const P = (p: V, w: number) => `${f(p.x + n.x * w)},${f(p.y + n.y * w)}`;
  const M = (p: V, w: number) => `${f(p.x - n.x * w)},${f(p.y - n.y * w)}`;
  return `M${P(a, wa)} L${P(b, wb)} L${M(b, wb)} L${M(a, wa)} A${wa},${wa} 0 0 0 ${P(a, wa)}`;
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

// ---------- Wardrobe ----------
export type OutfitName = 'wool' | 'puffer' | 'trench' | 'knit' | 'blazer' | 'dress' | 'barista';
export type HairName = 'bob' | 'pony' | 'bun' | 'crop' | 'curly' | 'long' | 'beanie' | 'cap';
export type ShoeName = 'trainer' | 'loafer' | 'ankleboot' | 'boot';
export type BottomName = 'straight' | 'jeans' | 'wide' | 'tights';

interface Outfit {
  torso: string; // drawn over the legs
  sleeve: [number, number, number];
  sleeveStyle: 'full' | 'rolled' | 'knit' | 'puffer';
  bottoms: BottomName[];
  shoes: ShoeName[];
}

const OUTFITS: Record<OutfitName, Outfit> = {
  wool: {
    torso:
      '<path class="ln o" d="M-4,314 C-15,317 -23,328 -24,350 L-25,430 L-28,540 Q0,545 30,540 L26,430 C28,400 27,360 22,336 C19,324 14,317 8,315 Z"/>' +
      '<path class="ln" d="M8,315 L16,338 L11,350 L19,362 M-4,314 Q-9,306 -3,299"/>' +
      '<circle class="ln" cx="23" cy="392" r="1.6"/><circle class="ln" cx="24" cy="428" r="1.6"/><circle class="ln" cx="25" cy="464" r="1.6"/>' +
      '<path class="ln" d="M4,478 L22,476"/><path class="ln faint" d="M-26,480 L-28,540 M-2,346 Q-8,420 -6,538"/>',
    sleeve: [8.5, 7.5, 6.8],
    sleeveStyle: 'full',
    bottoms: ['straight', 'wide'],
    shoes: ['loafer', 'ankleboot', 'boot'],
  },
  puffer: {
    torso:
      '<path class="ln o" d="M-6,312 C-22,316 -31,330 -31,354 L-31,476 Q0,485 33,476 L32,354 C32,330 23,316 10,312 Z"/>' +
      '<path class="ln" d="M-31,352 Q0,359 32,352 M-31,384 Q0,391 32,384 M-31,416 Q0,423 32,416 M-31,448 Q0,455 32,448"/>' +
      '<path class="ln o" d="M-7,313 L-7,298 Q2,293 11,298 L11,313 Z"/><path class="ln faint" d="M31,318 L32,474 M-7,305 L11,305"/>',
    sleeve: [10, 9.5, 8],
    sleeveStyle: 'puffer',
    bottoms: ['jeans', 'straight'],
    shoes: ['trainer'],
  },
  trench: {
    torso:
      '<path class="ln o" d="M-4,314 C-15,317 -22,328 -23,350 L-24,425 L-31,528 Q0,534 33,528 L25,425 C27,395 26,358 21,336 C18,324 14,317 8,315 Z"/>' +
      '<path class="ln" d="M8,315 L22,346 L18,351 M-23,423 Q0,428 25,423 M-23,430 Q0,435 25,430 M-11,320 L4,317"/>' +
      '<path class="ln o" d="M12,421 L19,421 L19,433 L12,433 Z"/>' +
      '<circle class="ln" cx="20" cy="372" r="1.5"/><circle class="ln" cx="13" cy="374" r="1.5"/><circle class="ln" cx="21" cy="400" r="1.5"/><circle class="ln" cx="14" cy="402" r="1.5"/>' +
      '<path class="ln faint" d="M-24,440 L-31,528 M4,440 Q2,490 0,530 M-2,460 L-6,470"/>',
    sleeve: [8, 7, 6.2],
    sleeveStyle: 'full',
    bottoms: ['straight', 'tights'],
    shoes: ['ankleboot', 'loafer'],
  },
  knit: {
    torso:
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
    torso:
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
    torso:
      '<path class="ln o" d="M-17,428 L-31,550 Q0,557 33,550 L18,428 Z"/>' +
      '<path class="ln faint" d="M-8,432 L-15,552 M2,432 L1,555 M11,431 L18,553 M-14,440 Q0,444 17,440"/>' +
      '<path class="ln o" d="M-4,316 C-14,318 -19,330 -19,350 L-17,432 Q0,436 18,432 L19,352 C19,334 14,320 8,316 Z"/>' +
      '<path class="ln" d="M-4,316 Q3,324 8,316"/><path class="ln faint" d="M-17,424 Q0,428 18,424"/>',
    sleeve: [6.5, 5.8, 5],
    sleeveStyle: 'full',
    bottoms: ['tights'],
    shoes: ['boot', 'ankleboot'],
  },
  barista: {
    torso:
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

const HAIR: Record<HairName, string> = {
  bob: '<path class="ln o" d="M-14,296 C-17,276 -9,261 4,260 C14,260 19,267 19,276 C14,271 8,271 4,274 C2,284 -1,292 -4,300 C-7,303 -12,302 -14,296 Z"/><path class="ln faint" d="M-9,268 Q-11,282 -10,298 M-3,264 Q-6,280 -6,296"/>',
  pony: '<path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,271 4,272 -2,278 Z"/><path class="ln o" d="M-11,276 C-22,278 -27,294 -22,312 C-20,300 -16,290 -9,284 Z"/><path class="ln" d="M-12,276 l3,6"/>',
  bun: '<circle class="ln o" cx="-10" cy="265" r="7.5"/><path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,272 4,273 -3,279 Z"/><path class="ln faint" d="M-14,263 q4,4 8,0 M-4,266 Q-8,274 -10,282"/>',
  crop: '<path class="ln o" d="M-12,289 C-14,272 -6,261 4,261 C13,261 18,267 17,275 C13,272 9,272 6,275 C2,276 -4,280 -7,290 Z"/><path class="ln faint" d="M-6,268 l4,-3 M0,266 l4,-3"/>',
  curly: '<path class="ln o" d="M-15,292 q-5,-7 0,-12 q-3,-9 6,-12 q4,-8 13,-5 q8,-2 11,6 q6,3 3,10 q-6,-3 -12,0 q-6,3 -9,11 q-5,4 -12,2 Z"/><path class="ln faint" d="M-8,276 q3,-2 4,2 M0,268 q3,-2 4,2"/>',
  long: '<path class="ln o" d="M-12,286 C-13,270 -4,261 5,261 C13,261 18,267 18,275 C12,272 4,274 -2,280 C-3,300 -4,322 -6,344 C-13,342 -17,322 -17,300 Z"/><path class="ln faint" d="M-10,290 Q-12,316 -12,338 M-6,286 Q-7,312 -8,340"/>',
  beanie: '<path class="ln o" d="M-14,284 C-15,264 -5,255 5,255 C15,255 20,264 19,278 Z"/><path class="ln o" d="M-15,284 Q2,276 20,279 L20,272 Q2,269 -15,277 Z"/><path class="ln faint" d="M-8,262 L-9,276 M-1,258 L-2,274 M6,257 L6,272 M13,259 L14,272"/>',
  cap: '<path class="ln o" d="M-11,282 C-12,266 -4,259 5,259 C12,259 16,265 16,276 Z"/><path class="ln o" d="M14,273 L31,276 Q30,281 15,279 Z"/><path class="ln faint" d="M3,259 L5,276 M-12,284 q-2,6 1,10"/>',
};

const EXTRAS = {
  glasses: '<path class="ln o" d="M10,279 L19,279 L19,285 L10,285 Z"/><path class="ln" d="M10,281 L-1,283"/>',
  scarf:
    '<path class="ln o" d="M-7,308 C-3,320 12,320 15,308 L16,320 C9,328 -3,328 -8,320 Z"/>' +
    '<path class="ln o" d="M10,320 L13,366 L22,365 L17,319 Z"/><path class="ln faint" d="M14,366 l0,5 M17,366 l0,5 M20,365 l0,5"/>',
  earring: '<circle class="ln" cx="-1" cy="297" r="1.4"/>',
  tote:
    '<path class="ln" d="M-2,322 L-27,418 M4,322 L-12,418"/>' +
    '<path class="ln o" d="M-42,412 L-6,412 L-3,480 L-45,480 Z"/>' +
    '<text class="cup-text" x="-24" y="446" font-size="6">THE</text><text class="cup-text" x="-24" y="454" font-size="6">MESS</text>',
  crossbody:
    '<path class="ln" d="M-8,320 L22,436"/><path class="ln o" d="M14,434 L33,434 L33,452 L14,452 Z"/><path class="ln" d="M14,434 L33,434 L31,443 L16,443 Z"/>',
};
export type Extra = keyof typeof EXTRAS;

const HAND = '<path class="ln o" d="M-4,-1 C-5,5 -4,10 -1,12 C2,13 5,10 5,5 L4,-1 Z"/><path class="ln" d="M4,3 q3,2 2,6"/>';

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
    hair: pick<HairName>(['bob', 'pony', 'bun', 'crop', 'curly', 'long', 'beanie', 'cap', 'crop']),
    bottom: pick(o.bottoms),
    shoe: pick(o.shoes),
    extras,
    height: rand(0.93, 1.05),
    build: rand(0.9, 1.16),
  };
}

// ---------- Figure ----------
export type ArmMode =
  | { kind: 'swing' } // walking or standing, arms by their sides
  | { kind: 'target'; near: V; far?: V } // hands placed on points (local coords)
  | { kind: 'hold' } // holding a cup in front
  | { kind: 'sip' };

export class Figure {
  x = 0;
  y = 0; // extra vertical offset (seated people sit lower)
  dir: 1 | -1 = 1;
  phase = rand(0, Math.PI * 2);
  walking = false;
  seated = false;
  arms: ArmMode = { kind: 'swing' };
  hasCup = false;
  look: Look;

  g: SVGGElement;
  private farArm: SVGPathElement;
  private farFore: SVGPathElement;
  private nearFore: SVGPathElement;
  private farHand: SVGGElement;
  private nearArm: SVGPathElement;
  private nearHand: SVGGElement;
  private nearCuff: SVGPathElement;
  private legs: { thigh: SVGPathElement; shin: SVGPathElement; hem: SVGPathElement; shoe: SVGGElement }[];
  private cupG: SVGGElement;
  private headG: SVGGElement;
  nod = 0;
  /** Where the near hand ended up last frame, in world coordinates. */
  handWorld: V = v(0, 0);

  constructor(parent: SVGGElement, look: Look = randomLook()) {
    this.look = look;
    const o = OUTFITS[look.outfit];
    const legMarkup = () =>
      `<g data-leg><path class="ln o" d=""/><path class="ln o" d=""/><path class="ln faint" d=""/><g>${SHOES[look.shoe]}</g></g>`;
    this.g = document.createElementNS(NS, 'g');
    this.g.innerHTML =
      `<path class="ln o" data-fararm d=""/><path class="ln o" data-farfore d=""/><g data-farhand>${HAND}</g>` +
      legMarkup() + legMarkup() +
      o.torso +
      (look.extras.includes('tote') ? EXTRAS.tote : '') +
      `<g data-head>${NECK}${HEAD}${HAIR[look.hair]}` +
      (look.extras.includes('glasses') ? EXTRAS.glasses : '') +
      (look.extras.includes('earring') && !['beanie', 'long', 'bob'].includes(look.hair) ? EXTRAS.earring : '') +
      `</g>` +
      (look.extras.includes('scarf') ? EXTRAS.scarf : '') +
      (look.extras.includes('crossbody') ? EXTRAS.crossbody : '') +
      `<g data-cup>${cupMarkup(0, 0)}</g>` +
      `<path class="ln o" data-neararm d=""/><path class="ln o" data-nearfore d=""/><path class="ln" data-nearcuff d=""/><g data-nearhand>${HAND}</g>`;
    const q = <T extends Element>(s: string) => this.g.querySelector(s) as unknown as T;
    this.farArm = q('[data-fararm]');
    this.farFore = q('[data-farfore]');
    this.nearFore = q('[data-nearfore]');
    this.farHand = q('[data-farhand]');
    this.nearArm = q('[data-neararm]');
    this.nearCuff = q('[data-nearcuff]');
    this.nearHand = q('[data-nearhand]');
    this.cupG = q('[data-cup]');
    this.headG = q('[data-head]');
    this.legs = Array.from(this.g.querySelectorAll('[data-leg]')).map((el) => ({
      thigh: el.children[0] as SVGPathElement,
      shin: el.children[1] as SVGPathElement,
      hem: el.children[2] as SVGPathElement,
      shoe: el.children[3] as SVGGElement,
    }));
    parent.appendChild(this.g);
  }

  /** Convert a world point into this figure's local (unmirrored) coordinates. */
  toLocal(p: V): V {
    const { height: s, build: b } = this.look;
    return v((p.x - this.x) / (this.dir * s * b), (p.y - 600 - this.y - this.bob) / s + 600);
  }
  private toWorld(p: V): V {
    const { height: s, build: b } = this.look;
    return v(this.x + p.x * this.dir * s * b, (p.y - 600) * s + 600 + this.y + this.bob);
  }

  private bob = 0;

  render() {
    const o = OUTFITS[this.look.outfit];
    const ph = this.phase;
    const stride = 0.36;

    // Legs
    const legAngles = (p: number) => {
      if (this.seated) return { t: 1.38, k: 1.38, foot: 0 };
      if (!this.walking) return { t: 0.04, k: 0.03, foot: 0 };
      const t = stride * Math.sin(p);
      const swing = Math.max(0, Math.cos(p));
      const k = 0.52 * Math.pow(swing, 1.4);
      const foot = -6 * swing + (Math.cos(p) <= 0 ? 10 * Math.max(0, -Math.sin(p)) : 0);
      return { t, k, foot };
    };
    const near = legAngles(ph);
    const far = this.seated ? { t: 1.3, k: 1.42, foot: 0 } : this.walking ? legAngles(ph + Math.PI) : { t: -0.05, k: 0.02, foot: 0 };
    this.bob = this.walking ? THIGH * 2 * (1 - Math.cos(stride * Math.abs(Math.sin(ph)))) * 0.85 : 0;

    const { height: s, build: b } = this.look;
    this.g.setAttribute(
      'transform',
      `translate(${f(this.x)} ${f(600 + this.y + this.bob)}) scale(${(this.dir * s * b).toFixed(3)} ${s.toFixed(3)}) translate(0 -600)`,
    );

    const lw = BOTTOMS[this.look.bottom];
    [far, near].forEach((a, i) => {
      const knee = fk(HIP, THIGH, a.t);
      const ankle = fk(knee, SHIN, a.t - a.k);
      const L = this.legs[i];
      L.thigh.setAttribute('d', limb2(HIP, knee, ankle, lw[0], lw[1], lw[1], lw[2]));
      L.shin.setAttribute('d', '');
      L.hem.setAttribute(
        'd',
        this.look.bottom === 'jeans'
          ? across(knee, ankle, lerpV(knee, ankle, 0.86), lw[2]) + ' ' + across(knee, ankle, lerpV(knee, ankle, 0.93), lw[2])
          : this.look.bottom === 'tights' ? '' : across(knee, ankle, lerpV(knee, ankle, 0.97), lw[2]),
      );
      L.shoe.setAttribute('transform', `translate(${f(ankle.x)} ${f(ankle.y)}) rotate(${f(a.foot)})`);
    });

    // Arms
    const [sw0, sw1, sw2] = o.sleeve;
    let nearE: V, nearW: V, farE: V, farW: V;
    const swingA = this.walking ? -0.32 * Math.sin(ph) : 0.04;
    const bend = this.walking ? 0.28 + 0.16 * Math.max(0, -Math.sin(ph)) : 0.14;
    const swingArm = (a: number, k: number) => {
      const e = fk(SHOULDER, UPPER_ARM, a);
      return { e, w: fk(e, FOREARM, a + k) };
    };
    const farSwing = swingArm(this.walking ? 0.32 * Math.sin(ph) : -0.03, this.walking ? 0.28 + 0.16 * Math.max(0, Math.sin(ph)) : 0.12);
    ({ e: farE, w: farW } = farSwing);

    const holdT = v(30 + (this.walking ? 2 * Math.sin(ph * 2) : 0), 384);
    const sipT = v(23, 322);
    switch (this.arms.kind) {
      case 'swing':
        ({ e: nearE, w: nearW } = this.hasCup ? ik(SHOULDER, holdT, UPPER_ARM, FOREARM) : swingArm(swingA, bend));
        break;
      case 'hold':
        ({ e: nearE, w: nearW } = ik(SHOULDER, holdT, UPPER_ARM, FOREARM));
        break;
      case 'sip':
        ({ e: nearE, w: nearW } = ik(SHOULDER, sipT, UPPER_ARM, FOREARM));
        break;
      case 'target':
        ({ e: nearE, w: nearW } = ik(SHOULDER, this.arms.near, UPPER_ARM, FOREARM));
        if (this.arms.far) ({ e: farE, w: farW } = ik(SHOULDER, this.arms.far, UPPER_ARM, FOREARM));
        break;
    }

    const rolled = o.sleeveStyle === 'rolled';
    // Rolled sleeves: the sleeve stops at the elbow and a bare forearm continues.
    const armD = (e: V, w: V) => (rolled ? limb2(SHOULDER, e, w, sw0, sw1, 4.6, 3.6) : limb2(SHOULDER, e, w, sw0, sw1, sw1, sw2));
    this.farArm.setAttribute('d', armD(farE, farW));
    this.farFore.setAttribute('d', '');
    this.nearArm.setAttribute('d', armD(nearE, nearW));
    this.nearFore.setAttribute('d', '');
    const cuffAt = rolled ? lerpV(SHOULDER, nearE, 0.86) : lerpV(nearE, nearW, 0.9);
    const cuffW = rolled ? sw1 : sw2;
    let cuff = rolled ? across(SHOULDER, nearE, cuffAt, cuffW) : across(nearE, nearW, cuffAt, cuffW);
    if (o.sleeveStyle === 'knit') cuff += ' ' + across(nearE, nearW, lerpV(nearE, nearW, 0.82), sw2);
    if (o.sleeveStyle === 'puffer') cuff += ' ' + across(SHOULDER, nearE, lerpV(SHOULDER, nearE, 0.5), sw0) + ' ' + across(nearE, nearW, lerpV(nearE, nearW, 0.45), sw1);
    if (rolled) cuff += ' ' + across(SHOULDER, nearE, lerpV(SHOULDER, nearE, 0.74), cuffW);
    this.nearCuff.setAttribute('d', cuff);

    const handRot = (e: V, w: V) => (-Math.atan2(w.x - e.x, w.y - e.y) * 180) / Math.PI;
    this.nearHand.setAttribute('transform', `translate(${f(nearW.x)} ${f(nearW.y)}) rotate(${f(handRot(nearE, nearW))})`);
    this.farHand.setAttribute('transform', `translate(${f(farW.x)} ${f(farW.y)}) rotate(${f(handRot(farE, farW))})`);
    this.handWorld = this.toWorld(nearW);

    // Head nod while ordering or chatting
    this.headG.setAttribute('transform', this.nod ? `rotate(${f(this.nod)} 4 318)` : '');

    // Cup in the near hand; scale(dir/build) keeps the lettering readable and in proportion
    this.cupG.style.display = this.hasCup ? '' : 'none';
    if (this.hasCup) {
      const tilt = this.arms.kind === 'sip' ? 24 : 0;
      this.cupG.setAttribute(
        'transform',
        `translate(${f(nearW.x + 1)} ${f(nearW.y + 13)}) scale(${(this.dir / b).toFixed(3)} 1) rotate(${tilt * this.dir} 0 -13)`,
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
