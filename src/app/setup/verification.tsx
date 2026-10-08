import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { useEnterApp } from '@/features/auth';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';

function Level({ title, body, tag, featured }: { title: string; body: string; tag: string; featured?: boolean }) {
  const c = useColors();
  return (
    <View
      style={{
        padding: 16,
        gap: 8,
        borderRadius: featured ? 16 : 12,
        borderWidth: 1,
        borderColor: featured ? tint(c.ac, 35) : c.line,
        backgroundColor: featured ? tint(c.ac, 6) : c.s1,
      }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt size={15} weight={600}>
          {title}
        </Txt>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: featured ? c.ac : c.s3 }}>
          <Txt size={11} weight={600} color={featured ? c.onAc : c.t2}>
            {tag}
          </Txt>
        </View>
      </View>
      <Txt size={13} lh={1.5} color={c.t2}>
        {body}
      </Txt>
    </View>
  );
}

export default function SetupVerification() {
  const c = useColors();
  const router = useRouter();
  const enter = useEnterApp();
  return (
    <FlowPage setupStep={2}>
      <Appear i={0}>
        <FlowTitle eyebrow="VERIFICATION" title="Verify your identity" sub="Required by regulation to unlock withdrawals, P2P and Futures. Takes about 5 minutes." />
      </Appear>
      <Appear i={1} style={{ gap: 10 }}>
        <Level title="Level 0 · Unverified" tag="Current" body="Deposit crypto and trade Spot. No withdrawals, P2P or Futures." />
        <Level featured title="Level 2 · Verified" tag="Recommended" body="Withdraw up to 100,000 USDT per day, P2P trading, Futures up to 20x for new accounts." />
      </Appear>
      <Appear i={2} style={{ gap: 10 }}>
        <Txt size={13} color={c.t3}>
          {"You'll need"}
        </Txt>
        {['A valid government ID', 'A selfie in good light'].map((t, i) => (
          <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: c.s2, alignItems: 'center', justifyContent: 'center' }}>
              <Txt mono size={12} color={c.acT}>
                {i + 1}
              </Txt>
            </View>
            <Txt size={14}>{t}</Txt>
          </View>
        ))}
      </Appear>
      <Appear i={3}>
        <Txt size={12} lh={1.5} color={c.t3}>
          Your documents are encrypted and processed by our verification partner. We never share them with other users.
        </Txt>
      </Appear>
      <Spacer />
      <Button label="Start verification" size={16} onPress={() => router.push('/kyc/document')} />
      <Press scale={1} onPress={() => enter('user', 'You can verify any time from Profile')} style={{ height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -6 }}>
        <Txt size={14} color={c.t2}>
          {"I'll do it later"}
        </Txt>
      </Press>
    </FlowPage>
  );
}
