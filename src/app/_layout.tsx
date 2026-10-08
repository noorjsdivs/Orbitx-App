import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Appearance, LogBox } from 'react-native';

import { ToastHost } from '@/components/navigation/toast-host';
import { useHydrated } from '@/store/hydration';
import { useMarket } from '@/store/market';
import { usePrefs } from '@/store/prefs';
import { fontAssets } from '@/theme/fonts';
import { palettes } from '@/theme/tokens';

// Known-benign RN warning emitted by the native-driven tab fade animator.
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate` with no listeners registered']);

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 250 });

/** Sheets are native form sheets; `fit` sizes to content, numbers are screen fractions. */
const SHEETS: { name: string; detents: 'fit' | number[] }[] = [
  { name: 'trade', detents: 'fit' },
  { name: 'pair', detents: [0.75, 0.96] },
  { name: 'picker', detents: 'fit' },
  { name: 'order-confirm', detents: 'fit' },
  { name: 'lite', detents: 'fit' },
  { name: 'convert-confirm', detents: 'fit' },
  { name: 'withdraw-confirm', detents: 'fit' },
  { name: 'earn-subscribe', detents: 'fit' },
  { name: 'guest', detents: 'fit' },
  { name: 'kyc-review', detents: 'fit' },
  { name: 'payout', detents: 'fit' },
  { name: 'market-status', detents: 'fit' },
];

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);
  const hydrated = useHydrated();
  const theme = usePrefs((s) => s.theme);
  const c = palettes[theme];

  // Native UI (sheets, keyboard, alerts) follows the in-app theme, not the system one.
  useEffect(() => {
    Appearance.setColorScheme(theme);
    SystemUI.setBackgroundColorAsync(c.bg);
  }, [theme, c.bg]);

  // Simulated real-time price feed (1.2s ticks), like the design prototype.
  useEffect(() => {
    useMarket.getState().boot();
    const id = setInterval(() => {
      if (usePrefs.getState().livePrices) useMarket.getState().step();
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const ready = fontsLoaded && hydrated;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const base = theme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = { ...base, colors: { ...base.colors, background: c.bg, card: c.bg, text: c.t1, border: c.line, primary: c.ac } };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="kyc/pending" options={{ gestureEnabled: false }} />
        <Stack.Screen name="kyc/verified" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="(app)" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="admin" options={{ animation: 'fade', gestureEnabled: false }} />
        {SHEETS.map((s) => (
          <Stack.Screen
            key={s.name}
            name={`sheets/${s.name}`}
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: s.detents === 'fit' ? 'fitToContents' : s.detents,
              sheetGrabberVisible: true,
              sheetCornerRadius: 24,
              contentStyle: { backgroundColor: c.glassSheet },
            }}
          />
        ))}
      </Stack>
      <ToastHost />
    </ThemeProvider>
  );
}
