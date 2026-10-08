import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { TFA_SECRET } from '@/data/fixtures';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';

export default function SetupSecurity() {
  const c = useColors();
  const router = useRouter();
  const { email, antiPh, set } = useSession();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = code.length === 6;
  const uri = `otpauth://totp/ORBITX:${encodeURIComponent(email || 'christina.john@gmail.com')}?secret=${TFA_SECRET}&issuer=ORBITX`;

  const enable = () => {
    if (!ok) return toast('Enter the 6-digit code from your app');
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      set({ tfaOn: true });
      haptic.success();
      router.push('/setup/verification');
      toast('Authenticator 2FA enabled');
    }, 800);
  };

  return (
    <FlowPage setupStep={1}>
      <Appear i={0}>
        <FlowTitle eyebrow="SECURITY" title="Turn on authenticator 2FA" sub="Scan with Google Authenticator, Authy or 1Password, then enter the 6-digit code." />
      </Appear>
      <Appear i={1} style={{ flexDirection: 'row', gap: 16, alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
        <View style={{ padding: 8, borderRadius: 12, backgroundColor: '#FFFFFF' }}>
          <QRCode value={uri} size={100} color="#111111" backgroundColor="#FFFFFF" ecl="M" />
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <Txt size={12} color={c.t3}>
            Setup key
          </Txt>
          <Txt mono size={13} lh={1.5}>
            {TFA_SECRET.match(/.{1,4}/g)?.join(' ')}
          </Txt>
          <Press
            onPress={async () => {
              await Clipboard.setStringAsync(TFA_SECRET);
              haptic.tap();
              toast('Setup key copied');
            }}
            pressedStyle={{ backgroundColor: c.s2 }}
            style={{ alignSelf: 'flex-start', height: 36, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: c.s4, justifyContent: 'center' }}>
            <Txt size={12} weight={500}>
              Copy key
            </Txt>
          </Press>
        </View>
      </Appear>
      <Appear i={2} style={{ gap: 8 }}>
        <Txt size={13} color={c.t2}>
          6-digit code from the app
        </Txt>
        <Field
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          placeholder="••••••"
          maxLength={6}
          mono
          size={24}
          inputStyle={{ letterSpacing: 9.6, paddingHorizontal: 16 }}
        />
      </Appear>
      <Appear i={3} style={{ gap: 8 }}>
        <Txt size={13} color={c.t2}>
          Anti-phishing code (optional)
        </Txt>
        <Field value={antiPh} onChangeText={(v) => set({ antiPh: v })} placeholder="Shown in every real ORBITX email" maxLength={20} h={44} inputStyle={{ paddingHorizontal: 16 }} />
      </Appear>
      <Spacer />
      <Button label="Enable 2FA" size={16} dim={!ok} loading={busy} onPress={enable} />
      <Press
        scale={1}
        onPress={() => {
          set({ tfaOn: false });
          router.push('/setup/verification');
        }}
        style={{ height: 40, alignItems: 'center', justifyContent: 'center', marginTop: -6 }}>
        <Txt size={13} color={c.t2}>
          Skip for now · withdrawals stay locked without 2FA
        </Txt>
      </Press>
    </FlowPage>
  );
}
