import { useMarket, type Quote } from '@/store/market';
import { usePrefs } from '@/store/prefs';
import { useWallet, type Position } from '@/store/wallet';

export const MASK = '••••••';

export type PositionStats = { mark: number; pnl: number; im: number; liq: number; roe: number };

/** Maintenance margin rate used for liquidation estimates. */
export const MMR = 0.004;

export function positionStats(p: Position, prices: Record<string, Quote>): PositionStats {
  const mark = prices[p.sym]?.p ?? p.entry;
  const d = p.side === 'long' ? 1 : -1;
  const pnl = (mark - p.entry) * p.size * d;
  const im = (p.entry * p.size) / p.lev;
  const liq = p.side === 'long' ? p.entry * (1 - 1 / p.lev + MMR) : p.entry * (1 + 1 / p.lev - MMR);
  return { mark, pnl, im, liq, roe: (pnl / im) * 100 };
}

/** Account values across Spot, Funding, Futures and Earn at live prices. */
export function usePortfolio() {
  const prices = useMarket((s) => s.prices);
  const { bal, fundUsdt, futUsdt, positions, earn } = useWallet();
  const px = (k: string) => prices[k]?.p ?? 1;

  const spotTotal = Object.keys(bal).reduce((a, k) => a + bal[k] * px(k), 0);
  const stats = positions.map((p) => positionStats(p, prices));
  const futPnl = stats.reduce((a, s) => a + s.pnl, 0);
  const futIm = stats.reduce((a, s) => a + s.im, 0);
  const futTotal = futUsdt + futPnl;
  const futAvail = Math.max(0, futUsdt - futIm);
  const earnTotal = earn.reduce((a, e) => a + e.amt * px(e.coin), 0);
  const total = spotTotal + fundUsdt + futTotal + earnTotal;

  let todayPnl = 0;
  for (const k of Object.keys(bal)) {
    if (k === 'USDT') continue;
    const c = prices[k]?.c ?? 0;
    todayPnl += (bal[k] * px(k) * c) / (100 + c);
  }
  for (const e of earn) {
    if (e.coin === 'USDT') continue;
    const c = prices[e.coin]?.c ?? 0;
    todayPnl += (e.amt * px(e.coin) * c) / (100 + c);
  }
  for (const p of positions) {
    const c = prices[p.sym]?.c ?? 0;
    todayPnl += (p.size * px(p.sym) * c) / (100 + c);
  }
  const todayPct = (todayPnl / (total - todayPnl)) * 100;

  return { prices, bal, spotTotal, fundTotal: fundUsdt, futPnl, futIm, futTotal, futAvail, earnTotal, total, todayPnl, todayPct, stats, positions, earn };
}

export type ListStatus = 'loading' | 'empty' | 'error' | 'ok';

/** List state with the feed's boot/retry loading and the developer override. */
export function useListStatus(count: number, extraLoading = false): ListStatus {
  const busy = useMarket((s) => s.booting || s.reloading);
  const forced = usePrefs((s) => s.listState);
  if (forced !== 'live') return forced === 'error' ? 'error' : forced;
  if (busy || extraLoading) return 'loading';
  return count ? 'ok' : 'empty';
}
