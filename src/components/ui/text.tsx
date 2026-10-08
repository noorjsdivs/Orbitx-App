import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { fontFamily, type FontWeight } from '@/theme/fonts';

export type TxtProps = TextProps & {
  size?: number;
  weight?: FontWeight;
  color?: string;
  mono?: boolean;
  /** Letter spacing in em, like the design's CSS (`-0.02` → -0.02em). */
  ls?: number;
  /** Line height as a multiplier of size. */
  lh?: number;
  align?: TextStyle['textAlign'];
  upper?: boolean;
};

/** Geist text with tabular numerals by default, matching `font-variant-numeric: tabular-nums`. */
export function Txt({ size = 14, weight = 400, color, mono, ls, lh, align, upper, style, ...rest }: TxtProps) {
  const c = useColors();
  return (
    <RNText
      allowFontScaling={false}
      {...rest}
      style={[
        {
          fontFamily: fontFamily(weight, mono),
          fontSize: size,
          color: color ?? c.t1,
          fontVariant: ['tabular-nums'],
          letterSpacing: ls != null ? ls * size : undefined,
          lineHeight: lh != null ? Math.round(lh * size) : undefined,
          textAlign: align,
          textTransform: upper ? 'uppercase' : undefined,
        },
        style,
      ]}
    />
  );
}

/** Mono eyebrow label used for section headers (e.g. "SECURITY"). */
export function Eyebrow({ children, color, size = 11, ls = 0.1, style }: { children: React.ReactNode; color?: string; size?: number; ls?: number; style?: TextStyle }) {
  const c = useColors();
  return (
    <Txt mono size={size} ls={ls} color={color ?? c.t3} style={style}>
      {children}
    </Txt>
  );
}
