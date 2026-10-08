import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { RadioDot } from '@/components/ui/controls';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import type { MarketStatus } from '@/data/fixtures';
import { statusMeta } from '@/features/admin-ui';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useAdmin } from '@/store/admin';
import { toast } from '@/store/toast';

const OPTIONS: [MarketStatus, string, string][] = [
  ['trading', 'Trading', 'Normal order placement and matching'],
  ['cancel', 'Cancel-only', 'Users can cancel orders but not place new ones'],
  ['halted', 'Halted', 'Matching paused · resting orders are preserved'],
];

export default function MarketStatusSheet() {
  const c = useColors();
  const router = useRouter();
  const { sym = 'BTC' } = useLocalSearchParams<{ sym: string }>();
  const markets = useAdmin((s) => s.markets);
  const setMarket = useAdmin((s) => s.setMarket);
  const log = useAdmin((s) => s.log);
  const [pick, setPick] = useState<MarketStatus>(markets[sym] ?? 'trading');
  const [label] = statusMeta(c, pick);

  return (
    <SheetBody title={`Set status · ${sym}/USDT`} closable={false} gap={12}>
      {OPTIONS.map(([k, l, d]) => {
        const sel = pick === k;
        const [, col, bg] = statusMeta(c, k);
        return (
          <Press
            key={k}
            scale={0.98}
            onPress={() => {
              haptic.tap();
              setPick(k);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              minHeight: 64,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1.5,
              borderColor: sel ? col : c.s3,
              backgroundColor: sel ? bg : c.s1,
              transitionProperty: ['borderColor', 'backgroundColor'],
              transitionDuration: 250,
            }}>
            <RadioDot on={sel} color={col} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={15} weight={600}>
                {l}
              </Txt>
              <Txt size={12} color={c.t3}>
                {d}
              </Txt>
            </View>
          </Press>
        );
      })}
      <Txt size={12} lh={1.5} color={c.t2}>
        Status changes are logged and broadcast to users in-app within 30 seconds.
      </Txt>
      <Button
        h={50}
        bg={pick === 'halted' ? c.dn : undefined}
        color={pick === 'halted' ? '#FFFFFF' : undefined}
        label={`Apply · ${label}`}
        onPress={() => {
          router.back();
          if (markets[sym] === pick) return;
          setMarket(sym, pick);
          log(`Set ${sym}/USDT to ${label}`);
          haptic.success();
          toast(`${sym}/USDT is now ${label} · users notified`);
        }}
      />
    </SheetBody>
  );
}
