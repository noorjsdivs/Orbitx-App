import { useRouter } from 'expo-router';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Notice, RowsPanel } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { haptic } from '@/hooks/use-haptics';
import { useNow } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { decimalInput, fmt, num } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';

export default function EarnSubscribe() {
  const c = useColors();
  const router = useRouter();
  const earn = useDrafts((s) => s.earn);
  const patch = useDrafts((s) => s.patch);
  const bal = useWallet((s) => s.bal);
  const setWallet = useWallet((s) => s.set);
  const now = useNow(60000);
  const sel = earn.sel;
  if (!sel) return null;
  const [coin, name, apr, term, days] = sel;
  const ea = num(earn.amt);
  const avbl = bal[coin] ?? 0;
  const dp = coin === 'USDT' ? 2 : 4;
  const err = ea > avbl + 1e-12 ? `Insufficient ${coin} balance.` : '';
  const ok = ea > 0 && !err;

  return (
    <SheetBody title={`Subscribe · ${name}`} closable={false}>
      <FieldLabel
        right={
          <Txt size={13} color={c.t3}>
            Avbl {fmt(avbl, dp)} {coin}
          </Txt>
        }>
        Amount
      </FieldLabel>
      <Field
        value={earn.amt}
        onChangeText={(v) => patch('earn', { amt: decimalInput(v) })}
        placeholder="0.00"
        keyboardType="decimal-pad"
        action={{ label: 'MAX', onPress: () => patch('earn', { amt: String(+avbl.toFixed(dp)) }) }}
      />
      <RowsPanel
        rows={[
          { k: 'Est. APR', v: apr, c: c.up },
          { k: 'Est. daily reward', v: `${fmt((ea * parseFloat(apr)) / 36500, 6)} ${coin}` },
          { k: 'Redemption', v: days ? `Locked until ${new Date(now + days * 864e5).toISOString().slice(0, 10)}` : 'Anytime · credited in ~1 min' },
          { k: 'Rewards start', v: 'Tomorrow 08:00 UTC' },
        ]}
      />
      {!!err && <Notice>{err}</Notice>}
      <Button
        label="Confirm subscription"
        dim={!ok}
        onPress={() => {
          if (!ok) return haptic.warn();
          setWallet((s) => ({
            bal: { ...s.bal, [coin]: (s.bal[coin] ?? 0) - ea },
            earn: [...s.earn, { id: uid(), coin, name, term, apr, amt: ea, k2: 'Started', v2: 'Today' }],
          }));
          patch('earn', { amt: '' });
          haptic.success();
          router.back();
          toast(`Subscribed ${fmt(ea, dp)} ${coin} to ${name}`);
        }}
      />
    </SheetBody>
  );
}
