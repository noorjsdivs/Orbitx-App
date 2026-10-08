import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { tabTransition } from '@/components/motion/presets';
import { GlassBar, GlassBarItem } from '@/components/navigation/glass-bar';
import { AdminHeader } from '@/features/admin-ui';
import { useColors } from '@/hooks/use-theme';
import { useResetTo } from '@/lib/nav';
import { useAdmin } from '@/store/admin';
import { useSession } from '@/store/session';
import { toast } from '@/store/toast';

const TABS = [
  { name: 'index', label: 'Overview', title: 'Dashboard', icon: 'grid' },
  { name: 'kyc', label: 'KYC', title: 'KYC review', icon: 'idCard' },
  { name: 'payouts', label: 'Payouts', title: 'Withdrawals', icon: 'withdraw' },
  { name: 'markets', label: 'Markets', title: 'Markets control', icon: 'bars' },
  { name: 'audit', label: 'Audit', title: 'Audit log', icon: 'history' },
] as const;

/** Staff console: its own glass header and tab bar with live queue badges. */
export default function AdminLayout() {
  const c = useColors();
  const resetTo = useResetTo();
  const kycCount = useAdmin((s) => s.kycQueue.length);
  const wdCount = useAdmin((s) => s.payouts.length);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs
        screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, ...tabTransition }}
        tabBar={({ state, navigation }) => {
          const active = state.routes[state.index]?.name;
          const tab = TABS.find((t) => t.name === active) ?? TABS[0];
          return (
            <>
              <AdminHeader
                title={tab.title}
                onSignOut={() => {
                  useSession.getState().signOut();
                  resetTo('/welcome');
                  setTimeout(() => toast('Signed out of the admin console'), 300);
                }}
              />
              <GlassBar count={5} active={state.index}>
                {TABS.map((t) => (
                  <GlassBarItem
                    key={t.name}
                    label={t.label}
                    icon={t.icon}
                    on={active === t.name}
                    badge={t.name === 'kyc' ? kycCount : t.name === 'payouts' ? wdCount : undefined}
                    badgeColor={t.name === 'payouts' ? c.warn : c.dn}
                    onPress={() => navigation.navigate(t.name)}
                  />
                ))}
              </GlassBar>
            </>
          );
        }}>
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} />
        ))}
      </Tabs>
    </View>
  );
}
