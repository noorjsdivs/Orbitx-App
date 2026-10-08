import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Screen } from '@/components/layout/screen';
import { Icon } from '@/components/ui/icon';
import { CoinGlyph } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { FEATURES } from '@/data/fixtures';
import { COINS, PAIRS } from '@/data/market';
import { useColors } from '@/hooks/use-theme';
import { fmt, pct } from '@/lib/format';
import { useGuard, useTabNav } from '@/lib/nav';
import { useMarket } from '@/store/market';
import { useWallet } from '@/store/wallet';
import { fontFamily } from '@/theme/fonts';

const GATES: Record<string, string> = {
  '/deposit': 'Sign up to deposit',
  '/withdraw': 'Sign up to withdraw',
  '/transfer': 'Sign up to transfer',
  '/convert': 'Sign up to convert',
  '/p2p': 'Sign up to buy with P2P',
  '/earn': 'Sign up to start earning',
  '/orders': 'Sign up to see your orders',
  '/profile': 'Create an account to unlock your profile',
  '/notifications': 'Sign up to set price alerts',
};

export default function Search() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const goTab = useTabNav();
  const prices = useMarket((s) => s.prices);
  const recent = useWallet((s) => s.recent);
  const addRecent = useWallet((s) => s.addRecent);
  const setWallet = useWallet((s) => s.set);
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const coins = query ? PAIRS.filter((x) => x.toLowerCase().includes(query) || COINS[x].n.toLowerCase().includes(query)).slice(0, 6) : [];
  const feats = query ? FEATURES.filter((f) => f[0].toLowerCase().includes(query)) : [];
  const trending = [...PAIRS].sort((a, b) => Math.abs(prices[b].c) - Math.abs(prices[a].c)).slice(0, 5);

  const openCoin = (x: string) => {
    addRecent(x);
    router.push(`/coin/${x}`);
  };
  const openFeature = (label: string, href: string) => {
    addRecent(label);
    if (href === '/futures') return goTab('futures');
    guard(GATES[href] ?? 'Create a free account', () => router.push(href as Href))();
  };

  const coinRow = (x: string, rank?: number) => {
    const p = prices[x];
    return (
      <Press key={x} scale={1} onPress={() => openCoin(x)} pressedStyle={{ backgroundColor: c.s2 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 8, borderRadius: 10 }}>
        {rank != null && (
          <Txt mono size={12} color={c.acT} style={{ width: 16 }}>
            {rank}
          </Txt>
        )}
        <CoinGlyph sym={x} size={30} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={15} weight={600}>
            {rank != null ? x : `${x}/USDT`}
          </Txt>
          <Txt size={12} color={c.t3}>
            {COINS[x].n}
          </Txt>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <Txt size={14}>{fmt(p.p, COINS[x].dp)}</Txt>
          <Txt size={12} weight={600} color={p.c >= 0 ? c.up : c.dn}>
            {pct(p.c)}
          </Txt>
        </View>
      </Press>
    );
  };

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4, paddingRight: 8, paddingLeft: 16 }}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: c.s4 }}>
        <Icon name="search" size={18} color={c.t3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          placeholder="Search coins, features"
          placeholderTextColor={c.placeholder}
          autoCorrect={false}
          returnKeyType="search"
          selectionColor={c.ac}
          style={{ flex: 1, height: 42, color: c.t1, fontSize: 15, fontFamily: fontFamily(400) }}
        />
      </View>
      <Press scale={1} onPress={() => router.back()} style={{ height: 44, paddingHorizontal: 8, justifyContent: 'center' }}>
        <Txt size={15} weight={500}>
          Cancel
        </Txt>
      </Press>
    </View>
  );

  return (
    <Screen gap={14} top={header}>
      {!query && (
        <>
          {recent.length > 0 && (
            <Appear i={0} style={{ marginHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Txt size={15} weight={600}>
                  Recent
                </Txt>
                <Press scale={1} onPress={() => setWallet({ recent: [] })} style={{ height: 32, justifyContent: 'center' }}>
                  <Txt size={13} color={c.t3}>
                    Clear
                  </Txt>
                </Press>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {recent.map((r) => (
                  <View key={r} style={{ flexDirection: 'row', alignItems: 'center', height: 34, borderRadius: 999, borderWidth: 1, borderColor: c.s4 }}>
                    <Press scale={1} onPress={() => setQ(r)} style={{ height: 34, paddingLeft: 12, paddingRight: 2, justifyContent: 'center' }}>
                      <Txt size={13} weight={500}>
                        {r}
                      </Txt>
                    </Press>
                    <Press accessibilityLabel={`Remove ${r}`} scale={0.9} onPress={() => setWallet((s) => ({ recent: s.recent.filter((y) => y !== r) }))} style={{ width: 30, height: 34, alignItems: 'center', justifyContent: 'center' }}>
                      <Txt size={15} color={c.t3}>
                        ×
                      </Txt>
                    </Press>
                  </View>
                ))}
              </View>
            </Appear>
          )}
          <Appear i={1} style={{ marginHorizontal: 16 }}>
            <Txt size={15} weight={600} style={{ marginBottom: 6 }}>
              Trending
            </Txt>
            {trending.map((x, i) => coinRow(x, i + 1))}
          </Appear>
          <Appear i={2} style={{ marginHorizontal: 16 }}>
            <Txt size={15} weight={600} style={{ marginBottom: 10 }}>
              Popular features
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {FEATURES.slice(0, 6).map(([l, href]) => (
                <Press key={l} scale={0.95} onPress={() => openFeature(l, href)} pressedStyle={{ backgroundColor: c.s2 }} style={{ width: '31.8%', flexGrow: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: c.s4, alignItems: 'center', justifyContent: 'center' }}>
                  <Txt size={13} weight={500}>
                    {l}
                  </Txt>
                </Press>
              ))}
            </View>
          </Appear>
        </>
      )}
      {!!query && coins.length > 0 && (
        <Appear i={0} style={{ marginHorizontal: 16 }}>
          <Txt size={12} weight={500} color={c.t3} style={{ marginBottom: 4 }}>
            Coins
          </Txt>
          {coins.map((x) => coinRow(x))}
        </Appear>
      )}
      {!!query && feats.length > 0 && (
        <Appear i={1} style={{ marginHorizontal: 16 }}>
          <Txt size={12} weight={500} color={c.t3} style={{ marginBottom: 4 }}>
            Features
          </Txt>
          {feats.map(([l, href]) => (
            <Press key={l} scale={1} onPress={() => openFeature(l, href)} pressedStyle={{ backgroundColor: c.s2 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 8, borderRadius: 10 }}>
              <Txt size={15} style={{ flex: 1 }}>
                {l}
              </Txt>
              <Icon name="chevronRight" size={14} sw={2} color={c.t3} />
            </Press>
          ))}
        </Appear>
      )}
      {!!query && !coins.length && !feats.length && (
        <Appear i={0} style={{ marginHorizontal: 16, paddingVertical: 40, paddingHorizontal: 16, gap: 6 }}>
          <Txt size={16} weight={600} align="center">
            No results for &quot;{q.trim()}&quot;
          </Txt>
          <Txt size={13} color={c.t2} align="center">
            Try a ticker like BTC or a feature like Deposit.
          </Txt>
        </Appear>
      )}
    </Screen>
  );
}
