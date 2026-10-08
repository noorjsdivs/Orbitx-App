import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { useEnterApp } from '@/features/auth';
import { FlowPage, Spacer } from '@/features/flow-layout';
import { useColors } from '@/hooks/use-theme';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);
const spin = { from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } };
const STEPS = ['Documents submitted', 'Document check', 'Face match', 'Final review'];

export default function KycPending() {
  const c = useColors();
  const router = useRouter();
  const enter = useEnterApp();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStage(1), 1300),
      setTimeout(() => setStage(2), 2600),
      setTimeout(() => setStage(3), 3800),
      setTimeout(() => router.replace('/kyc/verified'), 4700),
    ];
    return () => t.forEach(clearTimeout);
  }, [router]);

  return (
    <FlowPage kycStep={3} back={false}>
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 24, flex: 1 }}>
        <Appear i={0} style={{ width: 120, height: 120 }}>
          <View style={[StyleSheet.absoluteFill, { borderRadius: 60, borderWidth: 3, borderColor: c.line }]} />
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius: 60,
                borderWidth: 3,
                borderColor: c.ac,
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                animationName: spin,
                animationDuration: 1100,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
              },
            ]}
          />
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Txt mono size={20} weight={500}>
              {['25%', '50%', '75%', '100%'][stage]}
            </Txt>
          </View>
        </Appear>
        <Appear i={1} style={{ marginTop: 8 }}>
          <Txt size={28} weight={600} ls={-0.03} align="center" lh={1.1}>
            Reviewing your documents
          </Txt>
        </Appear>
        <Appear i={2} style={{ maxWidth: 290 }}>
          <Txt size={14} lh={1.5} color={c.t2} align="center">
            {"Most reviews finish in under 10 minutes. We'll notify you, and you can keep using the app."}
          </Txt>
        </Appear>
        <Appear i={3} style={{ alignSelf: 'stretch', marginTop: 12 }}>
          <Card gap={14}>
            {STEPS.map((l, i) => {
              const done = i <= stage;
              const cur = i === stage + 1;
              return (
                <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Animated.View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: done || cur ? c.ac : c.ctl,
                      backgroundColor: done ? c.ac : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transitionProperty: ['backgroundColor', 'borderColor'],
                      transitionDuration: 350,
                    }}>
                    <Animated.View
                      style={{
                        opacity: done ? 1 : 0,
                        transform: [{ scale: done ? 1 : 0.3 }],
                        transitionProperty: ['opacity', 'transform'],
                        transitionDuration: 400,
                        transitionTimingFunction: pop,
                      }}>
                      <Icon name="check" size={12} sw={3.5} color={c.onAc} />
                    </Animated.View>
                  </Animated.View>
                  <Txt size={14} color={done || cur ? c.t1 : c.t3} style={{ flex: 1 }}>
                    {l}
                  </Txt>
                  <Txt size={12} color={c.t3}>
                    {done ? 'Done' : cur ? 'In progress' : 'Waiting'}
                  </Txt>
                </View>
              );
            })}
          </Card>
        </Appear>
        <Spacer />
        <Button label="Go to Home" variant="secondary" h={52} style={{ alignSelf: 'stretch' }} onPress={() => {
            enter('user', "We'll notify you when verification completes");
            // Review keeps running in the background; unlock limits when it lands.
            setTimeout(() => {
              useSession.getState().set({ kycDone: true });
              toast('Identity verified · Level 2 limits unlocked');
            }, 6000);
          }}
        />
      </View>
    </FlowPage>
  );
}
