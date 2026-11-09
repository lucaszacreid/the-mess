// Timelapse animation for the coffee bar sketch.
// Customers walk in from the left, queue, order, collect a THE MESS cup and then
// either leave or stand and chat. The counter barista takes orders and hands drinks
// over; the La Marzocco barista tamps, pulls shots and steams milk; the seated
// customer sips. Everything runs at a sped-up, timelapse pace. With reduced motion
// the opening frame is drawn once and nothing moves. The loop pauses off screen.

import { Figure, randomLook, rand, type Look } from './figure';

type State = 'walk' | 'queue' | 'order' | 'waitDrink' | 'receive' | 'toSpot' | 'mingle' | 'leave' | 'pass';

const WALK_SPEED = 150; // svg units per second
const STEP_RATE = 8.2; // stride phase, radians per second
const QUEUE_X = [526, 446, 366, 286];
const EXIT_LEFT = -90;
const EXIT_RIGHT = 1290;
const BARISTA_HAND = { x: 612, y: 336 }; // where the counter barista holds the cup out

interface Spot { x: number; dir: 1 | -1; who: Customer | null }

class Customer {
  fig: Figure;
  state: State = 'walk';
  target: number;
  speed = WALK_SPEED * rand(0.88, 1.12);
  timer = 0;
  nextSip = rand(1.5, 4);
  sipLeft = 0;
  spot: Spot | null = null;
  done = false;
  reaching = false;

  constructor(parent: SVGGElement, x: number, look?: Look) {
    this.fig = new Figure(parent, look);
    this.fig.x = x;
    this.target = x;
  }
  get x() { return this.fig.x; }
  get walking() { return Math.abs(this.target - this.fig.x) > 0.5; }

  step(dt: number) {
    const d = this.target - this.fig.x;
    if (Math.abs(d) <= 0.5) { this.fig.x = this.target; this.fig.walking = false; return false; }
    this.fig.dir = d > 0 ? 1 : -1;
    this.fig.x += this.fig.dir * Math.min(Math.abs(d), this.speed * dt);
    this.fig.phase += STEP_RATE * dt * (this.speed / WALK_SPEED);
    this.fig.walking = true;
    if (Math.abs(this.target - this.fig.x) <= 0.5) { this.fig.x = this.target; this.fig.walking = false; return true; }
    return false;
  }
  remove() { this.fig.remove(); this.done = true; }
}

export function startCoffeeBar() {
  const svg = document.querySelector<SVGSVGElement>('.sketch svg');
  const crowd = document.getElementById('cb-crowd') as SVGGElement | null;
  const staff = document.getElementById('cb-staff') as SVGGElement | null;
  if (!svg || !crowd || !staff) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = <T extends Element>(id: string) => document.getElementById(id) as unknown as T;
  const b2 = $<SVGGElement>('b2');
  const b2Head = $<SVGGElement>('b2-head');
  const b2Reach = $<SVGGElement>('b2-reach');
  const b2Idle = $<SVGGElement>('b2-idle');
  const b2Cup = $<SVGGElement>('b2-cup');
  const jug = $<SVGGElement>('b1-jug');
  const steam = $<SVGPathElement>('b1-steam');
  const pour = $<SVGPathElement>('b1-pour');

  // Swap the no-JS drawings for live figures.
  crowd.innerHTML = '';
  $<SVGGElement>('b1').style.display = 'none';
  $<SVGGElement>('seat-person').style.display = 'none';

  // --- La Marzocco barista, side-on ---
  const b1 = new Figure(staff, {
    outfit: 'barista', hair: 'bun', bottom: 'straight', shoe: 'trainer',
    extras: ['earring'], height: 1, build: 1,
  });
  b1.x = 944;
  const B1_TARGETS = {
    idle: [{ x: 960, y: 386 }, { x: 952, y: 392 }],
    tamp: [{ x: 980, y: 352 }, { x: 973, y: 357 }],
    shot: [{ x: 966, y: 366 }, { x: 997, y: 345 }],
    steam: [{ x: 982, y: 364 }, { x: 1000, y: 337 }],
  };
  type B1Pose = keyof typeof B1_TARGETS;
  const b1Hands = B1_TARGETS.idle.map((p) => ({ ...p }));
  let b1Pose: B1Pose = 'idle';
  const brewCycle: B1Pose[] = ['tamp', 'tamp', 'shot', 'shot', 'shot', 'steam', 'steam', 'steam'];
  const BREW_TIME = 2.6;

  // --- Seated customer on the block ---
  const seated = new Figure(crowd, {
    outfit: 'knit', hair: 'curly', bottom: 'wide', shoe: 'trainer',
    extras: ['glasses'], height: 1, build: 1.05,
  });
  seated.seated = true;
  seated.dir = -1;
  seated.x = 172;
  seated.y = 50;
  seated.hasCup = true;
  seated.arms = { kind: 'hold' };
  const seat = { t: rand(1, 3), sipping: false };

  // --- Counter barista ---
  type B2State = 'idle' | 'taking' | 'fetch' | 'hand';
  const bar = { state: 'idle' as B2State, t: 0, who: null as Customer | null, handed: false };
  const setB2 = (facing: 'left' | 'right', reach: boolean, cup: boolean) => {
    b2.setAttribute('transform', facing === 'left' ? 'translate(1464 0) scale(-1 1)' : 'translate(-56 0)');
    b2Reach.style.display = reach ? '' : 'none';
    b2Idle.style.display = reach ? 'none' : '';
    b2Cup.style.display = cup ? '' : 'none';
  };
  setB2('left', false, false);

  const machine = { queue: [] as Customer[], busy: null as Customer | null, t: 0, ready: [] as Customer[] };
  const people: Customer[] = [];
  const queue: Customer[] = [];
  const spots: Spot[] = [
    { x: 268, dir: 1, who: null },
    { x: 1106, dir: 1, who: null },
    { x: 1168, dir: -1, who: null },
  ];

  const add = (x: number, look?: Look) => {
    const c = new Customer(crowd, x, look);
    people.push(c);
    return c;
  };
  const joinQueue = (c: Customer) => {
    queue.push(c);
    c.state = 'walk';
    c.target = QUEUE_X[queue.length - 1];
  };
  const leave = (c: Customer, side?: 'left' | 'right') => {
    if (c.spot) { c.spot.who = null; c.spot = null; }
    c.state = 'leave';
    c.target = (side ? side === 'right' : Math.random() < 0.6) ? EXIT_RIGHT : EXIT_LEFT;
    c.fig.nod = 0;
    c.fig.bringToFront();
  };
  const afterDrink = (c: Customer) => {
    const spot = Math.random() < 0.55 ? spots.find((s) => !s.who) ?? null : null;
    if (spot) {
      spot.who = c;
      c.spot = spot;
      c.state = 'toSpot';
      c.target = spot.x;
      c.fig.bringToFront();
    } else leave(c);
  };

  let spawnIn = 1.5;
  const spawn = () => {
    if (Math.random() < 0.15) {
      const fromLeft = Math.random() < 0.5;
      const c = add(fromLeft ? EXIT_LEFT : EXIT_RIGHT);
      c.fig.hasCup = Math.random() < 0.5;
      c.state = 'pass';
      c.target = fromLeft ? EXIT_RIGHT : EXIT_LEFT;
      c.speed *= 1.1;
      return;
    }
    if (queue.length < QUEUE_X.length) joinQueue(add(EXIT_LEFT));
  };

  // --- Opening scene ---
  {
    const a = add(QUEUE_X[0]);
    queue.push(a);
    a.state = 'waitDrink';
    machine.queue.push(a);
    const b = add(QUEUE_X[1]);
    queue.push(b);
    b.state = 'queue';
    const c = add(spots[0].x);
    c.fig.hasCup = true;
    c.state = 'mingle';
    c.timer = rand(7, 10);
    c.spot = spots[0];
    spots[0].who = c;
    const d = add(1010);
    d.fig.hasCup = true;
    leave(d, 'right');
    d.fig.walking = true;
    d.fig.phase = 0.9;
  }

  // ---------- Loop ----------
  const update = (dt: number) => {
    spawnIn -= dt;
    if (spawnIn <= 0) { spawn(); spawnIn = rand(3.4, 5.6); }

    queue.forEach((c, i) => {
      if (c.state === 'walk' || c.state === 'queue') c.target = QUEUE_X[i];
    });

    // Counter barista
    bar.t += dt;
    const front = queue[0];
    if (bar.state === 'idle') {
      if (machine.ready.length) {
        bar.state = 'fetch'; bar.t = 0; bar.who = machine.ready.shift()!; bar.handed = false;
      } else if (front && front.state === 'queue' && !front.walking && front.x === QUEUE_X[0]) {
        bar.state = 'taking'; bar.t = 0; bar.who = front; front.state = 'order';
      }
    }
    if (bar.state === 'taking') {
      b2Head.setAttribute('transform', `rotate(${(Math.sin(bar.t * 14) * 3.5).toFixed(2)} 760 274)`);
      if (bar.who) bar.who.fig.nod = Math.sin(bar.t * 11 + 1) * 2.5;
      if (bar.t > 1.3) {
        b2Head.removeAttribute('transform');
        if (bar.who) { bar.who.fig.nod = 0; bar.who.state = 'waitDrink'; machine.queue.push(bar.who); }
        bar.state = 'idle'; bar.who = null;
      }
    } else if (bar.state === 'fetch') {
      setB2('right', false, false);
      if (bar.t > 0.55) {
        bar.state = 'hand'; bar.t = 0;
        setB2('left', true, true);
        if (bar.who) bar.who.reaching = true;
      }
    } else if (bar.state === 'hand') {
      if (!bar.handed && bar.t > 0.6 && bar.who) {
        bar.handed = true;
        b2Cup.style.display = 'none';
        bar.who.fig.hasCup = true;
        bar.who.state = 'receive';
        bar.who.timer = 0.35;
      }
      if (bar.t > 0.85) { setB2('left', false, false); bar.state = 'idle'; bar.who = null; }
    }

    // La Marzocco barista
    if (!machine.busy && machine.queue.length) { machine.busy = machine.queue.shift()!; machine.t = 0; }
    if (machine.busy) {
      machine.t += dt;
      b1Pose = brewCycle[Math.min(brewCycle.length - 1, Math.floor((machine.t / BREW_TIME) * brewCycle.length))];
      if (machine.t > BREW_TIME) { machine.ready.push(machine.busy); machine.busy = null; }
    } else b1Pose = 'idle';
    const k = Math.min(1, dt * 14);
    B1_TARGETS[b1Pose].forEach((t, i) => {
      b1Hands[i].x += (t.x - b1Hands[i].x) * k;
      b1Hands[i].y += (t.y - b1Hands[i].y) * k;
    });
    b1.arms = { kind: 'target', near: b1.toLocal(b1Hands[0]), far: b1.toLocal(b1Hands[1]) };
    b1.nod = b1Pose === 'idle' ? 0 : Math.sin(machine.t * 5) * 2;
    b1.render();
    jug.style.display = b1Pose === 'steam' ? '' : 'none';
    jug.setAttribute('transform', `translate(${b1.handWorld.x.toFixed(1)} ${b1.handWorld.y.toFixed(1)})`);
    steam.style.display = b1Pose === 'steam' ? '' : 'none';
    steam.style.opacity = String(0.4 + 0.6 * Math.abs(Math.sin(machine.t * 9)));
    pour.style.display = b1Pose === 'shot' ? '' : 'none';

    // Seated customer
    seat.t -= dt;
    if (seat.t <= 0) {
      seat.sipping = !seat.sipping;
      seated.arms = { kind: seat.sipping ? 'sip' : 'hold' };
      seat.t = seat.sipping ? rand(0.9, 1.3) : rand(3.5, 6.5);
    }
    seated.render();

    // Customers
    const chatting = spots[1].who?.state === 'mingle' && spots[2].who?.state === 'mingle';
    for (const c of people) {
      const arrived = c.step(dt);
      const fig = c.fig;

      if (fig.hasCup && !c.walking && c.state === 'mingle') {
        if (c.sipLeft > 0) {
          c.sipLeft -= dt;
          if (c.sipLeft <= 0) c.sipLeft = 0;
        } else {
          c.nextSip -= dt;
          if (c.nextSip <= 0) { c.sipLeft = rand(0.7, 1.1); c.nextSip = rand(2.5, 5); }
        }
      }

      switch (c.state) {
        case 'walk':
          if (arrived || !c.walking) c.state = 'queue';
          break;
        case 'receive':
          c.timer -= dt;
          if (c.timer <= 0) {
            c.reaching = false;
            queue.splice(queue.indexOf(c), 1);
            afterDrink(c);
          }
          break;
        case 'toSpot':
          if (arrived || !c.walking) { c.state = 'mingle'; c.timer = rand(6, 11); }
          break;
        case 'mingle':
          if (!c.walking && c.spot) fig.dir = c.spot.dir;
          fig.nod = chatting && c.spot !== spots[0] ? Math.sin(performance.now() / 160 + c.spot!.x) * 1.8 : 0;
          c.timer -= dt;
          if (c.timer <= 0) leave(c, c.x < 600 ? 'left' : 'right');
          break;
        case 'leave':
        case 'pass':
          if (!c.walking) c.remove();
          break;
      }
      if (['queue', 'order', 'waitDrink', 'receive'].includes(c.state) && !c.walking) fig.dir = 1;

      fig.arms = c.reaching
        ? { kind: 'target', near: fig.toLocal(BARISTA_HAND) }
        : c.sipLeft > 0 ? { kind: 'sip' } : { kind: 'swing' };
      if (!c.done) fig.render();
    }
    for (let i = people.length - 1; i >= 0; i--) if (people[i].done) people.splice(i, 1);
  };

  update(0);
  if (still) return; // reduced motion: keep the detailed opening frame, no movement

  let running = false;
  let last = 0;
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      last = performance.now();
      requestAnimationFrame(frame);
    } else if (!entry.isIntersecting) running = false;
  });
  io.observe(svg);

  // ?sketch-debug exposes a manual stepper for checking the choreography.
  if (new URLSearchParams(location.search).has('sketch-debug')) {
    io.disconnect();
    running = false;
    (window as unknown as { __coffeeBar: unknown }).__coffeeBar = {
      advance(seconds: number) {
        for (let t = 0; t < seconds; t += 1 / 60) update(1 / 60);
      },
      state: () => ({
        bar: bar.state,
        machine: machine.busy ? 'brewing' : 'idle',
        queue: queue.map((c) => `${c.state}@${Math.round(c.x)}`),
        people: people.map((c) => `${c.state}@${Math.round(c.x)}${c.fig.hasCup ? '+cup' : ''}`),
      }),
    };
  }
}
