type RGB = [number, number, number];

function parse(color: string): { rgb: RGB; a: number } {
  if (color.startsWith('#')) {
    const hex = color.length === 4 ? color.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : color;
    const n = parseInt(hex.slice(1, 7), 16);
    return { rgb: [(n >> 16) & 255, (n >> 8) & 255, n & 255], a: 1 };
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b, a] = m[1].split(',').map((v) => parseFloat(v.trim()));
    return { rgb: [r, g, b], a: a ?? 1 };
  }
  return { rgb: [0, 0, 0], a: 1 };
}

/** Equivalent of `color-mix(in srgb, <color> <pct>%, transparent)`. */
export function tint(color: string, pct: number): string {
  const { rgb, a } = parse(color);
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${+((a * pct) / 100).toFixed(3)})`;
}

/** Equivalent of `color-mix(in srgb, <a> <pct>%, <b>)`. */
export function blend(a: string, b: string, pct: number): string {
  const x = parse(a).rgb;
  const y = parse(b).rgb;
  const k = pct / 100;
  const c = x.map((v, i) => Math.round(v * k + y[i] * (1 - k)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
