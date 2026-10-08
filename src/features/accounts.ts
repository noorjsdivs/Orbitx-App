import type { Account } from '@/store/wallet';

import { usePortfolio } from './portfolio';

export const ACCOUNT_NAMES: Record<Account, string> = { spot: 'Spot', funding: 'Funding', futures: 'USDT-M Futures' };

/** Transferable USDT per internal account. */
export function useAccountBalances(): Record<Account, number> {
  const pf = usePortfolio();
  return { spot: pf.bal.USDT ?? 0, funding: pf.fundTotal, futures: pf.futAvail };
}
