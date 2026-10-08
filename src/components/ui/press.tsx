import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, type CSSStyle } from 'react-native-reanimated';

const APressable = Animated.createAnimatedComponent(Pressable);

export type PressProps = Omit<PressableProps, 'style' | 'children'> & {
  /** Accepts Reanimated CSS transition props (transitionProperty, …). */
  style?: StyleProp<CSSStyle<ViewStyle>>;
  /** Extra style while pressed (e.g. pressed background). */
  pressedStyle?: StyleProp<CSSStyle<ViewStyle>>;
  /** Press-down scale; the design uses .97–.98 for buttons. */
  scale?: number;
  /** Opacity while pressed, for list rows. */
  pressedOpacity?: number;
  children?: React.ReactNode;
};

/**
 * Pressable with the design's press feedback (scale .97 · 150ms). The scale runs as an
 * animated style so any CSS transitions in `style` (width, colors…) keep working.
 */
export function Press({ style, pressedStyle, scale = 0.97, pressedOpacity, children, onPressIn, onPressOut, ...rest }: PressProps) {
  const [down, setDown] = useState(false);
  const s = useSharedValue(1);
  const o = useSharedValue(1);
  const anim = useAnimatedStyle(() => (pressedOpacity != null ? { transform: [{ scale: s.value }], opacity: o.value } : { transform: [{ scale: s.value }] }));
  return (
    <APressable
      accessibilityRole="button"
      {...rest}
      onPressIn={(e) => {
        setDown(true);
        if (scale !== 1) s.set(withTiming(scale, { duration: 150 }));
        if (pressedOpacity != null) o.set(withTiming(pressedOpacity, { duration: 100 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setDown(false);
        s.set(withTiming(1, { duration: 150 }));
        o.set(withTiming(1, { duration: 150 }));
        onPressOut?.(e);
      }}
      style={[style, down && pressedStyle, anim]}>
      {children}
    </APressable>
  );
}
