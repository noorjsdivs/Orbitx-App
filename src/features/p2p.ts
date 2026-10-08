import { MERCHANTS, type Merchant } from '@/data/fixtures';
import { haptic } from '@/hooks/use-haptics';
import { fmt, hms } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { toast } from '@/store/toast';
import { useWallet } from '@/store/wallet';

export const P2P_FIAT_AMOUNT = 150000;

export function merchantById(id: number): Merchant {
  return MERCHANTS.find((m) => m.id === id) ?? MERCHANTS[0];
}

/** Open a new order with a merchant: 15-minute payment window and an opening chat message. */
export function startP2P(m: Merchant) {
  useDrafts.getState().patch('p2p', {
    merchantId: m.id,
    stage: 0,
    endAt: Date.now() + 15 * 60000,
    chat: [{ me: false, t: 'Hi Christina, send exactly ₦150,000.00 to the account below, then tap "I have paid". Please leave the transfer note empty.', time: hms() }],
  });
}

const addChat = (me: boolean, t: string) => {
  const { p2p, patch } = useDrafts.getState();
  patch('p2p', { chat: [...p2p.chat, { me, t, time: hms() }] });
};

export function sendChat(text: string) {
  const t = text.trim();
  if (!t) return;
  addChat(true, t);
  setTimeout(() => addChat(false, 'Noted, checking now.'), 1400);
}

/** Buyer marks payment sent → seller confirms → USDT released from escrow to Funding. */
export function markPaid() {
  const { patch } = useDrafts.getState();
  patch('p2p', { stage: 1 });
  addChat(true, 'Payment sent from my Kuda account.');
  setTimeout(() => {
    const m = merchantById(useDrafts.getState().p2p.merchantId);
    const usdt = P2P_FIAT_AMOUNT / m.p;
    useWallet.getState().set((s) => ({ fundUsdt: s.fundUsdt + usdt }));
    useDrafts.getState().patch('p2p', { stage: 2 });
    addChat(false, 'Received, releasing now. Thank you!');
    haptic.success();
    toast(`${fmt(usdt, 2)} USDT released to Funding`);
  }, 3500);
}
