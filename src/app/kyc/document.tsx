import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { RadioDot } from '@/components/ui/controls';
import { Card } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { ID_DOCS } from '@/data/fixtures';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';

export default function KycDocument() {
  const c = useColors();
  const router = useRouter();
  const { country, idType, set } = useSession();
  return (
    <FlowPage kycStep={0}>
      <Appear i={0}>
        <FlowTitle
          title="Choose your document"
          sub={
            <>
              Issued by <Txt color={c.t1}>{country}</Txt>. It must be valid and not expired.
            </>
          }
        />
      </Appear>
      <Appear i={1} style={{ gap: 10 }}>
        {ID_DOCS.map((d) => {
          const sel = d.k === idType;
          return (
            <Press
              key={d.k}
              scale={0.98}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
              onPress={() => {
                haptic.tap();
                set({ idType: d.k });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                minHeight: 72,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: sel ? c.ac : c.s3,
                backgroundColor: sel ? tint(c.ac, 6) : c.s1,
                transitionProperty: ['borderColor', 'backgroundColor'],
                transitionDuration: 250,
              }}>
              <RadioDot on={sel} />
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={15} weight={600}>
                  {d.t}
                </Txt>
                <Txt size={12} color={c.t3}>
                  {d.d}
                </Txt>
              </View>
            </Press>
          );
        })}
      </Appear>
      <Appear i={2}>
        <Card gap={8} style={{ paddingVertical: 14 }}>
          <Txt size={13} weight={600}>
            For a fast approval
          </Txt>
          <Txt size={13} color={c.t2}>
            · Original document, not a photocopy or screenshot
          </Txt>
          <Txt size={13} color={c.t2}>
            · All four corners visible, no glare
          </Txt>
        </Card>
      </Appear>
      <Spacer />
      <Button label="Continue" size={16} onPress={() => router.push('/kyc/scan')} />
    </FlowPage>
  );
}
