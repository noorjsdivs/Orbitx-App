import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Appear } from '@/components/layout/appear';
import { Header, IconButton, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Chip, ChipRow } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { Card, Rows } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { NETWORKS } from '@/data/fixtures';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { toast } from '@/store/toast';
import { blend, tint } from '@/theme/color';

export default function Deposit() {
  const c = useColors();
  const router = useRouter();
  const [netId, setNetId] = useState('TRC-20');
  const n = NETWORKS.find((x) => x.id === netId) ?? NETWORKS[0];
  const copy = async (v: string, msg: string) => {
    await Clipboard.setStringAsync(v);
    haptic.success();
    toast(msg);
  };

  return (
    <Screen gap={14} top={<Header title="Deposit USDT" right={<IconButton name="history" label="Deposit history" onPress={() => router.push('/orders')} />} />}>
      <Appear i={0} style={{ marginHorizontal: 16, gap: 8 }}>
        <Txt size={13} weight={500} color={c.t2}>
          Network
        </Txt>
        <ChipRow>
          {NETWORKS.map((x) => (
            <Chip key={x.id} label={x.id} selected={x.id === netId} onPress={() => setNetId(x.id)} />
          ))}
        </ChipRow>
        <Txt size={12} color={c.t3}>
          {n.name} · {n.conf}
        </Txt>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <Card style={{ alignItems: 'center', gap: 14 }}>
          <View style={{ padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: c.line }}>
            <QRCode value={n.addr} size={150} color="#111111" backgroundColor="#FFFFFF" ecl="M" />
          </View>
          <Txt size={12} color={c.t3}>
            USDT · {n.id} address
          </Txt>
          <Txt mono size={13} lh={1.5} align="center" style={{ maxWidth: 300 }} selectable>
            {n.addr}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch' }}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" h={44} size={14} label="Share" onPress={() => Share.share({ message: `My ORBITX USDT (${n.id}) deposit address: ${n.addr}` })} />
            </View>
            <View style={{ flex: 1 }}>
              <Button h={44} size={14} label="Copy address" onPress={() => copy(n.addr, `Address copied · ${n.id}`)} />
            </View>
          </View>
        </Card>
      </Appear>
      {n.memo && (
        <Appear i={2} style={{ marginHorizontal: 16 }}>
          <View style={{ paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, backgroundColor: blend(c.warn, c.s1, 8), borderWidth: 1, borderColor: tint(c.warn, 45), gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt size={14} weight={600} color={c.warn}>
                MEMO required
              </Txt>
              <Press
                onPress={() => copy(n.memo!, 'Memo copied')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: c.s4 }}>
                <Txt mono size={13}>
                  {n.memo}
                </Txt>
                <Icon name="copy" size={16} sw={2} />
              </Press>
            </View>
            <Txt size={12} lh={1.45} color={c.t2}>
              {"Include this memo with your transfer. Deposits without the correct memo can't be credited and may be lost."}
            </Txt>
          </View>
        </Appear>
      )}
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Card>
          <Rows
            gap={12}
            rows={[
              { k: 'Minimum deposit', v: n.id === 'ERC-20' ? '10 USDT' : '1 USDT' },
              { k: 'Credited after', v: n.conf.split(' · ')[0] },
              { k: 'Withdrawable after', v: n.id === 'ERC-20' ? '64 confirmations' : 'Same as credit' },
              { k: 'Status', v: n.id === 'TON' ? 'Paused 10:00–12:00 UTC' : 'Operational', c: n.id === 'TON' ? c.warn : c.up },
            ]}
          />
        </Card>
      </Appear>
      <Appear i={4} style={{ marginHorizontal: 16 }}>
        <Txt size={12} lh={1.5} color={c.t3}>
          Send only USDT on {n.id}. Other assets or networks may be lost permanently.
        </Txt>
      </Appear>
    </Screen>
  );
}
