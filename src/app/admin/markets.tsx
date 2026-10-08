import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { AdminScreen, statusMeta } from '@/features/admin-ui';
import { useColors } from '@/hooks/use-theme';
import { compact, fmt } from '@/lib/format';
import { useAdmin } from '@/store/admin';
import { useMarket } from '@/store/market';
import { tint } from '@/theme/color';

export default function AdminMarkets() {
  const c = useColors();
  const router = useRouter();
  const markets = useAdmin((s) => s.markets);
  const prices = useMarket((s) => s.prices);
  const keys = Object.keys(markets);
  const nH = keys.filter((k) => markets[k] === 'halted').length;
  const nC = keys.filter((k) => markets[k] === 'cancel').length;
  const col = nH ? c.dn : nC ? c.warn : c.up;
  const title = nH ? `${nH} market${nH > 1 ? 's' : ''} halted` : nC ? `${nC} market in cancel-only` : 'All markets trading normally';

  return (
    <AdminScreen gap={12}>
      <Appear i={0}>
        <View
          style={{
            flexDirection: 'row',
            gap: 12,
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: tint(col, 8),
            borderWidth: 1,
            borderColor: tint(col, 30),
          }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col }} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt size={14} weight={600}>
              {title}
            </Txt>
            <Txt size={12} color={c.t2}>
              Circuit breaker: auto-halt at ±15% in 5 min
            </Txt>
          </View>
        </View>
      </Appear>
      <Appear i={1}>
        <View style={{ borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
          {keys.map((k, i) => {
            const [label, sc, sbg] = statusMeta(c, markets[k]);
            return (
              <View
                key={k}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  height: 60,
                  paddingLeft: 14,
                  paddingRight: 8,
                  borderBottomWidth: i < keys.length - 1 ? 1 : 0,
                  borderBottomColor: c.hair,
                }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt size={15} weight={600}>
                    {k}
                    <Txt size={12} color={c.t3}>
                      /USDT
                    </Txt>
                  </Txt>
                  <Txt size={12} color={c.t3}>
                    Vol {compact(COINS[k].v)}
                  </Txt>
                </View>
                <Txt size={14} align="right" style={{ width: 96 }}>
                  {fmt(prices[k].p, COINS[k].dp)}
                </Txt>
                <Press scale={0.95} onPress={() => router.push({ pathname: '/sheets/market-status', params: { sym: k } })} style={{ height: 44, justifyContent: 'center' }}>
                  <View
                    style={{ height: 30, minWidth: 96, paddingHorizontal: 10, borderRadius: 999, backgroundColor: sbg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc }} />
                    <Txt size={12} weight={600} color={sc}>
                      {label}
                    </Txt>
                  </View>
                </Press>
              </View>
            );
          })}
        </View>
      </Appear>
    </AdminScreen>
  );
}
