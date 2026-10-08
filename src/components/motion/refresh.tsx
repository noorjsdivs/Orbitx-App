import { RefreshControl } from 'react-native';

import { haptic } from '@/hooks/use-haptics';
import { useColors } from '@/hooks/use-theme';
import { useMarket } from '@/store/market';

/** Pull-to-refresh wired to the market feed ("Pull to refresh or try again"). */
export function MarketRefresh() {
  const c = useColors();
  const reloading = useMarket((s) => s.reloading);
  const retry = useMarket((s) => s.retry);
  return (
    <RefreshControl
      refreshing={reloading}
      onRefresh={() => {
        haptic.impact();
        retry();
      }}
      tintColor={c.ac}
      colors={[c.ac]}
      progressBackgroundColor={c.s1}
    />
  );
}
