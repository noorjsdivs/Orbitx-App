import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocialButtons } from '@/components/auth-buttons';
import { Appear, AppearProvider } from '@/components/layout/appear';
import { FlashPrice } from '@/components/motion/flash-price';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { CoinGlyph } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { Wordmark } from '@/components/wordmark';
import { COINS } from '@/data/market';
import { useEnterGuest, useOAuth } from '@/features/auth';
import { useColors } from '@/hooks/use-theme';
import { fmt, pct } from '@/lib/format';
import { useMarket } from '@/store/market';

function Ticker() {
  const c = useColors();
  const prices = useMarket((s) => s.prices);
  return (
    <View style={{ padding: 6, borderRadius: 20, backgroundColor: c.glass2, borderWidth: 1, borderColor: c.line }}>
      {['BTC', 'ETH', 'SOL'].map((k) => {
        const q = prices[k];
        return (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, paddingHorizontal: 12 }}>
            <CoinGlyph sym={k} size={30} />
            <Txt size={15} weight={600} style={{ flex: 1 }}>
              {k}
              <Txt size={12} color={c.t3}>
                /USDT
              </Txt>
            </Txt>
            <FlashPrice value={q.p} dir={q.dir} size={15} weight={500} color={q.dir < 0 ? c.dn : c.t1}>
              {fmt(q.p, COINS[k].dp)}
            </FlashPrice>
            <Txt size={13} weight={600} color={q.c >= 0 ? c.up : c.dn} align="right" style={{ width: 64 }}>
              {pct(q.c)}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

export default function Welcome() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const oauth = useOAuth('signin');
  const guest = useEnterGuest();
  const points = ['Proof of reserves published monthly', '2FA, withdrawal whitelist and anti-phishing code', '24/7 support in 9 languages'];

  return (
    <AppearProvider>
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 16) + 8, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}>
        <Appear i={0}>
          <Wordmark size={19} />
        </Appear>
        <Appear i={1} style={{ marginTop: 28 }}>
          <Ticker />
        </Appear>
        <Appear i={2} style={{ marginTop: 32 }}>
          <Txt size={36} weight={600} ls={-0.035} lh={1.05}>
            One account to buy, trade and earn crypto.
          </Txt>
        </Appear>
        <Appear i={3} style={{ marginTop: 20, gap: 10 }}>
          {points.map((p) => (
            <View key={p} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Icon name="check" size={16} sw={2.4} color={c.acT} />
              <Txt size={14} color={c.t2}>
                {p}
              </Txt>
            </View>
          ))}
        </Appear>
        <View style={{ flex: 1, minHeight: 24 }} />
        <Appear i={4} style={{ gap: 10 }}>
          <Button label="Create account" size={16} onPress={() => router.push('/register')} />
          <Button label="Sign in" variant="secondary" size={16} onPress={() => router.push('/sign-in')} />
          <SocialButtons busy={oauth.busy} onPress={oauth.start} />
          <Press onPress={guest} style={{ alignSelf: 'center', height: 40, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Txt size={14} weight={500} color={c.t2}>
              Explore as guest
            </Txt>
            <Icon name="chevronRight" size={14} sw={2} color={c.t2} />
          </Press>
        </Appear>
        <Appear i={5} style={{ marginTop: 16 }}>
          <Txt size={11} lh={1.5} color={c.t3} align="center">
            By continuing you agree to the Terms of Use and Privacy Notice. Crypto prices are volatile; only invest what you can afford to lose.
          </Txt>
        </Appear>
      </ScrollView>
    </AppearProvider>
  );
}
