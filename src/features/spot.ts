import { COINS } from '@/data/market';
import { haptic } from '@/hooks/use-haptics';
import { amountDp, fmt, num, stamp } from '@/lib/format';
import { hash, rng } from '@/lib/random';
import { useDrafts } from '@/store/drafts';
import { useMarket, type Quote } from '@/store/market';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';

type SpotDraft = ReturnType<typeof useDrafts.getState>['spot'];

export const TAKER_FEE = 0.001;

/** Validated spot ticket, mirroring the prototype's `tk()`. */
export function computeTicket(spot: SpotDraft, prices: Record<string, Quote>, bal: Record<string, number>) {
  const k = spot.pair;
  const co = COINS[k];
  const live = prices[k].p;
  const ad = amountDp(live);
  const isBuy = spot.side === 'buy';
  const priceN = spot.otype === 'market' ? live : num(spot.priceIn);
  const amtN = num(spot.amtIn);
  const totalN = priceN * amtN;
  const feeN = totalN * TAKER_FEE;
  const avblN = isBuy ? (bal.USDT ?? 0) : (bal[k] ?? 0);
  let err = '';
  if (spot.otype !== 'market' && !(priceN > 0)) err = 'Enter a price';
  else if (spot.otype === 'stop' && !(num(spot.stopIn) > 0)) err = 'Enter a stop (trigger) price';
  else if (amtN > 0 && isBuy && totalN + feeN > avblN + 1e-9) err = 'Insufficient USDT balance. Deposit or transfer funds to continue.';
  else if (amtN > 0 && !isBuy && amtN > avblN + 1e-12) err = `Insufficient ${k} balance`;
  else if (amtN > 0 && totalN < 5) err = 'Minimum order value is 5 USDT';
  return { k, co, live, ad, isBuy, priceN, amtN, totalN, feeN, avblN, err, ok: amtN > 0 && !err };
}

export type Ticket = ReturnType<typeof computeTicket>;

/** Fill the amount from a % of available balance. */
export function setPercent(v: number) {
  const { spot, patch } = useDrafts.getState();
  const t = computeTicket(spot, useMarket.getState().prices, useWallet.getState().bal);
  if (!(t.priceN > 0)) return;
  let a = t.isBuy ? (t.avblN * v) / 100 / (t.priceN * (1 + TAKER_FEE)) : (t.avblN * v) / 100;
  const m = Math.pow(10, t.ad);
  a = Math.floor(a * m) / m;
  haptic.tap();
  patch('spot', { pct: v, amtIn: a > 0 ? a.toFixed(t.ad) : '' });
}

/** Nudge the limit price by one tick. */
export function stepPrice(d: 1 | -1) {
  const { spot, patch } = useDrafts.getState();
  const co = COINS[spot.pair];
  const live = useMarket.getState().prices[spot.pair].p;
  const step = Math.max(Math.pow(10, -co.dp), +(live * 0.00002).toFixed(co.dp));
  const cur = num(spot.priceIn) || live;
  haptic.tap();
  patch('spot', { priceIn: Math.max(0, cur + d * step).toFixed(co.dp) });
}

/** Execute a market order or rest a limit / stop-limit order. */
export function placeOrder(): boolean {
  const { spot, patch } = useDrafts.getState();
  const wallet = useWallet.getState();
  const t = computeTicket(spot, useMarket.getState().prices, wallet.bal);
  if (!t.ok) return false;
  const dp = t.co.dp;
  if (spot.otype === 'market') {
    const bal = { ...wallet.bal };
    if (t.isBuy) {
      bal.USDT -= t.totalN + t.feeN;
      bal[t.k] = (bal[t.k] ?? 0) + t.amtN;
    } else {
      bal[t.k] -= t.amtN;
      bal.USDT += t.totalN - t.feeN;
    }
    wallet.set((s) => ({ bal, fills: [{ id: uid(), sym: t.k, side: spot.side, type: 'Market', price: t.live, amt: t.amtN, time: stamp() }, ...s.fills] }));
    toast(`Filled · ${t.isBuy ? 'Bought' : 'Sold'} ${fmt(t.amtN, t.ad)} ${t.k} at ${fmt(t.live, dp)}`);
  } else {
    const type = spot.otype === 'stop' ? 'Stop-limit' : 'Limit';
    wallet.set((s) => ({
      orders: [{ id: uid(), sym: t.k, side: spot.side, type, price: t.priceN, stop: spot.otype === 'stop' ? num(spot.stopIn) : null, amt: t.amtN, time: stamp() }, ...s.orders],
    }));
    toast(`${type} ${spot.side} order placed · ${fmt(t.amtN, t.ad)} ${t.k} @ ${fmt(t.priceN, dp)}`);
  }
  haptic.success();
  patch('spot', { amtIn: '', pct: 0 });
  return true;
}

export type BookView = 'both' | 'bids' | 'asks';
export type BookRow = { p: number; a: number; cum: number };

/** Synthetic order book around the live price, reseeded every tick. */
export function buildBook(sym: string, live: number, tick: number, view: BookView) {
  const dp = COINS[sym].dp;
  const r = rng(hash(sym) + tick * 7919);
  const step = Math.max(Math.pow(10, -dp), +(live * 0.000018).toFixed(dp));
  const base = 3200 / live;
  const side = (sg: 1 | -1): BookRow[] => {
    let off = 0;
    let cum = 0;
    return Array.from({ length: 14 }, () => {
      off += step * (1 + Math.floor(r() * 3));
      const p = live + sg * off;
      const a = base * (0.12 + r() * r() * 2.6);
      cum += a;
      return { p, a, cum };
    });
  };
  const asksA = side(1);
  const bidsA = side(-1);
  const n = view === 'both' ? 7 : 14;
  const maxCum = Math.max(asksA[n - 1].cum, bidsA[n - 1].cum);
  const bs = bidsA.slice(0, 7).reduce((a, b) => a + b.a, 0);
  const as = asksA.slice(0, 7).reduce((a, b) => a + b.a, 0);
  return {
    asks: view === 'bids' ? [] : asksA.slice(0, n).reverse(),
    bids: view === 'asks' ? [] : bidsA.slice(0, n),
    maxCum,
    bidPct: (bs / (bs + as)) * 100,
    step,
  };
}

