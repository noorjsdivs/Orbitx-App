import { create } from 'zustand';

import type { EarnProduct } from '@/data/fixtures';
import { COINS } from '@/data/market';

import type { Account, Side } from './wallet';

export type OrderType = 'limit' | 'market' | 'stop';
export type ChatMsg = { me: boolean; t: string; time: string };

/**
 * In-progress form state that is shared between a screen and the sheet that confirms it
 * (e.g. Spot ticket → confirm sheet). Not persisted.
 */
type DraftState = {
  spot: { pair: string; side: Side; otype: OrderType; priceIn: string; stopIn: string; amtIn: string; pct: number };
  lite: { side: Side; amt: string; quoteUntil: number; step: 'review' | 'done'; doneMsg: string };
  convert: { from: string; to: string; amt: string; quoteUntil: number; rot: boolean };
  withdraw: { addr: string; net: string; amt: string; code: string };
  earn: { tab: 'flex' | 'locked'; sel: EarnProduct | null; amt: string };
  transfer: { from: Account; to: Account; amt: string; rot: boolean };
  p2p: { side: Side; pay: string; merchantId: number; stage: 0 | 1 | 2; endAt: number; chat: ChatMsg[] };
  assetsTab: 'overview' | 'spot' | 'funding' | 'futures' | 'earn';
  patch: <K extends Exclude<keyof DraftState, 'patch' | 'selectPair' | 'setAssetsTab'>>(k: K, p: Partial<DraftState[K]>) => void;
  selectPair: (sym: string, price: number) => void;
  setAssetsTab: (t: DraftState['assetsTab']) => void;
};

export const useDrafts = create<DraftState>()((set) => ({
  spot: { pair: 'BTC', side: 'buy', otype: 'limit', priceIn: COINS.BTC.p.toFixed(2), stopIn: '', amtIn: '', pct: 0 },
  lite: { side: 'buy', amt: '', quoteUntil: 0, step: 'review', doneMsg: '' },
  convert: { from: 'USDT', to: 'BTC', amt: '', quoteUntil: 0, rot: false },
  withdraw: { addr: '', net: 'TRC-20', amt: '', code: '' },
  earn: { tab: 'flex', sel: null, amt: '' },
  transfer: { from: 'spot', to: 'funding', amt: '', rot: false },
  p2p: { side: 'buy', pay: 'All', merchantId: 1, stage: 0, endAt: 0, chat: [] },
  assetsTab: 'overview',
  patch: (k, p) => set((s) => ({ [k]: { ...(s[k] as object), ...p } }) as Partial<DraftState>),
  selectPair: (sym, price) => set((s) => ({ spot: { ...s.spot, pair: sym, priceIn: price.toFixed(COINS[sym].dp), stopIn: '', amtIn: '', pct: 0 } })),
  setAssetsTab: (assetsTab) => set({ assetsTab }),
}));
