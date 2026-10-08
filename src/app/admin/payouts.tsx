import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { AdminScreen, riskColors } from '@/features/admin-ui';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useAdmin } from '@/store/admin';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);

export default function AdminPayouts() {
  const c = useColors();
  const router = useRouter();
  const { payouts, leaving, resolvePayout, log } = useAdmin();
  const prices = useMarket((s) => s.prices);
  const usd = (coin: string, amt: number) => amt * (prices[coin]?.p ?? 1);
  const total = payouts.reduce((a, x) => a + usd(x.coin, x.amt), 0);

  return (
    <AdminScreen gap={12}>
      <Appear i={0}>
        <Card gap={6}>
          <Txt size={12} color={c.t3}>
            Awaiting manual review
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Txt size={28} weight={600} ls={-0.02}>
              {fmt(total, 2)}
            </Txt>
            <Txt size={13} color={c.t2}>
              USDT equiv.
            </Txt>
          </View>
          <Txt size={12} color={c.t2}>
            {payouts.length} requests · auto-approved today 1,842 · held 6
          </Txt>
        </Card>
      </Appear>
      {payouts.length === 0 && (
        <View style={{ paddingVertical: 32, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s3, alignItems: 'center', gap: 6 }}>
          <Txt size={15} weight={600}>
            Nothing to review
          </Txt>
          <Txt size={13} color={c.t2} align="center">
            New flagged withdrawals appear here in real time.
          </Txt>
        </View>
      )}
      {payouts.map((x, i) => {
        const lv = !!leaving[x.id];
        const [rc, rbg] = riskColors(c, x.risk);
        const amt = `${fmt(x.amt, x.coin === 'USDT' ? 2 : 4)} ${x.coin}`;
        return (
          <Appear key={x.id} i={i + 1}>
            <Animated.View
              style={{
                overflow: 'hidden',
                maxHeight: lv ? 0 : 260,
                opacity: lv ? 0 : 1,
                transform: [{ translateX: lv ? 48 : 0 }],
                transitionProperty: ['maxHeight', 'opacity', 'transform'],
                transitionDuration: [400, 300, 400],
                transitionTimingFunction: [out, 'ease', out],
              }}>
              <Card gap={10} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Txt size={18} weight={600} ls={-0.01}>
                    {amt}
                  </Txt>
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: rbg }}>
                    <Txt size={10.5} weight={700} color={rc}>
                      {x.risk} risk
                    </Txt>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt size={12} color={c.t2}>
                    {x.net} ·{' '}
                    <Txt mono size={12}>
                      {x.addr}
                    </Txt>
                  </Txt>
                  <Txt mono size={12} color={c.t3}>
                    {x.ago}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: c.s2 }}>
                    <Txt mono size={11} color={c.t2}>
                      UID {x.uid}
                    </Txt>
                  </View>
                  {x.flags.map((f) => {
                    const ok = f === 'Whitelisted';
                    return (
                      <View key={f} style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: tint(ok ? c.up : c.warn, 12) }}>
                        <Txt size={11} color={ok ? c.up : c.warn}>
                          {f}
                        </Txt>
                      </View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      variant="secondary"
                      h={44}
                      size={14}
                      label="Hold"
                      onPress={() => {
                        resolvePayout(x.id, false);
                        log(`Held ${x.id} · ${amt} · ${x.net}`);
                        haptic.impact();
                        toast(`${x.id} held · user sees "under review"`);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button h={44} size={14} label="Approve" onPress={() => router.push({ pathname: '/sheets/payout', params: { id: x.id } })} />
                  </View>
                </View>
              </Card>
            </Animated.View>
          </Appear>
        );
      })}
    </AdminScreen>
  );
}
