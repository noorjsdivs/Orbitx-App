import { haptic } from '@/hooks/use-haptics';
import { amountDp, fmt, num, stamp } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket, type Quote } from '@/store/market';
import { uid, useWallet } from '@/store/wallet';

type LiteDraft = ReturnType<typeof useDrafts.getState>['lite'];

/** Lite (market-only) ticket: spend USDT to buy, or sell the coin for USDT. 0.10% fee. */
export function computeLite(lite: LiteDraft, sym: string, prices: Record<string, Quote>, bal: Record<string, number>) {
  const o = prices[sym];
  const lb = lite.side === 'buy';
  const la = num(lite.amt);
  const ad = amountDp(o.p);
  const get = lb ? (la * 0.999) / o.p : la * o.p * 0.999;
  const avbl = lb ? (bal.USDT ?? 0) : (bal[sym] ?? 0);
  const notional = lb ? la : la * o.p;
  let err = '';
  if (la > 0 && la > avbl + 1e-9) err = `Not enough ${lb ? 'USDT' : sym}. Available ${fmt(avbl, lb ? 2 : ad)}.`;
  else if (la > 0 && notional < 5) err = 'Minimum order is 5 USDT.';
  return { o, lb, la, ad, get, avbl, notional, fee: notional * 0.001, err, ok: la > 0 && !err };
}

/** Open the review step with a fresh 10-second quote. */
export function lockLiteQuote() {
  useDrafts.getState().patch('lite', { step: 'review', quoteUntil: Date.now() + 10000 });
}

export function confirmLite(sym: string) {
  const { lite, patch } = useDrafts.getState();
  const wallet = useWallet.getState();
  const prices = useMarket.getState().prices;
  const t = computeLite(lite, sym, prices, wallet.bal);
  if (!t.ok) return;
  const bal = { ...wallet.bal };
  if (t.lb) {
    bal.USDT -= t.la;
    bal[sym] = (bal[sym] ?? 0) + t.get;
  } else {
    bal[sym] -= t.la;
    bal.USDT += t.get;
  }
  const msg = `${t.lb ? 'Bought' : 'Sold'} ${fmt(t.lb ? t.get : t.la, t.ad)} ${sym} for ${fmt(t.lb ? t.la : t.get, 2)} USDT`;
  wallet.set((s) => ({ bal, fills: [{ id: uid(), sym, side: lite.side, type: 'Market', price: t.o.p, amt: t.lb ? t.get : t.la, time: stamp() }, ...s.fills] }));
  haptic.success();
  patch('lite', { step: 'done', doneMsg: msg, amt: '' });
}
