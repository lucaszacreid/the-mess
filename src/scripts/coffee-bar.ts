// Timelapse animation for the coffee bar sketch.
// Customers walk in from the left, queue, order, collect a THE MESS cup and then
// either leave or stand and chat for a while. The counter barista takes orders and
// hands drinks over; the La Marzocco barista tamps, pulls shots and steams milk.
// Everything runs at a sped-up, timelapse pace. Nothing runs with reduced motion,
// and the loop pauses whenever the sketch is off screen.

import { cupMarkup } from '../lib/sketch';

type Hair = 'bob' | 'short' | 'pony' | 'bun';
type Coat = 'long' | 'short';
type Pose = 'down' | 'hold' | 'sip' | 'reach';
type State =
  | 'walk' | 'queue' | 'order' | 'waitDrink' | 'receive'
  | 'toSpot' | 'mingle' | 'leave' | 'pass';

const NS = 'http://www.w3.org/2000/svg';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Walking pace and step rhythm, tuned to read as a sped-up timelapse.
const WALK_SPEED = 165; // svg units per second
const STEP_RATE = 9.5; // radians of stride phase per second

const QUEUE_X = [540, 458, 376, 294];
const EXIT_LEFT = -90;
const EXIT_RIGHT = 1290;

// ---------- Figure markup (profile, facing right; feet on y = 600) ----------

const legMarkup = (hip: number) =>
  `<path class="ln o" d="M-9,${hip} L-7,592 L7,592 L9,${hip} Z"/>` +
  `<path class="ln o" d="M-7,592 L-7,600 L14,600 Q14,594 7,592 Z"/>`;

const COATS: Record<Coat, { hip: number; markup: string }> = {
  long: {
    hip: 470,
    markup:
      '<path class="ln o" d="M-8,316 C-30,318 -36,330 -38,356 L-44,490 L40,490 L34,356 C32,330 26,318 8,316 Z"/>' +
      '<path class="ln" d="M-8,316 L0,346 L8,316 M-37,420 Q0,426 35,420"/>',
  },
  short: {
    hip: 440,
    markup:
      '<path class="ln o" d="M-8,312 C-26,314 -31,326 -32,350 L-33,456 L31,456 L30,350 C29,326 24,314 8,312 Z"/>' +
      '<path class="ln faint" d="M-33,444 L31,444 M2,330 L2,456"/>',
  },
};

const HAIR: Record<Hair, { back: string; front: string }> = {
  bob: {
    back: '',
    front: '<path class="ln o" d="M-12,302 Q-17,270 3,268 Q21,268 18,302 Q16,290 15,282 Q4,276 -9,282 Q-10,292 -12,302 Z"/>',
  },
  short: {
    back: '',
    front: '<path class="ln o" d="M-12,284 Q-13,268 3,268 Q18,268 16,282 Q13,276 4,276 Q-6,276 -12,284 Z"/>',
  },
  pony: {
    back: '<path class="ln" d="M-11,280 Q-26,286 -24,310 Q-20,298 -12,292"/>',
    front: '<path class="ln o" d="M-12,288 Q-14,268 3,268 Q18,268 16,284 Q8,276 -12,288 Z"/>',
  },
  bun: {
    back: '<circle class="ln o" cx="-11" cy="272" r="6.5"/>',
    front: '<path class="ln o" d="M-12,286 Q-13,268 3,268 Q18,268 16,282 Q10,274 -12,286 Z"/>',
  },
};

const TOTE =
  '<path class="ln" d="M-6,318 L-26,420"/>' +
  '<path class="ln o" d="M-40,414 L-14,414 L-12,474 L-42,474 Z"/>';

// Near arm, shoulder at (4, 330).
const ARM: Record<Pose, string> = {
  down: 'M4,330 C10,368 10,410 6,446',
  hold: 'M4,330 C12,360 12,388 8,400 L22,384',
  sip: 'M4,330 C14,356 18,368 18,370 L23,334',
  reach: 'M4,330 C22,344 42,350 60,346',
};
// Where the cup sits (centre x, base y) for each arm pose.
const CUP_AT: Record<Pose, [number, number]> = {
  down: [24, 392],
  hold: [24, 392],
  sip: [27, 338],
  reach: [64, 352],
};

// ---------- People ----------

class Person {
  x: number;
  dir: 1 | -1;
  s = rand(0.95, 1.04);
  speed = WALK_SPEED * rand(0.9, 1.12);
  hip: number;
  state: State = 'walk';
  target: number;
  timer = 0;
  phase = rand(0, Math.PI * 2);
  pose: Pose = 'down';
  hasCup = false;
  showCup = false;
  nextSip = rand(1.5, 4);
  sipLeft = 0;
  spot: Spot | null = null;
  done = false;

  g: SVGGElement;
  near: SVGGElement;
  far: SVGGElement;
  armG: SVGGElement;
  armPath: SVGPathElement;
  hand: SVGEllipseElement;
  cupG: SVGGElement;
  private shownPose: Pose | null = null;

  constructor(parent: SVGGElement, x: number, opts: { coat?: Coat; hair?: Hair; tote?: boolean } = {}) {
    const coat = opts.coat ?? pick<Coat>(['long', 'short', 'short']);
    const hair = opts.hair ?? pick<Hair>(['bob', 'short', 'pony', 'bun', 'short']);
    const tote = opts.tote ?? Math.random() < 0.25;
    this.hip = COATS[coat].hip;
    this.x = x;
    this.target = x;
    this.dir = 1;

    this.g = document.createElementNS(NS, 'g');
    this.g.innerHTML =
      `<g data-far>${legMarkup(this.hip)}</g>` +
      `<g data-near>${legMarkup(this.hip)}</g>` +
      COATS[coat].markup +
      (tote ? TOTE : '') +
      `<g data-head>${HAIR[hair].back}<path class="ln" d="M-3,304 L-3,316 M7,304 L7,316"/>` +
      `<ellipse class="ln o" cx="2" cy="290" rx="13" ry="17"/>${HAIR[hair].front}</g>` +
      `<g data-arm><path class="ln" d=""/><ellipse class="ln o" cx="62" cy="346" rx="5" ry="4"/></g>` +
      `<g data-cup>${cupMarkup(0, 0)}</g>`;
    this.far = this.g.querySelector('[data-far]')!;
    this.near = this.g.querySelector('[data-near]')!;
    this.armG = this.g.querySelector('[data-arm]')!;
    this.armPath = this.armG.querySelector('path')!;
    this.hand = this.armG.querySelector('ellipse')!;
    this.cupG = this.g.querySelector('[data-cup]')!;
    parent.appendChild(this.g);
  }

  get walking() {
    return Math.abs(this.target - this.x) > 0.5;
  }

  /** Move toward target; returns true on the frame it arrives. */
  step(dt: number) {
    const d = this.target - this.x;
    if (Math.abs(d) <= 0.5) {
      this.x = this.target;
      return false;
    }
    this.dir = d > 0 ? 1 : -1;
    const move = Math.min(Math.abs(d), this.speed * dt);
    this.x += this.dir * move;
    this.phase += STEP_RATE * dt * (this.speed / WALK_SPEED);
    if (Math.abs(this.target - this.x) <= 0.5) {
      this.x = this.target;
      return true;
    }
    return false;
  }

  bringToFront() {
    this.g.parentNode?.appendChild(this.g);
  }

  render() {
    const walking = this.walking;
    const sw = walking ? Math.sin(this.phase) * 22 : 3;
    const bob = walking ? -Math.abs(Math.sin(this.phase)) * 2.2 : 0;
    this.g.setAttribute(
      'transform',
      `translate(${this.x.toFixed(1)} ${(600 + bob).toFixed(2)}) scale(${this.dir * this.s} ${this.s}) translate(0 -600)`,
    );
    this.near.setAttribute('transform', `rotate(${sw.toFixed(2)} 0 ${this.hip})`);
    this.far.setAttribute('transform', `rotate(${(-sw).toFixed(2)} 0 ${this.hip})`);

    const pose: Pose = this.pose === 'down' && this.hasCup ? 'hold' : this.pose;
    if (pose !== this.shownPose) {
      this.armPath.setAttribute('d', ARM[pose]);
      this.hand.style.display = pose === 'reach' ? '' : 'none';
      this.shownPose = pose;
    }
    const armSwing = !walking ? 0 : pose === 'down' ? -sw * 0.6 : -sw * 0.12;
    this.armG.setAttribute('transform', `rotate(${armSwing.toFixed(2)} 4 330)`);

    const cupVisible = this.hasCup || this.showCup;
    this.cupG.style.display = cupVisible ? '' : 'none';
    if (cupVisible) {
      const [cx, by] = CUP_AT[pose];
      // Swing with the arm around the shoulder; scale(dir) undoes the figure's mirror
      // so the cup lettering always reads the right way round.
      this.cupG.setAttribute(
        'transform',
        `rotate(${armSwing.toFixed(2)} 4 330) translate(${cx} ${by}) scale(${this.dir} 1)`,
      );
    }
  }

  remove() {
    this.g.remove();
    this.done = true;
  }
}

interface Spot { x: number; dir: 1 | -1; who: Person | null }

// ---------- Scene ----------

export function startCoffeeBar() {
  const svg = document.querySelector<SVGSVGElement>('.sketch svg');
  const crowd = document.getElementById('cb-crowd') as SVGGElement | null;
  if (!svg || !crowd) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const $ = <T extends Element>(id: string) => document.getElementById(id) as unknown as T;
  const b1Head = $<SVGGElement>('b1-head');
  const b1Arm1 = $<SVGPathElement>('b1-arm1');
  const b1Arm2 = $<SVGPathElement>('b1-arm2');
  const b1Jug = $<SVGPathElement>('b1-jug');
  const b1Steam = $<SVGPathElement>('b1-steam');
  const b2 = $<SVGGElement>('b2');
  const b2Head = $<SVGGElement>('b2-head');
  const b2Reach = $<SVGGElement>('b2-reach');
  const b2Idle = $<SVGPathElement>('b2-idle');
  const b2Cup = $<SVGGElement>('b2-cup');
  const seatArm = $<SVGPathElement>('seat-arm');
  const seatCup = $<SVGGElement>('seat-cup');

  // Swap the still frame's customers for live ones.
  crowd.innerHTML = '';

  const people: Person[] = [];
  const queue: Person[] = [];
  const spots: Spot[] = [
    { x: 262, dir: 1, who: null },
    { x: 1108, dir: 1, who: null },
    { x: 1166, dir: -1, who: null },
  ];

  // --- Baristas ---
  const B1_POSES = {
    shot: ['M960,298 C972,316 978,336 988,350', 'M948,302 C954,330 962,352 974,362 L986,364'],
    tamp: ['M960,298 C968,318 972,334 976,346', 'M948,302 C954,326 960,340 970,344'],
    steam: ['M960,298 C970,320 976,346 986,366', 'M948,302 C956,330 966,350 980,370'],
  };
  type B1Pose = keyof typeof B1_POSES;
  const brewCycle: B1Pose[] = ['tamp', 'tamp', 'shot', 'shot', 'steam', 'steam', 'steam'];
  let b1Pose: B1Pose | null = null;
  const setB1 = (p: B1Pose) => {
    if (p === b1Pose) return;
    b1Arm1.setAttribute('d', B1_POSES[p][0]);
    b1Arm2.setAttribute('d', B1_POSES[p][1]);
    b1Jug.style.display = p === 'steam' ? '' : 'none';
    b1Steam.style.display = p === 'steam' ? '' : 'none';
    b1Pose = p;
  };
  const machine = { queue: [] as Person[], busy: null as Person | null, t: 0, ready: [] as Person[] };

  type B2State = 'idle' | 'taking' | 'fetch' | 'hand';
  const bar = { state: 'idle' as B2State, t: 0, who: null as Person | null, handed: false };
  const B2_LEFT = 'translate(1464 0) scale(-1 1)';
  const B2_RIGHT = 'translate(-56 0)';
  const setB2 = (facing: 'left' | 'right', reach: boolean, cup: boolean) => {
    b2.setAttribute('transform', facing === 'left' ? B2_LEFT : B2_RIGHT);
    b2Reach.style.display = reach ? '' : 'none';
    b2Idle.style.display = reach ? 'none' : '';
    b2Cup.style.display = cup ? '' : 'none';
  };
  setB2('left', false, false);

  // --- Seated customer sips now and then ---
  const seat = { t: rand(1, 3), sipping: false };
  const SEAT_HOLD = 'M106,484 C98,502 96,514 88,512';
  const SEAT_SIP = 'M106,484 C100,478 98,470 98,466';

  // --- Spawning ---
  const addPerson = (x: number, opts?: ConstructorParameters<typeof Person>[2]) => {
    const p = new Person(crowd, x, opts);
    people.push(p);
    return p;
  };

  const joinQueue = (p: Person) => {
    queue.push(p);
    p.state = 'walk';
    p.target = QUEUE_X[queue.length - 1];
  };

  const freeSpot = () => spots.find((s) => !s.who) ?? null;

  const leave = (p: Person, side?: 'left' | 'right') => {
    if (p.spot) {
      p.spot.who = null;
      p.spot = null;
    }
    const goRight = side ? side === 'right' : Math.random() < 0.6;
    p.state = 'leave';
    p.target = goRight ? EXIT_RIGHT : EXIT_LEFT;
    p.pose = 'down';
    p.bringToFront();
  };

  const afterDrink = (p: Person) => {
    const spot = Math.random() < 0.5 ? freeSpot() : null;
    if (spot) {
      spot.who = p;
      p.spot = spot;
      p.state = 'toSpot';
      p.target = spot.x;
      p.bringToFront();
    } else {
      leave(p);
    }
  };

  let spawnIn = 1.2;
  const spawn = () => {
    if (Math.random() < 0.15) {
      // Someone just walking through
      const fromLeft = Math.random() < 0.5;
      const p = addPerson(fromLeft ? EXIT_LEFT : EXIT_RIGHT);
      p.hasCup = Math.random() < 0.5;
      p.state = 'pass';
      p.target = fromLeft ? EXIT_RIGHT : EXIT_LEFT;
      p.speed *= 1.1;
      return;
    }
    if (queue.length >= QUEUE_X.length) return;
    joinQueue(addPerson(EXIT_LEFT));
  };

  // --- Opening scene, close to the still frame ---
  {
    const a = addPerson(540, { coat: 'short', hair: 'pony' });
    queue.push(a);
    a.state = 'waitDrink';
    machine.queue.push(a);
    const b = addPerson(470, { coat: 'short', hair: 'short', tote: true });
    queue.push(b);
    b.state = 'queue';
    const c = addPerson(262, { coat: 'long', hair: 'bob', tote: false });
    c.hasCup = true;
    c.state = 'mingle';
    c.timer = rand(7, 10);
    c.spot = spots[0];
    spots[0].who = c;
    const d = addPerson(1010, { coat: 'long', hair: 'short', tote: false });
    d.hasCup = true;
    leave(d, 'right');
  }

  // ---------- Loop ----------
  const update = (dt: number) => {
    // Spawning
    spawnIn -= dt;
    if (spawnIn <= 0) {
      spawn();
      spawnIn = rand(3.4, 5.6);
    }

    // Queue positions shuffle forward as people are served
    queue.forEach((p, i) => {
      if (p.state === 'walk' || p.state === 'queue') p.target = QUEUE_X[i];
    });

    // Counter barista
    bar.t += dt;
    const front = queue[0];
    if (bar.state === 'idle') {
      if (machine.ready.length) {
        bar.state = 'fetch';
        bar.t = 0;
        bar.who = machine.ready.shift()!;
        bar.handed = false;
      } else if (front && front.state === 'queue' && !front.walking && front.x === QUEUE_X[0]) {
        bar.state = 'taking';
        bar.t = 0;
        bar.who = front;
        front.state = 'order';
      }
    }
    if (bar.state === 'taking') {
      const nod = Math.sin(bar.t * 14) * 3.5;
      b2Head.setAttribute('transform', `rotate(${nod.toFixed(2)} 760 274)`);
      if (bar.t > 1.2) {
        b2Head.removeAttribute('transform');
        bar.who!.state = 'waitDrink';
        machine.queue.push(bar.who!);
        bar.state = 'idle';
        bar.who = null;
      }
    } else if (bar.state === 'fetch') {
      setB2('right', false, false);
      if (bar.t > 0.55) {
        bar.state = 'hand';
        bar.t = 0;
        setB2('left', true, true);
        if (bar.who) bar.who.pose = 'reach';
      }
    } else if (bar.state === 'hand') {
      if (!bar.handed && bar.t > 0.55 && bar.who) {
        // The cup changes hands
        bar.handed = true;
        b2Cup.style.display = 'none';
        bar.who.hasCup = true;
        bar.who.state = 'receive';
        bar.who.timer = 0.35;
      }
      if (bar.t > 0.8) {
        setB2('left', false, false);
        bar.state = 'idle';
        bar.who = null;
      }
    }

    // Machine barista
    if (!machine.busy && machine.queue.length) {
      machine.busy = machine.queue.shift()!;
      machine.t = 0;
    }
    if (machine.busy) {
      machine.t += dt;
      setB1(brewCycle[Math.min(brewCycle.length - 1, Math.floor((machine.t / 2.4) * brewCycle.length))]);
      b1Head.setAttribute('transform', `rotate(${(Math.sin(machine.t * 5) * 2).toFixed(2)} 953 276)`);
      b1Steam.style.opacity = String(0.5 + 0.5 * Math.abs(Math.sin(machine.t * 9)));
      if (machine.t > 2.4) {
        machine.ready.push(machine.busy);
        machine.busy = null;
        setB1('shot');
      }
    } else {
      setB1('shot');
    }

    // Seated customer
    seat.t -= dt;
    if (seat.t <= 0) {
      seat.sipping = !seat.sipping;
      seatArm.setAttribute('d', seat.sipping ? SEAT_SIP : SEAT_HOLD);
      seatCup.setAttribute('transform', seat.sipping ? 'translate(14 -50)' : '');
      seat.t = seat.sipping ? rand(0.9, 1.3) : rand(3.5, 6.5);
    }

    // Customers
    for (const p of people) {
      const arrived = p.step(dt);

      // Sipping while holding a drink and standing still
      if (p.hasCup && !p.walking && (p.state === 'mingle' || p.state === 'queue')) {
        if (p.sipLeft > 0) {
          p.sipLeft -= dt;
          p.pose = 'sip';
          if (p.sipLeft <= 0) p.pose = 'down';
        } else {
          p.nextSip -= dt;
          if (p.nextSip <= 0) {
            p.sipLeft = rand(0.7, 1.1);
            p.nextSip = rand(2.5, 5);
          }
        }
      }

      switch (p.state) {
        case 'walk':
          if (arrived || !p.walking) p.state = 'queue';
          break;
        case 'receive':
          p.timer -= dt;
          if (p.timer <= 0) {
            p.pose = 'down';
            queue.splice(queue.indexOf(p), 1);
            afterDrink(p);
          }
          break;
        case 'toSpot':
          if (arrived || !p.walking) {
            p.state = 'mingle';
            p.timer = rand(6, 11);
          }
          break;
        case 'mingle':
          if (!p.walking && p.spot) p.dir = p.spot.dir;
          p.timer -= dt;
          if (p.timer <= 0) leave(p, p.x < 600 ? 'left' : 'right');
          break;
        case 'leave':
        case 'pass':
          if (!p.walking) p.remove(); // reached the edge
          break;
      }
      // Queuers face the counter
      if ((p.state === 'queue' || p.state === 'order' || p.state === 'waitDrink' || p.state === 'receive') && !p.walking) {
        p.dir = 1;
      }
      if (!p.done) p.render();
    }
    for (let i = people.length - 1; i >= 0; i--) if (people[i].done) people.splice(i, 1);
  };

  // Run only while the sketch is on screen.
  let running = false;
  let last = 0;
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(frame);
      } else if (!entry.isIntersecting) {
        running = false;
      }
    },
    { threshold: 0 },
  );
  io.observe(svg);

  // Draw the opening frame straight away so nothing pops in.
  update(0);

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
        queue: queue.map((p) => `${p.state}@${Math.round(p.x)}`),
        people: people.map((p) => `${p.state}@${Math.round(p.x)}${p.hasCup ? '+cup' : ''}`),
      }),
    };
  }
}
