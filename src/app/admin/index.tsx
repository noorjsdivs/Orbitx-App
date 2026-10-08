import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear, useAppearOn } from '@/components/layout/appear';
import { SlidingSeg } from '@/components/ui/controls';
import { Card } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { AdminScreen } from '@/features/admin-ui';
import { useCountUp } from '@/hooks/use-count-up';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { hash, rng } from '@/lib/random';
import { useAdmin, type AdminRange } from '@/store/admin';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);
const ping = { from: { transform: [{ scale: 1 }], opacity: 0.7 }, to: { transform: [{ scale: 2.6 }], opacity: 0 } };

const compactNum = (v: number) => (v >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : v.toFixed(0));

function VolumeBars({ range }: { range: AdminRange }) {
  const c = useColors();
  const on = useAppearOn();
  const r = rng(hash(range));
  const bars = Array.from({ length: 24 }, (_, i) => {
    const v = 0.38 + 0.32 * Math.sin(((i - 5) / 24) * Math.PI * 2) + r() * 0.3;
    return Math.round(14 + Math.min(1, v) * 104);
  });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 120 }}>
      {bars.map((h, i) => (
        <Animated.View
          key={i}
          style={{
            flex: 1,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: 1,
            backgroundColor: i === 23 ? c.ac : tint(c.ac, 24),
            height: on ? h : 4,
            transitionProperty: 'height',
            transitionDuration: on ? 700 : 0,
            transitionDelay: on ? 200 + i * 22 : 0,
            transitionTimingFunction: out,
          }}
        />
      ))}
    </View>
  );
}

export default function AdminOverview() {
  const c = useColors();
  const router = useRouter();
  const range = useAdmin((s) => s.range);
  const set = useAdmin((s) => s.set);
  const kycN = useAdmin((s) => s.kycQueue.length);
  const wdN = useAdmin((s) => s.payouts.length);
  const k = useCountUp(range);
  const mult = { '24h': 1, '7d': 6.4, '30d': 25.8 }[range];
  const traders = { '24h': 1, '7d': 2.9, '30d': 6.1 }[range];

  const kpis = [
    { l: 'Trading volume', v: '$' + compactNum(1.284e9 * mult * k), d: '+8.2% vs prior', dc: c.up },
    { l: 'Active traders', v: fmt(Math.round(184302 * traders * k), 0), d: '+3.1% vs prior', dc: c.up },
    { l: 'New sign-ups', v: fmt(Math.round(2418 * mult * k), 0), d: '+12.4% vs prior', dc: c.up },
    { l: 'Net deposits', v: '+$' + compactNum(4.52e6 * mult * k), d: '-2.0% vs prior', dc: c.dn },
    { l: 'Pending KYC', v: String(31 + kycN), d: 'Median 7m · SLA 15m', dc: c.t3, tap: () => router.navigate('/admin/kyc') },
    { l: 'Pending withdrawals', v: String(8 + wdN), d: 'Oldest 15m', dc: c.warn, tap: () => router.navigate('/admin/payouts') },
  ];
  const health: [string, string, string][] = [
    ['Matching engine', 'Operational · p99 3.1 ms', c.up],
    ['Bitcoin node', 'Synced · block 866,214', c.up],
    ['Ethereum node', 'Degraded · 41 blocks behind', c.warn],
    ['TRON node', 'Synced', c.up],
    ['P2P chat', 'Operational', c.up],
  ];
  const alerts: [string, string, string, string, string][] = [
    ['HIGH', c.dn, tint(c.dn, 14), '212 failed 2FA attempts from one IP range (NG) in 10 min', '3m'],
    ['MED', c.warn, tint(c.warn, 14), 'Withdrawal velocity above threshold · UID 77310482', '11m'],
    ['INFO', c.t2, c.s2, 'BTC hot wallet at 18% of target · top-up scheduled 10:00 UTC', '26m'],
  ];

  return (
    <AdminScreen replayKey={range}>
      <SlidingSeg<AdminRange>
        h={40}
        size={13}
        options={(['24h', '7d', '30d'] as AdminRange[]).map((r) => ({ value: r, label: r }))}
        value={range}
        onChange={(r) => set({ range: r })}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {kpis.map((x, i) => (
          <Appear key={x.l} i={i} dy={12} style={{ width: '48.4%' }}>
            <Press scale={0.98} disabled={!x.tap} onPress={x.tap} pressedStyle={{ backgroundColor: c.s2 }} style={{ padding: 14, gap: 6, borderRadius: 10, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
              <Txt size={12} color={c.t3}>
                {x.l}
              </Txt>
              <Txt size={22} weight={600} ls={-0.02}>
                {x.v}
              </Txt>
              <Txt size={12} weight={500} color={x.dc}>
                {x.d}
              </Txt>
            </Press>
          </Appear>
        ))}
      </View>
      <Appear i={3}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Txt size={15} weight={600}>
              Volume by hour
            </Txt>
            <Txt size={12} color={c.t3}>
              Spot + Futures · UTC
            </Txt>
          </View>
          <VolumeBars range={range} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['00', '06', '12', '18', 'Now'].map((t) => (
              <Txt key={t} mono size={10} color={c.t3}>
                {t}
              </Txt>
            ))}
          </View>
        </Card>
      </Appear>
      <Appear i={4}>
        <Card pad={0} gap={0} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
            <Txt size={15} weight={600}>
              System status
            </Txt>
            <Txt size={12} color={c.warn}>
              4 of 5 operational
            </Txt>
          </View>
          {health.map(([n, v, col]) => (
            <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 44, borderTopWidth: 1, borderTopColor: c.hair }}>
              <View style={{ width: 8, height: 8 }}>
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: col,
                    animationName: ping,
                    animationDuration: 2000,
                    animationIterationCount: 'infinite',
                    animationTimingFunction: cubicBezier(0, 0, 0.2, 1),
                  }}
                />
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: col }} />
              </View>
              <Txt size={14} style={{ flex: 1 }}>
                {n}
              </Txt>
              <Txt size={12} color={col === c.warn ? c.warn : c.t3}>
                {v}
              </Txt>
            </View>
          ))}
        </Card>
      </Appear>
      <Appear i={5}>
        <Card pad={0} gap={0} style={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
            <Txt size={15} weight={600}>
              Risk alerts
            </Txt>
            <Txt size={12} color={c.t3}>
              Last hour
            </Txt>
          </View>
          {alerts.map(([sev, col, bg, t, ago]) => (
            <Press key={t} scale={1} onPress={() => toast('Opened in risk console')} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.hair }}>
              <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: bg, marginTop: 1 }}>
                <Txt size={10} weight={700} color={col}>
                  {sev}
                </Txt>
              </View>
              <Txt size={13} lh={1.45} style={{ flex: 1 }}>
                {t}
              </Txt>
              <Txt mono size={11} color={c.t3}>
                {ago}
              </Txt>
            </Press>
          ))}
        </Card>
      </Appear>
    </AdminScreen>
  );
}
