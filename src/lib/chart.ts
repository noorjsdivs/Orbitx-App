import { hash, rng } from './random';

export type Candle = { o: number; c: number; h: number; l: number; v: number };
export type Timeframe = '15m' | '1H' | '4H' | '1D' | '1W';

const VOL: Record<Timeframe, number> = { '15m': 0.0022, '1H': 0.0045, '4H': 0.009, '1D': 0.02, '1W': 0.045 };

/** 28-point sparkline in a 64×24 box, drifting with the 24h change. */
export function sparkPoints(sym: string, change: number): string {
  const r = rng(hash(sym));
  const pts: number[] = [];
  let v = 50;
  const drift = (change / 28) * 1.6;
  for (let i = 0; i < 28; i++) {
    v += (r() - 0.5) * 5 + drift;
    pts.push(v);
  }
  const mn = Math.min(...pts);
  const mx = Math.max(...pts);
  return pts.map((y, i) => ((i / 27) * 64).toFixed(1) + ',' + (22 - ((y - mn) / (mx - mn || 1)) * 20).toFixed(1)).join(' ');
}

/** 40 candles walking backwards from the last price, seeded per symbol + timeframe. */
export function genCandles(sym: string, tf: Timeframe, last: number): Candle[] {
  const r = rng(hash(sym + tf));
  const vol = VOL[tf];
  const arr: Candle[] = [];
  let price = last;
  for (let i = 0; i < 40; i++) {
    const close = price;
    const open = close * (1 + (r() - 0.53) * vol * 2);
    const hi = Math.max(open, close) * (1 + r() * vol * 0.7);
    const lo = Math.min(open, close) * (1 - r() * vol * 0.7);
    arr.unshift({ o: open, c: close, h: hi, l: lo, v: 0.25 + r() * r() * 1.2 });
    price = open;
  }
  return arr;
}

const cache = new Map<string, Candle[]>();

/** Candles anchored to the first price seen, with the live price applied to the last candle. */
export function liveCandles(sym: string, tf: Timeframe, live: number): Candle[] {
  const key = sym + tf;
  let base = cache.get(key);
  if (!base) {
    base = genCandles(sym, tf, live);
    cache.set(key, base);
  }
  const last = base[base.length - 1];
  const next = { ...last, c: live, h: Math.max(last.h, live), l: Math.min(last.l, live) };
  base[base.length - 1] = { ...last, h: next.h, l: next.l };
  return [...base.slice(0, -1), next];
}

/** SVG path for a line chart of closes inside W×H (with 8px vertical padding). */
export function linePath(vals: number[], W: number, H: number) {
  const mn = Math.min(...vals);
  const mx = Math.max(...vals);
  const line = 'M' + vals.map((v, i) => ((i / (vals.length - 1)) * W).toFixed(1) + ',' + (8 + ((mx - v) / (mx - mn || 1)) * (H - 16)).toFixed(1)).join(' L');
  return { line, area: `${line} L${W},${H + 10} L0,${H + 10} Z`, mn, mx, up: vals[vals.length - 1] >= vals[0] };
}
