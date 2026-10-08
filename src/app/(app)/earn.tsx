import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { useTween } from '@/components/motion/animated-number';
import { rowEnter, rowLayout } from '@/components/motion/presets';
import { Button } from '@/components/ui/button';
import { Seg } from '@/components/ui/controls';
import { Card, CoinGlyph, Footnote } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { EARN_PRODUCTS } from '@/data/fixtures';
import { usePortfolio } from '@/features/portfolio';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';

export default function Earn() {
  const c = useColors();
  const router = useRouter();
  const tab = useDrafts((s) => s.earn.tab);
  const patch = useDrafts((s) => s.patch);
  const { earnTotal, earn } = usePortfolio();
  const total = useTween(earnTotal, { from: 0, duration: 900 });

  return (
    <Screen gap={14} top={<Header title="Earn" right={<IconButton name="history" label="Earn history" onPress={() => router.push('/orders')} />} />}>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <Card>
          <Txt size={13} color={c.t2}>
            Est. Earn holdings
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Txt size={30} weight={600} ls={-0.03}>
              {fmt(total, 2)}
            </Txt>
            <Txt size={14} color={c.t2}>
              USDT
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <Txt size={12} color={c.t3}>
              Yesterday{' '}
              <Txt size={12} weight={600} color={c.up}>
                +0.19 USDT
              </Txt>
            </Txt>
            <Txt size={12} color={c.t3}>
              Cumulative{' '}
              <Txt size={12} weight={600} color={c.up}>
                +38.42 USDT
              </Txt>
            </Txt>
          </View>
        </Card>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <Seg
          options={[
            { value: 'flex', label: 'Flexible' },
            { value: 'locked', label: 'Locked' },
          ]}
          value={tab}
          onChange={(v) => patch('earn', { tab: v })}
        />
      </Appear>
      {EARN_PRODUCTS[tab].map((p) => (
        <Appear key={p[1]} i={2} style={{ marginHorizontal: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 12,
              paddingRight: 12,
              paddingLeft: 14,
              borderRadius: 12,
              backgroundColor: c.s1,
              borderWidth: 1,
              borderColor: c.line,
            }}>
            <CoinGlyph sym={p[0]} size={36} />
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <Txt size={15} weight={600}>
                {p[1]}
              </Txt>
              <Txt size={12} color={c.t3}>
                {p[3]}
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2, marginRight: 4 }}>
              <Txt size={16} weight={700} color={c.up}>
                {p[2]}
              </Txt>
              <Txt size={11} color={c.t3}>
                Est. APR
              </Txt>
            </View>
            <Button
              h={36}
              size={13}
              label="Subscribe"
              style={{ paddingHorizontal: 12, borderRadius: 8 }}
              onPress={() => {
                patch('earn', { sel: p, amt: '' });
                router.push('/sheets/earn-subscribe');
              }}
            />
          </View>
        </Appear>
      ))}
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Txt size={17} weight={600}>
          My positions
        </Txt>
      </Appear>
      <LayoutAnimationConfig skipEntering>
        {earn.map((e) => (
          <Animated.View key={e.id} entering={rowEnter} layout={rowLayout}>
            <Appear i={3} style={{ marginHorizontal: 16 }}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <CoinGlyph sym={e.coin} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={15} weight={600}>
                      {e.name}
                    </Txt>
                    <Txt size={12} color={c.t3}>
                      {e.term}
                    </Txt>
                  </View>
                  <Txt size={15} weight={600} color={c.up}>
                    {e.apr}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt size={12} color={c.t3}>
                    Holding <Txt size={12}>{`${fmt(e.amt, e.coin === 'USDT' ? 2 : 4)} ${e.coin}`}</Txt>
                  </Txt>
                  <Txt size={12} color={c.t3}>
                    {e.k2} <Txt size={12}>{e.v2}</Txt>
                  </Txt>
                </View>
              </Card>
            </Appear>
          </Animated.View>
        ))}
      </LayoutAnimationConfig>
      <Appear i={4} style={{ marginHorizontal: 16 }}>
        <Footnote>{"APR is an estimate, not a guaranteed return, and can change daily. Locked products can't be redeemed early without forfeiting rewards."}</Footnote>
      </Appear>
    </Screen>
  );
}
