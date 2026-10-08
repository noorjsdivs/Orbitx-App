import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { RowsPanel } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { computeLite, confirmLite, lockLiteQuote } from '@/features/lite';
import { useSecondsLeft } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useTabNav } from '@/lib/nav';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { useWallet } from '@/store/wallet';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);

export default function LiteSheet() {
  const c = useColors();
  const router = useRouter();
  const goTab = useTabNav();
  const sym = useDrafts((s) => s.spot.pair);
  const lite = useDrafts((s) => s.lite);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const left = useSecondsLeft(lite.quoteUntil);
  const [popped, setPopped] = useState(false);
  const t = computeLite(lite, sym, prices, bal);
  const done = lite.step === 'done';

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setPopped(true), 40);
    return () => clearTimeout(id);
  }, [done]);

  if (done) {
    return (
      <SheetBody closable={false}>
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
          <Animated.View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: c.up,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: popped ? 1 : 0.4 }],
              transitionProperty: 'transform',
              transitionDuration: 600,
              transitionTimingFunction: pop,
            }}>
            <Icon name="check" size={34} sw={3} color="#FFFFFF" />
          </Animated.View>
          <Txt size={22} weight={600}>
            Order filled
          </Txt>
          <Txt size={14} color={c.t2} align="center">
            {lite.doneMsg}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label="View assets"
                onPress={() => {
                  router.back();
                  goTab('assets');
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Done" onPress={() => router.back()} />
            </View>
          </View>
        </View>
      </SheetBody>
    );
  }

  const expired = left === 0;
  return (
    <SheetBody
      title="Review order"
      closable={false}
      right={
        <View style={{ paddingVertical: 4, paddingHorizontal: 8, marginRight: 12, borderRadius: 999, borderWidth: 1, borderColor: expired ? c.warn : c.s4 }}>
          <Txt mono size={12} color={expired ? c.warn : c.t2}>
            {expired ? 'Expired' : `Quote ${left}s`}
          </Txt>
        </View>
      }>
      <RowsPanel
        rows={[
          { k: 'You pay', v: t.lb ? `${fmt(t.la, 2)} USDT` : `${fmt(t.la, t.ad)} ${sym}` },
          { k: 'You receive ≈', v: `${fmt(t.get, t.lb ? t.ad : 2)} ${t.lb ? sym : 'USDT'}` },
          { k: 'Price', v: `${fmt(t.o.p, COINS[sym].dp)} USDT` },
          { k: 'Fee (0.10%)', v: `${fmt(t.fee, 2)} USDT` },
          { k: 'Order type', v: 'Market · max slippage 0.5%' },
        ]}
      />
      <Txt size={12} lh={1.5} color={c.t2}>
        Market orders fill at the best available price. If the price moves more than 0.5% before filling, the order is canceled.
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" label="Cancel" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 2 }}>
          <Button
            variant={t.lb ? 'buy' : 'sell'}
            bg={expired ? c.s4 : undefined}
            label={expired ? 'Refresh quote' : `Confirm ${t.lb ? 'buy' : 'sell'}`}
            onPress={() => (expired ? lockLiteQuote() : confirmLite(sym))}
          />
        </View>
      </View>
    </SheetBody>
  );
}
