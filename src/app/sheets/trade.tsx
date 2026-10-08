import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Icon, type IconName } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import { useTabNav } from '@/lib/nav';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';

type Item = { key: string; title: string; body: string; icon: IconName; risk?: boolean; accent?: boolean; gate?: string };

const ITEMS: Item[] = [
  { key: 'spot', title: 'Spot', body: 'Buy and sell at market or limit price. 0.10% taker fee.', icon: 'trade', accent: true },
  { key: 'futures', title: 'Futures', body: 'USDT-M perpetuals up to 100x. Leverage can liquidate your margin.', icon: 'candles', risk: true },
  { key: 'convert', title: 'Convert', body: 'Swap at a locked quote. Spread is included, no separate fee.', icon: 'convert', gate: 'Sign up to convert' },
  { key: 'p2p', title: 'P2P', body: 'Buy USDT with bank transfer, OPay, M-Pesa and more. Escrow-protected.', icon: 'p2p', gate: 'Sign up to buy with P2P' },
];

export default function TradeSheet() {
  const c = useColors();
  const router = useRouter();
  const goTab = useTabNav();
  const guest = useSession((s) => s.status === 'guest');

  const pick = (it: Item) => {
    if (guest && it.gate) {
      router.replace({ pathname: '/sheets/guest', params: { title: it.gate } });
      return;
    }
    router.back();
    if (it.key === 'spot') goTab('trade');
    else if (it.key === 'futures') goTab('futures');
    else router.push(it.key === 'convert' ? '/convert' : '/p2p');
  };

  return (
    <SheetBody title="Trade" px={0} gap={0}>
      {ITEMS.map((it) => (
        <Press key={it.key} scale={1} onPress={() => pick(it)} pressedStyle={{ backgroundColor: c.s2 }} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, paddingVertical: 10, paddingHorizontal: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: it.accent ? tint(c.ac, 12) : c.s2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={it.icon} size={22} color={it.accent ? c.acT : c.t1} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt size={16} weight={600}>
                {it.title}
              </Txt>
              {it.risk && (
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tint(c.warn, 14) }}>
                  <Txt size={10} weight={600} color={c.warn}>
                    HIGH RISK
                  </Txt>
                </View>
              )}
            </View>
            <Txt size={13} lh={1.35} color={c.t2}>
              {it.body}
            </Txt>
          </View>
        </Press>
      ))}
    </SheetBody>
  );
}
