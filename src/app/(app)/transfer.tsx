import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { CoinGlyph, Footnote, Notice } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { ACCOUNT_NAMES, useAccountBalances } from '@/features/accounts';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { decimalInput, fmt, num } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { toast } from '@/store/toast';
import { useWallet } from '@/store/wallet';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);

export default function Transfer() {
  const c = useColors();
  const router = useRouter();
  const tr = useDrafts((s) => s.transfer);
  const patch = useDrafts((s) => s.patch);
  const move = useWallet((s) => s.move);
  const balances = useAccountBalances();
  const avbl = balances[tr.from];
  const amt = num(tr.amt);
  const err = amt > avbl + 1e-9 ? `Amount exceeds available in ${ACCOUNT_NAMES[tr.from]}.` : '';
  const ok = amt > 0 && !err;

  const row = (label: string, value: string, kind: 'trFrom' | 'trTo') => (
    <Press
      onPress={() => router.push({ pathname: '/sheets/picker', params: { kind } })}
      scale={0.98}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, paddingHorizontal: 16, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
      <Txt size={13} color={c.t3} style={{ width: 44 }}>
        {label}
      </Txt>
      <Txt size={16} weight={600} style={{ flex: 1 }}>
        {value}
      </Txt>
      <Icon name="chevronDown" size={16} sw={2} color={c.t3} />
    </Press>
  );

  return (
    <Screen gap={14} top={<Header title="Transfer" />}>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        {row('From', ACCOUNT_NAMES[tr.from], 'trFrom')}
        <Press
          accessibilityLabel="Swap"
          scale={0.92}
          onPress={() => {
            haptic.tap();
            patch('transfer', { from: tr.to, to: tr.from, rot: !tr.rot, amt: '' });
          }}
          style={{
            alignSelf: 'center',
            width: 40,
            height: 40,
            marginVertical: -14,
            zIndex: 1,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: c.s4,
            backgroundColor: c.bg,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
          <Animated.View style={{ transform: [{ rotate: tr.rot ? '180deg' : '0deg' }], transitionProperty: 'transform', transitionDuration: 450, transitionTimingFunction: pop }}>
            <Icon name="swap" size={18} sw={2.2} />
          </Animated.View>
        </Press>
        {row('To', ACCOUNT_NAMES[tr.to], 'trTo')}
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
          <CoinGlyph sym="USDT" size={30} letter="U" />
          <Txt size={15} weight={600} style={{ flex: 1 }}>
            USDT{' '}
            <Txt size={13} color={c.t3}>
              TetherUS
            </Txt>
          </Txt>
        </View>
      </Appear>
      <Appear i={2} style={{ marginHorizontal: 16, gap: 8 }}>
        <FieldLabel
          right={
            <Txt size={13} color={c.t3}>
              Avbl {fmt(avbl, 2)} USDT
            </Txt>
          }>
          Amount
        </FieldLabel>
        <Field
          value={tr.amt}
          onChangeText={(v) => patch('transfer', { amt: decimalInput(v) })}
          placeholder="0.00"
          keyboardType="decimal-pad"
          action={{ label: 'MAX', onPress: () => patch('transfer', { amt: String(Math.floor(avbl * 100) / 100) }) }}
        />
      </Appear>
      <Appear i={3} style={{ marginHorizontal: 16, gap: 10 }}>
        {!!err && <Notice>{err}</Notice>}
        <Button
          label="Confirm transfer"
          dim={!ok}
          onPress={() => {
            if (!ok) return haptic.warn();
            move(tr.from, tr.to, amt);
            patch('transfer', { amt: '' });
            haptic.success();
            toast(`Transferred ${fmt(amt, 2)} USDT · ${ACCOUNT_NAMES[tr.from]} → ${ACCOUNT_NAMES[tr.to]}`);
          }}
        />
        <Footnote>Internal transfers are instant and free.</Footnote>
      </Appear>
    </Screen>
  );
}
