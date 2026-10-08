import { usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useTabNav } from '@/lib/nav';
import { tint } from '@/theme/color';

import { GlassBar, GlassBarItem, glassStyles } from './glass-bar';

const INDEX: Record<string, number> = { home: 0, markets: 1, futures: 3, assets: 4 };

/** Trader tab bar: Home · Markets · [Trade] · Futures · Assets. */
export function GlassTabBar() {
  const c = useColors();
  const pathname = usePathname();
  const router = useRouter();
  const goTab = useTabNav();
  const active = pathname.replace(/^\//, '').split('/')[0] || 'home';
  const idx = INDEX[active] ?? null;

  return (
    <GlassBar count={5} active={idx}>
      <GlassBarItem label="Home" icon="home" on={active === 'home'} onPress={() => goTab('home')} />
      <GlassBarItem label="Markets" icon="bars" on={active === 'markets'} onPress={() => goTab('markets')} />
      <Press
        accessibilityLabel="Trade"
        scale={0.88}
        onPress={() => {
          haptic.impact();
          router.push('/sheets/trade');
        }}
        style={glassStyles.slot}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: c.ac,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 6px 18px ${tint(c.ac, 32)}, inset 0 1px 0 rgba(255,255,255,0.55)`,
          }}>
          <Icon name="trade" size={24} sw={2.1} color={c.onAc} />
        </View>
      </Press>
      <GlassBarItem label="Futures" icon="candles" on={active === 'futures'} onPress={() => goTab('futures')} />
      <GlassBarItem label="Assets" icon="wallet" on={active === 'assets'} onPress={() => goTab('assets')} />
    </GlassBar>
  );
}
