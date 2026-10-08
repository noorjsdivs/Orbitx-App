import { useState } from 'react';
import { View } from 'react-native';
import Animated, { LayoutAnimationConfig } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { fadeIn, fadeOut, rowEnter, rowExit, rowLayout } from '@/components/motion/presets';
import { Button } from '@/components/ui/button';
import { Chip, ChipRow, Toggle } from '@/components/ui/controls';
import { Card } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { NOTIFICATIONS, type NotificationType } from '@/data/fixtures';
import { COINS } from '@/data/market';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';
import { tint } from '@/theme/color';

type NTab = 'All' | NotificationType;

export default function Notifications() {
  const c = useColors();
  const prices = useMarket((s) => s.prices);
  const pair = useDrafts((s) => s.spot.pair);
  const { alerts, notifRead, set } = useWallet();
  const [tab, setTab] = useState<NTab>('All');
  const typeColor: Record<NotificationType, string> = { Trades: c.up, 'Price alerts': c.ac, Security: c.warn, News: c.t2 };
  const items = NOTIFICATIONS.filter((n) => tab === 'All' || n.ty === tab);
  const px = (k: string, p: number) => fmt(p, COINS[k].dp);

  return (
    <Screen
      gap={14}
      top={
        <Header
          title="Notifications"
          right={
            <Press
              scale={0.96}
              onPress={() => {
                set({ notifRead: true });
                haptic.tap();
                toast('All notifications marked as read');
              }}
              style={{ height: 36, paddingHorizontal: 10, marginRight: 6, borderRadius: 8, borderWidth: 1, borderColor: c.s4, justifyContent: 'center' }}>
              <Txt size={12} weight={500}>
                Mark all read
              </Txt>
            </Press>
          }
        />
      }>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <ChipRow>
          {(['All', 'Price alerts', 'Trades', 'Security', 'News'] as NTab[]).map((t) => (
            <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} />
          ))}
        </ChipRow>
      </Appear>
      <LayoutAnimationConfig skipEntering>
        {tab !== 'Price alerts' &&
          items.map((n, i) => {
            const col = typeColor[n.ty];
            const unread = !notifRead && NOTIFICATIONS.indexOf(n) < 3;
            return (
              <Animated.View key={n.t} entering={fadeIn} exiting={fadeOut} layout={rowLayout}>
                <Appear i={i + 1} style={{ marginHorizontal: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tint(col, 14), alignItems: 'center', justifyContent: 'center' }}>
                      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col }} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        <Txt size={14} weight={600} style={{ flexShrink: 1 }}>
                          {n.t}
                        </Txt>
                        <Txt size={11} color={c.t3}>
                          {n.time}
                        </Txt>
                      </View>
                      <Txt size={13} lh={1.45} color={c.t2}>
                        {n.b}
                      </Txt>
                      <Txt mono size={10} ls={0.06} color={c.t3}>
                        {n.ty}
                      </Txt>
                    </View>
                    {unread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.ac, marginTop: 4 }} />}
                  </View>
                </Appear>
              </Animated.View>
            );
          })}
      </LayoutAnimationConfig>
      {tab === 'Price alerts' && (
        <>
          <LayoutAnimationConfig skipEntering>
            {alerts.map((a) => (
              <Animated.View key={a.id} entering={rowEnter} exiting={rowExit} layout={rowLayout}>
                <Appear i={1} style={{ marginHorizontal: 16 }}>
                  <Press
                    scale={0.98}
                    accessibilityRole="switch"
                    accessibilityState={{ checked: a.on }}
                    onPress={() => {
                      haptic.tap();
                      set((s) => ({ alerts: s.alerts.map((y) => (y.id === a.id ? { ...y, on: !y.on } : y)) }));
                    }}>
                    <Card style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Txt size={15} weight={600}>
                          {a.sym}/USDT {a.cond === 'above' ? 'above' : 'below'} {px(a.sym, a.price)}
                        </Txt>
                        <Txt size={12} color={c.t3}>
                          Now {px(a.sym, prices[a.sym].p)} · push and email
                        </Txt>
                      </View>
                      <Toggle on={a.on} small />
                    </Card>
                  </Press>
                </Appear>
              </Animated.View>
            ))}
          </LayoutAnimationConfig>
          <Appear i={2} style={{ marginHorizontal: 16 }}>
            <Animated.View layout={rowLayout}>
              <Button
                variant="secondary"
                label={`New alert · ${pair} +5%`}
                onPress={() => {
                  const p = prices[pair].p * 1.05;
                  set((s) => ({ alerts: [{ id: uid(), sym: pair, cond: 'above', price: p, on: true }, ...s.alerts] }));
                  haptic.success();
                  toast(`Alert set · ${pair} above ${px(pair, p)}`);
                }}
              />
            </Animated.View>
          </Appear>
        </>
      )}
    </Screen>
  );
}
