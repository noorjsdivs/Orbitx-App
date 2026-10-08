import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { Icon } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { useColors, useThemeName } from '@/hooks/use-theme';
import { useToastStore } from '@/store/toast';

function Toast() {
  const c = useColors();
  const theme = useThemeName();
  const insets = useSafeAreaInsets();
  const { msg, visible } = useToastStore();
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <Animated.View
        accessibilityLiveRegion="polite"
        style={{
          position: 'absolute',
          top: insets.top + 6,
          left: 16,
          right: 16,
          alignItems: 'center',
          opacity: visible ? 1 : 0,
          transform: [{ translateY: visible ? 0 : -12 }],
          transitionProperty: ['opacity', 'transform'],
          transitionDuration: 250,
        }}>
        <View
          style={{
            borderRadius: 14,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: c.glassBd,
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}>
          <BlurView intensity={50} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <View style={{ backgroundColor: c.glass2, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={12} sw={3} color={c.onAc} />
            </View>
            <Txt size={13} lh={1.4} style={{ flexShrink: 1 }}>
              {msg}
            </Txt>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

/** Toasts render in a full-window overlay on iOS so they also show above native sheets. */
export function ToastHost() {
  if (Platform.OS === 'ios') {
    return (
      <FullWindowOverlay>
        <Toast />
      </FullWindowOverlay>
    );
  }
  return <Toast />;
}
