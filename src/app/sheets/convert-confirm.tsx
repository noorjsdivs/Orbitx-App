import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { RowsPanel } from '@/components/ui/misc';
import { Txt } from '@/components/ui/text';
import { computeConvert, convertDp, lockConvertQuote, rateFmt } from '@/features/convert';
import { haptic } from '@/hooks/use-haptics';
import { useSecondsLeft } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { fmt, stamp } from '@/lib/format';
import { useDrafts } from '@/store/drafts';
import { useMarket } from '@/store/market';
import { toast } from '@/store/toast';
import { uid, useWallet } from '@/store/wallet';

export default function ConvertConfirm() {
  const c = useColors();
  const router = useRouter();
  const cv = useDrafts((s) => s.convert);
  const patch = useDrafts((s) => s.patch);
  const prices = useMarket((s) => s.prices);
  const bal = useWallet((s) => s.bal);
  const setWallet = useWallet((s) => s.set);
  const left = useSecondsLeft(cv.quoteUntil);
  const t = computeConvert(cv, prices, bal);
  const expired = left === 0;

  const confirm = () => {
    if (expired) return lockConvertQuote();
    if (!t.ok) return;
    const toUsdt = cv.to === 'USDT';
    setWallet((s) => ({
      bal: { ...s.bal, [cv.from]: (s.bal[cv.from] ?? 0) - t.ca, [cv.to]: (s.bal[cv.to] ?? 0) + t.get },
      fills: [{ id: uid(), sym: toUsdt ? cv.from : cv.to, side: toUsdt ? 'sell' : 'buy', type: 'Convert', price: toUsdt ? t.rate : 1 / t.rate, amt: toUsdt ? t.ca : t.get, time: stamp() }, ...s.fills],
    }));
    patch('convert', { amt: '' });
    haptic.success();
    router.back();
    toast(`Converted ${fmt(t.ca, convertDp(cv.from))} ${cv.from} → ${fmt(t.get, convertDp(cv.to))} ${cv.to}`);
  };

  return (
    <SheetBody
      title="Confirm conversion"
      closable={false}
      right={
        <View style={{ paddingVertical: 4, paddingHorizontal: 8, marginRight: 12, borderRadius: 999, borderWidth: 1, borderColor: expired ? c.warn : c.s4 }}>
          <Txt mono size={12} color={expired ? c.warn : c.t2}>
            {expired ? 'Expired' : `Locked ${left}s`}
          </Txt>
        </View>
      }>
      <RowsPanel
        rows={[
          { k: 'You pay', v: `${fmt(t.ca, convertDp(cv.from))} ${cv.from}` },
          { k: 'You receive', v: `${fmt(t.get, convertDp(cv.to))} ${cv.to}` },
          { k: 'Rate', v: `1 ${cv.from} = ${rateFmt(t.rate)} ${cv.to}` },
          { k: 'Fee', v: '0 · spread included', c: c.up },
        ]}
      />
      <Button label={expired ? 'Refresh quote' : 'Convert now'} onPress={confirm} />
    </SheetBody>
  );
}
