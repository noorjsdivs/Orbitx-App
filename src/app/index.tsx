import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { cubicBezier, Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import { useResetTo } from '@/lib/nav';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const out = cubicBezier(...motion.out);
const pop = cubicBezier(...motion.pop);
const orbit = { from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } };

/** Animated brand splash: ring draws, orbit dot spins, wordmark rises, then scales out. */
export default function Splash() {
  const c = useColors();
  const router = useRouter();
  const resetTo = useResetTo();
  const [sg, setSg] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dash = useSharedValue(264);

  const leave = () => {
    const s = useSession.getState();
    if (s.status === 'user' || s.status === 'guest') resetTo('/home');
    else if (s.status === 'admin') resetTo('/admin');
    else router.replace(s.onboarded ? '/welcome' : '/onboarding');
  };

  useEffect(() => {
    const T = (ms: number, f: () => void) => timers.current.push(setTimeout(f, ms));
    T(120, () => {
      setSg(1);
      dash.set(withTiming(0, { duration: 1200, easing: Easing.bezier(...motion.draw) }));
    });
    T(850, () => setSg(2));
    T(1450, () => setSg(3));
    T(2700, () => setSg(4));
    T(3150, leave);
    const list = timers.current;
    return () => list.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    if (sg >= 4) return;
    timers.current.forEach(clearTimeout);
    setSg(4);
    timers.current = [setTimeout(leave, 420)];
  };

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: dash.value, strokeOpacity: dash.value > 262 ? 0 : 1 }));

  return (
    <Pressable onPress={skip} style={{ flex: 1, backgroundColor: c.bg }} accessibilityLabel="Tap to skip">
      <Animated.View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: sg >= 4 ? 0 : 1,
          transform: [{ scale: sg >= 4 ? 1.08 : 1 }],
          transitionProperty: ['opacity', 'transform'],
          transitionDuration: [450, 600],
          transitionTimingFunction: ['ease', out],
        }}>
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 460,
            height: 460,
            marginTop: -120,
            opacity: sg >= 1 ? 1 : 0,
            transform: [{ scale: sg >= 2 ? 1 : 0.6 }],
            transitionProperty: ['opacity', 'transform'],
            transitionDuration: [1200, 1800],
            transitionTimingFunction: ['ease', out],
          }}>
          <Svg width={460} height={460}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={c.ac} stopOpacity={0.13} />
                <Stop offset="1" stopColor={c.ac} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={230} cy={230} r={230} fill="url(#glow)" />
          </Svg>
        </Animated.View>

        <View style={{ width: 104, height: 104, marginTop: -60 }}>
          <Svg width={104} height={104} viewBox="0 0 104 104" style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
            <Circle cx={52} cy={52} r={42} stroke={c.line} strokeWidth={2} fill="none" />
            <AnimatedCircle cx={52} cy={52} r={42} stroke={c.acT} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="264" fill="none" animatedProps={ringProps} />
          </Svg>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                opacity: sg >= 2 ? 1 : 0,
                transitionProperty: 'opacity',
                transitionDuration: 400,
                animationName: orbit,
                animationDuration: 2800,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'linear',
              },
            ]}>
            <View
              style={{
                position: 'absolute',
                left: 46,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: c.ac,
                boxShadow: `0 0 18px ${tint(c.ac, 75)}`,
              }}
            />
          </Animated.View>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sg >= 1 ? 1 : 0,
                transform: [{ scale: sg >= 1 ? 1 : 0.4 }],
                transitionProperty: ['transform', 'opacity'],
                transitionDuration: [700, 300],
                transitionTimingFunction: [pop, 'ease'],
              },
            ]}>
            <Txt size={40} weight={700} ls={-0.04}>
              X
            </Txt>
          </Animated.View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 30, height: 48, overflow: 'hidden' }}>
          {'ORBITX'.split('').map((ch, i) => (
            <Animated.View
              key={i}
              style={{
                transform: [{ translateY: sg >= 2 ? 0 : 52 }],
                transitionProperty: 'transform',
                transitionDuration: 700,
                transitionDelay: i * 55,
                transitionTimingFunction: out,
              }}>
              <Txt size={40} weight={700} ls={-0.03} lh={1.2} color={i === 5 ? c.ac : c.t1}>
                {ch}
              </Txt>
            </Animated.View>
          ))}
        </View>

        <Animated.View
          style={{
            marginTop: 12,
            opacity: sg >= 3 ? 1 : 0,
            transform: [{ translateY: sg >= 3 ? 0 : 8 }],
            transitionProperty: ['opacity', 'transform'],
            transitionDuration: [600, 700],
            transitionTimingFunction: ['ease', out],
          }}>
          <Txt mono size={11} ls={0.2} color={c.t3}>
            EXCHANGE · WALLET · EARN
          </Txt>
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: 72,
            alignItems: 'center',
            gap: 12,
            opacity: sg >= 3 ? 1 : 0,
            transitionProperty: 'opacity',
            transitionDuration: 600,
            transitionDelay: 200,
          }}>
          <View style={{ width: 120, height: 2, borderRadius: 1, backgroundColor: c.line, overflow: 'hidden' }}>
            <Animated.View
              style={{
                height: '100%',
                width: sg >= 3 ? 120 : 0,
                backgroundColor: c.ac,
                transitionProperty: 'width',
                transitionDuration: 1300,
                transitionTimingFunction: cubicBezier(...motion.draw),
              }}
            />
          </View>
          <Txt mono size={10} color={c.t4}>
            v4.2.0 · tap to skip
          </Txt>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
