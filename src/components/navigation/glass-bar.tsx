import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { TAB_BAR_H, useTabBarSpace } from '@/components/layout/screen';
import { Icon, type IconName } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { haptic } from '@/hooks/use-haptics';
import { useColors, useThemeName } from '@/hooks/use-theme';
import { motion } from '@/theme/tokens';

const spring = cubicBezier(...motion.spring);

/**
 * Floating liquid-glass bar (blur 28 · saturate) with a spring indicator pill
 * (550ms) that slides under the active slot.
 */
export function GlassBar({ count, active, children }: { count: number; active: number | null; children: React.ReactNode }) {
  const c = useColors();
  const theme = useThemeName();
  const { bottom } = useTabBarSpace();
  const [w, setW] = useState(0);
  const seg = w / count;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom, boxShadow: theme === 'dark' ? '0 18px 40px rgba(0,0,0,0.5)' : '0 12px 32px rgba(30,35,41,0.16)' }]}>
      <View
        style={[
          styles.bar,
          {
            borderColor: c.glassBd,
            boxShadow: theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.4)' : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(30,35,41,0.06)',
          },
        ]}
        onLayout={(e) => setW(e.nativeEvent.layout.width - 2)}>
        <BlurView intensity={60} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.glass }]} />
        <LinearGradient colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']} locations={[0, 0.55]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: seg,
            opacity: active != null && w > 0 ? 1 : 0,
            transform: [{ translateX: (active ?? 0) * seg }],
            transitionProperty: ['transform', 'opacity'],
            transitionDuration: [550, 250],
            transitionTimingFunction: [spring, 'ease'],
          }}>
          <View
            style={{
              position: 'absolute',
              top: 7,
              bottom: 7,
              left: 5,
              right: 5,
              borderRadius: 26,
              backgroundColor: c.pill,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 4px 12px rgba(0,0,0,0.25)',
            }}
          />
        </Animated.View>
        <View style={styles.row}>{children}</View>
      </View>
    </View>
  );
}

/** Icon + label slot; optional numeric badge. */
export function GlassBarItem({ label, icon, on, onPress, badge, badgeColor }: { label: string; icon: IconName; on: boolean; onPress: () => void; badge?: number; badgeColor?: string }) {
  const c = useColors();
  return (
    <Press
      accessibilityLabel={label}
      accessibilityState={{ selected: on }}
      scale={0.9}
      onPress={() => {
        if (!on) haptic.tap();
        onPress();
      }}
      style={styles.slot}>
      <View>
        <Icon name={icon} size={22} sw={1.7} color={on ? c.t1 : c.t3} />
        {!!badge && (
          <View style={{ position: 'absolute', top: -6, right: -12, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: badgeColor ?? c.dn, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={10} weight={700} color={badgeColor === c.warn ? c.onAc : '#FFFFFF'}>
              {badge}
            </Txt>
          </View>
        )}
      </View>
      <Txt size={10.5} weight={500} color={on ? c.t1 : c.t3}>
        {label}
      </Txt>
    </Press>
  );
}

export const glassStyles = StyleSheet.create({ slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 } });

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, height: TAB_BAR_H, borderRadius: TAB_BAR_H / 2 },
  bar: {
    flex: 1,
    borderRadius: TAB_BAR_H / 2,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: { flex: 1, flexDirection: 'row' },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
});
