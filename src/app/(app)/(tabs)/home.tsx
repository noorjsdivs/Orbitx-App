import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Sparkline } from '@/components/charts';
import { Appear } from '@/components/layout/appear';
import { useTween } from '@/components/motion/animated-number';
import { MarketRefresh } from '@/components/motion/refresh';
import { Screen } from '@/components/layout/screen';
import { AnimatedMarketRow, EmptyState, ErrorState, MarketRowSkeleton, SectionHead } from '@/components/market';
import { Button } from '@/components/ui/button';
import { PillToggle, UnderlineTabs } from '@/components/ui/controls';
import { Icon, type IconName } from '@/components/ui/icon';
import { Card, Skel } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { AVATAR_URL } from '@/data/fixtures';
import { ANNOUNCEMENTS, COINS, NEW_LISTINGS, PAIRS, SPARKS } from '@/data/market';
import { MASK, useListStatus, usePortfolio } from '@/features/portfolio';
import { useColors } from '@/hooks/use-theme';
import { fmt, pct } from '@/lib/format';
import { useGuard } from '@/lib/nav';
import { useMarket } from '@/store/market';
import { usePrefs, type TradeMode } from '@/store/prefs';
import { displayName, useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { tint, blend } from '@/theme/color';

type HomeTab = 'fav' | 'hot' | 'gain' | 'lose' | 'new';

function TopBar() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const guest = useSession((s) => s.status === 'guest');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
      <Press
        accessibilityLabel="Profile and security"
        scale={0.92}
        onPress={guard('Create an account to unlock your profile', () => router.push('/profile'))}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        {guest ? (
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.s2, borderWidth: 1, borderColor: c.s3, alignItems: 'center', justifyContent: 'center' }}>
            <Txt size={12} weight={600} color={c.acT}>
              G
            </Txt>
          </View>
        ) : (
          <View style={{ width: 34, height: 34, borderRadius: 17, boxShadow: `0 0 0 2px ${c.bg}, 0 0 0 3.5px ${c.ac}` }}>
            <Image source={{ uri: AVATAR_URL }} style={{ width: 34, height: 34, borderRadius: 17 }} contentFit="cover" />
          </View>
        )}
      </Press>
      <Press
        onPress={() => router.push('/search')}
        scale={0.99}
        style={{ flex: 1, height: 40, borderRadius: 10, backgroundColor: c.s2, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }}>
        <Icon name="search" size={18} color={c.t3} />
        <Txt size={14} color={c.t3}>
          Search BTC, SOL, P2P…
        </Txt>
      </Press>
      <Press
        accessibilityLabel="Notifications"
        scale={0.9}
        onPress={guard('Sign up to set price alerts', () => router.push('/notifications'))}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="bell" size={22} sw={1.7} />
        <View style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: c.warn, borderWidth: 2, borderColor: c.bg }} />
      </Press>
    </View>
  );
}

function BalanceCard() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const guest = useSession((s) => s.status === 'guest');
  const hide = usePrefs((s) => s.hideBalance);
  const toggleHide = usePrefs((s) => s.toggleHide);
  const { total, todayPnl, todayPct } = usePortfolio();
  // Counts up from 0 on entry, then rolls smoothly as live prices tick.
  const shown = useTween(total, { from: 0, duration: 900 });
  const pnlShown = useTween(todayPnl, { from: 0, duration: 900 });
  const amt = guest ? '0.00' : hide ? MASK : fmt(shown, 2);
  const usd = guest ? '$0.00' : hide ? '$' + MASK : '$' + fmt(total, 2);
  const pnl = guest ? '—' : hide ? MASK : `${pnlShown >= 0 ? '+' : ''}${fmt(pnlShown, 2)} (${pct(todayPct)})`;
  const pnlCol = guest || hide ? c.t3 : todayPnl >= 0 ? c.up : c.dn;
  return (
    <Card gap={6} style={{ marginHorizontal: 16, marginTop: 12 }}>
      <Press
        scale={1}
        onPress={toggleHide}
        accessibilityLabel={hide ? 'Show balance' : 'Hide balance'}
        style={{ alignSelf: 'flex-start', height: 32, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Txt size={13} color={c.t2}>
          Est. total value
        </Txt>
        <Icon name={hide ? 'eyeOff' : 'eye'} size={16} color={c.t2} />
      </Press>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Txt size={34} weight={600} ls={-0.02} lh={1.15}>
          {amt}
        </Txt>
        <Txt size={14} weight={500} color={c.t2}>
          USDT
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Txt size={13} color={c.t3}>
          ≈ {usd}
        </Txt>
        <Press scale={1} onPress={() => router.push('/assets')} style={{ height: 32, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Txt size={13} color={c.t2}>
            {"Today's PnL "}
            <Txt size={13} weight={500} color={pnlCol}>
              {pnl}
            </Txt>
          </Txt>
          <Icon name="chevronRight" size={14} sw={2} color={c.t2} />
        </Press>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Button label="Add funds" h={44} size={14} onPress={guard('Sign up to deposit', () => router.push('/deposit'))} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Buy with NGN" variant="secondary" h={44} size={14} onPress={guard('Sign up to buy with P2P', () => router.push('/p2p'))} />
        </View>
      </View>
    </Card>
  );
}

function QuickActions() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const items: { label: string; icon: IconName; href: '/deposit' | '/withdraw' | '/transfer' | '/convert'; gate: string; accent?: boolean }[] = [
    { label: 'Deposit', icon: 'deposit', href: '/deposit', gate: 'Sign up to deposit', accent: true },
    { label: 'Withdraw', icon: 'withdraw', href: '/withdraw', gate: 'Sign up to withdraw' },
    { label: 'Transfer', icon: 'transfer', href: '/transfer', gate: 'Sign up to transfer' },
    { label: 'Convert', icon: 'convert', href: '/convert', gate: 'Sign up to convert' },
  ];
  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingTop: 16, paddingBottom: 4, paddingHorizontal: 16 }}>
      {items.map((it) => (
        <Press key={it.label} onPress={guard(it.gate, () => router.push(it.href))} pressedOpacity={0.6} scale={0.96} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
          <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: c.s2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={it.icon} size={22} color={it.accent ? c.acT : c.t1} />
          </View>
          <Txt size={12} weight={500}>
            {it.label}
          </Txt>
        </Press>
      ))}
    </View>
  );
}

function Watchlist() {
  const c = useColors();
  const router = useRouter();
  const [tab, setTab] = useState<HomeTab>('fav');
  const favs = usePrefs((s) => s.favs);
  const setFavs = usePrefs((s) => s.setFavs);
  const prices = useMarket((s) => s.prices);
  const retry = useMarket((s) => s.retry);
  const list =
    tab === 'fav'
      ? favs.filter((k) => COINS[k] && k !== 'USDT').slice(0, 6)
      : tab === 'hot'
        ? [...PAIRS].sort((a, b) => COINS[b].v - COINS[a].v).slice(0, 6)
        : tab === 'gain'
          ? PAIRS.filter((k) => prices[k].c > 0)
              .sort((a, b) => prices[b].c - prices[a].c)
              .slice(0, 6)
          : tab === 'lose'
            ? PAIRS.filter((k) => prices[k].c < 0)
                .sort((a, b) => prices[a].c - prices[b].c)
                .slice(0, 6)
            : NEW_LISTINGS;
  const status = useListStatus(list.length);
  const st = tab !== 'fav' && status === 'empty' && list.length ? 'ok' : status;

  return (
    <View>
      <UnderlineTabs<HomeTab>
        size={15}
        style={{ paddingLeft: 6, paddingRight: 4, marginTop: 12 }}
        tabs={[
          { value: 'fav', label: 'Favorites' },
          { value: 'hot', label: 'Hot' },
          { value: 'gain', label: 'Gainers' },
          { value: 'lose', label: 'Losers' },
          { value: 'new', label: 'New' },
        ]}
        value={tab}
        onChange={setTab}
        right={
          <Press accessibilityLabel="All markets" scale={0.9} onPress={() => router.navigate('/markets')} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronRight" size={16} sw={2} color={c.t2} />
          </Press>
        }
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 32 }}>
        <Txt size={12} color={c.t3} style={{ flex: 1 }}>
          Name / Vol
        </Txt>
        <Txt size={12} color={c.t3} align="right" style={{ width: 104 }}>
          Last price
        </Txt>
        <Txt size={12} color={c.t3} align="right" style={{ width: 76 }}>
          24h chg
        </Txt>
      </View>
      {st === 'loading' && [1, 2, 3, 4].map((i) => <MarketRowSkeleton key={i} />)}
      {st === 'error' && <ErrorState title="Couldn't load your watchlist" body="Prices may be delayed. Check your connection and try again." onRetry={retry} />}
      {st === 'empty' && (
        <EmptyState
          title="No favorites yet"
          body="Star a pair on its trade screen to track it here."
          cta="Add BTC, ETH, SOL"
          onCta={() => {
            setFavs(['BTC', 'ETH', 'SOL']);
            toast('Added BTC, ETH and SOL to favorites');
          }}
        />
      )}
      {st === 'ok' && list.map((k, i) => <AnimatedMarketRow key={`${tab}-${k}`} index={i} sym={k} onPress={() => router.push(`/coin/${k}`)} />)}
    </View>
  );
}

function TopMovers() {
  const c = useColors();
  const router = useRouter();
  const [mode, setMode] = useState<'gainers' | 'losers'>('gainers');
  const prices = useMarket((s) => s.prices);
  const retry = useMarket((s) => s.retry);
  const movers = PAIRS.filter((k) => (mode === 'gainers' ? prices[k].c > 0 : prices[k].c < 0))
    .sort((a, b) => (mode === 'gainers' ? prices[b].c - prices[a].c : prices[a].c - prices[b].c))
    .slice(0, 3);
  const st = useListStatus(movers.length);
  return (
    <View>
      <SectionHead
        title="Top movers"
        action={
          <View style={{ flexDirection: 'row', backgroundColor: c.s1, borderRadius: 10, padding: 3 }}>
            {(['gainers', 'losers'] as const).map((m) => (
              <Press
                key={m}
                scale={1}
                onPress={() => setMode(m)}
                style={{ height: 32, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center', backgroundColor: mode === m ? c.s3 : 'transparent' }}>
                <Txt size={12} weight={500} color={mode === m ? c.t1 : c.t3}>
                  {m === 'gainers' ? 'Gainers' : 'Losers'}
                </Txt>
              </Press>
            ))}
          </View>
        }
      />
      {st === 'error' ? (
        <View
          style={{
            marginHorizontal: 16,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.s1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}>
          <Txt size={13} color={c.t2}>
            Movers unavailable right now.
          </Txt>
          <Button label="Retry" variant="secondary" h={44} size={13} onPress={retry} />
        </View>
      ) : st === 'empty' ? (
        <View style={{ marginHorizontal: 16, padding: 16, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: c.s3 }}>
          <Txt size={13} color={c.t2} align="center">
            No big moves in the last 24h.
          </Txt>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
          {st === 'loading'
            ? [1, 2, 3].map((i) => <Skel key={i} h={118} r={12} tone="s1" style={{ flex: 1 }} />)
            : movers.map((k) => {
                const q = prices[k];
                const col = q.c >= 0 ? c.up : c.dn;
                return (
                  <Press
                    key={k}
                    onPress={() => router.push(`/coin/${k}`)}
                    pressedStyle={{ backgroundColor: c.s2 }}
                    style={{ flex: 1, minWidth: 0, gap: 6, padding: 12, borderRadius: 10, backgroundColor: c.s1 }}>
                    <Txt size={14} weight={600}>
                      {k}
                    </Txt>
                    <Txt size={13} color={c.t2} numberOfLines={1}>
                      {fmt(q.p, COINS[k].dp)}
                    </Txt>
                    <Txt size={15} weight={600} color={col}>
                      {pct(q.c)}
                    </Txt>
                    <Sparkline points={SPARKS[k]} color={col} />
                  </Press>
                );
              })}
        </View>
      )}
    </View>
  );
}

function EarnPromo() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const go = guard('Sign up to start earning', () => router.push('/earn'));
  return (
    <Card style={{ marginHorizontal: 16, marginTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ gap: 4 }}>
          <Txt mono size={11} ls={0.08} color={c.acT}>
            EARN · FLEXIBLE
          </Txt>
          <Txt size={17} weight={600}>
            USDT Flexible Savings
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Txt size={24} weight={600} color={c.acT}>
            5.10%
          </Txt>
          <Txt size={11} color={c.t3}>
            Est. APR
          </Txt>
        </View>
      </View>
      <Txt size={13} lh={1.45} color={c.t2}>
        Paid daily, redeem anytime. APR is variable and not guaranteed; it can change with market demand.
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button label="Subscribe" h={44} size={14} onPress={go} />
        </View>
        <Button label="All products" variant="secondary" h={44} size={14} onPress={go} />
      </View>
    </Card>
  );
}

function Announcements() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const retry = useMarket((s) => s.retry);
  const st = useListStatus(ANNOUNCEMENTS.length);
  const open = guard('Sign up to set price alerts', () => router.push('/notifications'));
  return (
    <View>
      <SectionHead title="Announcements" action="View all" onAction={open} style={{ paddingBottom: 4 }} />
      {st === 'loading' &&
        [1, 2, 3].map((i) => (
          <View key={i} style={{ paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}>
            <Skel w={44} h={10} tone="hair" />
            <Skel w={260} h={12} />
          </View>
        ))}
      {st === 'error' && (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Txt size={13} color={c.t2}>
            {"Couldn't load announcements. "}
          </Txt>
          <Press scale={1} onPress={retry} style={{ height: 44, justifyContent: 'center' }}>
            <Txt size={13} weight={500} color={c.acT}>
              Retry
            </Txt>
          </Press>
        </View>
      )}
      {st === 'empty' && (
        <Txt size={13} color={c.t2} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
          {"You're all caught up."}
        </Txt>
      )}
      {st === 'ok' &&
        ANNOUNCEMENTS.map((a) => (
          <Press
            key={a.d}
            scale={1}
            onPress={open}
            pressedStyle={{ backgroundColor: c.s1 }}
            style={{ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 48, paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: c.hair }}>
            <Txt mono size={11} color={c.t3} style={{ width: 44 }}>
              {a.d}
            </Txt>
            <Txt size={13} lh={1.4} style={{ flex: 1 }}>
              {a.t}
            </Txt>
            <Icon name="chevronRight" size={14} sw={2} color={c.t3} />
          </Press>
        ))}
    </View>
  );
}

export default function Home() {
  const c = useColors();
  const router = useRouter();
  const guest = useSession((s) => s.status === 'guest');
  const name = useSession((s) => s.name);
  const mode = usePrefs((s) => s.mode);
  const setMode = usePrefs((s) => s.setMode);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen refreshControl={<MarketRefresh />}>
      <TopBar />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, paddingHorizontal: 16 }}>
        <Txt size={15} color={c.t2}>
          {greeting},{' '}
          <Txt size={15} weight={600}>
            {displayName(name, guest)}
          </Txt>
        </Txt>
        <PillToggle<TradeMode>
          options={[
            { value: 'lite', label: 'Lite' },
            { value: 'pro', label: 'Pro' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </View>
      {guest && (
        <View
          style={{
            marginTop: 12,
            marginHorizontal: 16,
            padding: 14,
            paddingLeft: 16,
            borderRadius: 14,
            backgroundColor: blend(c.ac, c.s1, 10),
            borderWidth: 1,
            borderColor: tint(c.ac, 35),
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Txt size={14} weight={600}>
              {"You're browsing as a guest"}
            </Txt>
            <Txt size={12} lh={1.4} color={c.t2}>
              Live prices and markets only. Sign up to deposit and trade.
            </Txt>
          </View>
          <Button label="Sign up" h={40} size={13} onPress={() => router.push('/register')} />
        </View>
      )}
      <Appear i={1}>
        <BalanceCard />
      </Appear>
      <Appear i={2}>
        <QuickActions />
      </Appear>
      <Appear i={3}>
        <Watchlist />
      </Appear>
      <Appear i={4}>
        <TopMovers />
        <EarnPromo />
        <Announcements />
      </Appear>
    </Screen>
  );
}
