import { createContext, use, useEffect, useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { cubicBezier, useReducedMotion } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const AppearCtx = createContext(true);
const out = cubicBezier(...motion.out);

/**
 * Drives the design's content stagger: everything starts hidden, then 40ms later
 * flips on so each <Appear i={n}> eases in 60ms after the previous one.
 * Change `replayKey` to run it again (e.g. switching setup steps).
 */
export function AppearProvider({ children, replayKey }: { children: React.ReactNode; replayKey?: unknown }) {
  const [on, setOn] = useState(false);
  const [prevKey, setPrevKey] = useState(replayKey);
  if (prevKey !== replayKey) {
    setPrevKey(replayKey);
    setOn(false);
  }
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 40);
    return () => clearTimeout(t);
  }, [replayKey]);
  return <AppearCtx value={on}>{children}</AppearCtx>;
}

export function useAppearOn() {
  return use(AppearCtx);
}

/** Staggered fade-up (opacity 420ms · translateY 16px over 560ms, 60ms steps). */
export function Appear({ i = 0, children, style, dy = 16 }: { i?: number; children: React.ReactNode; style?: StyleProp<ViewStyle>; dy?: number }) {
  const ctx = use(AppearCtx);
  // With "Reduce Motion" on, content is simply shown — no fade or slide.
  const on = useReducedMotion() || ctx;
  const d = 60 + i * 60;
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: on ? 1 : 0,
          transform: [{ translateY: on ? 0 : dy }],
          transitionProperty: ['opacity', 'transform'],
          transitionDuration: on ? [420, 560] : 0,
          transitionDelay: on ? d : 0,
          transitionTimingFunction: ['ease', out],
        },
      ]}>
      {children}
    </Animated.View>
  );
}
