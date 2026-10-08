import { fmt, num } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import type { Quote } from '@/store/market';

type ConvertDraft = ReturnType<typeof useDrafts.getState>['convert'];

/** Lock a fresh 8-second quote. */
export function lockConvertQuote() {
  useDrafts.getState().patch('convert', { quoteUntil: Date.now() + 8000 });
}

export const CONVERT_ASSETS = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'TON'];
export const convertDp = (c: string) => (c === 'USDT' ? 2 : 6);
export const rateFmt = (v: number) => fmt(v, v >= 1000 ? 2 : v >= 1 ? 4 : 8);

/** Locked-quote conversion: spread (0.1%) is included, no separate fee. */
export function computeConvert(cv: ConvertDraft, prices: Record<string, Quote>, bal: Record<string, number>) {
  const ca = num(cv.amt);
  const rate = prices[cv.from].p / prices[cv.to].p;
  const get = ca * rate * 0.999;
  const avbl = bal[cv.from] ?? 0;
  let err = '';
  if (ca > avbl + 1e-12) err = `Insufficient ${cv.from} balance.`;
  else if (ca > 0 && ca * prices[cv.from].p < 1) err = 'Minimum is 1 USDT equivalent.';
  return { ca, rate, get, avbl, err, ok: ca > 0 && !err };
}
