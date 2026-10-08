import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { SheetBody } from '@/components/layout/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';
import { tint } from '@/theme/color';

/** Shown when a guest taps an action that needs an account. */
export default function GuestGate() {
  const c = useColors();
  const router = useRouter();
  const { title } = useLocalSearchParams<{ title?: string }>();
  const go = (href: '/register' | '/sign-in') => {
    router.back();
    router.push(href);
  };
  return (
    <SheetBody closable={false} style={{ paddingTop: 4 }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: tint(c.ac, 14), alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={26} color={c.acT} />
      </View>
      <Txt size={22} weight={600} ls={-0.02}>
        {title || 'Create a free account'}
      </Txt>
      <Txt size={14} lh={1.5} color={c.t2}>
        Guest mode shows live prices and markets. Create a free account to deposit, trade and earn. It takes about 2 minutes.
      </Txt>
      <View style={{ gap: 10, marginTop: 4 }}>
        <Button label="Create free account" size={16} onPress={() => go('/register')} />
        <Button label="I already have an account" variant="secondary" size={16} onPress={() => go('/sign-in')} />
      </View>
    </SheetBody>
  );
}
