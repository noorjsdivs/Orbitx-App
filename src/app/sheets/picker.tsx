import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { SheetBody } from '@/components/layout/sheet';
import { rowExit, rowLayout } from '@/components/motion/presets';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { COUNTRIES, LANGUAGES } from '@/data/fixtures';
import { COINS } from '@/data/market';
import { ACCOUNT_NAMES, useAccountBalances } from '@/features/accounts';
import { CONVERT_ASSETS, convertDp } from '@/features/convert';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { usePrefs, type ListState } from '@/store/prefs';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { useWallet, type Account } from '@/store/wallet';

type Kind = 'lang' | 'country' | 'devices' | 'cvFrom' | 'cvTo' | 'trFrom' | 'trTo' | 'dev';
type Item = { key: string; label: string; tag?: string; sub?: string; on?: boolean; action?: string; onPress?: () => void };

/** Generic list picker sheet: language, country, devices, convert assets, transfer accounts, developer options. */
export default function Picker() {
  const c = useColors();
  const router = useRouter();
  const { kind = 'lang' } = useLocalSearchParams<{ kind?: Kind }>();
  const session = useSession();
  const prefs = usePrefs();
  const bal = useWallet((s) => s.bal);
  const drafts = useDrafts();
  const accounts = useAccountBalances();
  const close = () => router.back();

  let title = '';
  let items: Item[] = [];

  if (kind === 'lang') {
    title = 'Language';
    items = LANGUAGES.map((l) => ({
      key: l,
      label: l,
      on: l === prefs.lang,
      onPress: () => {
        prefs.setLang(l);
        close();
        toast('Language set to ' + l);
      },
    }));
  } else if (kind === 'country') {
    title = 'Country of residence';
    items = COUNTRIES.map((x) => ({
      key: x[0],
      label: x[1],
      tag: x[0],
      sub: 'Display currency ' + x[2],
      on: x[1] === session.country,
      onPress: () => {
        session.set({ country: x[1] });
        close();
      },
    }));
  } else if (kind === 'devices') {
    title = 'Active devices';
    items = session.devices.map((d) => ({
      key: String(d.id),
      label: d.n,
      sub: `${d.loc} · ${d.t}`,
      on: !!d.cur,
      action: d.cur ? undefined : 'Sign out',
      onPress: d.cur
        ? undefined
        : () => {
            session.set({ devices: session.devices.filter((x) => x.id !== d.id) });
            haptic.impact();
            toast(d.n + ' signed out');
          },
    }));
  } else if (kind === 'cvFrom' || kind === 'cvTo') {
    const isF = kind === 'cvFrom';
    const cv = drafts.convert;
    title = isF ? 'Convert from' : 'Convert to';
    items = CONVERT_ASSETS.map((a) => ({
      key: a,
      label: a,
      sub: `${COINS[a].n} · ${fmt(bal[a] ?? 0, convertDp(a))}`,
      on: (isF ? cv.from : cv.to) === a,
      onPress: () => {
        const other = isF ? cv.to : cv.from;
        const next = isF ? { from: a, to: a === other ? cv.from : cv.to } : { to: a, from: a === other ? cv.to : cv.from };
        drafts.patch('convert', { ...next, amt: '' });
        close();
      },
    }));
  } else if (kind === 'trFrom' || kind === 'trTo') {
    const isF = kind === 'trFrom';
    const tr = drafts.transfer;
    title = isF ? 'From account' : 'To account';
    items = (Object.keys(ACCOUNT_NAMES) as Account[]).map((a) => ({
      key: a,
      label: ACCOUNT_NAMES[a],
      sub: `${fmt(accounts[a], 2)} USDT available`,
      on: (isF ? tr.from : tr.to) === a,
      onPress: () => {
        const other = isF ? tr.to : tr.from;
        const next = isF ? { from: a, to: a === other ? tr.from : tr.to } : { to: a, from: a === other ? tr.to : tr.from };
        drafts.patch('transfer', next);
        close();
      },
    }));
  } else if (kind === 'dev') {
    title = 'Developer options';
    const states: ListState[] = ['live', 'loading', 'empty', 'error'];
    items = [
      ...states.map((st) => ({
        key: st,
        label: `List state · ${st[0].toUpperCase() + st.slice(1)}`,
        sub: st === 'live' ? 'Real data with loading on boot' : 'Force this state on every list',
        on: prefs.listState === st,
        onPress: () => prefs.setListState(st),
      })),
      {
        key: 'live',
        label: 'Live prices',
        sub: prefs.livePrices ? 'Ticking every 1.2s' : 'Paused',
        on: prefs.livePrices,
        onPress: () => prefs.setLivePrices(!prefs.livePrices),
      },
      {
        key: 'splash',
        label: 'Replay splash',
        sub: 'Restart from the animated launch screen',
        onPress: () => {
          close();
          router.replace('/');
        },
      },
    ];
  }

  return (
    <SheetBody title={title} px={12} gap={0}>
      {items.map((o) => (
        <Animated.View key={o.key} exiting={rowExit} layout={rowLayout}>
          <Press
            scale={1}
            disabled={!o.onPress}
            onPress={() => {
              haptic.tap();
              o.onPress?.();
            }}
            pressedStyle={{ backgroundColor: c.s3 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              minHeight: 48,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: o.on && kind !== 'devices' ? c.s2 : 'transparent',
            }}>
            {o.tag && (
              <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: c.s3 }}>
                <Txt mono size={12}>
                  {o.tag}
                </Txt>
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={15} weight={500}>
                {o.label}
              </Txt>
              {o.sub && (
                <Txt size={12} color={c.t3}>
                  {o.sub}
                </Txt>
              )}
            </View>
            {o.on && <Icon name="check" size={18} sw={2.6} color={c.acT} />}
            {o.action && (
              <Txt size={13} weight={600} color={c.dn}>
                {o.action}
              </Txt>
            )}
          </Press>
        </Animated.View>
      ))}
    </SheetBody>
  );
}
