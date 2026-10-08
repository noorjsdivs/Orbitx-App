import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear, AppearProvider } from '@/components/layout/appear';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { Wordmark } from '@/components/wordmark';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { fmt } from '@/lib/format';
import { useSession } from '@/store/session';
import { tint } from '@/theme/color';
import { motion } from '@/theme/tokens';

const out = cubicBezier(...motion.out);
const pop = cubicBezier(...motion.pop);

const SLIDES = [
  { eyebrow: '01 · BUY', title: 'Buy crypto with the money you already use.', body: 'Bank transfer, mobile money or card. You see the fee and rate before you pay.' },
  { eyebrow: '02 · TRADE', title: 'Trade with the depth you can see.', body: 'Live order book, limit and stop orders, 0.10% taker fee. Switch to Lite any time.' },
  { eyebrow: '03 · EARN', title: 'Put idle USDT to work.', body: 'Flexible and locked products. Rates are estimates, not guaranteed, and can change.' },
];

/** Fragment animation for the active slide (fade-up with per-element delays). */
function Frag({ active, delay, children, popIn, style }: { active: boolean; delay: number; children: React.ReactNode; popIn?: boolean; style?: object }) {
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: active ? 1 : 0,
          transform: popIn ? [{ scale: active ? 1 : 0.3 }] : [{ translateY: active ? 0 : 28 }, { scale: active ? 1 : 0.97 }],
          transitionProperty: ['opacity', 'transform'],
          transitionDuration: active ? (popIn ? [400, 600] : [500, 700]) : 0,
          transitionDelay: active ? delay : 0,
          transitionTimingFunction: ['ease', popIn ? pop : out],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

function PayVisual({ active }: { active: boolean }) {
  const c = useColors();
  const card = { padding: 18, borderRadius: 20, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, gap: 6 };
  const pill = (t: string) => (
    <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: c.s2 }}>
      <Txt size={13} weight={600}>
        {t}
      </Txt>
    </View>
  );
  return (
    <View style={{ height: 360, justifyContent: 'center', gap: 10 }}>
      <Frag active={active} delay={150} style={card}>
        <Txt size={12} color={c.t3}>
          You pay
        </Txt>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt size={30} weight={600} ls={-0.02}>
            ₦150,000.00
          </Txt>
          {pill('NGN')}
        </View>
      </Frag>
      <Frag active={active} delay={380} popIn style={{ alignSelf: 'center', marginVertical: -24, zIndex: 1 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 6px ${c.bg}` }}>
          <Icon name="arrowDown" size={18} sw={2.4} color={c.onAc} />
        </View>
      </Frag>
      <Frag active={active} delay={300} style={card}>
        <Txt size={12} color={c.t3}>
          You receive
        </Txt>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt size={30} weight={600} ls={-0.02} color={c.acT}>
            96.13
          </Txt>
          {pill('USDT')}
        </View>
        <Txt size={12} color={c.t3}>
          1 USDT ≈ ₦1,560.40 · quote locked for 30s
        </Txt>
      </Frag>
      <Frag active={active} delay={450} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['Bank transfer', 'OPay', 'M-Pesa', 'Card'].map((t) => (
          <View key={t} style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: c.s3, justifyContent: 'center' }}>
            <Txt size={12} color={c.t2}>
              {t}
            </Txt>
          </View>
        ))}
      </Frag>
    </View>
  );
}

const BOOK_W = [38, 62, 24, 80, 46, 52, 30, 74, 58, 90];

function BookVisual({ active }: { active: boolean }) {
  const c = useColors();
  return (
    <View style={{ height: 360, justifyContent: 'center' }}>
      <Frag active={active} delay={150} style={{ padding: 18, borderRadius: 20, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, gap: 3 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <Txt size={15} weight={600}>
            BTC/USDT
          </Txt>
          <Txt size={12} weight={600} color={c.up}>
            +2.14%
          </Txt>
        </View>
        {BOOK_W.map((w, i) => {
          const ask = i < 5;
          const p = 67412.3 + (ask ? (5 - i) * 1.4 : -(i - 4) * 1.3);
          return (
            <View key={i} style={{ height: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Animated.View
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 2,
                  bottom: 2,
                  borderRadius: 2,
                  backgroundColor: tint(ask ? c.dn : c.up, 14),
                  width: active ? `${w}%` : '0%',
                  transitionProperty: 'width',
                  transitionDuration: active ? 800 : 0,
                  transitionDelay: active ? 250 + i * 60 : 0,
                  transitionTimingFunction: out,
                }}
              />
              <Txt size={12} color={ask ? c.dn : c.up}>
                {fmt(p, 2)}
              </Txt>
              <Txt size={12} color={c.t2}>
                {(0.012 + ((i * 37) % 17) / 100).toFixed(5)}
              </Txt>
            </View>
          );
        })}
      </Frag>
      <Frag active={active} delay={450} style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        {['Limit', 'Market', 'Stop-limit', 'Perps'].map((t, i) => (
          <View key={t} style={{ height: 32, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center', backgroundColor: i === 0 ? c.s2 : 'transparent', borderWidth: i === 0 ? 0 : 1, borderColor: c.s3 }}>
            <Txt size={12} weight={i === 0 ? 600 : 400} color={i === 0 ? c.t1 : c.t2}>
              {t}
            </Txt>
          </View>
        ))}
      </Frag>
    </View>
  );
}

const EARN_BARS = [22, 30, 34, 41, 47, 55, 60, 68, 77, 90];

function EarnVisual({ active }: { active: boolean }) {
  const c = useColors();
  return (
    <View style={{ height: 360, justifyContent: 'center' }}>
      <Frag active={active} delay={150} style={{ padding: 20, borderRadius: 20, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ gap: 4 }}>
            <Txt size={13} color={c.t2}>
              USDT Flexible
            </Txt>
            <Txt size={44} weight={600} ls={-0.03} color={c.acT} lh={1.05}>
              5.10%
            </Txt>
            <Txt size={12} color={c.t3}>
              Est. APR · variable
            </Txt>
          </View>
          <View style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: tint(c.ac, 12) }}>
            <Txt size={11} weight={600} color={c.acT}>
              Paid daily
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 110 }}>
          {EARN_BARS.map((v, i) => (
            <Animated.View
              key={i}
              style={{
                flex: 1,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                backgroundColor: i === 9 ? c.ac : `rgba(61,255,176,${(0.16 + i * 0.05).toFixed(2)})`,
                height: active ? `${v}%` : '4%',
                transitionProperty: 'height',
                transitionDuration: active ? 700 : 0,
                transitionDelay: active ? 250 + i * 55 : 0,
                transitionTimingFunction: out,
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {['Day 1', 'Rewards on 800 USDT', 'Day 10'].map((t) => (
            <Txt key={t} size={12} color={c.t3}>
              {t}
            </Txt>
          ))}
        </View>
      </Frag>
    </View>
  );
}

export default function Onboarding() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const finish = () => {
    useSession.getState().set({ onboarded: true });
    router.replace('/welcome');
  };
  const goTo = (i: number) => {
    haptic.tap();
    setIdx(i);
    scroller.current?.scrollTo({ x: i * width, animated: true });
  };
  const visuals = [PayVisual, BookVisual, EarnVisual];

  return (
    <AppearProvider>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }} onLayout={() => setTimeout(() => setReady(true), 40)}>
        <Appear i={0} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52, paddingLeft: 24, paddingRight: 12 }}>
          <Wordmark size={19} />
          <Press onPress={finish} style={{ height: 40, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: c.glassBd, backgroundColor: c.glass2, justifyContent: 'center' }}>
            <Txt size={14} weight={500}>
              Skip
            </Txt>
          </Press>
        </Appear>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            if (i !== idx) haptic.tap();
            setIdx(i);
          }}
          style={{ flex: 1 }}>
          {SLIDES.map((s, i) => {
            const Visual = visuals[i];
            return (
              <View key={s.eyebrow} style={{ width, paddingHorizontal: 24, paddingTop: 12 }}>
                <Visual active={ready && idx === i} />
                <Txt mono size={11} ls={0.12} color={c.acT} style={{ marginTop: 8 }}>
                  {s.eyebrow}
                </Txt>
                <Txt size={32} weight={600} ls={-0.03} lh={1.08} style={{ marginTop: 10 }}>
                  {s.title}
                </Txt>
                <Txt size={15} lh={1.5} color={c.t2} style={{ marginTop: 10 }}>
                  {s.body}
                </Txt>
              </View>
            );
          })}
        </ScrollView>
        <Appear i={3} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <Press key={i} accessibilityLabel={`Slide ${i + 1}`} scale={1} onPress={() => goTo(i)} hitSlop={8}>
                <Animated.View
                  style={{
                    width: i === idx ? 28 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === idx ? c.ac : c.s4,
                    transitionProperty: ['width', 'backgroundColor'],
                    transitionDuration: [450, 300],
                    transitionTimingFunction: [out, 'ease'],
                  }}
                />
              </Press>
            ))}
          </View>
          <Press
            onPress={() => (idx < 2 ? goTo(idx + 1) : finish())}
            scale={0.98}
            pressedStyle={{ backgroundColor: c.acP }}
            style={{
              height: 48,
              width: idx < 2 ? 132 : 188,
              borderRadius: 10,
              backgroundColor: c.ac,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              overflow: 'hidden',
              transitionProperty: 'width',
              transitionDuration: 500,
              transitionTimingFunction: cubicBezier(0.34, 1.3, 0.64, 1),
            }}>
            <Txt size={16} weight={500} color={c.onAc} numberOfLines={1}>
              {idx < 2 ? 'Next' : 'Get started'}
            </Txt>
            <Icon name="arrowRight" size={18} sw={2.2} color={c.onAc} />
          </Press>
        </Appear>
      </View>
    </AppearProvider>
  );
}
