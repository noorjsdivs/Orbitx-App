import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Appear } from '@/components/layout/appear';
import { Header, Screen } from '@/components/layout/screen';
import { PillToggle, StepBars, Toggle } from '@/components/ui/controls';
import { Icon } from '@/components/ui/icon';
import { Card } from '@/components/ui/misc';
import { Press } from '@/components/ui/press';
import { Eyebrow, Txt } from '@/components/ui/text';
import { AVATAR_URL, COUNTRIES } from '@/data/fixtures';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useResetTo } from '@/lib/nav';
import { usePrefs, type TradeMode } from '@/store/prefs';
import { fullName, useSession } from '@/store/session';
import { toast } from '@/store/toast';
import { tint } from '@/theme/color';
import type { ThemeName } from '@/theme/tokens';

function Row({
  label,
  sub,
  value,
  valueColor,
  mono,
  onPress,
  toggle,
  right,
  last,
  danger,
}: {
  label: string;
  sub?: string;
  value?: string;
  valueColor?: string;
  mono?: boolean;
  onPress?: () => void;
  toggle?: boolean;
  right?: React.ReactNode;
  last?: boolean;
  danger?: boolean;
}) {
  const c = useColors();
  const tall = sub != null || toggle != null || right != null;
  return (
    <Press
      scale={1}
      disabled={!onPress}
      onPress={onPress}
      pressedStyle={{ backgroundColor: c.s2 }}
      accessibilityRole={toggle != null ? 'switch' : 'button'}
      accessibilityState={toggle != null ? { checked: toggle } : undefined}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: tall ? 60 : 48, paddingLeft: 16, paddingRight: right ? 12 : 16, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.hair }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt size={15} weight={danger ? 500 : 400} color={danger ? c.dn : c.t1}>
          {label}
        </Txt>
        {sub && (
          <Txt size={12} color={c.t3}>
            {sub}
          </Txt>
        )}
      </View>
      {value != null && (
        <Txt size={13} mono={mono} color={valueColor ?? c.t3}>
          {value}
        </Txt>
      )}
      {toggle != null && <Toggle on={toggle} />}
      {right}
      {onPress && toggle == null && !right && !danger && <Icon name="chevronRight" size={14} sw={2} color={c.t3} />}
    </Press>
  );
}

function Group({ title, i, children }: { title: string; i: number; children: React.ReactNode }) {
  const c = useColors();
  return (
    <Appear i={i}>
      <Eyebrow style={{ paddingTop: 4, paddingBottom: 8 }}>{title}</Eyebrow>
      <View style={{ borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.s1, overflow: 'hidden' }}>{children}</View>
    </Appear>
  );
}

export default function Profile() {
  const c = useColors();
  const router = useRouter();
  const resetTo = useResetTo();
  const s = useSession();
  const { theme, setTheme, mode, setMode, lang } = usePrefs();
  const secN = 1 + (s.tfaOn ? 1 : 0) + (s.antiPh ? 1 : 0) + (s.wlOn ? 1 : 0);
  const secCol = secN >= 3 ? c.ac : c.warn;
  const ctry = COUNTRIES.find((x) => x[1] === s.country) ?? COUNTRIES[0];
  const isAdmin = s.email.trim().toLowerCase().startsWith('admin@');

  return (
    <Screen gap={14} contentStyle={{ paddingHorizontal: 16 }} top={<Header title="Profile & security" />}>
      <Appear i={0}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, boxShadow: `0 0 0 2px ${c.s1}, 0 0 0 3.5px ${c.ac}` }}>
              <Image source={{ uri: AVATAR_URL }} style={{ width: 56, height: 56, borderRadius: 28 }} contentFit="cover" />
            </View>
            <View style={{ position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: s.kycDone ? c.up : c.warn, borderWidth: 2, borderColor: c.s1, alignItems: 'center', justifyContent: 'center' }}>
              {s.kycDone ? (
                <Icon name="check" size={10} sw={4} color="#FFFFFF" />
              ) : (
                <Txt size={10} weight={700} color="#FFFFFF">
                  !
                </Txt>
              )}
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
            <Txt size={17} weight={600} numberOfLines={1}>
              {fullName(s.name)}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt size={12} color={c.t3}>
                UID
              </Txt>
              <Txt mono size={12} color={c.t2}>
                48219377
              </Txt>
              <Press
                accessibilityLabel="Copy UID"
                scale={0.9}
                onPress={async () => {
                  await Clipboard.setStringAsync('48219377');
                  haptic.tap();
                  toast('UID 48219377 copied');
                }}
                style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="copy" size={14} sw={2} color={c.t2} />
              </Press>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: tint(s.kycDone ? c.up : c.warn, 14) }}>
                <Txt size={11} weight={600} color={s.kycDone ? c.up : c.warn}>
                  {s.kycDone ? 'Verified · Level 2' : 'Unverified'}
                </Txt>
              </View>
              <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: c.s2 }}>
                <Txt size={11} weight={600} color={c.t2}>
                  VIP 0
                </Txt>
              </View>
            </View>
          </View>
        </Card>
      </Appear>

      <Appear i={1}>
        <Card gap={10} style={{ paddingVertical: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Txt size={14} weight={600}>
              Security level
            </Txt>
            <Txt size={13} weight={600} color={secCol}>
              {['', 'Low', 'Medium', 'High', 'Maximum'][secN]}
            </Txt>
          </View>
          <StepBars count={4} filled={secN} gap={4} color={secCol} />
          <Txt size={12} color={c.t3}>
            {!s.tfaOn
              ? 'Turn on 2FA to protect logins and withdrawals.'
              : !s.antiPh
                ? 'Set an anti-phishing code to spot fake emails.'
                : !s.wlOn
                  ? 'Turn on the withdrawal whitelist for maximum protection.'
                  : 'All recommended protections are on.'}
          </Txt>
        </Card>
      </Appear>

      <Group title="SECURITY" i={2}>
        <Row label="Password" value="Changed 32 days ago" onPress={() => toast('Changing your password requires email and 2FA confirmation')} />
        <Row
          label="Authenticator 2FA"
          sub="Required for login and withdrawals"
          toggle={s.tfaOn}
          onPress={() => {
            haptic.tap();
            s.set({ tfaOn: !s.tfaOn });
            toast(s.tfaOn ? '2FA off · withdrawals locked for 24 hours' : 'Authenticator 2FA turned on');
          }}
        />
        <Row
          label="Anti-phishing code"
          value={s.antiPh || 'Not set'}
          mono
          valueColor={s.antiPh ? c.t1 : c.warn}
          onPress={() => {
            if (!s.antiPh) {
              s.set({ antiPh: 'ORBX-7Q' });
              haptic.success();
              toast('Anti-phishing code set: ORBX-7Q');
            } else toast('Your code appears in every genuine ORBITX email');
          }}
        />
        <Row
          label="Withdrawal whitelist"
          sub="Only send to saved addresses"
          toggle={s.wlOn}
          onPress={() => {
            haptic.tap();
            s.set({ wlOn: !s.wlOn });
            toast(s.wlOn ? 'Whitelist off' : 'Whitelist on · new addresses unlock after 24 hours');
          }}
        />
        <Row label="Devices" value={`${s.devices.length} active`} last onPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'devices' } })} />
      </Group>

      <Group title="PREFERENCES" i={3}>
        <Row label="Language" value={lang} onPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'lang' } })} />
        <Row label="Display currency" value={s.curMode === 'local' ? ctry[2] : 'USD'} onPress={() => s.set({ curMode: s.curMode === 'local' ? 'usd' : 'local' })} />
        <Row
          label="Appearance"
          right={
            <PillToggle<ThemeName>
              track={c.s2}
              activeBg={theme === 'dark' ? c.s4 : c.bg}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
              ]}
              value={theme}
              onChange={setTheme}
            />
          }
        />
        <Row
          label="Trading mode"
          last
          right={
            <PillToggle<TradeMode>
              track={c.s2}
              options={[
                { value: 'lite', label: 'Lite' },
                { value: 'pro', label: 'Pro' },
              ]}
              value={mode}
              onChange={setMode}
            />
          }
        />
      </Group>

      <Group title="ACCOUNT" i={4}>
        <Row label="Identity verification" value={s.kycDone ? 'Level 2' : 'Verify now'} valueColor={s.kycDone ? c.up : c.warn} onPress={() => router.push(s.kycDone ? '/kyc/verified' : '/setup/verification')} />
        {isAdmin && (
          <Row
            label="Staff console"
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tint(c.warn, 14) }}>
                  <Txt mono size={10} color={c.warn}>
                    ADMIN
                  </Txt>
                </View>
                <Icon name="chevronRight" size={14} sw={2} color={c.t3} />
              </View>
            }
            onPress={() => resetTo('/admin')}
          />
        )}
        <Row label="Notifications" onPress={() => router.push('/notifications')} />
        <Row
          label="Log out"
          danger
          last
          onPress={() => {
            s.signOut();
            resetTo('/welcome');
            setTimeout(() => toast('Signed out on this device'), 300);
          }}
        />
      </Group>

      <Press scale={1} onLongPress={() => router.push({ pathname: '/sheets/picker', params: { kind: 'dev' } })} delayLongPress={600}>
        <Txt mono size={11} color={c.t4} align="center">
          ORBITX 4.2.0 (418) · Last login 09:12 · Lagos, NG
        </Txt>
      </Press>
    </Screen>
  );
}
