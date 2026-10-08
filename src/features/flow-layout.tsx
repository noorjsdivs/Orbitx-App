import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppearProvider, useAppearOn } from '@/components/layout/appear';
import { FlowBack } from '@/components/layout/screen';
import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);

function SetupProgress({ step }: { step: number }) {
  const c = useColors();
  const on = useAppearOn();
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: c.s3, overflow: 'hidden' }}>
          <Animated.View
            style={{
              height: '100%',
              backgroundColor: c.ac,
              width: i < step ? '100%' : i === step && on ? '55%' : '0%',
              transitionProperty: 'width',
              transitionDuration: 600,
              transitionTimingFunction: out,
            }}
          />
        </View>
      ))}
    </View>
  );
}

function KycDots({ step }: { step: number }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2, 3].map((i) => (
        <Animated.View
          key={i}
          style={{
            width: i === step ? 22 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i <= step ? c.ac : c.s4,
            transitionProperty: ['width', 'backgroundColor'],
            transitionDuration: [450, 300],
            transitionTimingFunction: [out, 'ease'],
          }}
        />
      ))}
    </View>
  );
}

/**
 * Full-screen flow page used by profile setup and KYC: round back button, progress
 * indicator, then content that fills the height with the CTA pinned at the bottom.
 */
export function FlowPage({
  children,
  setupStep,
  kycStep,
  title,
  back = true,
  onBack,
}: {
  children: React.ReactNode;
  setupStep?: number;
  kycStep?: number;
  title?: string;
  back?: boolean;
  onBack?: () => void;
}) {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <AppearProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 52, paddingLeft: 12, paddingRight: 24 }}>
            {back && <FlowBack onPress={onBack ?? (() => router.back())} />}
            {setupStep != null && (
              <>
                <SetupProgress step={setupStep} />
                <Txt mono size={12} color={c.t3}>
                  {setupStep + 1} / 3
                </Txt>
              </>
            )}
            {kycStep != null && (
              <>
                <Txt size={15} weight={600} style={{ flex: 1, paddingLeft: back ? 4 : 12 }}>
                  {title ?? 'Identity verification'}
                </Txt>
                <KycDots step={kycStep} />
              </>
            )}
          </View>
          <View style={{ flex: 1, gap: 16, paddingHorizontal: 24, paddingTop: 16 }}>{children}</View>
        </ScrollView>
      </View>
    </AppearProvider>
  );
}

/** Eyebrow + large title + supporting copy. */
export function FlowTitle({ eyebrow, title, sub, size = 30 }: { eyebrow?: string; title: string; sub?: React.ReactNode; size?: number }) {
  const c = useColors();
  return (
    <View style={{ gap: 8 }}>
      {eyebrow && (
        <Txt mono size={11} ls={0.12} color={c.acT}>
          {eyebrow}
        </Txt>
      )}
      <Txt size={size} weight={600} ls={-0.03} lh={1.12}>
        {title}
      </Txt>
      {sub != null && (
        <Txt size={14} lh={1.5} color={c.t2}>
          {sub}
        </Txt>
      )}
    </View>
  );
}

export function Spacer() {
  return <View style={{ flex: 1, minHeight: 12 }} />;
}
