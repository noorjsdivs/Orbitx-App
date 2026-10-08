const formatters = new Map<number, Intl.NumberFormat>();

/** Fixed-decimal number with thousands separators, e.g. fmt(67412.3, 2) → "67,412.30". */
export function fmt(n: number, d: number): string {
  let f = formatters.get(d);
  if (!f) {
    f = new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    formatters.set(d, f);
  }
  return f.format(Number.isFinite(n) ? n : 0);
}

/** 1.84e9 → "1.84B" */
export function compact(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'K';
  return v.toFixed(2);
}

/** Signed percent: 2.14 → "+2.14%" */
export function pct(c: number): string {
  return (c >= 0 ? '+' : '') + c.toFixed(2) + '%';
}

/** Amount decimals for an asset priced at p. */
export function amountDp(p: number): number {
  return p >= 10000 ? 5 : p >= 100 ? 4 : p >= 1 ? 2 : 0;
}

/** Holding decimals. */
export function holdingDp(sym: string, p: number): number {
  return sym === 'USDT' ? 2 : p >= 1000 ? 6 : p >= 1 ? 4 : 2;
}

export function maskEmail(e: string): string {
  const p = e.split('@');
  if (p.length < 2) return e;
  return p[0].slice(0, 1) + '•••' + p[0].slice(-1) + '@' + p[1];
}

const z = (n: number) => String(n).padStart(2, '0');

/** Local wall-clock time HH:MM:SS */
export function hms(d = new Date()): string {
  return z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds());
}

/** Local timestamp YYYY-MM-DD HH:MM:SS */
export function stamp(d = new Date()): string {
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${hms(d)}`;
}

/** Seconds → HH:MM:SS */
export function clock(sec: number): string {
  return z(Math.floor(sec / 3600)) + ':' + z(Math.floor((sec % 3600) / 60)) + ':' + z(sec % 60);
}

/** Seconds → MM:SS */
export function mmss(sec: number): string {
  return z(Math.floor(sec / 60)) + ':' + z(sec % 60);
}

/** Strip everything except digits and a decimal point. */
export function decimalInput(v: string): string {
  const clean = v.replace(/[^0-9.]/g, '');
  const i = clean.indexOf('.');
  return i < 0 ? clean : clean.slice(0, i + 1) + clean.slice(i + 1).replace(/\./g, '');
}

export function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
