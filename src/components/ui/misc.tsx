import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { COINS } from '@/data/market';
import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';

import { Txt } from './text';

/** Surface card: s1, 12 radius, 1px line border. */
export function Card({ children, style, pad = 16, gap = 12 }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; pad?: number; gap?: number }) {
  const c = useColors();
  return (
    <View style={[{ padding: pad, gap, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }, style]}>
      {children}
    </View>
  );
}

/** Coin glyph: circle with the ticker's first letter in the coin color. */
export function CoinGlyph({ sym, size = 32, letter }: { sym: string; size?: number; letter?: string }) {
  const c = useColors();
  const col = COINS[sym]?.col ?? c.acT;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.s2,
        borderWidth: 1,
        borderColor: c.s3,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Txt size={Math.round(size * 0.4)} weight={700} color={col}>
        {letter ?? sym[0]}
      </Txt>
    </View>
  );
}

export type KV = { k: string; v: string; c?: string; mono?: boolean };

/** Key/value lines (13px, key muted, value 500). */
export function Rows({ rows, gap = 8, size = 13, keyColor }: { rows: KV[]; gap?: number; size?: number; keyColor?: string }) {
  const c = useColors();
  return (
    <View style={{ gap }}>
      {rows.map((r) => (
        <View key={r.k} style={styles.row}>
          <Txt size={size} color={keyColor ?? c.t3}>
            {r.k}
          </Txt>
          <Txt size={size} weight={500} mono={r.mono} color={r.c ?? c.t1} align="right" style={{ flexShrink: 1 }}>
            {r.v}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Rows inside a filled panel (sheet summaries). */
export function RowsPanel({ rows, size = 13, keyColor }: { rows: KV[]; size?: number; keyColor?: string }) {
  const c = useColors();
  return (
    <View style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.s2 }}>
      <Rows rows={rows} gap={10} size={size} keyColor={keyColor} />
    </View>
  );
}

/** Warning callout (warn tint). */
export function Notice({ children, tone = 'warn', size = 13 }: { children: React.ReactNode; tone?: 'warn' | 'danger'; size?: number }) {
  const c = useColors();
  const col = tone === 'warn' ? c.warn : c.dn;
  return (
    <View style={{ paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: tint(col, 40), backgroundColor: tint(col, 10) }}>
      <Txt size={size} color={col} lh={1.4}>
        {children}
      </Txt>
    </View>
  );
}

/** Small tag pill, e.g. "Perp", "HIGH RISK", "Limit / Buy". */
export function Tag({ label, color, bg, size = 11, mono, style }: { label: string; color: string; bg: string; size?: number; mono?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: bg }, style]}>
      <Txt size={size} weight={600} color={color} mono={mono}>
        {label}
      </Txt>
    </View>
  );
}

/** Disclaimer footnote (11px, centered). */
export function Footnote({ children, align = 'center' }: { children: React.ReactNode; align?: 'center' | 'left' }) {
  const c = useColors();
  return (
    <Txt size={11} lh={1.5} color={c.t3} align={align}>
      {children}
    </Txt>
  );
}

const pulse = { from: { opacity: 1 }, to: { opacity: 0.45 } };

/** Pulsing skeleton block. */
export function Skel({ w, h, r = 4, tone = 's2', style }: { w?: number | `${number}%`; h: number; r?: number; tone?: 's2' | 'hair' | 's1'; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: c[tone],
          animationName: pulse,
          animationDuration: 650,
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationTimingFunction: 'ease-in-out',
        },
        style,
      ]}
    />
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  return <View style={[{ height: 1, backgroundColor: c.hair }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
});
