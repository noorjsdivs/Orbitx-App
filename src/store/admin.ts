import { create } from 'zustand';

import {
  AUDIT_LOG,
  KYC_QUEUE,
  MARKET_STATUS,
  PAYOUT_QUEUE,
  type AuditEntry,
  type KycApp,
  type MarketStatus,
  type Payout,
} from '@/data/fixtures';
import { hms } from '@/lib/format';

export type AdminRange = '24h' | '7d' | '30d';
export type KycFilter = 'pending' | 'flagged' | 'approved';

type AdminState = {
  range: AdminRange;
  kycQueue: KycApp[];
  kycDone: KycApp[];
  kycFilter: KycFilter;
  payouts: Payout[];
  markets: Record<string, MarketStatus>;
  audit: AuditEntry[];
  /** Rows animating out after a decision */
  leaving: Record<string, true>;
  set: (p: Partial<AdminState>) => void;
  log: (act: string) => void;
  resolveKyc: (id: string, approved: boolean, reason?: string) => KycApp | undefined;
  resolvePayout: (id: string, approved: boolean) => Payout | undefined;
  setMarket: (sym: string, st: MarketStatus) => void;
};

export const useAdmin = create<AdminState>()((set, get) => ({
  range: '24h',
  kycQueue: KYC_QUEUE,
  kycDone: [],
  kycFilter: 'pending',
  payouts: PAYOUT_QUEUE,
  markets: MARKET_STATUS,
  audit: AUDIT_LOG,
  leaving: {},
  set: (p) => set(p),
  log: (act) => set((s) => ({ audit: [{ t: hms(), who: 'you · admin@orbitx.io', act, me: true }, ...s.audit] })),
  resolveKyc: (id, approved, reason) => {
    const x = get().kycQueue.find((y) => y.id === id);
    if (!x) return undefined;
    set((s) => ({ leaving: { ...s.leaving, [id]: true } }));
    setTimeout(
      () =>
        set((s) => ({
          kycQueue: s.kycQueue.filter((y) => y.id !== id),
          kycDone: approved ? [{ ...x, ago: 'now' }, ...s.kycDone] : s.kycDone,
        })),
      420,
    );
    get().log((approved ? 'Approved KYC ' : 'Rejected KYC ') + id + ' · ' + x.name + (approved ? ' · Level 2' : ' · ' + (reason ?? '')));
    return x;
  },
  resolvePayout: (id, approved) => {
    const x = get().payouts.find((y) => y.id === id);
    if (!x) return undefined;
    set((s) => ({ leaving: { ...s.leaving, [id]: true } }));
    setTimeout(() => set((s) => ({ payouts: s.payouts.filter((y) => y.id !== id) })), 420);
    return x;
  },
  setMarket: (sym, st) => set((s) => ({ markets: { ...s.markets, [sym]: st } })),
}));
