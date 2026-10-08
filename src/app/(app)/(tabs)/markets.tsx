import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';

import { IconButton, Screen } from '@/components/layout/screen';
import { EmptyState, ErrorState, MarketRow, MarketRowSkeleton } from '@/components/market';
import { UnderlineTabs } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COINS, NEW_LISTINGS, PAIRS } from '@/data/market';
import { useListStatus } from '@/features/portfolio';
import { useColors } from '@/hooks/use-theme';
import { useGuard, useTabNav } from '@/lib/nav';
import { useMarket } from '@/store/market';
import { usePrefs } from '@/store/prefs';
import { toast } from '@/store/toast';
import { fontFamily } from '@/theme/fonts';

type MTab = 'favorites' | 'spot' | 'futures' | 'gainers' | 'losers' | 'new';
type SortKey = 'vol' | 'price' | 'chg';

export default function Markets() {
  const c = useColors();
  const router = useRouter();
  const guard = useGuard();
  const goTab = useTabNav();
  const prices = useMarket((s) => s.prices);
  const retry = useMarket((s) => s.retry);
  const favs = usePrefs((s) => s.favs);
  const setFavs = usePrefs((s) => s.setFavs);
  const [tab, setTab] = useState<MTab>('spot');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState(-1);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!switching) return;
    const t = setTimeout(() => setSwitching(false), 450);
    return () => clearTimeout(t);
  }, [switching]);

  let list =
    tab === 'favorites'
      ? favs.filter((k) => COINS[k] && k !== 'USDT')
      : tab === 'futures'
        ? PAIRS.filter((k) => COINS[k].fr != null)
        : tab === 'gainers'
          ? PAIRS.filter((k) => prices[k].c > 0)
          : tab === 'losers'
            ? PAIRS.filter((k) => prices[k].c < 0)
            : tab === 'new'
              ? NEW_LISTINGS
              : PAIRS;
  const q = query.trim().toLowerCase();
  if (q) list = list.filter((k) => k.toLowerCase().includes(q) || COINS[k].n.toLowerCase().includes(q));
  const key: SortKey = sortKey ?? (tab === 'gainers' || tab === 'losers' ? 'chg' : 'vol');
  const dir = sortKey ? sortDir : tab === 'losers' ? 1 : -1;
  const val = (k: string) => (key === 'vol' ? COINS[k].v : key === 'price' ? prices[k].p : prices[k].c);
  list = [...list].sort((a, b) => (val(a) - val(b)) * dir);
  const st = useListStatus(list.length, switching);

  const empty = q
    ? { t: `No results for "${query.trim()}"`, d: 'Check the ticker or try the full coin name.', cta: false }
    : tab === 'favorites'
      ? { t: 'No favorites yet', d: 'Star a pair on its trade screen to pin it here.', cta: true }
      : tab === 'new'
        ? { t: 'No new listings this week', d: 'New listings are announced 24h before trading opens.', cta: false }
        : { t: 'Nothing to show', d: 'No pairs match this filter right now.', cta: false };

  const sortBtn = (k: SortKey, label: string, width?: number) => (
    <Press
      scale={1}
      onPress={() => {
        if (sortKey === k) setSortDir(-sortDir);
        else {
          setSortKey(k);
          setSortDir(-1);
        }
      }}
      style={{ height: 36, justifyContent: 'center', ...(width ? { width, alignItems: 'flex-end' } : { flex: 1 }) }}>
      <Txt size={12} color={key === k ? c.t1 : c.t3}>
        {label}
        {key === k ? (dir < 0 ? ' ↓' : ' ↑') : ''}
      </Txt>
    </Press>
  );

  const header = (
    <View style={{ backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 8, paddingLeft: 16, paddingRight: 8 }}>
        <Txt size={24} weight={600} ls={-0.02}>
          Markets
        </Txt>
        <IconButton name="bell" label="Price alerts" size={22} onPress={guard('Sign up to set price alerts', () => router.push('/notifications'))} />
      </View>
      <View style={{ marginHorizontal: 16, height: 44, borderRadius: 12, backgroundColor: c.s2, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 4 }}>
        <Icon name="search" size={18} color={c.t3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search coin or pair"
          placeholderTextColor={c.placeholder}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          style={{ flex: 1, height: 44, color: c.t1, fontSize: 15, fontFamily: fontFamily(400) }}
        />
        {!!query && (
          <Press accessibilityLabel="Clear search" scale={0.9} onPress={() => setQuery('')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={16} sw={2} color={c.t2} />
          </Press>
        )}
      </View>
      <UnderlineTabs<MTab>
        scroll
        style={{ paddingTop: 4 }}
        tabs={[
          { value: 'favorites', label: 'Favorites' },
          { value: 'spot', label: 'Spot' },
          { value: 'futures', label: 'Futures' },
          { value: 'gainers', label: 'Gainers' },
          { value: 'losers', label: 'Losers' },
          { value: 'new', label: 'New' },
        ]}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setSortKey(null);
          setSwitching(true);
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, height: 36 }}>
        {sortBtn('vol', 'Name / Vol')}
        {sortBtn('price', 'Last price', 104)}
        {sortBtn('chg', '24h chg', 76)}
      </View>
    </View>
  );

  return (
    <Screen top={header}>
      {st === 'loading' && [1, 2, 3, 4, 5, 6, 7, 8].map((i) => <MarketRowSkeleton key={i} />)}
      {st === 'error' && (
        <ErrorState card={false} primary cta="Try again" title="Market data unavailable" body="We couldn't reach the price feed. Your funds and open orders are not affected." onRetry={retry} />
      )}
      {st === 'empty' && (
        <View style={{ marginVertical: 32 }}>
          <EmptyState
            dashed={false}
            icon
            title={empty.t}
            body={empty.d}
            cta={empty.cta ? 'Add popular pairs' : undefined}
            onCta={() => {
              setFavs(['BTC', 'ETH', 'SOL']);
              toast('Added BTC, ETH and SOL to favorites');
            }}
          />
        </View>
      )}
      {st === 'ok' &&
        list.map((k) => (
          <MarketRow
            key={k}
            sym={k}
            mode={tab === 'futures' ? 'fut' : tab === 'new' ? 'new' : 'spot'}
            onPress={() => (tab === 'futures' ? goTab('futures') : router.push(`/coin/${k}`))}
          />
        ))}
      <Txt size={11} lh={1.5} color={c.t3} align="center" style={{ padding: 16 }}>
        Prices in USDT. 24h data updates in real time. Fiat values are estimates.
      </Txt>
    </Screen>
  );
}
