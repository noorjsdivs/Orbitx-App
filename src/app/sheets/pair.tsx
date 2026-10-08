import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS, PAIRS } from '@/data/market';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt, pct } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { fontFamily } from '@/theme/fonts';

export default function PairSheet() {
  const c = useColors();
  const router = useRouter();
  const prices = useMarket((s) => s.prices);
  const current = useDrafts((s) => s.spot.pair);
  const selectPair = useDrafts((s) => s.selectPair);
  const [q, setQ] = useState('');
  const qv = q.trim().toLowerCase();
  const list = PAIRS.filter((k) => !qv || k.toLowerCase().includes(qv) || COINS[k].n.toLowerCase().includes(qv));

  return (
    <SheetBody title="Spot pairs" scroll gap={0} px={0}>
      <View style={{ marginHorizontal: 16, marginBottom: 8, height: 44, borderRadius: 12, backgroundColor: c.s2, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Icon name="search" size={18} color={c.t3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search pair"
          placeholderTextColor={c.placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          style={{ flex: 1, height: 44, color: c.t1, fontSize: 15, fontFamily: fontFamily(400) }}
        />
      </View>
      {list.map((k) => {
        const p = prices[k];
        return (
          <Press
            key={k}
            scale={1}
            pressedStyle={{ backgroundColor: c.s2 }}
            onPress={() => {
              haptic.tap();
              selectPair(k, p.p);
              router.back();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, paddingHorizontal: 16, backgroundColor: k === current ? c.s2 : 'transparent' }}>
            <Txt size={15} weight={600} style={{ flex: 1 }}>
              {k}
              <Txt size={12} color={c.t3}>
                /USDT
              </Txt>
            </Txt>
            <Txt size={14}>{fmt(p.p, COINS[k].dp)}</Txt>
            <Txt size={13} weight={600} color={p.c >= 0 ? c.up : c.dn} align="right" style={{ width: 72 }}>
              {pct(p.c)}
            </Txt>
          </Press>
        );
      })}
      {list.length === 0 && (
        <Txt size={13} color={c.t2} align="center" style={{ paddingVertical: 32, paddingHorizontal: 16 }}>
          No pairs match &quot;{q}&quot;
        </Txt>
      )}
    </SheetBody>
  );
}
