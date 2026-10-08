import { useRouter } from 'expo-router';
import { TextInput, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card, CoinGlyph, Footnote, Notice } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { computeConvert, convertDp, lockConvertQuote, rateFmt } from '@/features/convert';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { decimalInput, fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { useWallet } from '@/store/wallet';
import { motion } from '@/theme/tokens';
import { fontFamily } from '@/theme/fonts';

const pop = cubicBezier(...motion.pop);

function CoinPicker({ sym, onPress }: { sym: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Press
      onPress={onPress}
      pressedStyle={{ backgroundColor: c.s2 }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingLeft: 6, paddingRight: 10, borderRadius: 999, borderWidth: 1, borderColor: c.s4 }}>
      <CoinGlyph sym={sym} size={30} />
      <Txt size={15} weight={600}>
        {sym}
      </Txt>
      <Icon name="chevronDown" size={16} sw={2} color={c.t3} />
    </Press>
  );
}

export default function Convert() {
  const c = useColors();
  const router = useRouter();
  const cv = useDrafts((s) => s.convert);
  const patch = useDrafts((s) => s.patch);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const t = computeConvert(cv, prices, bal);

  return (
    <Screen gap={14} top={<Header title="Convert" right={<IconButton name="history" label="History" onPress={() => router.push('/orders')} />} />}>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <Card gap={10}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={13} color={c.t3}>
              From
            </Txt>
            <Txt size={13} color={c.t3}>
              Avbl {fmt(t.avbl, convertDp(cv.from))} {cv.from}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CoinPicker sym={cv.from} onPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'cvFrom' } })} />
            <TextInput
              value={cv.amt}
              onChangeText={(v) => patch('convert', { amt: decimalInput(v) })}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={c.placeholder}
              selectionColor={c.ac}
              style={{ flex: 1, minWidth: 0, textAlign: 'right', padding: 0, color: c.t1, fontSize: 28, fontFamily: fontFamily(600) }}
            />
          </View>
          <Press
            scale={0.95}
            onPress={() => patch('convert', { amt: String(+t.avbl.toFixed(convertDp(cv.from))) })}
            style={{ alignSelf: 'flex-end', height: 28, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.s2, justifyContent: 'center' }}>
            <Txt size={12} weight={600}>
              MAX
            </Txt>
          </Press>
        </Card>
        <Press
          accessibilityLabel="Swap"
          scale={0.92}
          onPress={() => {
            haptic.tap();
            patch('convert', { from: cv.to, to: cv.from, amt: '', rot: !cv.rot });
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
          <Animated.View style={{ transform: [{ rotate: cv.rot ? '180deg' : '0deg' }], transitionProperty: 'transform', transitionDuration: 450, transitionTimingFunction: pop }}>
            <Icon name="swap" size={18} sw={2.2} />
          </Animated.View>
        </Press>
        <Card gap={10}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={13} color={c.t3}>
              To
            </Txt>
            <Txt size={13} color={c.t3}>
              Estimated
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <CoinPicker sym={cv.to} onPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'cvTo' } })} />
            <Txt size={28} weight={600} color={c.t2} align="right" numberOfLines={1} style={{ flex: 1, minWidth: 0 }}>
              {t.ca > 0 ? fmt(t.get, convertDp(cv.to)) : '0.00'}
            </Txt>
          </View>
        </Card>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.t3}>
            Rate
          </Txt>
          <Txt size={13}>
            1 {cv.from} ≈ {rateFmt(t.rate)} {cv.to}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.t3}>
            Trading fee
          </Txt>
          <Txt size={13} color={c.up}>
            0 · spread included
          </Txt>
        </View>
      </Appear>
      <Appear i={2} style={{ marginHorizontal: 16, gap: 10 }}>
        {!!t.err && <Notice>{t.err}</Notice>}
        <Button
          label="Preview conversion"
          dim={!t.ok}
          onPress={() => {
            if (!t.ok) return haptic.warn();
            lockConvertQuote();
            router.push('/sheets/convert-confirm');
          }}
        />
        <Footnote>Quotes lock for 8 seconds after preview.</Footnote>
      </Appear>
    </Screen>
  );
}
