import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { AppleLogo, GoogleLogo } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';

/** Apple + Google sign-in buttons with per-provider loading state. */
export function SocialButtons({
  busy,
  onPress,
  order = ['apple', 'google'],
  h = 50,
}: {
  busy: null | 'google' | 'apple';
  onPress: (p: 'google' | 'apple') => void;
  order?: ('google' | 'apple')[];
  h?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {order.map((p) => (
        <View key={p} style={{ flex: 1, opacity: busy ? 0.7 : 1 }}>
          <Button
            variant="secondary"
            h={h}
            size={15}
            label={p === 'google' ? 'Google' : 'Apple'}
            accessibilityLabel={`Continue with ${p === 'google' ? 'Google' : 'Apple'}`}
            left={busy === p ? <Spinner size={18} /> : p === 'google' ? <GoogleLogo /> : <AppleLogo />}
            onPress={() => onPress(p)}
          />
        </View>
      ))}
    </View>
  );
}
