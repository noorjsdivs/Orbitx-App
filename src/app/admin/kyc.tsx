import { useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { SlidingSeg } from '@/components/ui/controls';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { AdminScreen, riskColors } from '@/features/admin-ui';
import { useColors } from '@/hooks/use-theme';
import { initials } from '@/lib/format';
import { useAdmin, type KycFilter } from '@/store/admin';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);

export default function AdminKyc() {
  const c = useColors();
  const router = useRouter();
  const { kycQueue, kycDone, kycFilter, leaving, set } = useAdmin();
  const flagged = kycQueue.filter((x) => x.risk === 'High');
  const list = kycFilter === 'pending' ? kycQueue : kycFilter === 'flagged' ? flagged : kycDone;

  return (
    <AdminScreen gap={12}>
      <SlidingSeg<KycFilter>
        h={40}
        size={13}
        options={[
          { value: 'pending', label: `Pending ${kycQueue.length}` },
          { value: 'flagged', label: `Flagged ${flagged.length}` },
          { value: 'approved', label: `Done ${kycDone.length}` },
        ]}
        value={kycFilter}
        onChange={(v) => set({ kycFilter: v })}
      />
      <Txt size={12} color={c.t3}>
        Median review time 7m · SLA 15m · 3 reviewers online
      </Txt>
      {list.length === 0 && (
        <View style={{ paddingVertical: 32, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s3, alignItems: 'center', gap: 6 }}>
          <Txt size={15} weight={600}>
            Queue clear
          </Txt>
          <Txt size={13} color={c.t2}>
            No applications in this view.
          </Txt>
        </View>
      )}
      {list.map((x, i) => {
        const lv = !!leaving[x.id] && kycFilter !== 'approved';
        const done = kycFilter === 'approved';
        const [rc, rbg] = done ? [c.up, tint(c.up, 14)] : riskColors(c, x.risk);
        return (
          <Appear key={x.id} i={i}>
            <Animated.View
              style={{
                overflow: 'hidden',
                maxHeight: lv ? 0 : 120,
                opacity: lv ? 0 : 1,
                transform: [{ translateX: lv ? 48 : 0 }],
                transitionProperty: ['maxHeight', 'opacity', 'transform'],
                transitionDuration: [400, 300, 400],
                transitionTimingFunction: [out, 'ease', out],
              }}>
              <Press
                scale={0.98}
                pressedStyle={{ backgroundColor: c.s2 }}
                onPress={() => (done ? toast(`${x.name} · approved this session`) : router.push({ pathname: '/sheets/kyc-review', params: { id: x.id } }))}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.s2, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt size={13} weight={600} color={c.t2}>
                    {initials(x.name)}
                  </Txt>
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <Txt size={15} weight={600} numberOfLines={1}>
                    {x.name}
                  </Txt>
                  <Txt size={12} color={c.t3} numberOfLines={1}>
                    {x.cc} · {x.doc} · {x.id}
                  </Txt>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, backgroundColor: rbg }}>
                    <Txt size={10.5} weight={700} color={rc}>
                      {done ? 'Approved' : `${x.risk} · ${x.score}`}
                    </Txt>
                  </View>
                  <Txt mono size={11} color={c.t3}>
                    {x.ago}
                  </Txt>
                </View>
              </Press>
            </Animated.View>
          </Appear>
        );
      })}
    </AdminScreen>
  );
}
