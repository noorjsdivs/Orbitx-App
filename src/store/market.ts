import { create } from 'zustand';

import { COINS, PAIRS } from '@/data/market';

export type Quote = { p: number; c: number; dir: -1 | 0 | 1 };

type MarketState = {
  prices: Record<string, Quote>;
  tick: number;
  /** Initial feed connection (skeletons). */
  booting: boolean;
  /** Manual retry in flight. */
  reloading: boolean;
  step: () => void;
  boot: () => void;
  retry: () => void;
};

const initial: Record<string, Quote> = Object.fromEntries(
  Object.keys(COINS).map((k) => [k, { p: COINS[k].p, c: COINS[k].c, dir: 0 as const }]),
);

/**
 * Simulated price feed: every tick ~65% of pairs random-walk.
 * Swap `step` for a WebSocket subscription to go live.
 */
export const useMarket = create<MarketState>()((set) => ({
  prices: initial,
  tick: 0,
  booting: true,
  reloading: false,
  step: () =>
    set((s) => {
      const prices = { ...s.prices };
      for (const k of PAIRS) {
        if (Math.random() < 0.35) continue;
        const o = prices[k];
        const vol = k === 'BTC' || k === 'ETH' ? 0.0006 : 0.0013;
        const r = (Math.random() - 0.485) * vol;
        prices[k] = { p: o.p * (1 + r), c: o.c + r * 100, dir: r >= 0 ? 1 : -1 };
      }
      return { prices, tick: s.tick + 1 };
    }),
  boot: () => {
    set({ booting: true });
    setTimeout(() => set({ booting: false }), 900);
  },
  retry: () => {
    set({ reloading: true });
    setTimeout(() => set({ reloading: false }), 800);
  },
}));

export const useQuote = (sym: string) => useMarket((s) => s.prices[sym]);
export const getPrice = (sym: string) => useMarket.getState().prices[sym]?.p ?? 1;
