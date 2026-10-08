import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';

import { Appear } from '@/components/layout/appear';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Spinner } from '@/components/ui/spinner';
import { Txt } from '@/components/ui/text';
import { ID_DOCS } from '@/data/fixtures';
import { FlowPage, FlowTitle, Spacer } from '@/features/flow-layout';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);
const scanLine = {
  '0%': { transform: [{ translateY: 0 }] },
  '50%': { transform: [{ translateY: 196 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

function Corner({ pos, color }: { pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const t = pos[0] === 't';
  const l = pos[1] === 'l';
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 28,
        height: 28,
        [t ? 'top' : 'bottom']: 14,
        [l ? 'left' : 'right']: 14,
        [t ? 'borderTopWidth' : 'borderBottomWidth']: 3,
        [l ? 'borderLeftWidth' : 'borderRightWidth']: 3,
        borderColor: color,
        [t ? (l ? 'borderTopLeftRadius' : 'borderTopRightRadius') : l ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: 8,
        transitionProperty: 'borderColor',
        transitionDuration: 300,
      }}
    />
  );
}

export default function KycScan() {
  const c = useColors();
  const router = useRouter();
  const idType = useSession((s) => s.idType);
  const doc = ID_DOCS.find((d) => d.k === idType) ?? ID_DOCS[0];
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const a = setTimeout(() => setStage(1), 350);
    const b = setTimeout(() => {
      setStage(2);
      haptic.success();
    }, 2700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [run]);

  const frame = stage === 2 ? c.ac : c.t1;
  const msg = ['Hold steady…', 'Scanning · keep the card inside the frame', 'Looks good. All details are readable.'][stage];

  return (
    <FlowPage kycStep={1}>
      <Appear i={0}>
        <FlowTitle title="Scan the front" sub={`${doc.t} · place it inside the frame on a dark surface.`} />
      </Appear>
      <Appear i={1}>
        <View style={{ height: 216, borderRadius: 18, backgroundColor: c.cam, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}>
          <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
            <Txt mono size={11} ls={0.1} color={c.t4}>
              CAMERA PREVIEW
            </Txt>
          </View>
          {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
            <Corner key={p} pos={p} color={frame} />
          ))}
          {stage === 1 && (
            <Animated.View
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                top: 10,
                height: 2,
                backgroundColor: c.ac,
                boxShadow: `0 0 16px 2px ${tint(c.ac, 60)}`,
                animationName: scanLine,
                animationDuration: 2200,
                animationIterationCount: 'infinite',
                animationTimingFunction: 'ease-in-out',
              }}
            />
          )}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: tint(c.ac, 10),
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: stage === 2 ? 1 : 0,
                transform: [{ scale: stage === 2 ? 1 : 0.92 }],
                transitionProperty: ['opacity', 'transform'],
                transitionDuration: [350, 500],
                transitionTimingFunction: ['ease', pop],
              },
            ]}>
            <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={26} sw={3} color={c.onAc} />
            </View>
            <Txt size={14} weight={600}>
              Front captured
            </Txt>
          </Animated.View>
        </View>
      </Appear>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 24 }}>
        {stage === 1 && <Spinner size={14} width={2} color={c.ac} duration={800} />}
        <Txt size={14} color={stage === 2 ? c.ac : c.t2}>
          {msg}
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['No glare', 'All corners visible', 'Text readable'].map((t) => (
          <View key={t} style={{ height: 30, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: c.s3, justifyContent: 'center' }}>
            <Txt size={12} color={c.t2}>
              {t}
            </Txt>
          </View>
        ))}
      </View>
      <Spacer />
      <Button label="Continue to selfie" size={16} dim={stage !== 2} onPress={() => stage === 2 && router.push('/kyc/selfie')} />
      <Press
        scale={1}
        onPress={() => {
          setStage(0);
          setRun((r) => r + 1);
        }}
        style={{ height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -6 }}>
        <Txt size={14} color={c.t2}>
          Retake
        </Txt>
      </Press>
    </FlowPage>
  );
}
