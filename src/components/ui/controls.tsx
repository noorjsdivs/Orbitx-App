import { useState } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { motion } from '@/theme/tokens';

import { Icon } from './icon';
import { Press } from './press';
import { Txt } from './text';

const springCurve = cubicBezier(...motion.spring);
const popCurve = cubicBezier(...motion.pop);

/** Rounded filter chip (`chip()` in the design). */
export function Chip({ label, selected, onPress, h = 34 }: { label: string; selected?: boolean; onPress?: () => void; h?: number }) {
  const c = useColors();
  return (
    <Press
      onPress={onPress}
      scale={0.95}
      style={{
        height: h,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? c.s4 : c.line,
        backgroundColor: selected ? c.s2 : 'transparent',
        justifyContent: 'center',
        transitionProperty: ['backgroundColor', 'borderColor'],
        transitionDuration: 200,
      }}>
      <Txt size={13} weight={500} color={selected ? c.t1 : c.t3}>
        {label}
      </Txt>
    </Press>
  );
}

export function ChipRow({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[{ gap: 8 }, style]}>
      {children}
    </ScrollView>
  );
}

export type SegOption<T extends string> = { value: T; label: string; activeBg?: string };

/** Segmented control on an s2 track with a raised selected segment (`seg()`). */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  h = 44,
  radius = 10,
  size = 14,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  h?: number;
  radius?: number;
  size?: number;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', height: h, padding: 4, borderRadius: radius, backgroundColor: c.s2 }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Press
            key={o.value}
            scale={1}
            onPress={() => {
              if (!sel) haptic.tap();
              onChange(o.value);
            }}
            style={{
              flex: 1,
              borderRadius: radius - 3,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: sel ? (o.activeBg ?? c.bg) : 'transparent',
              boxShadow: sel ? '0 1px 2px rgba(0,0,0,0.15)' : undefined,
              transitionProperty: 'backgroundColor',
              transitionDuration: 200,
            }}>
            <Txt size={size} weight={500} color={sel ? (o.activeBg ? c.white : c.t1) : c.t3}>
              {o.label}
            </Txt>
          </Press>
        );
      })}
    </View>
  );
}

/** Segmented control with a sliding pill (spring curve, 450ms). */
export function SlidingSeg<T extends string>({
  options,
  value,
  onChange,
  h = 44,
  pill,
  activeColor,
  track,
  bordered = true,
  size = 14,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  h?: number;
  pill?: string;
  activeColor?: string;
  track?: string;
  bordered?: boolean;
  size?: number;
}) {
  const c = useColors();
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const seg = (w - (bordered ? 2 : 0) - 8) / options.length;
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        height: h,
        padding: 4,
        borderRadius: 12,
        backgroundColor: track ?? c.s1,
        borderWidth: bordered ? 1 : 0,
        borderColor: c.line,
      }}>
      {w > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            width: seg,
            borderRadius: 9,
            backgroundColor: pill ?? c.s3,
            transform: [{ translateX: idx * seg }],
            transitionProperty: 'transform',
            transitionDuration: 450,
            transitionTimingFunction: springCurve,
          }}
        />
      )}
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Press
            key={o.value}
            scale={1}
            onPress={() => {
              if (!sel) haptic.tap();
              onChange(o.value);
            }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={size} weight={500} color={sel ? (activeColor ?? c.t1) : c.t3}>
              {o.label}
            </Txt>
          </Press>
        );
      })}
    </View>
  );
}

/** Pill toggle like Lite / Pro or Dark / Light. */
export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  h = 36,
  size = 13,
  track,
  activeBg,
}: {
  options: SegOption<T>[];
  value: T;
  onChange: (v: T) => void;
  h?: number;
  size?: number;
  track?: string;
  activeBg?: string;
}) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: track ?? c.s1, borderWidth: track ? 0 : 1, borderColor: c.line, borderRadius: 999, padding: h > 32 ? 3 : 2, gap: 2 }}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Press
            key={o.value}
            scale={1}
            onPress={() => {
              if (!sel) haptic.tap();
              onChange(o.value);
            }}
            style={{
              height: h,
              paddingHorizontal: h > 32 ? 14 : 10,
              borderRadius: 999,
              justifyContent: 'center',
              backgroundColor: sel ? (o.activeBg ?? activeBg ?? c.s3) : 'transparent',
              transitionProperty: 'backgroundColor',
              transitionDuration: 250,
            }}>
            <Txt size={size} weight={500} color={sel ? c.t1 : c.t3}>
              {o.label}
            </Txt>
          </Press>
        );
      })}
    </View>
  );
}

export type TabItem<T extends string> = { value: T; label: string };

/** Underlined text tabs (44h, 2px accent underline). */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  size = 14,
  scroll,
  right,
  style,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: number;
  scroll?: boolean;
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const items = tabs.map((t) => {
    const sel = t.value === value;
    return (
      <Press
        key={t.value}
        scale={1}
        onPress={() => {
          if (!sel) haptic.tap();
          onChange(t.value);
        }}
        style={{
          height: 44,
          paddingHorizontal: 10,
          justifyContent: 'center',
          borderBottomWidth: 2,
          borderBottomColor: sel ? c.ac : 'transparent',
          transitionProperty: 'borderBottomColor',
          transitionDuration: 250,
        }}>
        <Txt size={size} weight={500} color={sel ? c.t1 : c.t3}>
          {t.label}
        </Txt>
      </Press>
    );
  });
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth * 2, borderBottomColor: c.hair, paddingHorizontal: 8 }, style]}>
      {scroll ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 2 }}>
          {items}
        </ScrollView>
      ) : (
        <View style={{ flexDirection: 'row', gap: 2, flex: 1 }}>{items}</View>
      )}
      {right}
    </View>
  );
}

/** iOS-style switch with the design's springy knob. */
export function Toggle({ on, small }: { on: boolean; small?: boolean }) {
  const c = useColors();
  const W = small ? 44 : 51;
  const H = small ? 24 : 31;
  const K = H - 4;
  return (
    <Animated.View
      style={{
        width: W,
        height: H,
        borderRadius: H / 2,
        padding: 2,
        backgroundColor: on ? c.ac : c.s4,
        transitionProperty: 'backgroundColor',
        transitionDuration: 250,
      }}>
      <Animated.View
        style={{
          width: K,
          height: K,
          borderRadius: K / 2,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          transform: [{ translateX: on ? W - K - 4 : 0 }],
          transitionProperty: 'transform',
          transitionDuration: 400,
          transitionTimingFunction: popCurve,
        }}
      />
    </Animated.View>
  );
}

/** Square checkbox (16px) used for "Hide other pairs". */
export function Checkbox({ checked, size = 16, radius = 4 }: { checked: boolean; size?: number; radius?: number }) {
  const c = useColors();
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: checked ? c.ac : c.ctl,
        backgroundColor: checked ? c.ac : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        transitionProperty: ['backgroundColor', 'borderColor'],
        transitionDuration: 200,
      }}>
      <Animated.View
        style={{
          opacity: checked ? 1 : 0,
          transform: [{ scale: checked ? 1 : 0.4 }],
          transitionProperty: ['opacity', 'transform'],
          transitionDuration: 300,
          transitionTimingFunction: popCurve,
        }}>
        <Icon name="check" size={size * 0.62} color={c.onAc} sw={3.5} />
      </Animated.View>
    </Animated.View>
  );
}

/** Radio ring with a springy center dot. */
export function RadioDot({ on, color }: { on: boolean; color?: string }) {
  const c = useColors();
  const col = color ?? c.ac;
  return (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: on ? col : c.ctl, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: col,
          transform: [{ scale: on ? 1 : 0 }],
          transitionProperty: 'transform',
          transitionDuration: 350,
          transitionTimingFunction: popCurve,
        }}
      />
    </View>
  );
}

/** Thin progress bars (setup / P2P steps / security level). */
export function StepBars({ count, filled, color, gap = 6, h = 4, colorFor }: { count: number; filled: number; color?: string; gap?: number; h?: number; colorFor?: (i: number) => string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {Array.from({ length: count }, (_, i) => (
        <Animated.View
          key={i}
          style={{
            flex: 1,
            height: h,
            borderRadius: h / 2,
            backgroundColor: colorFor ? colorFor(i) : i < filled ? (color ?? c.ac) : c.s3,
            transitionProperty: 'backgroundColor',
            transitionDuration: 400,
          }}
        />
      ))}
    </View>
  );
}
