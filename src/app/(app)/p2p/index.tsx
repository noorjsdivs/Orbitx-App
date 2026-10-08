import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Chip, ChipRow, Seg } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { Card, Footnote } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { flagUrl, MERCHANTS, P2P_PAY_METHODS } from '@/data/fixtures';
import { startP2P } from '@/features/p2p';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';

export default function P2P() {
  const c = useColors();
  const router = useRouter();
  const p2p = useDrafts((s) => s.p2p);
  const patch = useDrafts((s) => s.patch);
  const buy = p2p.side === 'buy';
  const list = MERCHANTS.filter((m) => p2p.pay === 'All' || m.pays.includes(p2p.pay));

  return (
    <Screen gap={14} top={<Header title="P2P" right={<IconButton name="history" label="P2P orders" onPress={() => router.push('/orders')} />} />}>
      <Appear i={0} style={{ marginHorizontal: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Seg
            options={[
              { value: 'buy', label: 'Buy', activeBg: c.up },
              { value: 'sell', label: 'Sell', activeBg: c.dn },
            ]}
            value={p2p.side}
            onChange={(v) => patch('p2p', { side: v })}
          />
        </View>
        <View style={{ height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: c.s4, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={{ uri: flagUrl('NG') }} style={{ width: 20, height: 14, borderRadius: 2 }} contentFit="cover" />
          <Txt size={14} weight={500}>
            USDT · NGN
          </Txt>
        </View>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <ChipRow>
          {P2P_PAY_METHODS.map((p) => (
            <Chip key={p} label={p} selected={p2p.pay === p} onPress={() => patch('p2p', { pay: p })} />
          ))}
        </ChipRow>
      </Appear>
      {list.length === 0 && (
        <Appear i={2} style={{ marginHorizontal: 16 }}>
          <View style={{ paddingVertical: 28, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s4 }}>
            <Txt size={13} color={c.t2} align="center">
              No merchants for this payment method right now.
            </Txt>
          </View>
        </Appear>
      )}
      {list.map((m) => (
        <Appear key={m.id} i={2} style={{ marginHorizontal: 16 }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.s2, borderWidth: 1, borderColor: c.s3, alignItems: 'center', justifyContent: 'center' }}>
                <Txt size={14} weight={700} color={c.acT}>
                  {m.n[0]}
                </Txt>
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt size={15} weight={600}>
                    {m.n}
                  </Txt>
                  <Icon name="check" size={13} sw={3} color={c.acT} />
                </View>
                <Txt size={12} color={c.t3}>
                  {fmt(m.o, 0)} orders · {m.r}% completion
                </Txt>
              </View>
              <Txt mono size={11} color={c.t3}>
                {m.t}
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
              <View style={{ gap: 4, minWidth: 0, flexShrink: 1 }}>
                <Txt size={22} weight={600} ls={-0.02}>
                  ₦{fmt(buy ? m.p : m.p - 6.4, 2)}
                </Txt>
                <Txt size={12} color={c.t3}>
                  Limit ₦{fmt(m.min, 0)} – ₦{fmt(m.max, 0)}
                </Txt>
                <Txt size={12} color={c.t3}>
                  Available {fmt(m.av, 2)} USDT
                </Txt>
              </View>
              <Button
                variant={buy ? 'buy' : 'sell'}
                h={40}
                size={14}
                label={buy ? 'Buy' : 'Sell'}
                style={{ paddingHorizontal: 22 }}
                onPress={() => {
                  startP2P(m);
                  router.push('/p2p/order');
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {m.pays.map((p) => (
                <View key={p} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: c.line }}>
                  <Txt size={11} color={c.t2}>
                    {p}
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        </Appear>
      ))}
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Footnote>USDT is held in escrow until the seller confirms payment. Never pay or chat outside the order.</Footnote>
      </Appear>
    </Screen>
  );
}
