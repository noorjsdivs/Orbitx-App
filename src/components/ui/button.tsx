import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';

import { Press, type PressProps } from './press';
import { Spinner } from './spinner';
import { Txt } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'buy' | 'sell' | 'ghost' | 'dashed' | 'danger';

type Props = {
  label: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Height in px — design uses 36, 40, 44, 48, 50. */
  h?: number;
  size?: number;
  /** Dimmed (opacity .45) but still tappable so validation can explain why. */
  dim?: boolean;
  loading?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: PressProps['style'];
  /** Override background (e.g. stateful confirm buttons). */
  bg?: string;
  color?: string;
  accessibilityLabel?: string;
};

export function Button({ label, onPress, variant = 'primary', h = 48, size, dim, loading, left, right, style, bg, color, accessibilityLabel }: Props) {
  const c = useColors();
  const v = {
    primary: { bg: c.ac, fg: c.onAc, bd: 'transparent', pressed: c.acP },
    secondary: { bg: 'transparent', fg: c.t1, bd: c.s4, pressed: c.s2 },
    buy: { bg: c.up, fg: c.white, bd: 'transparent', pressed: c.up },
    sell: { bg: c.dn, fg: c.white, bd: 'transparent', pressed: c.dn },
    ghost: { bg: 'transparent', fg: c.t2, bd: 'transparent', pressed: 'transparent' },
    dashed: { bg: 'transparent', fg: c.t2, bd: c.s4, pressed: c.s1 },
    danger: { bg: tint(c.dn, 8), fg: c.dn, bd: tint(c.dn, 40), pressed: tint(c.dn, 14) },
  }[variant];
  const fs = size ?? (h >= 48 ? 15 : 14);
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? (typeof label === 'string' ? label : undefined)}
      scale={0.98}
      style={[
        styles.base,
        {
          height: h,
          backgroundColor: bg ?? v.bg,
          borderColor: v.bd,
          borderWidth: v.bd === 'transparent' ? 0 : 1,
          borderStyle: variant === 'dashed' ? 'dashed' : 'solid',
          opacity: dim ? 0.45 : 1,
          boxShadow: variant === 'ghost' || variant === 'dashed' ? undefined : '0 1px 2px rgba(0,0,0,0.12)',
        },
        style,
      ]}
      pressedStyle={{ backgroundColor: bg ?? v.pressed, ...(variant === 'buy' || variant === 'sell' ? { opacity: dim ? 0.4 : 0.88 } : null) }}>
      {loading ? <Spinner size={18} color={variant === 'primary' ? c.bg : c.t3} /> : left}
      {typeof label === 'string' ? (
        <Txt size={fs} weight={500} color={color ?? v.fg} ls={-0.005} numberOfLines={1}>
          {label}
        </Txt>
      ) : (
        label
      )}
      {right}
    </Press>
  );
}

/** Row of two buttons with the design's 1fr / 2fr split. */
export function ButtonRow({ children, ratio = [1, 1], gap = 8, style }: { children: React.ReactNode[]; ratio?: [number, number]; gap?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', gap }, style]}>
      {children.map((ch, i) => (
        <View key={i} style={{ flex: ratio[i] ?? 1 }}>
          {ch}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
});
