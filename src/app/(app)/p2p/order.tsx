import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { StepBars } from '@/components/ui/controls';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Card, Notice, Rows } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Spinner } from '@/components/ui/spinner';
import { Txt } from '@/components/ui/text';
import { markPaid, merchantById, P2P_FIAT_AMOUNT, sendChat } from '@/features/p2p';
import { haptic } from '@/hooks/use-haptics';
import { useSecondsLeft } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { fmt, mmss } from '@/lib/format';
import { useTabNav } from '@/lib/nav';
import { useDrafts } from '@/store/drafts';
import { toast } from '@/store/toast';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);

export default function P2POrder() {
  const c = useColors();
  const router = useRouter();
  const goTab = useTabNav();
  const p2p = useDrafts((s) => s.p2p);
  const setAssetsTab = useDrafts((s) => s.setAssetsTab);
  const [msg, setMsg] = useState('');
  const [poppedStage, setPoppedStage] = useState(-1);
  const chatRef = useRef<ScrollView>(null);
  const left = useSecondsLeft(p2p.endAt);
  const m = merchantById(p2p.merchantId);
  const usdt = P2P_FIAT_AMOUNT / m.p;
  const stage = p2p.stage;

  const popped = stage === 2 && poppedStage === 2;
  useEffect(() => {
    if (stage !== 2) return;
    const t = setTimeout(() => setPoppedStage(2), 60);
    return () => clearTimeout(t);
  }, [stage]);

  const titles = ['Pay the seller', 'Waiting for release', 'Order completed'];
  const subs = [
    'Transfer within the time limit, then tap “I have paid”.',
    'The seller is confirming your payment. USDT is locked in escrow.',
    `${fmt(usdt, 2)} USDT is now in your Funding account.`,
  ];

  return (
    <Screen gap={14} top={<Header title={p2p.side === 'buy' ? 'Buy USDT' : 'Sell USDT'} />}>
      <Appear i={0} style={{ marginHorizontal: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={18} weight={600}>
                {titles[stage]}
              </Txt>
              <Txt size={13} lh={1.45} color={c.t2}>
                {subs[stage]}
              </Txt>
            </View>
            {stage < 2 && (
              <Txt mono size={20} weight={500} color={c.warn}>
                {mmss(left)}
              </Txt>
            )}
          </View>
          <StepBars count={3} filled={stage + 1} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {['Pay', 'Seller releases', 'Done'].map((l) => (
              <Txt key={l} size={11} color={c.t3}>
                {l}
              </Txt>
            ))}
          </View>
        </Card>
      </Appear>
      <Appear i={1} style={{ marginHorizontal: 16 }}>
        <Card>
          <Rows
            rows={[
              { k: 'You pay', v: `₦${fmt(P2P_FIAT_AMOUNT, 2)}` },
              { k: 'Price', v: `₦${fmt(m.p, 2)} / USDT` },
              { k: 'You receive', v: `${fmt(usdt, 2)} USDT` },
              { k: 'Order no.', v: `P2P-26100714${m.id}` },
            ]}
            gap={12}
          />
        </Card>
      </Appear>
      {stage === 0 && (
        <Appear i={2} style={{ marginHorizontal: 16 }}>
          <Card>
            <Txt size={15} weight={600}>
              Transfer to {m.n}
            </Txt>
            <View style={{ gap: 8 }}>
              <Rows
                rows={[
                  { k: 'Bank', v: 'Kuda Microfinance Bank' },
                  { k: 'Account name', v: 'Oluwaseun Adebayo' },
                ]}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Txt size={13} color={c.t3}>
                  Account no.
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Txt mono size={13}>
                    2014 583 916
                  </Txt>
                  <Press
                    accessibilityLabel="Copy account number"
                    scale={0.9}
                    onPress={async () => {
                      await Clipboard.setStringAsync('2014583916');
                      haptic.tap();
                      toast('Account number copied');
                    }}
                    style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="copy" size={16} sw={2} color={c.t2} />
                  </Press>
                </View>
              </View>
            </View>
            <Notice size={12}>{"Don't write crypto, USDT or ORBITX in the transfer note. Pay from an account in your own name."}</Notice>
          </Card>
        </Appear>
      )}
      {stage === 2 && (
        <Appear i={2} style={{ marginHorizontal: 16 }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Animated.View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: c.up,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: popped ? 1 : 0.4 }],
                transitionProperty: 'transform',
                transitionDuration: 600,
                transitionTimingFunction: pop,
              }}>
              <Icon name="check" size={22} sw={3} color="#FFFFFF" />
            </Animated.View>
            <Txt size={14} lh={1.45} style={{ flex: 1 }}>
              USDT released to your Funding account.
            </Txt>
          </Card>
        </Appear>
      )}
      <Appear i={3} style={{ marginHorizontal: 16 }}>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Txt size={15} weight={600}>
              Chat
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.up }} />
              <Txt size={12} color={c.up}>
                {m.n} · online
              </Txt>
            </View>
          </View>
          <ScrollView ref={chatRef} style={{ maxHeight: 220 }} contentContainerStyle={{ gap: 8 }} onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })} nestedScrollEnabled>
            {p2p.chat.map((x, i) => (
              <View key={i} style={{ alignItems: x.me ? 'flex-end' : 'flex-start', gap: 3 }}>
                <View style={{ maxWidth: '82%', paddingVertical: 9, paddingHorizontal: 12, borderRadius: 12, backgroundColor: x.me ? c.ac : c.s2 }}>
                  <Txt size={13} lh={1.4} color={x.me ? c.onAc : c.t1}>
                    {x.t}
                  </Txt>
                </View>
                <Txt mono size={10} color={c.t4}>
                  {x.time}
                </Txt>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Field
              value={msg}
              onChangeText={setMsg}
              placeholder="Message"
              h={44}
              returnKeyType="send"
              onSubmitEditing={() => {
                sendChat(msg);
                setMsg('');
              }}
              containerStyle={{ flex: 1 }}
            />
            <Press
              accessibilityLabel="Send"
              scale={0.92}
              onPress={() => {
                sendChat(msg);
                setMsg('');
              }}
              style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrowRight" size={18} sw={2.2} color={c.onAc} />
            </Press>
          </View>
        </Card>
      </Appear>
      <Appear i={4} style={{ marginHorizontal: 16 }}>
        {stage === 0 && (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label="Cancel"
                onPress={() => {
                  router.back();
                  toast('Order canceled · no payment was made');
                }}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button label="I've paid, notify seller" onPress={markPaid} />
            </View>
          </View>
        )}
        {stage === 1 && (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
              <Spinner size={16} width={2} color={c.ac} duration={800} />
              <Txt size={13} color={c.t2} style={{ flex: 1 }}>
                Waiting for the seller to confirm. USDT stays in escrow.
              </Txt>
            </View>
            <Button variant="secondary" label="Appeal" onPress={() => toast('Appeals open 10 minutes after payment')} />
          </View>
        )}
        {stage === 2 && (
          <Button
            label="View in Funding"
            onPress={() => {
              setAssetsTab('funding');
              goTab('assets');
            }}
          />
        )}
      </Appear>
    </Screen>
  );
}
