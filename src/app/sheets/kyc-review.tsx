import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { KYC_QUEUE } from '@/data/fixtures';
import { riskColors } from '@/features/admin-ui';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useAdmin } from '@/store/admin';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);
const REASONS = ['Blurry document', 'Name mismatch', 'Expired document', 'Face mismatch', 'Sanctions hit'];

export default function KycReview() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queue = useAdmin((s) => s.kycQueue);
  const resolveKyc = useAdmin((s) => s.resolveKyc);
  const [rejMode, setRejMode] = useState(false);
  const [reason, setReason] = useState('');
  const x = queue.find((y) => y.id === id) ?? queue[0] ?? KYC_QUEUE[0];
  const [rc, rbg] = riskColors(c, x.risk);
  const checks: [string, string, string][] = [
    ['Document authenticity', x.risk === 'High' ? '91%' : '98%', c.up],
    ['Face match', x.risk === 'Medium' ? '88%' : '96%', x.risk === 'Medium' ? c.warn : c.up],
    ['Sanctions screening', x.flag ? 'Potential match' : 'Clear', x.flag ? c.dn : c.up],
    ['PEP check', 'No match', c.up],
    ['Duplicate accounts', 'None found', c.up],
  ];

  const finish = (approved: boolean) => {
    resolveKyc(x.id, approved, reason);
    if (approved) haptic.success();
    else haptic.impact();
    router.back();
    toast(approved ? `${x.name} approved · Level 2` : `${x.name} rejected · user notified`);
  };

  return (
    <SheetBody closable={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ gap: 4, flex: 1 }}>
          <Txt size={19} weight={600}>
            {x.name}
          </Txt>
          <Txt mono size={11} color={c.t3}>
            {x.id} · {x.cc} · {x.doc}
          </Txt>
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: rbg }}>
          <Txt size={11} weight={700} color={rc}>
            {x.risk} · {x.score}
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['ID FRONT', 'ID BACK', 'SELFIE'].map((t, i) => (
          <View key={t} style={{ flex: i === 2 ? 0.75 : 1, height: 84, borderRadius: i === 2 ? 42 : 12, backgroundColor: c.s2, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s4, alignItems: 'center', justifyContent: 'center' }}>
            <Txt mono size={10} color={c.t3}>
              {t}
            </Txt>
          </View>
        ))}
      </View>
      <View style={{ gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14, backgroundColor: c.s2 }}>
        {checks.map(([k, v, col]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={13} color={c.t2}>
              {k}
            </Txt>
            <Txt size={13} weight={600} color={col}>
              {v}
            </Txt>
          </View>
        ))}
      </View>
      {x.flag && (
        <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: tint(c.dn, 10) }}>
          <Txt size={13} color={c.dn}>
            {x.flag}
          </Txt>
        </View>
      )}
      <Animated.View style={{ maxHeight: rejMode ? 120 : 0, opacity: rejMode ? 1 : 0, overflow: 'hidden', transitionProperty: ['maxHeight', 'opacity'], transitionDuration: [400, 300], transitionTimingFunction: [out, 'ease'] }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 4 }}>
          {REASONS.map((r) => {
            const sel = reason === r;
            return (
              <Press key={r} scale={0.96} onPress={() => setReason(r)} style={{ height: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: sel ? c.dn : c.s4, backgroundColor: sel ? tint(c.dn, 12) : 'transparent', justifyContent: 'center' }}>
                <Txt size={12} weight={500} color={sel ? c.dn : c.t2}>
                  {r}
                </Txt>
              </Press>
            );
          })}
        </View>
      </Animated.View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button
            variant="danger"
            h={50}
            label={rejMode ? (reason ? 'Confirm reject' : 'Pick a reason') : 'Reject'}
            onPress={() => {
              if (!rejMode) setRejMode(true);
              else if (reason) finish(false);
              else toast('Choose a rejection reason first');
            }}
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <Button h={50} label="Approve · Level 2" onPress={() => finish(true)} />
        </View>
      </View>
    </SheetBody>
  );
}
