import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Notice, RowsPanel } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { PAYOUT_QUEUE } from '@/data/fixtures';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useAdmin } from '@/store/admin';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';

export default function PayoutApprove() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const payouts = useAdmin((s) => s.payouts);
  const resolvePayout = useAdmin((s) => s.resolvePayout);
  const log = useAdmin((s) => s.log);
  const prices = useMarket((s) => s.prices);
  const x = payouts.find((y) => y.id === id) ?? payouts[0] ?? PAYOUT_QUEUE[0];
  const usd = x.amt * (prices[x.coin]?.p ?? 1);
  const dual = usd > 10000;
  const amt = `${fmt(x.amt, x.coin === 'USDT' ? 2 : 4)} ${x.coin}`;

  return (
    <SheetBody title="Approve withdrawal" closable={false}>
      <RowsPanel
        size={14}
        keyColor={c.t2}
        rows={[
          { k: 'Request', v: x.id, mono: true },
          { k: 'User UID', v: x.uid, mono: true },
          { k: 'Amount', v: amt },
          { k: 'Value', v: `≈ $${fmt(usd, 2)}` },
          { k: 'Network', v: x.net },
          { k: 'To', v: x.addr, mono: true },
          { k: 'Risk', v: `${x.risk} · ${x.flags.join(', ')}` },
        ]}
      />
      {dual && <Notice>Above 10,000 USDT. A second approver from Treasury must also sign before broadcast.</Notice>}
      <Txt size={12} lh={1.5} color={c.t2}>
        {"Approving signs with your hardware key and broadcasts on-chain. This can't be undone."}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" h={50} label="Cancel" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 2 }}>
          <Button
            h={50}
            label={dual ? 'Sign (1 of 2)' : 'Approve & broadcast'}
            onPress={() => {
              resolvePayout(x.id, true);
              log(`Approved ${x.id} · ${amt} · ${x.net}`);
              haptic.success();
              router.back();
              toast(`${x.id} signed · broadcasting on ${x.net}`);
            }}
          />
        </View>
      </View>
    </SheetBody>
  );
}
