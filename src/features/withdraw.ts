import { NETWORKS } from '@/data/fixtures';
import { num } from '@/lib/format';
import type { useDrafts } from '@/store/drafts';

type WithdrawDraft = ReturnType<typeof useDrafts.getState>['withdraw'];

export function computeWithdraw(w: WithdrawDraft, usdt: number, tfaOn: boolean) {
  const net = NETWORKS.find((n) => n.id === w.net) ?? NETWORKS[0];
  const fee = parseFloat(net.fee);
  const amt = num(w.amt);
  let err = '';
  if (w.addr && w.addr.length < 26) err = `That address looks too short for ${net.id}.`;
  else if (amt > usdt + 1e-9) err = 'Amount exceeds your available balance.';
  else if (amt > 0 && amt < 10) err = 'Minimum withdrawal is 10 USDT.';
  else if (amt > 0 && !tfaOn) err = 'Turn on 2FA in Profile to withdraw.';
  const ok = amt >= 10 && w.addr.length >= 26 && !err;
  return { net, fee, amt, receive: Math.max(0, amt - fee), err, ok };
}
