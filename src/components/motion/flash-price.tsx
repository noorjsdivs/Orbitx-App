import { useEffect, useRef } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { Txt, type TxtProps } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';

/**
 * Price text that briefly flashes green or red behind the digits whenever the value
 * ticks, the way exchange tickers signal movement.
 */
export function FlashPrice({ value, dir, children, containerStyle, ...txt }: TxtProps & { value: number; dir: number; containerStyle?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const reduce = useReducedMotion();
  const flash = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (reduce) return;
    flash.set(withSequence(withTiming(1, { duration: 90 }), withTiming(0, { duration: 650 })));
  }, [value, reduce, flash]);

  const on = tint(dir < 0 ? c.dn : c.up, 24);
  const anim = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(flash.value, [0, 1], ['rgba(0,0,0,0)', on]),
  }));

  return (
    <Animated.View style={[{ borderRadius: 5, paddingHorizontal: 4, marginHorizontal: -4 }, containerStyle, anim]}>
      <Txt {...txt}>{children}</Txt>
    </Animated.View>
  );
}
