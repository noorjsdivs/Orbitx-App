import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { rowExit, rowLayout } from '@/components/motion/presets';
import { Button } from '@/components/ui/button';
import { Chip, ChipRow, UnderlineTabs } from '@/components/ui/controls';
import { Card } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { amountDp, fmt, hms } from '@/lib/format';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';
import { useWallet, type Order } from '@/store/wallet';
import { tint } from '@/theme/color';

type OTab = 'open' | 'filled' | 'canceled';
type SideF = 'all' | 'buy' | 'sell';

export default function Orders() {
  const c = useColors();
  const prices = useMarket((s) => s.prices);
  const { orders, fills, canceled, cancelOrder } = useWallet();
  const [tab, setTab] = useState<OTab>('open');
  const [side, setSide] = useState<SideF>('all');
  const sf = (x: Order) => side === 'all' || x.side === side;
  const src = (tab === 'open' ? orders : tab === 'filled' ? fills : canceled).filter(sf);

  return (
    <Screen gap={14} top={<Header title="Orders" />}>
      <UnderlineTabs<OTab>
        tabs={[
          { value: 'open', label: `Open (${orders.length})` },
          { value: 'filled', label: 'Filled' },
          { value: 'canceled', label: 'Canceled' },
        ]}
        value={tab}
        onChange={setTab}
      />
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <ChipRow>
          {(
            [
              ['all', 'All'],
              ['buy', 'Buy'],
              ['sell', 'Sell'],
            ] as [SideF, string][]
          ).map(([k, l]) => (
            <Chip key={k} label={l} selected={side === k} onPress={() => setSide(k)} />
          ))}
        </ChipRow>
      </Appear>
      {src.length === 0 && (
        <Appear i={1} style={{ marginHorizontal: 16 }}>
          <View style={{ paddingVertical: 28, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s4 }}>
            <Txt size={13} color={c.t2} align="center">
              No {tab} orders yet.
            </Txt>
          </View>
        </Appear>
      )}
      {src.map((x) => {
        const sc = x.side === 'buy' ? c.up : c.dn;
        const status = tab === 'open' ? 'Open · 0%' : tab === 'filled' ? 'Filled' : 'Canceled';
        const stC = tab === 'open' ? c.t1 : tab === 'filled' ? c.up : c.t3;
        return (
          <Animated.View key={`${tab}-${x.id}`} exiting={rowExit} layout={rowLayout}>
            <Appear i={1} style={{ marginHorizontal: 16 }}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Txt size={15} weight={600}>
                    {x.sym}/USDT
                  </Txt>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: tint(sc, 14) }}>
                    <Txt size={11} weight={600} color={sc}>
                      {x.type} / {x.side === 'buy' ? 'Buy' : 'Sell'}
                    </Txt>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Txt mono size={11} color={c.t3}>
                    {x.time}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  {[
                    ['Amount', `${fmt(x.amt, amountDp(prices[x.sym]?.p ?? 1))} ${x.sym}`, c.t1],
                    ['Price', fmt(x.price, COINS[x.sym]?.dp ?? 2), c.t1],
                    ['Status', status, stC],
                  ].map(([k, v, col], i) => (
                    <View key={k} style={{ flex: 1, gap: 2, alignItems: i === 2 ? 'flex-end' : 'flex-start' }}>
                      <Txt size={12} color={c.t3}>
                        {k}
                      </Txt>
                      <Txt size={12} color={col}>
                        {v}
                      </Txt>
                    </View>
                  ))}
                </View>
                {tab === 'open' && (
                  <Button
                    variant="secondary"
                    h={38}
                    size={13}
                    label="Cancel order"
                    onPress={() => {
                      cancelOrder(x.id, hms());
                      haptic.impact();
                      toast(`Order canceled · ${x.sym}/USDT`);
                    }}
                  />
                )}
              </Card>
            </Appear>
          </Animated.View>
        );
      })}
    </Screen>
  );
}
