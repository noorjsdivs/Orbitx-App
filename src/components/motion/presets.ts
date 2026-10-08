import { Easing as RNEasing } from 'react-native';
import { Easing, FadeIn, FadeInDown, FadeOut, FadeOutLeft, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

/**
 * Shared layout-animation presets so every list in the app moves the same way.
 * Reanimated layout animations follow the OS "Reduce Motion" setting by default.
 */
const out = Easing.bezier(...motion.out);

/** Rows that slide in when they're added (new order, alert, position…). */
export const rowEnter = FadeInDown.duration(380).easing(out);

/** Rows that slide out to the left when removed (cancel, close, sign out…). */
export const rowExit = FadeOutLeft.duration(240);

/** Remaining rows glide into the freed space / new sort order. */
export const rowLayout = LinearTransition.duration(320).easing(out);

/** Market rows fading in after the skeleton, 30ms apart. */
export const listItemEnter = (i: number) => FadeIn.duration(260).delay(Math.min(i, 10) * 30);

export const fadeIn = FadeIn.duration(220);
export const fadeOut = FadeOut.duration(160);

/** New chat messages rise in from the composer. */
export const bubbleIn = FadeInDown.duration(260).easing(out);

/** Chips / bubbles popping in and out. */
export const popIn = ZoomIn.duration(240).easing(out);
export const popOut = ZoomOut.duration(180);

/** Tab-to-tab scene transition: fade + 10px rise, like the design's `animate(0)`. */
export const tabTransition = {
  transitionSpec: { animation: 'timing' as const, config: { duration: 320, easing: RNEasing.bezier(...motion.out) } },
  sceneStyleInterpolator: ({ current }: { current: { progress: import('react-native').Animated.Value } }) => ({
    sceneStyle: {
      opacity: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [0, 1, 0] }),
      transform: [{ translateY: current.progress.interpolate({ inputRange: [-1, 0, 1], outputRange: [10, 0, 10] }) }],
    },
  }),
};
