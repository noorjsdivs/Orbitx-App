import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Line, Path, Polyline, Rect } from 'react-native-svg';

import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import type { Candle } from '@/lib/chart';
import { fmt } from '@/lib/format';
import { tint } from '@/theme/color';

export function Sparkline({ points, color, height = 24 }: { points: string; color: string; height?: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 64 24" preserveAspectRatio="none">
      <Polyline points={points} stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill="none" vectorEffect="non-scaling-stroke" />
    </Svg>
  );
}

/** Line + soft area fill, drawn in a 358×190 viewBox stretched to the given height. */
export function AreaChart({ line, area, color, height }: { line: string; area: string; color: string; height: number }) {
  return (
    <Svg width="100%" height={height} viewBox="0 0 358 190" preserveAspectRatio="none">
      <Path d={area} fill={tint(color, 14)} />
      <Path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </Svg>
  );
}

/** Candlesticks with volume, a right price axis and a live price tag. */
export function CandleChart({ candles, live, dirUp, axisDp, height = 168 }: { candles: Candle[]; live: number; dirUp: boolean; axisDp: number; height?: number }) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const W = Math.max(0, width - 54);
  const CH = 132;
  let mn = Infinity;
  let mx = -Infinity;
  for (const k of candles) {
    mn = Math.min(mn, k.l);
    mx = Math.max(mx, k.h);
  }
  const pad = (mx - mn) * 0.08;
  mn -= pad;
  mx += pad;
  const Y = (v: number) => ((mx - v) / (mx - mn)) * CH;
  const cw = W / candles.length;
  const bw = Math.max(2, cw - 2.4);
  const dirCol = dirUp ? c.up : c.dn;
  const axis = [0.1, 0.37, 0.63, 0.9].map((f) => mx - (mx - mn) * f);
  return (
    <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <>
          <Svg width={width} height={height} style={{ position: 'absolute' }}>
            {axis.map((v, i) => (
              <Line key={i} x1={0} x2={W} y1={Y(v)} y2={Y(v)} stroke={c.hair} strokeWidth={1} />
            ))}
            {candles.map((k, i) => {
              const col = k.c >= k.o ? c.up : c.dn;
              const x = i * cw + 1.2;
              return <Rect key={'v' + i} x={x} y={height - (3 + k.v * 18)} width={bw} height={3 + k.v * 18} fill={col} opacity={0.28} />;
            })}
            {candles.map((k, i) => {
              const col = k.c >= k.o ? c.up : c.dn;
              const x = i * cw + 1.2;
              return <Rect key={'w' + i} x={x + bw / 2 - 0.5} y={Y(k.h)} width={1} height={Math.max(1, Y(k.l) - Y(k.h))} fill={col} />;
            })}
            {candles.map((k, i) => {
              const col = k.c >= k.o ? c.up : c.dn;
              const x = i * cw + 1.2;
              return <Rect key={'b' + i} x={x} y={Y(Math.max(k.o, k.c))} width={bw} height={Math.max(1, Math.abs(Y(k.o) - Y(k.c)))} rx={1} fill={col} />;
            })}
            <Line x1={0} x2={W} y1={Y(live)} y2={Y(live)} stroke={dirCol} strokeWidth={1} strokeDasharray="3,3" opacity={0.8} />
          </Svg>
          {axis.map((v, i) => (
            <Txt key={i} size={10} color={c.t3} style={{ position: 'absolute', left: W + 6, top: Y(v) - 7 }}>
              {fmt(v, axisDp)}
            </Txt>
          ))}
          <View style={{ position: 'absolute', left: W + 2, top: Y(live) - 9, height: 18, paddingHorizontal: 4, backgroundColor: dirCol, borderRadius: 4, justifyContent: 'center' }}>
            <Txt size={10} weight={600} color="#FFFFFF">
              {fmt(live, axisDp)}
            </Txt>
          </View>
        </>
      )}
    </View>
  );
}
