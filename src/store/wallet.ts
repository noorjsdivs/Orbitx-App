import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { SPOT_START } from '@/data/market';

import { persistStorage } from './storage';

export type Side = 'buy' | 'sell';
export type Order = {
  id: string;
  sym: string;
  side: Side;
  type: 'Limit' | 'Stop-limit' | 'Market' | 'Convert';
  price: number;
  stop?: number | null;
  amt: number;
  time: string;
};
export type Position = { id: string; sym: string; side: 'long' | 'short'; lev: number; size: number; entry: number; mode: 'Cross' | 'Isolated' };
export type EarnPosition = { id: string; coin: string; name: string; term: string; apr: string; amt: number; k2: string; v2: string };
export type PriceAlert = { id: string; sym: string; cond: 'above' | 'below'; price: number; on: boolean };
export type Account = 'spot' | 'funding' | 'futures';

type WalletState = {
  /** Spot balances by asset */
  bal: Record<string, number>;
  fundUsdt: number;
  futUsdt: number;
  orders: Order[];
  fills: Order[];
  canceled: Order[];
  positions: Position[];
  earn: EarnPosition[];
  alerts: PriceAlert[];
  recent: string[];
  notifRead: boolean;
  set: (p: Partial<WalletState> | ((s: WalletState) => Partial<WalletState>)) => void;
  credit: (asset: string, delta: number) => void;
  cancelOrder: (id: string, time: string) => void;
  addRecent: (x: string) => void;
  /** Move USDT between internal accounts (instant, free). */
  move: (from: Account, to: Account, amt: number) => void;
};

/** Futures margin locked by the seeded BTC position. */
export const FUT_LOCKED = 380;

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const useWallet = create<WalletState>()(
  persist(
    (set) => ({
      bal: { ...SPOT_START },
      fundUsdt: 1850,
      futUsdt: 2131.28,
      orders: [
        { id: 'o1', sym: 'ETH', side: 'sell', type: 'Limit', price: 3420.0, amt: 0.15, time: '2026-10-07 09:14:52' },
        { id: 'o2', sym: 'SOL', side: 'buy', type: 'Stop-limit', price: 148.5, stop: 148.0, amt: 2.0, time: '2026-10-06 22:41:07' },
      ],
      fills: [
        { id: 'f1', sym: 'BTC', side: 'buy', type: 'Limit', price: 65120, amt: 0.012, time: '2026-10-05 18:02:11' },
        { id: 'f2', sym: 'SOL', side: 'buy', type: 'Market', price: 141.22, amt: 2.85, time: '2026-10-03 09:47:30' },
        { id: 'f3', sym: 'DOGE', side: 'sell', type: 'Market', price: 0.1311, amt: 400, time: '2026-09-29 21:15:04' },
      ],
      canceled: [{ id: 'c1', sym: 'ETH', side: 'buy', type: 'Limit', price: 3150, amt: 0.25, time: '2026-10-04 11:20:45' }],
      positions: [{ id: 'p1', sym: 'BTC', side: 'long', lev: 10, size: 0.03, entry: 64610.5, mode: 'Cross' }],
      earn: [
        { id: 'e1', coin: 'USDT', name: 'USDT Flexible', term: 'Redeem anytime · paid daily', apr: '5.10%', amt: 800, k2: 'Yesterday', v2: '+0.11 USDT' },
        { id: 'e2', coin: 'SOL', name: 'SOL Locked', term: '60 days · ends 2026-11-21', apr: '7.40%', amt: 2.63, k2: 'Est. reward at end', v2: '0.0320 SOL' },
      ],
      alerts: [
        { id: 'a1', sym: 'BTC', cond: 'above', price: 70000, on: true },
        { id: 'a2', sym: 'ETH', cond: 'below', price: 3100, on: true },
        { id: 'a3', sym: 'SOL', cond: 'above', price: 160, on: false },
      ],
      recent: ['SOL', 'P2P', 'DOGE', 'Convert'],
      notifRead: false,
      set: (p) => set(p),
      credit: (asset, delta) => set((s) => ({ bal: { ...s.bal, [asset]: (s.bal[asset] ?? 0) + delta } })),
      cancelOrder: (id, time) =>
        set((s) => {
          const o = s.orders.find((x) => x.id === id);
          if (!o) return {};
          return { orders: s.orders.filter((x) => x.id !== id), canceled: [{ ...o, time }, ...s.canceled] };
        }),
      addRecent: (x) => set((s) => ({ recent: [x, ...s.recent.filter((y) => y !== x)].slice(0, 8) })),
      move: (from, to, amt) =>
        set((s) => {
          const next: Partial<WalletState> = { bal: { ...s.bal }, fundUsdt: s.fundUsdt, futUsdt: s.futUsdt };
          const apply = (acc: Account, d: number) => {
            if (acc === 'spot') next.bal = { ...next.bal!, USDT: (next.bal!.USDT ?? 0) + d };
            else if (acc === 'funding') next.fundUsdt = next.fundUsdt! + d;
            else next.futUsdt = next.futUsdt! + d;
          };
          apply(from, -amt);
          apply(to, amt);
          return next;
        }),
    }),
    {
      name: 'orbitx.wallet',
      storage: persistStorage,
      partialize: ({ set: _a, credit: _b, cancelOrder: _c, addRecent: _d, move: _e, ...rest }) => rest,
    },
  ),
);
