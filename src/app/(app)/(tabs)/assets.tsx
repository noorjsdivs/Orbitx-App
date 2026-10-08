import { useRouter } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { IconButton, Screen } from '@/components/layout/screen';
import { useTween } from '@/components/motion/animated-number';
import { MarketRefresh } from '@/components/motion/refresh';
import { EmptyState, ErrorState } from '@/components/market';
import { Button } from '@/components/ui/button';
import { Checkbox, UnderlineTabs } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { Card, CoinGlyph, Skel } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS } from '@/data/market';
import { MASK, MMR, positionStats, useListStatus, usePortfolio } from '@/features/portfolio';
import { useNow } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { clock, fmt, holdingDp, pct } from '@/lib/format';
import { useGuard, useTabNav } from '@/lib/nav';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { usePrefs } from '@/store/prefs';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';
import { fontFamily } from '@/theme/fonts';

type ATab = 'overview' | 'spot' | 'funding' | 'futures' | 'earn';

function fundingLeft(now: number) {
  const d = new Date(now);
  const nh = (Math.floor(d.getUTCHours() / 8) + 1) * 8;
  return Math.max(0, Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), nh) - now) / 1000));
}

export default function Assets() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const goTab = useTabNav();
  const now = useNow(1000);
  const guest = useSession((s) => s.status === 'guest');
  const hide = usePrefs((s) => s.hideBalance);
  const toggleHide = usePrefs((s) => s.toggleHide);
  const tab = useDrafts((s) => s.assetsTab);
  const setTab = useDrafts((s) => s.setAssetsTab);
  const selectPair = useDrafts((s) => s.selectPair);
  const retry = useMarket((s) => s.retry);
  const pf = usePortfolio();
  const [hideSmall, setHideSmall] = useState(false);
  const [query, setQuery] = useState('');

  const H = hide;
  const money = (v: number) => (guest ? '0.00' : H ? MASK : fmt(v, 2));
  const accts = [
    { k: 'spot' as const, name: 'Spot', v: pf.spotTotal, col: c.ac },
    { k: 'funding' as const, name: 'Funding', v: pf.fundTotal, col: c.up },
    { k: 'futures' as const, name: 'Futures', v: pf.futTotal, col: c.warn },
    { k: 'earn' as const, name: 'Earn', v: pf.earnTotal, col: c.t2 },
  ];
  const card: Record<ATab, [string, number]> = {
    overview: ['Est. total value', pf.total],
    spot: ['Spot balance', pf.spotTotal],
    funding: ['Funding balance', pf.fundTotal],
    futures: ['Margin balance', pf.futTotal],
    earn: ['Earn holdings', pf.earnTotal],
  };
  // Card total rolls to the new value when switching accounts or when prices tick.
  const cardValue = useTween(card[tab][1], { duration: 600 });
  const subK = tab === 'futures' ? 'Unrealized PnL' : tab === 'earn' ? 'Yesterday' : "Today's PnL";
  const subRaw = tab === 'futures' ? pf.futPnl : tab === 'earn' ? 0.19 : tab === 'funding' ? 0 : pf.todayPnl;
  const subV = guest ? '—' : H ? MASK : tab === 'earn' ? '+0.19 USDT' : `${subRaw >= 0 ? '+' : ''}${fmt(subRaw, 2)}`;
  const subCol = guest || H || tab === 'funding' ? c.t1 : subRaw >= 0 ? c.up : c.dn;

  let src: Record<string, number> = {};
  if (tab === 'overview') {
    src = { ...pf.bal };
    src.USDT = (src.USDT ?? 0) + pf.fundTotal + pf.futTotal;
    for (const e of pf.earn) src[e.coin] = (src[e.coin] ?? 0) + e.amt;
  } else if (tab === 'spot') src = { ...pf.bal };
  else if (tab === 'funding') src = { USDT: pf.fundTotal };
  else if (tab === 'futures') src = { USDT: pf.futTotal };
  const aq = query.trim().toLowerCase();
  const rows = guest
    ? []
    : Object.keys(src)
        .map((k) => ({ k, amt: src[k], v: src[k] * (pf.prices[k]?.p ?? 1) }))
        .filter((x) => x.amt > 0)
        .filter((x) => !hideSmall || x.v >= 1)
        .filter((x) => !aq || x.k.toLowerCase().includes(aq) || COINS[x.k].n.toLowerCase().includes(aq))
        .sort((a, b) => b.v - a.v);
  const st = useListStatus(rows.length);
  const empty = guest
    ? { t: 'Guest mode', d: 'Create an account to deposit, trade and see your balances.' }
    : aq
      ? { t: `No coins match "${query.trim()}"`, d: 'Only coins with a balance in this account are listed.' }
      : { t: 'No balances yet', d: 'Deposit crypto or buy USDT with P2P to get started.' };

  return (
    <Screen refreshControl={<MarketRefresh />}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingRight: 4, paddingLeft: 16 }}>
        <Txt size={24} weight={600} ls={-0.02}>
          Assets
        </Txt>
        <View style={{ flexDirection: 'row' }}>
          <IconButton name="history" label="Order and transaction history" size={21} onPress={guard('Sign up to see your orders', () => router.push('/orders'))} />
          <IconButton name="shieldCheck" label="Settings" size={21} onPress={guard('Create an account to unlock your profile', () => router.push('/profile'))} />
        </View>
      </View>
      <UnderlineTabs<ATab>
        scroll
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'spot', label: 'Spot' },
          { value: 'funding', label: 'Funding' },
          { value: 'futures', label: 'Futures' },
          { value: 'earn', label: 'Earn' },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setQuery('');
        }}
      />
      <Card gap={6} style={{ marginHorizontal: 16, marginTop: 16 }}>
        <Press scale={1} onPress={toggleHide} style={{ alignSelf: 'flex-start', height: 32, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Txt size={13} color={c.t2}>
            {card[tab][0]}
          </Txt>
          <Icon name={H ? 'eyeOff' : 'eye'} size={16} color={c.t2} />
        </Press>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Txt size={32} weight={600} ls={-0.02} lh={1.15}>
            {money(cardValue)}
          </Txt>
          <Txt size={14} weight={500} color={c.t2}>
            USDT
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={13} color={c.t3}>
            ≈ {guest ? '$0.00' : H ? '$' + MASK : '$' + fmt(card[tab][1], 2)}
          </Txt>
          <Txt size={13} color={c.t2}>
            {subK}{' '}
            <Txt size={13} weight={500} color={subCol}>
              {subV}
            </Txt>
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <Button label="Deposit" h={44} size={14} onPress={guard('Sign up to deposit', () => router.push('/deposit'))} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Withdraw" variant="secondary" h={44} size={14} onPress={guard('Sign up to withdraw', () => router.push('/withdraw'))} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Transfer" variant="secondary" h={44} size={14} onPress={guard('Sign up to transfer', () => router.push('/transfer'))} />
          </View>
        </View>
      </Card>

      {tab === 'overview' && (
        <View>
          <View style={{ marginTop: 16, marginHorizontal: 16, flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
            {accts.map((a) => (
              <View key={a.k} style={{ width: `${guest ? 25 : (a.v / pf.total) * 100}%`, backgroundColor: a.col }} />
            ))}
          </View>
          <View style={{ paddingTop: 4 }}>
            {accts.map((a) => (
              <Press
                key={a.k}
                scale={1}
                onPress={() => setTab(a.k)}
                pressedStyle={{ backgroundColor: c.s1 }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, paddingHorizontal: 16 }}>
                <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: a.col }} />
                <Txt size={15} weight={500} style={{ flex: 1 }}>
                  {a.name}
                </Txt>
                <Txt size={12} color={c.t3} align="right" style={{ width: 44 }}>
                  {guest ? '0.0%' : `${((a.v / pf.total) * 100).toFixed(1)}%`}
                </Txt>
                <Txt size={15} weight={500} align="right" style={{ width: 110 }}>
                  {money(a.v)}
                </Txt>
                <Icon name="chevronRight" size={14} sw={2} color={c.t3} />
              </Press>
            ))}
          </View>
        </View>
      )}

      {tab === 'futures' && (
        <View>
          <View style={{ marginTop: 16, marginHorizontal: 16, flexDirection: 'row', gap: 8 }}>
            {[
              ['Wallet balance', money(pf.futTotal - pf.futPnl), c.t1],
              ['Unrealized PnL', guest ? '0.00' : H ? MASK : `${pf.futPnl >= 0 ? '+' : ''}${fmt(pf.futPnl, 2)}`, pf.futPnl >= 0 ? c.up : c.dn],
              ['Available', money(pf.futAvail), c.t1],
            ].map(([k, v, col], i) => (
              <View key={k} style={{ flex: 1, gap: 3, alignItems: i === 2 ? 'flex-end' : 'flex-start' }}>
                <Txt size={12} color={c.t3}>
                  {k}
                </Txt>
                <Txt size={14} color={col}>
                  {v}
                </Txt>
              </View>
            ))}
          </View>
          {!guest &&
            pf.positions.map((p) => {
              const s = positionStats(p, pf.prices);
              const pc = s.pnl >= 0 ? c.up : c.dn;
              const sc = p.side === 'long' ? c.up : c.dn;
              return (
                <Card key={p.id} style={{ marginTop: 16, marginHorizontal: 16, padding: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Txt size={15} weight={600}>
                      {p.sym}USDT
                    </Txt>
                    <View style={{ paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: c.s2 }}>
                      <Txt size={10} weight={600} color={c.t2}>
                        Perp
                      </Txt>
                    </View>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tint(sc, 14) }}>
                      <Txt size={11} weight={600} color={sc}>
                        {p.side === 'long' ? 'Long' : 'Short'} {p.lev}x · {p.mode}
                      </Txt>
                    </View>
                    <View style={{ flex: 1 }} />
                    <Txt size={15} weight={600} color={pc}>
                      {pct(s.roe)}
                    </Txt>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 }}>
                    {[
                      ['Size (BTC)', fmt(p.size, 4)],
                      ['Entry price', fmt(p.entry, 2)],
                      ['Mark price', fmt(s.mark, 2)],
                      ['Liq. price', fmt(s.liq, 2), c.warn],
                      ['Margin ratio', `${((s.mark * p.size * MMR * 100) / Math.max(1, pf.futTotal)).toFixed(2)}%`],
                      ['PnL (USDT)', `${s.pnl >= 0 ? '+' : ''}${fmt(s.pnl, 2)}`, pc],
                    ].map(([k, v, col], i) => (
                      <View key={k} style={{ width: '33.33%', gap: 2, alignItems: i % 3 === 2 ? 'flex-end' : 'flex-start' }}>
                        <Txt size={12} color={c.t3}>
                          {k}
                        </Txt>
                        <Txt size={12} color={col}>
                          {v}
                        </Txt>
                      </View>
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line }}>
                    <Txt size={12} color={c.t3}>
                      Funding rate <Txt size={12}>+0.0100%</Txt>
                    </Txt>
                    <Txt size={12} color={c.t3}>
                      Next in{' '}
                      <Txt mono size={12}>
                        {clock(fundingLeft(now))}
                      </Txt>
                    </Txt>
                  </View>
                  <Button label="Manage position" variant="secondary" h={44} size={14} onPress={() => goTab('futures')} />
                </Card>
              );
            })}
        </View>
      )}

      {tab === 'earn' && (
        <View style={{ gap: 8, marginTop: 16, marginHorizontal: 16 }}>
          {!guest &&
            pf.earn.map((e) => (
              <Card key={e.id} gap={10} style={{ padding: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <CoinGlyph sym={e.coin} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={15} weight={600}>
                      {e.name}
                    </Txt>
                    <Txt size={12} color={c.t3}>
                      {e.term}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Txt size={15} weight={600} color={c.acT}>
                      {e.apr}
                    </Txt>
                    <Txt size={11} color={c.t3}>
                      Est. APR
                    </Txt>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ gap: 2 }}>
                    <Txt size={12} color={c.t3}>
                      Holding
                    </Txt>
                    <Txt size={12}>{H ? MASK : `${fmt(e.amt, e.coin === 'USDT' ? 2 : 4)} ${e.coin}`}</Txt>
                  </View>
                  <View style={{ gap: 2, alignItems: 'flex-end' }}>
                    <Txt size={12} color={c.t3}>
                      {e.k2}
                    </Txt>
                    <Txt size={12}>{e.v2}</Txt>
                  </View>
                </View>
              </Card>
            ))}
          <Button label="Explore Earn products" variant="secondary" h={44} size={14} onPress={guard('Sign up to start earning', () => router.push('/earn'))} />
          <Txt size={11} lh={1.5} color={c.t3}>
            APR is an estimate, not a guaranteed return. Locked products cannot be redeemed before the end date without forfeiting rewards.
          </Txt>
        </View>
      )}

      {tab !== 'earn' && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingHorizontal: 16, paddingBottom: 4 }}>
            <Txt size={17} weight={600}>
              Balances
            </Txt>
            <Press
              scale={1}
              onPress={() => setHideSmall(!hideSmall)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: hideSmall }}
              style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Checkbox checked={hideSmall} />
              <Txt size={12} color={c.t2}>
                {'Hide balances < 1 USDT'}
              </Txt>
            </Press>
          </View>
          <View style={{ marginHorizontal: 16, marginBottom: 4, height: 40, borderRadius: 10, backgroundColor: c.s1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
            <Icon name="search" size={16} color={c.t3} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search coin"
              placeholderTextColor={c.placeholder}
              autoCapitalize="characters"
              autoCorrect={false}
              style={{ flex: 1, height: 40, color: c.t1, fontSize: 14, fontFamily: fontFamily(400) }}
            />
          </View>
          {st === 'loading' &&
            [1, 2, 3, 4].map((i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, paddingHorizontal: 16 }}>
                <Skel w={32} h={32} r={16} />
                <View style={{ flex: 1, gap: 8 }}>
                  <Skel w={60} h={12} />
                  <Skel w={90} h={10} tone="hair" />
                </View>
                <View style={{ gap: 8, alignItems: 'flex-end' }}>
                  <Skel w={72} h={12} />
                  <Skel w={56} h={10} tone="hair" />
                </View>
              </View>
            ))}
          {st === 'error' && <ErrorState title="Balances didn't load" body="Your funds are safe. Pull to refresh or try again." onRetry={retry} />}
          {(st === 'empty' || (guest && st === 'ok')) && <EmptyState title={empty.t} body={empty.d} cta="Deposit crypto" onCta={guard('Sign up to deposit', () => router.push('/deposit'))} />}
          {st === 'ok' &&
            rows.map((x) => {
              const q = pf.prices[x.k];
              const pnl = x.k === 'USDT' ? 0 : (x.v * q.c) / (100 + q.c);
              return (
                <Press
                  key={x.k}
                  scale={1}
                  pressedStyle={{ backgroundColor: c.s1 }}
                  onPress={() => {
                    if (x.k === 'USDT') router.push('/deposit');
                    else {
                      selectPair(x.k, q.p);
                      goTab('trade');
                    }
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, paddingHorizontal: 16 }}>
                  <CoinGlyph sym={x.k} />
                  <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                    <Txt size={15} weight={600}>
                      {x.k}
                    </Txt>
                    <Txt size={12} color={c.t3}>
                      {COINS[x.k].n}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 3 }}>
                    <Txt size={15} weight={500}>
                      {H ? MASK : fmt(x.amt, holdingDp(x.k, q.p))}
                    </Txt>
                    <Txt size={12} color={c.t3}>
                      ≈ {H ? MASK : fmt(x.v, 2)} USDT{' '}
                      {x.k !== 'USDT' && !H && (
                        <Txt size={12} color={pnl >= 0 ? c.up : c.dn}>
                          {pnl >= 0 ? '+' : ''}
                          {fmt(pnl, 2)}
                        </Txt>
                      )}
                    </Txt>
                  </View>
                </Press>
              );
            })}
        </View>
      )}
    </Screen>
  );
}
