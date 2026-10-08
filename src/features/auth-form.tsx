import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { cubicBezier } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SocialButtons } from '@/components/auth-buttons';
import { Appear, AppearProvider } from '@/components/layout/appear';
import { FlowBack } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Checkbox, SlidingSeg, StepBars } from '@/components/ui/controls';
import { Field } from '@/components/ui/field';
import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { DIAL_CODES, flagUrl } from '@/data/fixtures';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useSession, type AuthTab } from '@/store/session';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import { fontFamily } from '@/theme/fonts';
import { motion } from '@/theme/tokens';

import { isEmail, passwordScore, useEnterGuest, useOAuth } from './auth';

const out = cubicBezier(...motion.out);
const pop = cubicBezier(...motion.pop);

function DialPicker({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const c = useColors();
  const dial = useSession((s) => s.dial);
  const set = useSession((s) => s.set);
  const [q, setQ] = useState('');
  const dq = q.trim().toLowerCase();
  const list = DIAL_CODES.filter((d) => !dq || d[1].toLowerCase().includes(dq) || d[2].includes(dq) || d[0].toLowerCase() === dq);
  if (!open) return null;
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 54,
        zIndex: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: c.s4,
        backgroundColor: c.bg,
        boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 44, borderBottomWidth: 1, borderBottomColor: c.line }}>
        <Icon name="search" size={16} sw={2} color={c.t3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          placeholder="Search country or code"
          placeholderTextColor={c.placeholder}
          style={{ flex: 1, height: 44, color: c.t1, fontSize: 14, fontFamily: fontFamily(400) }}
        />
      </View>
      <ScrollView style={{ maxHeight: 252 }} contentContainerStyle={{ padding: 4 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        {list.map((d) => {
          const on = d[0] === dial;
          return (
            <Press
              key={d[0]}
              scale={1}
              onPress={() => {
                set({ dial: d[0] });
                setOpen(false);
                setQ('');
              }}
              pressedStyle={{ backgroundColor: c.s2 }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 40, paddingHorizontal: 8, borderRadius: 8, backgroundColor: on ? c.s2 : 'transparent' }}>
              <Image source={{ uri: flagUrl(d[0]) }} style={{ width: 22, height: 16, borderRadius: 3, backgroundColor: c.s3 }} contentFit="cover" />
              <Txt size={14} numberOfLines={1} style={{ flex: 1 }}>
                {d[1]}
              </Txt>
              <Txt mono size={12} color={c.t3}>
                {d[2]}
              </Txt>
              <View style={{ width: 16, alignItems: 'center' }}>{on && <Icon name="check" size={14} sw={3} color={c.acT} />}</View>
            </Press>
          );
        })}
        {list.length === 0 && (
          <Txt size={13} color={c.t3} align="center" style={{ padding: 16 }}>
            No country found.
          </Txt>
        )}
      </ScrollView>
    </View>
  );
}

export function AuthForm({ mode }: { mode: 'signin' | 'register' }) {
  const c = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isReg = mode === 'register';
  const { authTab, email, phone, dial, set } = useSession();
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [refc, setRefc] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const oauth = useOAuth(isReg ? 'register' : 'signin');
  const guest = useEnterGuest();

  const dl = DIAL_CODES.find((d) => d[0] === dial) ?? DIAL_CODES[0];
  const score = passwordScore(pw);
  const sCol = [c.s3, c.dn, c.warn, c.up, c.ac][score];
  const rules: [string, boolean][] = [
    ['8 or more characters', pw.length >= 8],
    ['One uppercase letter', /[A-Z]/.test(pw)],
    ['One number', /\d/.test(pw)],
  ];

  const validId = () => (authTab === 'email' ? (isEmail(email) ? '' : 'Enter a valid email address') : phone.replace(/\D/g, '').length >= 9 ? '' : 'Enter a valid phone number');

  const submit = () => {
    if (busy) return;
    const e = isReg
      ? validId() || (rules.filter((r) => r[1]).length < 3 ? 'Use 8+ characters with an uppercase letter and a number' : '') || (!terms ? 'Accept the terms to continue' : '')
      : validId() || (pw.length < 8 ? 'Password must be at least 8 characters' : '');
    if (e) {
      haptic.warn();
      setErr(e);
      return;
    }
    setErr('');
    setBusy(true);
    setTimeout(
      () => {
        setBusy(false);
        set({ otpMode: isReg ? 'verify' : '2fa', pendingAdmin: !isReg && authTab === 'email' && /^admin@/i.test(email.trim()) });
        router.push('/otp');
      },
      isReg ? 1000 : 900,
    );
  };

  return (
    <AppearProvider>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 8 }}>
          {dialOpen && <Pressable onPress={() => setDialOpen(false)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />}
          <View style={{ height: 52, paddingHorizontal: 12, justifyContent: 'center' }}>
            <FlowBack onPress={() => router.back()} />
          </View>
          <View style={{ flex: 1, gap: 16, paddingHorizontal: 24, paddingTop: 12 }}>
            <Appear i={0} style={{ gap: 8 }}>
              <Txt mono size={11} ls={0.12} color={c.acT}>
                {isReg ? 'JOIN ORBITX' : 'WELCOME BACK'}
              </Txt>
              <Txt size={32} weight={600} ls={-0.03} lh={1.1}>
                {isReg ? 'Create your account' : 'Sign in to ORBITX'}
              </Txt>
            </Appear>
            <Appear i={1}>
              <SlidingSeg<AuthTab>
                options={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                ]}
                value={authTab}
                onChange={(v) => {
                  set({ authTab: v });
                  setErr('');
                }}
              />
            </Appear>
            <Appear i={2} style={{ gap: 12, zIndex: 20 }}>
              {authTab === 'email' ? (
                <Field
                  value={email}
                  onChangeText={(v) => {
                    set({ email: v });
                    setErr('');
                  }}
                  placeholder="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  clearButtonMode="while-editing"
                  textContentType="emailAddress"
                  size={16}
                  inputStyle={{ paddingHorizontal: 16 }}
                />
              ) : (
                <View style={{ zIndex: 20 }}>
                  <Field
                    value={phone}
                    onChangeText={(v) => {
                      set({ phone: v.replace(/[^0-9 ]/g, '') });
                      setErr('');
                    }}
                    placeholder={dl[3]}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    size={16}
                    inputStyle={{ paddingLeft: 124 }}
                  />
                  <Press
                    accessibilityLabel="Country code"
                    scale={1}
                    onPress={() => setDialOpen(!dialOpen)}
                    pressedStyle={{ backgroundColor: c.s2 }}
                    style={{
                      position: 'absolute',
                      left: 1,
                      top: 1,
                      bottom: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingLeft: 12,
                      paddingRight: 10,
                      borderRightWidth: 1,
                      borderRightColor: c.s4,
                      borderTopLeftRadius: 9,
                      borderBottomLeftRadius: 9,
                      backgroundColor: c.s1,
                    }}>
                    <Image source={{ uri: flagUrl(dl[0]) }} style={{ width: 22, height: 16, borderRadius: 3, backgroundColor: c.s3 }} contentFit="cover" />
                    <Txt size={15} weight={500}>
                      {dl[2]}
                    </Txt>
                    <Animated.View style={{ transform: [{ rotate: dialOpen ? '180deg' : '0deg' }], transitionProperty: 'transform', transitionDuration: 250 }}>
                      <Icon name="chevronDown" size={14} sw={2} color={c.t3} />
                    </Animated.View>
                  </Press>
                  <DialPicker open={dialOpen} setOpen={setDialOpen} />
                </View>
              )}
              <Field
                value={pw}
                onChangeText={(v) => {
                  setPw(v);
                  setErr('');
                }}
                placeholder="Password"
                secureTextEntry={!showPw}
                autoCapitalize="none"
                textContentType={isReg ? 'newPassword' : 'password'}
                size={16}
                inputStyle={{ paddingHorizontal: 16, paddingRight: 72 }}
                action={{ label: showPw ? 'Hide' : 'Show', onPress: () => setShowPw(!showPw), plain: true }}
              />
              {isReg && (
                <View style={{ gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <StepBars count={4} filled={score} color={sCol} gap={4} />
                    </View>
                    <Txt size={12} color={sCol} align="right" style={{ minWidth: 48 }}>
                      {pw ? ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][score] : ''}
                    </Txt>
                  </View>
                  <View style={{ gap: 6 }}>
                    {rules.map(([l, ok]) => (
                      <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Animated.View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            borderWidth: 1.5,
                            borderColor: ok ? c.ac : c.ctl,
                            backgroundColor: ok ? c.ac : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transitionProperty: ['backgroundColor', 'borderColor'],
                            transitionDuration: 250,
                          }}>
                          <Animated.View
                            style={{
                              opacity: ok ? 1 : 0,
                              transform: [{ scale: ok ? 1 : 0.4 }],
                              transitionProperty: ['opacity', 'transform'],
                              transitionDuration: 300,
                              transitionTimingFunction: pop,
                            }}>
                            <Icon name="check" size={10} sw={3.5} color={c.onAc} />
                          </Animated.View>
                        </Animated.View>
                        <Txt size={13} color={ok ? c.t1 : c.t3}>
                          {l}
                        </Txt>
                      </View>
                    ))}
                  </View>
                  <Press scale={1} onPress={() => setShowRef(!showRef)} style={{ alignSelf: 'flex-start', height: 36, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Txt size={13} color={c.t2}>
                      Referral code (optional)
                    </Txt>
                    <Animated.View style={{ transform: [{ rotate: showRef ? '180deg' : '0deg' }], transitionProperty: 'transform', transitionDuration: 300 }}>
                      <Icon name="chevronDown" size={14} sw={2} color={c.t2} />
                    </Animated.View>
                  </Press>
                  <Animated.View
                    style={{
                      maxHeight: showRef ? 60 : 0,
                      opacity: showRef ? 1 : 0,
                      overflow: 'hidden',
                      transitionProperty: ['maxHeight', 'opacity'],
                      transitionDuration: [400, 300],
                      transitionTimingFunction: [out, 'ease'],
                    }}>
                    <Field value={refc} onChangeText={(v) => setRefc(v.toUpperCase())} placeholder="e.g. ORX-7Q2K" h={44} mono autoCapitalize="characters" inputStyle={{ paddingHorizontal: 16 }} />
                  </Animated.View>
                  <Press
                    scale={1}
                    onPress={() => {
                      haptic.tap();
                      setTerms(!terms);
                      setErr('');
                    }}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: terms }}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 }}>
                    <Checkbox checked={terms} size={22} radius={7} />
                    <Txt size={13} lh={1.45} color={c.t2} style={{ flex: 1 }}>
                      {"I'm 18 or older and agree to the Terms of Use, Privacy Notice and Risk Disclosure."}
                    </Txt>
                  </Press>
                </View>
              )}
              {!isReg && (
                <Press scale={1} onPress={() => toast('If an account exists, a reset link is on its way')} style={{ alignSelf: 'flex-end', height: 36, justifyContent: 'center' }}>
                  <Txt size={13} weight={500} color={c.acT}>
                    Forgot password?
                  </Txt>
                </Press>
              )}
            </Appear>
            <Animated.View
              style={{
                maxHeight: err ? 64 : 0,
                opacity: err ? 1 : 0,
                overflow: 'hidden',
                transitionProperty: ['maxHeight', 'opacity'],
                transitionDuration: 300,
              }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: tint(c.warn, 10) }}>
                <Txt size={13} weight={700} color={c.warn}>
                  !
                </Txt>
                <Txt size={13} color={c.warn} style={{ flex: 1 }}>
                  {err}
                </Txt>
              </View>
            </Animated.View>
            <Appear i={3} style={{ gap: 12 }}>
              <Button label={busy ? (isReg ? 'Creating account…' : 'Signing in…') : isReg ? 'Create account' : 'Sign in'} size={16} loading={busy} style={{ opacity: busy ? 0.75 : 1 }} onPress={submit} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
                <Txt size={12} color={c.t3}>
                  or continue with
                </Txt>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
              </View>
              <SocialButtons busy={oauth.busy} onPress={oauth.start} order={['google', 'apple']} h={52} />
              <Button
                variant="dashed"
                label="Continue as guest"
                size={14}
                left={<Icon name="user" size={18} color={c.t2} />}
                right={<Icon name="chevronRight" size={14} sw={2} color={c.t2} />}
                onPress={guest}
              />
              {!isReg && (
                <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.s1, borderWidth: 1, borderColor: c.line }}>
                  <Icon name="shield" size={18} color={c.acT} />
                  <Txt size={12} lh={1.5} color={c.t2} style={{ flex: 1 }}>
                    Only sign in at orbitx.com or this app. ORBITX staff will never ask for your password or 2FA code.
                  </Txt>
                </View>
              )}
            </Appear>
            <View style={{ flex: 1, minHeight: 12 }} />
            <Appear i={4} style={{ alignItems: 'center' }}>
              <Press scale={1} onPress={() => router.replace(isReg ? '/sign-in' : '/register')} style={{ height: 44, justifyContent: 'center' }}>
                <Txt size={14} color={c.t2}>
                  {isReg ? 'Already have an account? ' : 'New to ORBITX? '}
                  <Txt size={14} weight={600} color={c.acT}>
                    {isReg ? 'Sign in' : 'Create account'}
                  </Txt>
                </Txt>
              </Press>
            </Appear>
          </View>
        </ScrollView>
      </View>
    </AppearProvider>
  );
}
