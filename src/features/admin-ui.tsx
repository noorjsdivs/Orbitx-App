import { BlurView } from 'expo-blur';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppearProvider } from '@/components/layout/appear';
import { useTabBarSpace } from '@/components/layout/screen';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import type { MarketStatus, Risk } from '@/data/fixtures';
import { useColors, useThemeName } from '@/hooks/use-theme';
import { tint } from '@/theme/color';
import type { Palette } from '@/theme/tokens';

export const ADMIN_HEADER_H = 56;

/** Risk → [text color, tinted background]. */
export function riskColors(c: Palette, r: Risk): [string, string] {
  if (r === 'High') return [c.dn, tint(c.dn, 14)];
  if (r === 'Medium') return [c.warn, tint(c.warn, 14)];
  return [c.up, tint(c.up, 14)];
}

/** Market status → [label, color, tinted background]. */
export function statusMeta(c: Palette, s: MarketStatus): [string, string, string] {
  if (s === 'halted') return ['Halted', c.dn, tint(c.dn, 14)];
  if (s === 'cancel') return ['Cancel-only', c.warn, tint(c.warn, 14)];
  return ['Trading', c.up, tint(c.up, 14)];
}

/** Glass header for the admin console: logo, PROD badge, section title, sign out. */
export function AdminHeader({ title, onSignOut }: { title: string; onSignOut: () => void }) {
  const c = useColors();
  const theme = useThemeName();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + ADMIN_HEADER_H, zIndex: 20, borderBottomWidth: 1, borderBottomColor: c.glassBd, overflow: 'hidden' }}>
      <BlurView intensity={70} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.glassBar }]} />
      <View style={{ flex: 1, paddingTop: insets.top, paddingLeft: 16, paddingRight: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.ac, alignItems: 'center', justifyContent: 'center' }}>
          <Txt size={18} weight={700} color={c.onAc}>
            X
          </Txt>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Txt mono size={10} ls={0.1} color={c.t3}>
              ADMIN CONSOLE
            </Txt>
            <View style={{ paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: tint(c.warn, 14) }}>
              <Txt mono size={9.5} weight={500} color={c.warn}>
                PROD
              </Txt>
            </View>
          </View>
          <Txt size={19} weight={600} ls={-0.02}>
            {title}
          </Txt>
        </View>
        <Press onPress={onSignOut} scale={0.95} style={{ height: 36, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: c.s4, justifyContent: 'center' }}>
          <Txt size={12} weight={500}>
            Sign out
          </Txt>
        </Press>
      </View>
    </View>
  );
}

/** Scroll container below the admin header and above the glass tab bar. */
export function AdminScreen({ children, gap = 14, replayKey }: { children: React.ReactNode; gap?: number; replayKey?: unknown }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { space } = useTabBarSpace();
  return (
    <AppearProvider replayKey={replayKey}>
      <ScrollView
        style={{ flex: 1, backgroundColor: c.bg }}
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ top: ADMIN_HEADER_H }}
        contentContainerStyle={{ paddingTop: insets.top + ADMIN_HEADER_H + 8, paddingBottom: space, paddingHorizontal: 16, gap }}>
        {children}
      </ScrollView>
    </AppearProvider>
  );
}
