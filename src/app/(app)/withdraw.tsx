import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Card, Footnote, Notice, Rows } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { NETWORKS } from '@/data/fixtures';
import { computeWithdraw } from '@/features/withdraw';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { decimalInput, fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { useWallet } from '@/store/wallet';
import { tint } from '@/theme/color';

export default function Withdraw() {
  const c = useColors();
  const router = useRouter();
  const w = useDrafts((s) => s.withdraw);
  const patch = useDrafts((s) => s.patch);
  const usdt = useWallet((s) => s.bal.USDT ?? 0);
  const tfaOn = useSession((s) => s.tfaOn);
  const t = computeWithdraw(w, usdt, tfaOn);

  const paste = async () => {
    const clip = (await Clipboard.getStringAsync()).trim();
    const sample = t.net.id === 'TRC-20' ? 'TJr8VbN2kQ5mX7cL1pW9sD4fG6hK3aZ0yE' : '0x4bF2a91C7e3D58b06A1c2E9f7D3B8a5C6e0F1d29';
    patch('withdraw', { addr: clip.length >= 26 ? clip : sample });
    haptic.tap();
  };

  return (
    <Screen gap={14} top={<Header title="Withdraw USDT" right={<IconButton name="history" label="Withdrawal history" onPress={() => router.push('/orders')} />} />}>
      <Appear i={0} style={{ marginHorizontal: 16, gap: 8 }}>
        <FieldLabel>Address</FieldLabel>
        <Field
          value={w.addr}
          onChangeText={(v) => patch('withdraw', { addr: v.trim() })}
          placeholder="Paste or scan address"
          autoCapitalize="none"
          autoCorrect={false}
          size={13}
          action={{ label: 'Paste', onPress: paste }}
        />
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16, gap: 8 }}>
        <FieldLabel>Network</FieldLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {NETWORKS.map((n) => {
            const sel = n.id === w.net;
            return (
              <Press
                key={n.id}
                scale={0.97}
                onPress={() => {
                  haptic.tap();
                  patch('withdraw', { net: n.id });
                }}
                style={{
                  width: '48.5%',
                  gap: 2,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: sel ? c.ac : c.s4,
                  backgroundColor: sel ? tint(c.ac, 8) : 'transparent',
                  boxShadow: sel ? `0 0 0 3px ${tint(c.ac, 18)}` : undefined,
                  transitionProperty: ['borderColor', 'backgroundColor'],
                  transitionDuration: 200,
                }}>
                <Txt size={14} weight={600}>
                  {n.id}
                </Txt>
                <Txt size={11} color={c.t3}>
                  Fee {n.fee}
                </Txt>
              </Press>
            );
          })}
        </View>
      </Appear>
      <Appear i={2} style={{ marginHorizontal: 16, gap: 8 }}>
        <FieldLabel right={<Txt size={13} color={c.t3}>Avbl {fmt(usdt, 2)} USDT</Txt>}>Amount</FieldLabel>
        <Field
          value={w.amt}
          onChangeText={(v) => patch('withdraw', { amt: decimalInput(v) })}
          placeholder="Minimum 10 USDT"
          keyboardType="decimal-pad"
          action={{ label: 'MAX', onPress: () => patch('withdraw', { amt: String(Math.floor(usdt * 100) / 100) }) }}
        />
      </Appear>
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Card>
          <Rows
            gap={12}
            rows={[
              { k: 'Network fee', v: t.net.fee },
              { k: 'You receive', v: `${fmt(t.receive, 2)} USDT` },
              { k: '24h limit remaining', v: '99,520.00 USDT' },
            ]}
          />
        </Card>
      </Appear>
      <Appear i={4} style={{ marginHorizontal: 16, gap: 10 }}>
        {!!t.err && <Notice>{t.err}</Notice>}
        <Button
          label="Withdraw"
          dim={!t.ok}
          onPress={() => {
            if (!t.ok) {
              haptic.warn();
              return toast(t.err || 'Enter an address and amount');
            }
            patch('withdraw', { code: '' });
            router.push('/sheets/withdraw-confirm');
          }}
        />
        <Footnote>{"Withdrawals sent on the wrong network can't be recovered."}</Footnote>
      </Appear>
    </Screen>
  );
}
