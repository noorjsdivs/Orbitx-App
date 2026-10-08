import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { SlidingSeg } from '@/components/ui/controls';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { AVATAR_URL, COUNTRIES } from '@/data/fixtures';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { useColors } from '@/hooks/use-theme';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';

export default function SetupProfile() {
  const c = useColors();
  const router = useRouter();
  const { name, country, curMode, set } = useSession();
  const ctry = COUNTRIES.find((x) => x[1] === country) ?? COUNTRIES[0];
  const ok = name.trim().length >= 2;

  return (
    <FlowPage setupStep={0}>
      <Appear i={0}>
        <FlowTitle eyebrow="PROFILE" title="Tell us about you" sub="Use your legal name. It must match your ID for verification." />
      </Appear>
      <Appear i={1} style={{ alignItems: 'center' }}>
        <View style={{ width: 88, height: 88 }}>
          <Image source={{ uri: AVATAR_URL }} style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: c.s1 }} contentFit="cover" />
          <View style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15, backgroundColor: c.s3, borderWidth: 3, borderColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pencil" size={14} sw={2} />
          </View>
        </View>
      </Appear>
      <Appear i={2} style={{ gap: 8 }}>
        <Txt size={13} color={c.t2}>
          Legal full name
        </Txt>
        <Field value={name} onChangeText={(v) => set({ name: v })} placeholder="First and last name" autoComplete="name" textContentType="name" autoCapitalize="words" size={16} inputStyle={{ paddingHorizontal: 16 }} />
      </Appear>
      <Appear i={3} style={{ gap: 8 }}>
        <Txt size={13} color={c.t2}>
          Country of residence
        </Txt>
        <Press
          onPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'country' } })}
          scale={0.98}
          pressedStyle={{ backgroundColor: c.s2 }}
          style={{ height: 48, borderRadius: 10, borderWidth: 1, borderColor: c.s3, backgroundColor: c.s1, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5, backgroundColor: c.s3 }}>
            <Txt mono size={12}>
              {ctry[0]}
            </Txt>
          </View>
          <Txt size={16} style={{ flex: 1 }}>
            {country}
          </Txt>
          <Icon name="chevronDown" size={16} sw={2} color={c.t3} />
        </Press>
      </Appear>
      <Appear i={4} style={{ gap: 8 }}>
        <Txt size={13} color={c.t2}>
          Display currency
        </Txt>
        <SlidingSeg
          h={48}
          options={[
            { value: 'local', label: ctry[2] },
            { value: 'usd', label: 'USD' },
          ]}
          value={curMode}
          onChange={(v) => set({ curMode: v as 'local' | 'usd' })}
        />
      </Appear>
      <Spacer />
      <Button
        label="Continue"
        size={16}
        dim={!ok}
        onPress={() => {
          if (!ok) return toast('Enter your legal name as shown on your ID');
          router.push('/setup/security');
        }}
      />
    </FlowPage>
  );
}
