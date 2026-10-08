import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { cubicBezier, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Appear, AppearProvider } from '@/components/layout/appear';
import { FlowBack } from '@/components/layout/screen';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { DIAL_CODES } from '@/data/fixtures';
import { useEnterApp } from '@/features/auth';
import { haptic } from '@/hooks/use-haptics';
import { useSecondsLeft } from '@/hooks/use-now';
import { useColors } from '@/hooks/use-theme';
import { maskEmail } from '@/lib/format';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { motion } from '@/theme/tokens';

const pop = cubicBezier(...motion.pop);
const blink = { '0%': { opacity: 1 }, '50%': { opacity: 0 }, '100%': { opacity: 1 } };
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function Otp() {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const enter = useEnterApp();
  const { otpMode, authTab, email, phone, dial, pendingAdmin } = useSession();
  const [otp, setOtp] = useState('');
  const code = useRef('');
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [tries, setTries] = useState(5);
  const [resendAt, setResendAt] = useState(() => Date.now() + 45000);
  const left = useSecondsLeft(resendAt);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const verify = otpMode === 'verify';
  const dest =
    authTab === 'email'
      ? maskEmail(email.trim() || 'christina.john@gmail.com')
      : (DIAL_CODES.find((d) => d[0] === dial) ?? DIAL_CODES[0])[2] + ' •••• ' + (phone.replace(/\D/g, '').slice(-4) || '5678');

  const done = () => {
    if (verify) {
      router.push('/setup/profile');
      toast(authTab === 'email' ? 'Email verified' : 'Phone verified');
    } else if (pendingAdmin) {
      enter('admin');
    } else {
      enter('user', 'Signed in · new device alert sent to your email');
    }
  };

  const press = (k: string) => {
    // Read the live value from a ref so rapid taps never see a stale code.
    if (busyRef.current || !k) return;
    haptic.tap();
    let v = code.current;
    if (k === 'del') v = v.slice(0, -1);
    else if (v.length < 6) v += k;
    else return;
    code.current = v;
    setOtp(v);
    setErr('');
    if (v.length === 6) {
      busyRef.current = true;
      setBusy(true);
      setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
        if (v === '000000') {
          const t = Math.max(0, tries - 1);
          setTries(t);
          code.current = '';
          setOtp('');
          setErr('Incorrect code. ' + t + ' attempts left.');
          haptic.error();
          shake.set(
            withSequence(withTiming(-10, { duration: 90 }), withTiming(9, { duration: 90 }), withTiming(-6, { duration: 90 }), withTiming(4, { duration: 90 }), withTiming(0, { duration: 90 })),
          );
        } else {
          haptic.success();
          done();
        }
      }, 800);
    }
  };

  const msg = busy ? 'Verifying…' : err || (verify ? 'No code? Check spam or promotions.' : 'Codes refresh every 30 seconds.');
  const msgC = err ? c.dn : busy ? c.ac : c.t3;

  return (
    <AppearProvider>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
        <View style={{ height: 52, paddingHorizontal: 12, justifyContent: 'center' }}>
          <FlowBack onPress={() => router.back()} />
        </View>
        <Appear i={0} style={{ gap: 8, paddingHorizontal: 24, paddingTop: 12 }}>
          <Txt mono size={11} ls={0.12} color={c.acT}>
            {verify ? 'VERIFY' : 'TWO-FACTOR'}
          </Txt>
          <Txt size={32} weight={600} ls={-0.03} lh={1.1}>
            {verify ? (authTab === 'email' ? 'Check your email' : 'Check your messages') : 'Enter your 2FA code'}
          </Txt>
          <Txt size={15} lh={1.5} color={c.t2}>
            {verify ? `We sent a 6-digit code to ${dest}. It expires in 10 minutes.` : 'Open your authenticator app and enter the 6-digit code for ORBITX.'}
          </Txt>
        </Appear>
        <Appear i={1}>
          <Animated.View style={[{ flexDirection: 'row', gap: 8, paddingHorizontal: 24, paddingTop: 24 }, shakeStyle]} accessibilityLabel={`Code, ${otp.length} of 6 digits entered`}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const d = otp[i] ?? '';
              const cur = i === otp.length && !busy;
              const bd = err ? c.dn : cur ? c.ac : d ? c.ctl : c.s3;
              return (
                <Animated.View
                  key={i}
                  style={{
                    flex: 1,
                    height: 60,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: bd,
                    backgroundColor: c.s1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: d && i === otp.length - 1 && !busy ? 1.04 : 1 }],
                    transitionProperty: ['borderColor', 'transform'],
                    transitionDuration: [200, 250],
                    transitionTimingFunction: ['ease', pop],
                  }}>
                  <Txt size={26} weight={600}>
                    {d}
                  </Txt>
                  {cur && otp.length < 6 && (
                    <Animated.View
                      style={{
                        position: 'absolute',
                        width: 2,
                        height: 26,
                        borderRadius: 1,
                        backgroundColor: c.ac,
                        animationName: blink,
                        animationDuration: 1000,
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'step-end',
                      }}
                    />
                  )}
                </Animated.View>
              );
            })}
          </Animated.View>
        </Appear>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 14, minHeight: 44 }}>
          <Txt size={13} color={msgC} style={{ flex: 1 }}>
            {msg}
          </Txt>
          {left <= 0 ? (
            <Press
              scale={1}
              onPress={() => {
                setResendAt(Date.now() + 45000);
                toast('New code sent to ' + dest);
              }}
              style={{ height: 44, justifyContent: 'center' }}>
              <Txt size={13} weight={500} color={c.acT}>
                Resend code
              </Txt>
            </Press>
          ) : (
            <Txt size={13} color={c.t3}>
              Resend in{' '}
              <Txt mono size={13} color={c.t1}>
                0:{String(left).padStart(2, '0')}
              </Txt>
            </Txt>
          )}
        </View>
        <View style={{ flex: 1 }} />
        <Appear i={2} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24 }}>
          {KEYS.map((k, i) => (
            <Press
              key={i}
              accessibilityLabel={k === 'del' ? 'Delete' : k || undefined}
              disabled={!k}
              scale={0.94}
              onPress={() => press(k)}
              pressedStyle={{ backgroundColor: c.s3 }}
              style={{ width: '31.6%', flexGrow: 1, height: 48, borderRadius: 10, backgroundColor: k ? c.s1 : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Txt size={24} weight={500}>
                {k === 'del' ? '⌫' : k}
              </Txt>
            </Press>
          ))}
        </Appear>
      </View>
    </AppearProvider>
  );
}
