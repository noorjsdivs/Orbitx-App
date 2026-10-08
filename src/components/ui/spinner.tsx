import Animated from 'react-native-reanimated';

import { useColors } from '@/hooks/use-theme';

const spin = { from: { transform: [{ rotate: '0deg' }] }, to: { transform: [{ rotate: '360deg' }] } };

/** Ring spinner (`ox-spin`): a circle border with a transparent right edge. */
export function Spinner({ size = 18, color, width = 2.5, duration = 700 }: { size?: number; color?: string; width?: number; duration?: number }) {
  const c = useColors();
  const col = color ?? c.t3;
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: width,
        borderColor: col,
        borderRightColor: 'transparent',
        animationName: spin,
        animationDuration: duration,
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
      }}
    />
  );
}
