import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier, Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const pop = cubicBezier(...motion.pop);
const breathe = {
  '0%': { opacity: 0.55, transform: [{ scale: 1 }] },
  '50%': { opacity: 1, transform: [{ scale: 1.06 }] },
  '100%': { opacity: 0.55, transform: [{ scale: 1 }] },
};

export default function KycSelfie() {
  const c = useColors();
  const router = useRouter();
  const [stage, setStage] = useState(0);
  const ring = useSharedValue(754);
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: ring.value, strokeOpacity: ring.value > 752 ? 0 : 1 }));

  useEffect(() => {
    const a = setTimeout(() => {
      setStage(1);
      ring.set(withTiming(0, { duration: 2600, easing: Easing.bezier(0.4, 0, 0.2, 1) }));
    }, 450);
    const b = setTimeout(() => {
      setStage(2);
      haptic.success();
    }, 3200);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [ring]);

  return (
    <FlowPage kycStep={2}>
      <Appear i={0}>
        <FlowTitle title="Take a selfie" sub="Remove glasses and hats. Keep your face inside the circle." />
      </Appear>
      <Appear i={1} style={{ alignSelf: 'center', width: 250, height: 250, marginTop: 8 }}>
        {stage === 1 && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              right: 14,
              bottom: 14,
              borderRadius: 125,
              borderWidth: 2,
              borderColor: tint(c.ac, 50),
              animationName: breathe,
              animationDuration: 1600,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        )}
        <View
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderRadius: 125,
            backgroundColor: c.cam,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Txt mono size={11} ls={0.1} color={c.t4}>
            FRONT CAMERA
          </Txt>
        </View>
        <Svg width={250} height={250} viewBox="0 0 250 250" style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
          <Circle cx={125} cy={125} r={120} stroke={c.line} strokeWidth={4} fill="none" />
          <AnimatedCircle cx={125} cy={125} r={120} stroke={c.acT} strokeWidth={4} strokeLinecap="round" strokeDasharray="754" fill="none" animatedProps={ringProps} />
        </Svg>
        <Animated.View
          style={{
            position: 'absolute',
            top: 18,
            left: 18,
            right: 18,
            bottom: 18,
            borderRadius: 125,
            backgroundColor: tint(c.ac, 12),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: stage === 2 ? 1 : 0,
            transform: [{ scale: stage === 2 ? 1 : 0.85 }],
            transitionProperty: ['opacity', 'transform'],
            transitionDuration: [350, 500],
            transitionTimingFunction: ['ease', pop],
          }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={32} sw={3} color={c.onAc} />
          </View>
        </Animated.View>
      </Appear>
      <Txt size={16} weight={600} align="center" color={stage === 2 ? c.ac : c.t1} style={{ minHeight: 24 }}>
        {['Position your face in the circle', 'Hold still…', 'Selfie captured'][stage]}
      </Txt>
      <Spacer />
      <Button label="Submit for review" size={16} dim={stage !== 2} onPress={() => stage === 2 && router.push('/kyc/pending')} />
    </FlowPage>
  );
}
