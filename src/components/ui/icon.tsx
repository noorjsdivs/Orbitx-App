import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useColors } from '@/hooks/use-theme';

type El = { d: string } | { c: [number, number, number] } | { r: [number, number, number, number, number] };

/** Stroke icons from the ORBITX design (24×24 grid). */
const ICONS = {
  back: [{ d: 'M15 6l-6 6 6 6' }],
  chevronRight: [{ d: 'M9 6l6 6-6 6' }],
  chevronDown: [{ d: 'M6 9l6 6 6-6' }],
  search: [{ c: [11, 11, 7] }, { d: 'M20 20l-3.5-3.5' }],
  bell: [{ d: 'M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z' }, { d: 'M10 20.5a2 2 0 0 0 4 0' }],
  eye: [{ d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' }, { c: [12, 12, 3] }],
  eyeOff: [{ d: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z' }, { d: 'M3 3l18 18' }],
  deposit: [{ d: 'M12 4v11M7 10l5 5 5-5M5 20h14' }],
  withdraw: [{ d: 'M12 15V4M7 9l5-5 5 5M5 20h14' }],
  transfer: [{ d: 'M4 8h15l-4-4M20 16H5l4 4' }],
  convert: [{ d: 'M19.5 10A8 8 0 0 0 5 7.5M4.5 14A8 8 0 0 0 19 16.5' }, { d: 'M5 3.5v4h4M19 20.5v-4h-4' }],
  star: [{ d: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z' }],
  candles: [{ d: 'M8 3v3M8 16v5M16 3v6M16 19v2' }, { r: [5, 6, 6, 10, 1] }, { r: [13, 9, 6, 10, 1] }],
  list: [{ d: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01' }],
  history: [{ d: 'M3 12a9 9 0 1 0 3-6.7L3 8' }, { d: 'M3 3v5h5M12 7v5l3 2' }],
  shieldCheck: [{ d: 'M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z' }, { d: 'M9 12l2 2 4-4' }],
  shield: [{ d: 'M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z' }],
  close: [{ d: 'M6 6l12 12M18 6L6 18' }],
  copy: [{ r: [8, 8, 12, 12, 2] }, { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' }],
  check: [{ d: 'M5 12l5 5 9-10' }],
  arrowRight: [{ d: 'M5 12h14M13 6l6 6-6 6' }],
  arrowDown: [{ d: 'M12 5v14M6 13l6 6 6-6' }],
  swap: [{ d: 'M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4' }],
  home: [{ d: 'M3.5 10.5L12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z' }],
  bars: [{ d: 'M5 20v-6M10 20V8M15 20v-9M20 20V4' }],
  trade: [{ d: 'M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7' }],
  wallet: [{ r: [3, 6, 18, 14, 3] }, { d: 'M6 6V5a2 2 0 0 1 2-2h9M16 13.5h2' }],
  p2p: [{ c: [8, 8, 3] }, { c: [16, 16, 3] }, { d: 'M14 6h4v4M10 18H6v-4' }],
  user: [{ c: [12, 8, 4] }, { d: 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6' }],
  lock: [{ r: [5, 11, 14, 10, 2] }, { d: 'M8 11V8a4 4 0 0 1 8 0v3' }],
  pencil: [{ d: 'M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z' }],
  grid: [{ r: [3.5, 3.5, 7, 7, 2] }, { r: [13.5, 3.5, 7, 7, 2] }, { r: [3.5, 13.5, 7, 7, 2] }, { r: [13.5, 13.5, 7, 7, 2] }],
  idCard: [{ r: [3, 5, 18, 14, 3] }, { c: [9, 11, 2] }, { d: 'M6 16c.8-1.4 1.9-2 3-2s2.2.6 3 2M14.5 10h4M14.5 14h3' }],
  doc: [{ r: [4, 3, 16, 18, 2] }, { d: 'M8 8h8M8 12h8M8 16h5' }],
} satisfies Record<string, El[]>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color, sw = 1.8, fill = 'none' }: { name: IconName; size?: number; color?: string; sw?: number; fill?: string }) {
  const c = useColors();
  const stroke = color ?? c.t1;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {(ICONS[name] as El[]).map((e, i) => {
        const common = { stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill };
        if ('d' in e) return <Path key={i} d={e.d} {...common} />;
        if ('c' in e) return <Circle key={i} cx={e.c[0]} cy={e.c[1]} r={e.c[2]} {...common} />;
        return <Rect key={i} x={e.r[0]} y={e.r[1]} width={e.r[2]} height={e.r[3]} rx={e.r[4]} {...common} />;
      })}
    </Svg>
  );
}

export function AppleLogo({ size = 18, color }: { size?: number; color?: string }) {
  const c = useColors();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color ?? c.t1}
        d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-2.99-.79-1.54.02-2.96.9-3.75 2.27-1.6 2.78-.41 6.89 1.15 9.14.76 1.1 1.67 2.34 2.86 2.29 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.77.74 2.98.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.41-3.65zM14.1 5.86c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z"
      />
    </Svg>
  );
}

export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </Svg>
  );
}
