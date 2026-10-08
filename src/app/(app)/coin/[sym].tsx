import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AreaChart } from '@/components/charts';
import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { FlashPrice } from '@/components/motion/flash-price';
import { fadeIn } from '@/components/motion/presets';
import { Button } from '@/components/ui/button';
import { Seg } from '@/components/ui/controls';
import { Card, CoinGlyph, Footnote } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { ABOUT, ATH, COINS, MARKET_CAP, RANK, SUPPLY } from '@/data/market';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { genCandles, linePath, type Timeframe } from '@/lib/chart';
import { compact, fmt, pct } from '@/lib/format';
import { useGuard, useTabNav } from '@/lib/nav';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';

type Range = '1D' | '1W' | '1M' | '1Y';
const TF: Record<Range, Timeframe> = { '1D': '15m', '1W': '1H', '1M': '4H', '1Y': '1W' };

export default function CoinDetail() {
  const c = useColors();
  const guard = useGuard();
  const goTab = useTabNav();
  const { sym: raw } = useLocalSearchParams<{ sym: string }>();
  const sym = raw && COINS[raw] ? raw : 'BTC';
  const co = COINS[sym];
  const q = useMarket((s) => s.prices[sym]);
  const favs = usePrefs((s) => s.favs);
  const toggleFav = usePrefs((s) => s.toggleFav);
  const setMode = usePrefs((s) => s.setMode);
  const selectPair = useDrafts((s) => s.selectPair);
  const patch = useDrafts((s) => s.patch);
  const setWallet = useWallet((s) => s.set);
  const [range, setRange] = useState<Range>('1D');
  const fav = favs.includes(sym);

  const closes = genCandles(sym, TF[range], q.p).map((k) => k.c);
  closes[closes.length - 1] = q.p;
  const ch = linePath(closes, 358, 180);
  const chgAbs = Math.abs((q.p * q.c) / (100 + q.c));
  const h24 = Math.max(q.p, co.p * (1 + (Math.abs(co.c) / 100) * 0.45 + 0.006));
  const l24 = Math.min(q.p, co.p * (1 - (Math.abs(co.c) / 100) * 0.55 - 0.005));
  const stats: [string, string][] = [
    ['Market cap', MARKET_CAP[sym] ?? '$' + compact(co.v * 9.3)],
    ['24h volume', '$' + compact(co.v)],
    ['24h high', fmt(h24, co.dp)],
    ['24h low', fmt(l24, co.dp)],
    ['Circulating supply', SUPPLY[sym] ?? '—'],
    ['All-time high', ATH[sym] ?? '—'],
  ];

  const trade = (side: 'buy' | 'sell') => {
    selectPair(sym, q.p);
    patch('spot', { side });
    setMode('pro');
    goTab('trade');
  };

  return (
    <Screen
      gap={14}
      top={
        <Header
          title={
            <Txt size={18} weight={600} numberOfLines={1}>
              {sym}
              <Txt size={18} color={c.t3}>
                /USDT
              </Txt>
            </Txt>
          }
          right={
            <>
              <IconButton
                name="bell"
                label="Set price alert"
                onPress={guard('Sign up to set price alerts', () => {
                  setWallet((s) => ({ alerts: [{ id: uid(), sym, cond: 'above', price: q.p * 1.05, on: true }, ...s.alerts] }));
                  haptic.success();
                  toast(`Alert set · ${sym} above ${fmt(q.p * 1.05, co.dp)}`);
                })}
              />
              <IconButton
                name="star"
                label="Favorite"
                color={fav ? c.warn : c.t1}
                fill={fav ? c.warn : 'none'}
                onPress={() => {
                  haptic.tap();
                  const added = toggleFav(sym);
                  toast(added ? `${sym}/USDT added to favorites` : `${sym}/USDT removed from favorites`);
                }}
              />
            </>
          }
        />
      }>
      <Appear i={0} style={{ marginHorizontal: 16, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CoinGlyph sym={sym} size={28} />
          <Txt size={14} color={c.t2}>
            {co.n}
          </Txt>
          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: c.line }}>
            <Txt mono size={11} color={c.t3}>
              #{RANK[sym] ?? '—'}
            </Txt>
          </View>
        </View>
        <FlashPrice value={q.p} dir={q.dir} size={36} weight={600} ls={-0.03} color={q.dir < 0 ? c.dn : c.t1} containerStyle={{ alignSelf: 'flex-start' }}>
          {fmt(q.p, co.dp)}
        </FlashPrice>
        <Txt size={14} weight={500} color={q.c >= 0 ? c.up : c.dn}>
          {q.c >= 0 ? '+' : '-'}
          {fmt(chgAbs, co.dp)} ({pct(q.c)}){' '}
          <Txt size={14} color={c.t3}>
            24h
          </Txt>
        </Txt>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <Animated.View key={range} entering={fadeIn}>
          <AreaChart line={ch.line} area={ch.area} color={ch.up ? c.up : c.dn} height={190} />
          <Txt size={11} color={c.t3} style={{ position: 'absolute', right: 0, top: 0 }}>
            H {fmt(ch.mx, co.dp)}
          </Txt>
          <Txt size={11} color={c.t3} style={{ position: 'absolute', left: 0, bottom: 0 }}>
            L {fmt(ch.mn, co.dp)}
          </Txt>
        </Animated.View>
        <View style={{ marginTop: 12 }}>
          <Seg<Range> h={42} size={13} options={(['1D', '1W', '1M', '1Y'] as Range[]).map((r) => ({ value: r, label: r }))} value={range} onChange={setRange} />
        </View>
      </Appear>
      <Appear i={2} style={{ marginHorizontal: 16 }}>
        <Card>
          <Txt size={15} weight={600}>
            Market stats
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 }}>
            {stats.map(([k, v]) => (
              <View key={k} style={{ width: '50%', gap: 3, paddingRight: 12 }}>
                <Txt size={12} color={c.t3}>
                  {k}
                </Txt>
                <Txt size={14} weight={600}>
                  {v}
                </Txt>
              </View>
            ))}
          </View>
        </Card>
      </Appear>
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Card>
          <Txt size={15} weight={600}>
            About {co.n}
          </Txt>
          <Txt size={13} lh={1.55} color={c.t2}>
            {ABOUT[sym] ?? `${co.n} is listed on ORBITX spot markets. Read the project documentation and understand the risks before trading.`}
          </Txt>
        </Card>
      </Appear>
      <Appear i={4} style={{ marginHorizontal: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button variant="buy" label="Buy" onPress={() => trade('buy')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="sell" label="Sell" onPress={() => trade('sell')} />
          </View>
        </View>
        <Footnote>Crypto prices are volatile. Past performance does not indicate future results.</Footnote>
      </Appear>
    </Screen>
  );
}
