import { Stack } from 'expo-router';
import { View } from 'react-native';

import { GlassTabBar } from '@/components/navigation/glass-tab-bar';
import { useColors } from '@/hooks/use-theme';

// Deep links into pushed screens keep the tabs underneath so back always works.
export const unstable_settings = { anchor: '(tabs)' };

/** Trader app: one stack (tabs + pushed screens) under a persistent floating glass tab bar. */
export default function AppLayout() {
  const c = useColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      <GlassTabBar />
    </View>
  );
}
