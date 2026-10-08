import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { RowsPanel, type KV } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { computeTicket, placeOrder } from '@/features/spot';
import { useColors } from '@/hooks/use-theme';
import { fmt, num } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { useWallet } from '@/store/wallet';

export default function OrderConfirm() {
  const c = useColors();
  const router = useRouter();
  const spot = useDrafts((s) => s.spot);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const T = computeTicket(spot, prices, bal);
  const dp = T.co.dp;
  const otl = spot.otype === 'market' ? 'Market' : spot.otype === 'stop' ? 'Stop-limit' : 'Limit';
  const rows: KV[] = [
    { k: 'Pair', v: `${T.k}/USDT` },
    { k: 'Type', v: `${otl} · ${T.isBuy ? 'Buy' : 'Sell'}` },
  ];
  if (spot.otype === 'stop') rows.push({ k: 'Stop (trigger)', v: `${fmt(num(spot.stopIn), dp)} USDT` });
  rows.push(
    { k: 'Price', v: spot.otype === 'market' ? `Market ≈ ${fmt(T.live, dp)}` : `${fmt(T.priceN, dp)} USDT` },
    { k: 'Amount', v: `${fmt(T.amtN, T.ad)} ${T.k}` },
    { k: 'Total', v: `${fmt(T.totalN, 2)} USDT` },
    { k: 'Est. fee', v: `${fmt(T.feeN, 4)} USDT` },
  );
  if (spot.otype === 'market') rows.push({ k: 'Max slippage', v: '0.05%' });
  const note =
    spot.otype === 'market'
      ? 'Market orders fill immediately at the best available prices and pay the taker fee (0.10%). Fast markets can fill at a worse price, up to your slippage limit.'
      : spot.otype === 'stop'
        ? 'When the last price reaches your stop, a limit order is placed at your limit price. It may fill partially or not at all.'
        : 'Limit orders that rest on the book pay the maker fee (0.08%). Fee shown at the taker rate. Your order may fill partially.';

  return (
    <SheetBody title={`Confirm ${otl.toLowerCase()} ${T.isBuy ? 'buy' : 'sell'}`} closable={false} px={16}>
      <RowsPanel rows={rows} size={14} keyColor={c.t2} />
      <Txt size={12} lh={1.5} color={c.t2}>
        {note}
      </Txt>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" label="Cancel" onPress={() => router.back()} />
        </View>
        <View style={{ flex: 2 }}>
          <Button
            variant={T.isBuy ? 'buy' : 'sell'}
            label={`Confirm ${T.isBuy ? 'buy' : 'sell'}`}
            dim={!T.ok}
            onPress={() => {
              placeOrder();
              router.back();
            }}
          />
        </View>
      </View>
    </SheetBody>
  );
}
