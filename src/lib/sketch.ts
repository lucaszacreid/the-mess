// Shared SVG markup builders for the coffee bar sketch (used at build time and in the browser).

/** THE MESS takeaway cup, centred on cx with its base at by. */
export const cupMarkup = (cx: number, by: number, s = 1) => {
  const w = 11 * s, b = 8 * s, h = 30 * s;
  return `
  <g class="cup">
    <path class="ln o" d="M${cx - w},${by - h} L${cx + w},${by - h} L${cx + b},${by} L${cx - b},${by} Z"/>
    <path class="ln o" d="M${cx - w - 1},${by - h} L${cx + w + 1},${by - h} L${cx + w},${by - h - 4 * s} L${cx - w},${by - h - 4 * s} Z"/>
    <path class="ln" d="M${cx - w + 2},${by - h - 4 * s} L${cx - w + 3},${by - h - 7 * s} L${cx + w - 3},${by - h - 7 * s} L${cx + w - 2},${by - h - 4 * s}"/>
    <path class="ln faint" d="M${cx - w + 0.6},${by - h + 7 * s} L${cx + w - 0.6},${by - h + 7 * s} M${cx - b - 1},${by - 7 * s} L${cx + b + 1},${by - 7 * s}"/>
    <text class="cup-text" x="${cx + 0.4 * s}" y="${by - 16.5 * s}" font-size="${4.4 * s}">THE</text>
    <text class="cup-text" x="${cx + 0.4 * s}" y="${by - 10.5 * s}" font-size="${4.4 * s}">MESS</text>
  </g>`;
};

/** Small espresso cup with a handle, base at y. */
export const smallCupMarkup = (x: number, y: number) =>
  `<path class="ln o" d="M${x - 6},${y - 9} L${x + 6},${y - 9} L${x + 5},${y} L${x - 5},${y} Z"/><path class="ln" d="M${x + 6},${y - 7} q5,1 4,5 l-4,0"/>`;
