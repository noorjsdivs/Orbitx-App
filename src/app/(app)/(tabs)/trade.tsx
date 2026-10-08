import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { AreaChart, CandleChart } from '@/components/charts';
import { Appear } from '@/components/layout/appear';
import { IconButton, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Checkbox, Chip, ChipRow, PillToggle, Seg } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { CoinGlyph, Notice, Skel } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { computeLite, lockLiteQuote } from '@/features/lite';
import { useListStatus } from '@/features/portfolio';
import { buildBook, computeTicket, setPercent, stepPrice, type BookView } from '@/features/spot';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { genCandles, linePath, liveCandles, type Timeframe } from '@/lib/chart';
import { compact, decimalInput, fmt, holdingDp, amountDp, pct, hms } from '@/lib/format';
import { useGuard, useTabNav } from '@/lib/nav';
import { useDrafts, type OrderType } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { usePrefs, type TradeMode } from '@/store/prefs';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { useWallet } from '@/store/wallet';
import { tint } from '@/theme/color';
import { fontFamily } from '@/theme/fonts';

function ModeHeader() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const goTab = useTabNav();
  const mode = usePrefs((s) => s.mode);
  const setMode = usePrefs((s) => s.setMode);
  const tab = (label: string, active: boolean, onPress?: () => void) => (
    <Press key={label} scale={1} onPress={onPress} style={{ height: 44, paddingHorizontal: 12, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: active ? c.ac : 'transparent' }}>
      <Txt size={15} weight={500} color={active ? c.t1 : c.t3}>
        {label}
      </Txt>
    </Press>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: c.hair }}>
      <View style={{ flexDirection: 'row' }}>
        {tab('Spot', true)}
        {tab('Futures', false, () => goTab('futures'))}
        {tab('Convert', false, guard('Sign up to convert', () => router.push('/convert')))}
        {tab('P2P', false, guard('Sign up to buy with P2P', () => router.push('/p2p')))}
      </View>
      <PillToggle<TradeMode>
        h={30}
        size={12}
        options={[
          { value: 'lite', label: 'Lite' },
          { value: 'pro', label: 'Pro' },
        ]}
        value={mode}
        onChange={setMode}
      />
    </View>
  );
}

// ─── Pro ────────────────────────────────────────────────────────────────────

function PairRow({ showChart, toggleChart }: { showChart: boolean; toggleChart: () => void }) {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const sym = useDrafts((s) => s.spot.pair);
  const q = useMarket((s) => s.prices[sym]);
  const favs = usePrefs((s) => s.favs);
  const toggleFav = usePrefs((s) => s.toggleFav);
  const fav = favs.includes(sym);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingRight: 4, paddingLeft: 16 }}>
      <Press scale={0.98} onPress={() => router.push('/sheets/pair')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 44 }}>
        <Txt size={20} weight={600} ls={-0.01}>
          {sym}/USDT
        </Txt>
        <Icon name="chevronDown" size={16} sw={2} color={c.t2} />
        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: tint(q.c >= 0 ? c.up : c.dn, 12) }}>
          <Txt size={13} weight={600} color={q.c >= 0 ? c.up : c.dn}>
            {pct(q.c)}
          </Txt>
        </View>
      </Press>
      <View style={{ flexDirection: 'row' }}>
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
        <IconButton name="candles" label="Toggle chart" color={showChart ? c.ac : c.t1} onPress={toggleChart} />
        <IconButton name="list" label="Order history" onPress={guard('Sign up to see your orders', () => router.push('/orders'))} />
      </View>
    </View>
  );
}

function ChartBlock() {
  const c = useColors();
  const sym = useDrafts((s) => s.spot.pair);
  const q = useMarket((s) => s.prices[sym]);
  const [tf, setTf] = useState<Timeframe>('1H');
  const co = COINS[sym];
  const live = q.p;
  const axisDp = live >= 1000 ? 1 : co.dp;
  const dirCol = q.dir < 0 ? c.dn : c.up;
  const h24 = Math.max(live, co.p * (1 + (Math.abs(co.c) / 100) * 0.45 + 0.006));
  const l24 = Math.min(live, co.p * (1 - (Math.abs(co.c) / 100) * 0.55 - 0.005));
  const candles = liveCandles(sym, tf, live);
  const stat = (k: string, v: string) => (
    <View key={k} style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
      <Txt size={11} color={c.t3}>
        {k}
      </Txt>
      <Txt size={11}>{v}</Txt>
    </View>
  );
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8, gap: 12 }}>
        <View style={{ gap: 2 }}>
          <Txt size={26} weight={600} ls={-0.02} color={dirCol}>
            {fmt(live, co.dp)}
          </Txt>
          <Txt size={12} color={c.t2}>
            ≈ ${fmt(live, co.dp)}
          </Txt>
        </View>
        <View style={{ gap: 3 }}>
          {stat('24h High', fmt(h24, co.dp))}
          {stat('24h Low', fmt(l24, co.dp))}
          {stat(`Vol (${sym})`, compact(co.v / live))}
          {stat('Vol (USDT)', compact(co.v))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 12 }}>
        {(['15m', '1H', '4H', '1D', '1W'] as Timeframe[]).map((t) => (
          <Press key={t} scale={1} onPress={() => setTf(t)} style={{ height: 36, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center', backgroundColor: tf === t ? c.s2 : 'transparent' }}>
            <Txt size={12} weight={500} color={tf === t ? c.t1 : c.t3}>
              {t}
            </Txt>
          </Press>
        ))}
        <View style={{ flex: 1 }} />
        <Txt size={11} color={c.t3} style={{ paddingRight: 4 }}>
          MA · VOL
        </Txt>
      </View>
      <View style={{ marginTop: 4, marginHorizontal: 16 }}>
        <CandleChart candles={candles} live={live} dirUp={q.dir >= 0} axisDp={axisDp} />
      </View>
    </View>
  );
}

function InputBox({ label, value, onChange, placeholder, center }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; center?: boolean }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: center ? 'center' : 'stretch', justifyContent: 'center', minWidth: 0 }}>
      <Txt size={10} color={c.t3}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(decimalInput(v))}
        keyboardType="decimal-pad"
        placeholder={placeholder}
        placeholderTextColor={c.placeholder}
        selectionColor={c.ac}
        style={{ alignSelf: 'stretch', padding: 0, color: c.t1, fontSize: 14, fontFamily: fontFamily(500), textAlign: center ? 'center' : 'left', fontVariant: ['tabular-nums'] }}
      />
    </View>
  );
}

function TicketPanel() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const guest = useSession((s) => s.status === 'guest');
  const spot = useDrafts((s) => s.spot);
  const patch = useDrafts((s) => s.patch);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const T = computeTicket(spot, prices, bal);
  const sym = spot.pair;
  const dp = COINS[sym].dp;
  const sideCol = T.isBuy ? c.up : c.dn;
  const showErr = !!T.err && (T.amtN > 0 || T.err.startsWith('Enter'));
  const info: [string, string][] = [
    ['Total', `${fmt(T.totalN, 2)} USDT`],
    ['Avbl', guest ? '0.00 USDT' : T.isBuy ? `${fmt(T.avblN, 2)} USDT` : `${fmt(T.avblN, T.ad)} ${sym}`],
    [T.isBuy ? 'Max buy' : 'Max sell', guest ? '--' : `${T.isBuy ? (T.priceN > 0 ? fmt(T.avblN / (T.priceN * 1.001), T.ad) : '--') : fmt(T.avblN, T.ad)} ${sym}`],
    ['Est. fee', `${spot.otype === 'market' ? '0.10%' : '0.08–0.10%'} · ${fmt(T.feeN, 2)}`],
  ];
  if (spot.otype === 'market') info.push(['Max slippage', '0.05%']);

  return (
    <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
      <Seg
        options={[
          { value: 'buy', label: 'Buy', activeBg: c.up },
          { value: 'sell', label: 'Sell', activeBg: c.dn },
        ]}
        value={spot.side}
        onChange={(v) => patch('spot', { side: v, amtIn: '', pct: 0 })}
        radius={10}
      />
      <View style={{ flexDirection: 'row', gap: 2, marginTop: -4 }}>
        {(
          [
            ['limit', 'Limit'],
            ['market', 'Market'],
            ['stop', 'Stop-limit'],
          ] as [OrderType, string][]
        ).map(([k, l]) => (
          <Press key={k} scale={1} onPress={() => patch('spot', { otype: k, priceIn: (parseFloat(spot.priceIn) || T.live).toFixed(dp) })} style={{ height: 40, paddingHorizontal: 6, justifyContent: 'center' }}>
            <Txt size={13} weight={500} color={spot.otype === k ? c.t1 : c.t3} numberOfLines={1}>
              {l}
            </Txt>
          </Press>
        ))}
      </View>
      {spot.otype === 'stop' && (
        <View style={{ height: 44, borderRadius: 10, backgroundColor: c.s2, paddingHorizontal: 12, justifyContent: 'center' }}>
          <InputBox label="Stop (USDT)" value={spot.stopIn} onChange={(v) => patch('spot', { stopIn: v })} placeholder="Trigger price" />
        </View>
      )}
      {spot.otype !== 'market' ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 10, backgroundColor: c.s2 }}>
          <Press accessibilityLabel="Decrease price" scale={0.9} onPress={() => stepPrice(-1)} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={18} color={c.t2}>
              −
            </Txt>
          </Press>
          <InputBox center label={spot.otype === 'stop' ? 'Limit (USDT)' : 'Price (USDT)'} value={spot.priceIn} onChange={(v) => patch('spot', { priceIn: v })} />
          <Press accessibilityLabel="Increase price" scale={0.9} onPress={() => stepPrice(1)} style={{ width: 34, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={18} color={c.t2}>
              +
            </Txt>
          </Press>
        </View>
      ) : (
        <View style={{ height: 44, borderRadius: 10, backgroundColor: c.s1, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s3, alignItems: 'center', justifyContent: 'center' }}>
          <Txt size={13} color={c.t3}>
            Market price
          </Txt>
        </View>
      )}
      <View style={{ height: 44, borderRadius: 10, backgroundColor: c.s2, paddingHorizontal: 12, justifyContent: 'center' }}>
        <InputBox label={`Amount (${sym})`} value={spot.amtIn} onChange={(v) => patch('spot', { amtIn: v, pct: 0 })} placeholder="0" />
      </View>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: -4 }}>
        {[25, 50, 75, 100].map((v) => (
          <Press key={v} scale={1} onPress={() => setPercent(v)} style={{ flex: 1, height: 36, justifyContent: 'center', gap: 5 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: spot.pct >= v ? sideCol : c.s3 }} />
            <Txt size={11} color={spot.pct >= v ? c.t1 : c.t3}>
              {v}%
            </Txt>
          </Press>
        ))}
      </View>
      <View style={{ gap: 5 }}>
        {info.map(([k, v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
            <Txt size={12} color={c.t3}>
              {k}
            </Txt>
            <Txt size={12} numberOfLines={1} style={{ flexShrink: 1 }}>
              {v}
            </Txt>
          </View>
        ))}
      </View>
      {showErr && !guest && (
        <Txt size={12} lh={1.35} color={c.warn}>
          {T.err}
        </Txt>
      )}
      <Button
        h={44}
        variant={T.isBuy ? 'buy' : 'sell'}
        label={guest ? 'Sign up to trade' : `${T.isBuy ? 'Buy' : 'Sell'} ${sym}`}
        dim={!guest && !T.ok}
        onPress={guard('Create an account to place orders', () => {
          if (T.ok) router.push('/sheets/order-confirm');
          else haptic.warn();
        })}
      />
    </View>
  );
}

function OrderBook() {
  const c = useColors();
  const sym = useDrafts((s) => s.spot.pair);
  const otype = useDrafts((s) => s.spot.otype);
  const patch = useDrafts((s) => s.patch);
  const q = useMarket((s) => s.prices[sym]);
  const tick = useMarket((s) => s.tick);
  const [view, setView] = useState<BookView>('both');
  const co = COINS[sym];
  const ad = amountDp(q.p);
  const book = buildBook(sym, q.p, tick, view);
  const dirCol = q.dir < 0 ? c.dn : c.up;
  const row = (x: { p: number; a: number; cum: number }, col: string, key: string) => (
    <Press
      key={key}
      scale={1}
      onPress={() => {
        haptic.tap();
        patch('spot', { priceIn: x.p.toFixed(co.dp), otype: otype === 'market' ? 'limit' : otype });
      }}
      style={{ height: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ position: 'absolute', right: 0, top: 1, bottom: 1, width: `${(x.cum / book.maxCum) * 100}%`, backgroundColor: tint(col, 12) }} />
      <Txt size={11.5} color={col}>
        {fmt(x.p, co.dp)}
      </Txt>
      <Txt size={11.5} color={c.t2}>
        {fmt(x.a, ad)}
      </Txt>
    </Press>
  );
  return (
    <View style={{ width: 142 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 22, alignItems: 'center' }}>
        <Txt size={10} color={c.t3}>
          Price (USDT)
        </Txt>
        <Txt size={10} color={c.t3}>
          Amt ({sym})
        </Txt>
      </View>
      {book.asks.map((x, i) => row(x, c.dn, 'a' + i))}
      <View style={{ paddingVertical: 6 }}>
        <Txt size={16} weight={600} color={dirCol} numberOfLines={1}>
          {fmt(q.p, co.dp)}
        </Txt>
        <Txt size={11} color={c.t3} numberOfLines={1}>
          ≈ ${fmt(q.p, co.dp)}
        </Txt>
      </View>
      {book.bids.map((x, i) => row(x, c.up, 'b' + i))}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <Txt size={10} color={c.up}>
          B {book.bidPct.toFixed(1)}%
        </Txt>
        <View style={{ flex: 1, height: 4, flexDirection: 'row', borderRadius: 2, overflow: 'hidden', gap: 1 }}>
          <View style={{ width: `${book.bidPct}%`, backgroundColor: c.up }} />
          <View style={{ flex: 1, backgroundColor: c.dn }} />
        </View>
        <Txt size={10} color={c.dn}>
          {(100 - book.bidPct).toFixed(1)}% S
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <View style={{ backgroundColor: c.s2, borderRadius: 6, paddingVertical: 4, paddingHorizontal: 6 }}>
          <Txt size={11} color={c.t2}>
            {fmt(book.step, co.dp)}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {(
            [
              ['both', c.dn, c.up],
              ['bids', c.up, c.up],
              ['asks', c.dn, c.dn],
            ] as [BookView, string, string][]
          ).map(([k, a, b]) => (
            <Press key={k} accessibilityLabel={`Book view ${k}`} scale={0.9} onPress={() => setView(k)} style={{ width: 28, height: 40, alignItems: 'center', justifyContent: 'center', gap: 2, opacity: view === k ? 1 : 0.4 }}>
              <View style={{ width: 14, height: 6, borderRadius: 1, backgroundColor: a }} />
              <View style={{ width: 14, height: 6, borderRadius: 1, backgroundColor: b }} />
            </Press>
          ))}
        </View>
      </View>
    </View>
  );
}

function OrdersPanel() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const guest = useSession((s) => s.status === 'guest');
  const sym = useDrafts((s) => s.spot.pair);
  const prices = useMarket((s) => s.prices);
  const retry = useMarket((s) => s.retry);
  const { orders, bal, cancelOrder, set } = useWallet();
  const [tab, setTab] = useState<'open' | 'hold'>('open');
  const [hideOther, setHideOther] = useState(false);
  const visible = guest ? [] : hideOther ? orders.filter((o) => o.sym === sym) : orders;
  const st = useListStatus(visible.length);

  const tabBtn = (k: 'open' | 'hold', label: string) => (
    <Press key={k} scale={1} onPress={() => setTab(k)} style={{ height: 44, paddingHorizontal: 12, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: tab === k ? c.ac : 'transparent' }}>
      <Txt size={14} weight={500} color={tab === k ? c.t1 : c.t3}>
        {label}
      </Txt>
    </Press>
  );

  return (
    <View style={{ marginTop: 16, borderTopWidth: 8, borderTopColor: c.s1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: c.hair }}>
        <View style={{ flexDirection: 'row' }}>
          {tabBtn('open', `Open orders (${guest ? 0 : orders.length})`)}
          {tabBtn('hold', 'Holdings')}
        </View>
        <Press scale={1} onPress={guard('Sign up to see your orders', () => router.push('/orders'))} style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
          <Txt size={13} color={c.t2}>
            History
          </Txt>
        </Press>
      </View>
      {tab === 'open' ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 16 }}>
            <Press scale={1} onPress={() => setHideOther(!hideOther)} accessibilityRole="checkbox" accessibilityState={{ checked: hideOther }} style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8 }}>
              <Checkbox checked={hideOther} />
              <Txt size={12} color={c.t2}>
                Hide other pairs
              </Txt>
            </Press>
            <Press
              scale={1}
              onPress={() => {
                if (!visible.length) return;
                const ids = new Set(visible.map((x) => x.id));
                const time = hms();
                set((s) => ({ orders: s.orders.filter((y) => !ids.has(y.id)), canceled: [...visible.map((x) => ({ ...x, time })), ...s.canceled] }));
                haptic.impact();
                toast(`${ids.size} order${ids.size > 1 ? 's' : ''} canceled`);
              }}
              style={{ height: 44, justifyContent: 'center' }}>
              <Txt size={12} weight={500}>
                Cancel all
              </Txt>
            </Press>
          </View>
          {st === 'loading' &&
            [1, 2, 3].map((i) => (
              <View key={i} style={{ paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}>
                <Skel w={120} h={12} />
                <Skel w={240} h={10} tone="hair" />
              </View>
            ))}
          {st === 'error' && (
            <View style={{ paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', gap: 8 }}>
              <Txt size={14} weight={600}>
                {"Couldn't load open orders"}
              </Txt>
              <Txt size={12} color={c.t2}>
                Your orders are still live on the book.
              </Txt>
              <Button label="Retry" variant="secondary" h={44} size={13} onPress={retry} />
            </View>
          )}
          {st === 'empty' && (
            <View style={{ paddingVertical: 28, paddingHorizontal: 16, alignItems: 'center', gap: 6 }}>
              <Icon name="doc" size={28} sw={1.5} color={c.t3} />
              <Txt size={14} weight={600}>
                No open orders
              </Txt>
              <Txt size={12} color={c.t2} align="center">
                Limit and stop-limit orders waiting to fill appear here.
              </Txt>
            </View>
          )}
          {st === 'ok' &&
            visible.map((o) => {
              const ddp = COINS[o.sym].dp;
              const xad = amountDp(prices[o.sym].p);
              const sc = o.side === 'buy' ? c.up : c.dn;
              return (
                <View key={o.id} style={{ paddingTop: 8, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.hair, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Txt size={15} weight={600}>
                        {o.sym}/USDT
                      </Txt>
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tint(sc, 14) }}>
                        <Txt size={11} weight={600} color={sc}>
                          {o.type} / {o.side === 'buy' ? 'Buy' : 'Sell'}
                        </Txt>
                      </View>
                    </View>
                    <Press
                      scale={0.95}
                      onPress={() => {
                        cancelOrder(o.id, hms());
                        haptic.impact();
                        toast(`Order canceled · ${o.sym}/USDT ${o.type} ${o.side}`);
                      }}
                      style={{ height: 44, justifyContent: 'center' }}>
                      <View style={{ height: 30, paddingHorizontal: 12, borderRadius: 8, backgroundColor: c.s2, justifyContent: 'center' }}>
                        <Txt size={12} weight={600}>
                          Cancel
                        </Txt>
                      </View>
                    </Press>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {[
                      ['Filled / Amount', `${fmt(0, xad)} / ${fmt(o.amt, xad)}`, 1.2],
                      ['Price', fmt(o.price, ddp), 1],
                      ['Trigger', o.stop ? `≤ ${fmt(o.stop, ddp)}` : '--', 1],
                    ].map(([k, v, f], i) => (
                      <View key={k as string} style={{ flex: f as number, gap: 2, alignItems: i === 2 ? 'flex-end' : 'flex-start' }}>
                        <Txt size={12} color={c.t3}>
                          {k}
                        </Txt>
                        <Txt size={12}>{v}</Txt>
                      </View>
                    ))}
                  </View>
                  <Txt mono size={11} color={c.t3}>
                    {o.time}
                  </Txt>
                </View>
              );
            })}
        </View>
      ) : (
        [sym, 'USDT'].map((k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: c.hair }}>
            <CoinGlyph sym={k} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={15} weight={600}>
                {k}
              </Txt>
              <Txt size={12} color={c.t3}>
                Available
              </Txt>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Txt size={15} weight={500}>
                {fmt(guest ? 0 : (bal[k] ?? 0), holdingDp(k, prices[k].p))}
              </Txt>
              <Txt size={12} color={c.t3}>
                ≈ {fmt(guest ? 0 : (bal[k] ?? 0) * prices[k].p, 2)} USDT
              </Txt>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function ProView() {
  const c = useColors();
  const [showChart, setShowChart] = useState(true);
  const sym = useDrafts((s) => s.spot.pair);
  const q = useMarket((s) => s.prices[sym]);
  return (
    <View style={{ paddingBottom: 16 }}>
      <PairRow showChart={showChart} toggleChart={() => setShowChart(!showChart)} />
      {showChart ? (
        <ChartBlock />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
          <Txt size={22} weight={600} color={q.dir < 0 ? c.dn : c.up}>
            {fmt(q.p, COINS[sym].dp)}
          </Txt>
          <Txt size={12} color={c.t2}>
            ≈ ${fmt(q.p, COINS[sym].dp)}
          </Txt>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 12, paddingTop: 12, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.hair, marginTop: 8 }}>
        <TicketPanel />
        <OrderBook />
      </View>
      <OrdersPanel />
    </View>
  );
}

// ─── Lite ───────────────────────────────────────────────────────────────────

function LiteView() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const guest = useSession((s) => s.status === 'guest');
  const sym = useDrafts((s) => s.spot.pair);
  const lite = useDrafts((s) => s.lite);
  const patch = useDrafts((s) => s.patch);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const setMode = usePrefs((s) => s.setMode);
  const co = COINS[sym];
  const q = prices[sym];
  const t = computeLite(lite, sym, prices, guest ? {} : bal);
  const closes = genCandles(sym, '15m', q.p).map((k) => k.c);
  closes[closes.length - 1] = q.p;
  const chart = linePath(closes, 358, 180);
  const presets = t.lb ? [50, 100, 250, 500] : [25, 50, 75, 100];

  return (
    <View style={{ gap: 14, paddingVertical: 8 }}>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <Press scale={0.98} onPress={() => router.push('/sheets/pair')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, alignSelf: 'flex-start' }}>
          <CoinGlyph sym={sym} />
          <Txt size={17} weight={600}>
            {co.n}
          </Txt>
          <Icon name="chevronDown" size={16} sw={2} color={c.t3} />
        </Press>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <Txt size={40} weight={600} ls={-0.035}>
            {fmt(q.p, co.dp)}
          </Txt>
          <Txt size={14} weight={600} color={q.c >= 0 ? c.up : c.dn}>
            {pct(q.c)}
          </Txt>
        </View>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <AreaChart line={chart.line} area={chart.area} color={chart.up ? c.up : c.dn} height={90} />
      </Appear>
      <Appear i={2} style={{ marginHorizontal: 16 }}>
        <Seg
          h={46}
          options={[
            { value: 'buy', label: 'Buy', activeBg: c.up },
            { value: 'sell', label: 'Sell', activeBg: c.dn },
          ]}
          value={lite.side}
          onChange={(v) => patch('lite', { side: v, amt: '' })}
          size={15}
        />
      </Appear>
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <View style={{ padding: 16, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt size={13} color={c.t3}>
              {t.lb ? 'You spend' : 'You sell'}
            </Txt>
            <Txt size={13} color={c.t3}>
              Avbl {fmt(t.avbl, t.lb ? 2 : t.ad)} {t.lb ? 'USDT' : sym}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <TextInput
              value={lite.amt}
              onChangeText={(v) => patch('lite', { amt: decimalInput(v) })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={c.placeholder}
              selectionColor={c.ac}
              style={{ flex: 1, minWidth: 0, padding: 0, color: c.t1, fontSize: 34, fontFamily: fontFamily(600), letterSpacing: -1 }}
            />
            <Txt size={15} weight={600} color={c.t2}>
              {t.lb ? 'USDT' : sym}
            </Txt>
          </View>
          <Txt size={13} color={c.t2}>
            You get ≈{' '}
            <Txt size={13} weight={600}>
              {t.la > 0 ? fmt(t.get, t.lb ? t.ad : 2) : '0'} {t.lb ? sym : 'USDT'}
            </Txt>
          </Txt>
          <ChipRow>
            {presets.map((v) => (
              <Chip
                key={v}
                label={t.lb ? `${v} USDT` : `${v}%`}
                onPress={() => {
                  haptic.tap();
                  patch('lite', { amt: t.lb ? String(v) : String(+(((bal[sym] ?? 0) * v) / 100).toFixed(t.ad)) });
                }}
              />
            ))}
          </ChipRow>
        </View>
      </Appear>
      <Appear i={4} style={{ marginHorizontal: 16, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.t3}>
            Price
          </Txt>
          <Txt size={13}>≈ {fmt(q.p, co.dp)} USDT</Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.t3}>
            Fee (0.10%)
          </Txt>
          <Txt size={13}>{fmt(t.fee, 2)} USDT</Txt>
        </View>
      </Appear>
      <Appear i={5} style={{ marginHorizontal: 16, gap: 10 }}>
        {!!t.err && <Notice>{t.err}</Notice>}
        <Button
          label={guest ? 'Sign up to trade' : `${t.lb ? 'Buy' : 'Sell'} ${sym}`}
          dim={!guest && !t.ok}
          onPress={guard('Create an account to place orders', () => {
            if (!t.ok) return haptic.warn();
            lockLiteQuote();
            router.push('/sheets/lite');
          })}
        />
        <Press scale={1} onPress={() => setMode('pro')} style={{ alignSelf: 'center', height: 40, justifyContent: 'center' }}>
          <Txt size={13} color={c.t2}>
            Need limit or stop orders?{' '}
            <Txt size={13} weight={600} color={c.acT}>
              Switch to Pro
            </Txt>
          </Txt>
        </Press>
      </Appear>
    </View>
  );
}

export default function Trade() {
  const mode = usePrefs((s) => s.mode);
  return (
    <Screen replayKey={mode}>
      <ModeHeader />
      {mode === 'lite' ? <LiteView /> : <ProView />}
    </Screen>
  );
}
