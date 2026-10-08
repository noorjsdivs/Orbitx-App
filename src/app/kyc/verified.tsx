import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier, Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Appear, useAppearOn } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { useEnterApp } from '@/features/auth';
import { FlowPage, Spacer } from '@/features/flow-layout';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fullName, useSession } from '@/store/session';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const pop = cubicBezier(...motion.pop);
const ping = { from: { transform: [{ scale: 1 }], opacity: 0.7 }, to: { transform: [{ scale: 2.6 }], opacity: 0 } };

function Badge() {
  const c = useColors();
  const on = useAppearOn();
  const dash = useSharedValue(80);
  // Hide the stroke until it starts drawing (a round cap would otherwise show a dot).
  const props = useAnimatedProps(() => ({ strokeDashoffset: dash.value, strokeOpacity: dash.value > 79 ? 0 : 1 }));
  useEffect(() => {
    if (on) {
      dash.set(withDelay(350, withTiming(0, { duration: 600, easing: Easing.bezier(0.65, 0, 0.35, 1) })));
      haptic.success();
    }
  }, [on, dash]);
  return (
    <View style={{ width: 132, height: 132 }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 66,
            backgroundColor: tint(c.ac, 18),
            animationName: ping,
            animationDuration: 1800,
            animationIterationCount: 'infinite',
            animationTimingFunction: cubicBezier(0, 0, 0.2, 1),
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 66,
            backgroundColor: c.ac,
            transform: [{ scale: on ? 1 : 0.3 }],
            transitionProperty: 'transform',
            transitionDuration: 700,
            transitionTimingFunction: pop,
          },
        ]}
      />
      <Svg width={132} height={132} viewBox="0 0 132 132" style={StyleSheet.absoluteFill}>
        <AnimatedPath d="M42 68l16 16 32-36" stroke={c.onAc} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" fill="none" animatedProps={props} />
      </Svg>
    </View>
  );
}

export default function KycVerified() {
  const c = useColors();
  const enter = useEnterApp();
  const name = useSession((s) => s.name);
  const limits = [
    ['Daily withdrawal limit', '100,000 USDT', c.t1],
    ['P2P trading', 'Unlocked', c.up],
    ['Futures', 'Up to 20x', c.t1],
  ];
  return (
    <FlowPage kycStep={4} back={false}>
      <View style={{ flex: 1, alignItems: 'center', gap: 14, paddingTop: 32 }}>
        <Badge />
        <Appear i={2} style={{ marginTop: 12 }}>
          <Txt mono size={11} ls={0.12} color={c.acT}>
            LEVEL 2 · VERIFIED
          </Txt>
        </Appear>
        <Appear i={3}>
          <Txt size={32} weight={600} ls={-0.03}>
            {"You're verified"}
          </Txt>
        </Appear>
        <Appear i={3}>
          <Txt size={14} color={c.t2} align="center">
            {fullName(name)} · approved just now
          </Txt>
        </Appear>
        <Appear i={4} style={{ alignSelf: 'stretch', marginTop: 12 }}>
          <Card pad={0} gap={0} style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
            {limits.map(([k, v, col], i) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 48, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: c.line }}>
                <Txt size={14} color={c.t2}>
                  {k}
                </Txt>
                <Txt size={14} weight={600} color={col}>
                  {v}
                </Txt>
              </View>
            ))}
          </Card>
        </Appear>
        <Spacer />
        <Appear i={5} style={{ alignSelf: 'stretch' }}>
          <Button
            label="Start trading"
            size={16}
            onPress={() => {
              useSession.getState().set({ kycDone: true });
              enter('user', 'Identity verified · Level 2 limits unlocked');
            }}
          />
        </Appear>
      </View>
    </FlowPage>
  );
}
