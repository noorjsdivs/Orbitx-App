import { Tabs } from 'expo-router';

import { useColors } from '@/hooks/use-theme';

/** Tab roots. The visible tab bar is the overlay in the parent layout. */
export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs tabBar={() => null} screenOptions={{ headerShown: false, animation: 'fade', sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="markets" />
      <Tabs.Screen name="trade" />
      <Tabs.Screen name="futures" />
      <Tabs.Screen name="assets" />
    </Tabs>
  );
}
