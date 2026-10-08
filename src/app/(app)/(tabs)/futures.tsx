import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Chip, ChipRow, Seg, UnderlineTabs } from '@/components/ui/controls';
import { Field } from '@/components/ui/field';
import { Card, Footnote, Notice, Rows } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { MMR, positionStats, usePortfolio } from '@/features/portfolio';
import { haptic } from '@/hooks/use-haptics';
import { useNow } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { clock, decimalInput, fmt, num, pct } from '@/lib/format';
import { useGuard } from '@/lib/nav';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';
import { tint } from '@/theme/color';

/** Seconds until the next 8-hourly funding (00/08/16 UTC). */
function fundingLeft(now: number) {
  const d = new Date(now);
  const nh = (Math.floor(d.getUTCHours() / 8) + 1) * 8;
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), nh);
  return Math.max(0, Math.floor((next - now) / 1000));
}

export default function Futures() {
  const c = useColors();
  const guard = useGuard();
  const now = useNow(1000);
  const btc = useMarket((s) => s.prices.BTC);
  const { futAvail, positions, prices } = usePortfolio();
  const setWallet = useWallet((s) => s.set);
  const [mode, setMode] = useState<'cross' | 'isolated'>('cross');
  const [lev, setLev] = useState(10);
  const [type, setType] = useState<'market' | 'limit'>('market');
  const [size, setSize] = useState('');
  const [limit, setLimit] = useState('');

  const fp = btc.p;
  const sz = num(size);
  const ent = type === 'limit' ? num(limit) || fp : fp;
  const liqL = ent * (1 - 1 / lev + MMR);
  const liqS = ent * (1 + 1 / lev - MMR);
  const marg = sz / lev;
  const fee = sz * 0.0005;
  let err = '';
  if (sz > 0 && marg + fee > futAvail) err = `Margin required exceeds your available ${fmt(futAvail, 2)} USDT.`;
  else if (sz > 0 && sz < 5) err = 'Minimum position size is 5 USDT.';

  const open = (side: 'long' | 'short') =>
    guard('Sign up to trade Futures', () => {
      if (!(sz > 0) || err) {
        haptic.warn();
        toast(err || 'Enter a position size');
        return;
      }
      const qty = sz / ent;
      setWallet((s) => ({
        positions: [{ id: uid(), sym: 'BTC', side, lev, size: qty, entry: ent, mode: mode === 'cross' ? 'Cross' : 'Isolated' }, ...s.positions],
        futUsdt: s.futUsdt - fee,
      }));
      setSize('');
      haptic.success();
      toast(`${side === 'long' ? 'Long' : 'Short'} ${lev}x opened · ${fmt(qty, 4)} BTC at ${fmt(ent, 2)}`);
    });

  return (
    <Screen
      gap={14}
      top={
        <Header
          back={false}
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt size={18} weight={600}>
                BTCUSDT
              </Txt>
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: c.line }}>
                <Txt size={11} weight={500} color={c.t2}>
                  Perp
                </Txt>
              </View>
            </View>
          }
          right={
            <View style={{ paddingRight: 12, alignItems: 'flex-end' }}>
              <Txt size={12} color={c.t3} lh={1.35}>
                Funding <Txt size={12}>+0.0100%</Txt>
              </Txt>
              <Txt mono size={12} color={c.t3} lh={1.35}>
                {clock(fundingLeft(now))}
              </Txt>
            </View>
          }
        />
      }>
      <Appear i={0} style={{ marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View style={{ gap: 2 }}>
          <Txt size={30} weight={600} ls={-0.03} color={btc.dir < 0 ? c.dn : c.t1}>
            {fmt(fp, 2)}
          </Txt>
          <Txt size={13} weight={600} color={btc.c >= 0 ? c.up : c.dn}>
            {pct(btc.c)}
          </Txt>
        </View>
        <View style={{ gap: 3, alignItems: 'flex-end' }}>
          <Txt size={12} color={c.t3}>
            Mark <Txt size={12}>{fmt(fp * 1.00012, 2)}</Txt>
          </Txt>
          <Txt size={12} color={c.t3}>
            Max leverage <Txt size={12}>100x</Txt>
          </Txt>
        </View>
      </Appear>

      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Seg
                options={[
                  { value: 'cross', label: 'Cross' },
                  { value: 'isolated', label: 'Isolated' },
                ]}
                value={mode}
                onChange={setMode}
              />
            </View>
            <View style={{ height: 44, minWidth: 72, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: c.s4, alignItems: 'center', justifyContent: 'center' }}>
              <Txt size={16} weight={700} color={c.acT}>
                {lev}x
              </Txt>
            </View>
          </View>
          <View style={{ gap: 4 }}>
            <Slider
              accessibilityLabel="Leverage"
              style={{ width: '100%', height: 28 }}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={lev}
              onValueChange={(v) => {
                if (Math.round(v) !== lev) haptic.tap();
                setLev(Math.round(v));
              }}
              minimumTrackTintColor={c.ac}
              maximumTrackTintColor={c.s3}
              thumbTintColor="#FFFFFF"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[1, 10, 25, 50, 75, 100].map((v) => (
                <Press key={v} scale={0.9} onPress={() => setLev(v)} style={{ height: 28, paddingHorizontal: 4, justifyContent: 'center' }}>
                  <Txt size={11} weight={600} color={lev === v ? c.acT : c.t3}>
                    {v}x
                  </Txt>
                </Press>
              ))}
            </View>
          </View>
          {lev > 20 && <Notice>{`High leverage. A ${((100 / lev) * 0.96).toFixed(1)}% move against you can liquidate this position.`}</Notice>}
          <UnderlineTabs
            tabs={[
              { value: 'market', label: 'Market' },
              { value: 'limit', label: 'Limit' },
            ]}
            value={type}
            onChange={(t) => {
              setType(t);
              setLimit(fp.toFixed(1));
            }}
          />
          {type === 'limit' && <Field value={limit} onChangeText={(v) => setLimit(decimalInput(v))} placeholder="Limit price (USDT)" keyboardType="decimal-pad" />}
          <Field value={size} onChangeText={(v) => setSize(decimalInput(v))} placeholder="Size (USDT)" keyboardType="decimal-pad" />
          <ChipRow>
            {[10, 25, 50, 100].map((v) => (
              <Chip
                key={v}
                label={`${v}%`}
                onPress={() => {
                  haptic.tap();
                  setSize(String(Math.floor((((futAvail * v) / 100) * lev * 0.98))));
                }}
              />
            ))}
          </ChipRow>
          <Rows
            rows={[
              { k: 'Margin required', v: `${fmt(marg, 2)} USDT` },
              { k: 'Est. liq. price · long', v: sz > 0 ? fmt(liqL, 2) : '--', c: c.warn },
              { k: 'Est. liq. price · short', v: sz > 0 ? fmt(liqS, 2) : '--', c: c.warn },
              { k: 'Fee (0.05% taker)', v: `${fmt(fee, 2)} USDT` },
              { k: 'Available margin', v: `${fmt(futAvail, 2)} USDT` },
            ]}
          />
          {!!err && <Notice>{err}</Notice>}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button variant="buy" label="Open long" onPress={open('long')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="sell" label="Open short" onPress={open('short')} />
            </View>
          </View>
        </Card>
      </Appear>

      <Appear i={2} style={{ marginHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 32 }}>
        <Txt size={17} weight={600}>
          Positions ({positions.length})
        </Txt>
        <Txt size={12} color={c.t3}>
          PnL at mark price
        </Txt>
      </Appear>
      {positions.length === 0 && (
        <Appear i={2} style={{ marginHorizontal: 16 }}>
          <View style={{ paddingVertical: 28, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s4 }}>
            <Txt size={13} color={c.t2} align="center">
              No open positions.
            </Txt>
          </View>
        </Appear>
      )}
      {positions.map((p) => {
        const s = positionStats(p, prices);
        const sc = p.side === 'long' ? c.up : c.dn;
        const pc = s.pnl >= 0 ? c.up : c.dn;
        const cell = (k: string, v: string, right?: boolean, col?: string) => (
          <View key={k} style={{ width: '33.33%', gap: 2, alignItems: right ? 'flex-end' : 'flex-start', paddingVertical: 5 }}>
            <Txt size={12} color={c.t3}>
              {k}
            </Txt>
            <Txt size={12} color={col}>
              {v}
            </Txt>
          </View>
        );
        return (
          <Appear key={p.id} i={3} style={{ marginHorizontal: 16 }}>
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Txt size={15} weight={600}>
                  {p.sym}USDT
                </Txt>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: tint(sc, 14) }}>
                  <Txt size={11} weight={600} color={sc}>
                    {p.side === 'long' ? 'Long' : 'Short'} {p.lev}x · {p.mode}
                  </Txt>
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt size={15} weight={600} color={pc}>
                    {s.pnl >= 0 ? '+' : ''}
                    {fmt(s.pnl, 2)} USDT
                  </Txt>
                  <Txt size={12} color={pc}>
                    ROE {pct(s.roe)}
                  </Txt>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {cell('Size', `${fmt(p.size, 4)} ${p.sym}`)}
                {cell('Entry', fmt(p.entry, 2))}
                {cell('Mark', fmt(s.mark, 2), true)}
                {cell('Liq. price', fmt(s.liq, 2), false, c.warn)}
                {cell('Margin', `${fmt(s.im, 2)} USDT`)}
                {cell('Funding', '+0.0100%', true)}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button variant="secondary" h={38} size={13} label="TP / SL" onPress={() => toast('Take-profit / stop-loss editor')} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    variant="secondary"
                    h={38}
                    size={13}
                    label="Close position"
                    onPress={() => {
                      setWallet((w) => ({ positions: w.positions.filter((x) => x.id !== p.id), futUsdt: w.futUsdt + s.pnl }));
                      haptic.success();
                      toast(`Position closed · realized ${s.pnl >= 0 ? '+' : ''}${fmt(s.pnl, 2)} USDT`);
                    }}
                  />
                </View>
              </View>
            </Card>
          </Appear>
        );
      })}
      <Appear i={4} style={{ marginHorizontal: 16 }}>
        <Footnote>Futures are high risk. Leverage amplifies gains and losses, and you can lose your entire margin.</Footnote>
      </Appear>
    </Screen>
  );
}
