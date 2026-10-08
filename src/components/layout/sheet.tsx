import { useRouter } from 'expo-router';
import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';

/**
 * Content wrapper for native form-sheet routes. The sheet chrome (grabber, glass, corner
 * radius, drag-to-dismiss) is native; this adds the design's title row and padding.
 */
export function SheetBody({
  title,
  right,
  closable = true,
  children,
  px = 20,
  gap = 14,
  scroll,
  style,
}: {
  title?: React.ReactNode;
  right?: React.ReactNode;
  closable?: boolean;
  children: React.ReactNode;
  px?: number;
  gap?: number;
  /** Fill the detent height and scroll (for long lists). */
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const router = useRouter();
  const c = useColors();
  const insets = useSafeAreaInsets();
  // iOS 26+ sheets float above the home indicator, so they don't need the safe-area inset.
  const floating = Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;
  const bottom = floating ? 20 : Platform.OS === 'ios' ? Math.max(insets.bottom, 20) + 4 : 24;
  const head = title != null && (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: px || 16, paddingRight: 8, minHeight: 44 }}>
      {typeof title === 'string' ? (
        <Txt size={19} weight={600} style={{ flex: 1 }}>
          {title}
        </Txt>
      ) : (
        <View style={{ flex: 1 }}>{title}</View>
      )}
      {right}
      {closable && (
        <Press accessibilityLabel="Close" scale={0.9} onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} sw={2} color={c.t2} />
        </Press>
      )}
    </View>
  );
  if (scroll) {
    return (
      <View style={{ flex: 1, paddingTop: 18 }}>
        {head}
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[{ paddingBottom: bottom, gap }, style]} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={{ paddingTop: 18, paddingBottom: bottom }}>
      {head}
      <View style={[{ paddingHorizontal: px, gap, paddingTop: title != null ? 4 : 0 }, style]}>{children}</View>
    </View>
  );
}
