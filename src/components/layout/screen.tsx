import { useNavigation, useRouter } from 'expo-router';
import { ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Press } from '@/components/ui/press';
import { Txt } from '@/components/ui/text';
import { useColors } from '@/hooks/use-theme';

import { AppearProvider } from './appear';

export const TAB_BAR_H = 66;

/** Distance of the floating tab bar from the bottom edge, and the scroll space it needs. */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom - 12, 12);
  return { bottom, space: bottom + TAB_BAR_H + 20 };
}

type ScreenProps = Omit<ScrollViewProps, 'children'> & {
  children: React.ReactNode;
  /** Reserve space for the floating glass tab bar. */
  tabBar?: boolean;
  /** Content that stays pinned above the scroll area (e.g. headers). */
  top?: React.ReactNode;
  /** Gap between direct children. */
  gap?: number;
  contentStyle?: StyleProp<ViewStyle>;
  replayKey?: unknown;
  scrollRef?: React.Ref<ScrollView>;
};

/** Standard scrolling screen: safe-area top, bg color, stagger provider, tab-bar spacing. */
export function Screen({ children, tabBar = true, top, gap, contentStyle, replayKey, scrollRef, ...rest }: ScreenProps) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { space } = useTabBarSpace();
  return (
    <AppearProvider replayKey={replayKey}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        {top}
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
          {...rest}
          contentContainerStyle={[{ paddingBottom: tabBar ? space : insets.bottom + 24, paddingTop: top && gap ? gap : 0, gap }, contentStyle]}>
          {children}
        </ScrollView>
      </View>
    </AppearProvider>
  );
}

export function IconButton({
  name,
  onPress,
  label,
  color,
  size = 20,
  sw = 1.7,
  fill,
  badge,
}: {
  name: IconName;
  onPress?: () => void;
  label: string;
  color?: string;
  size?: number;
  sw?: number;
  fill?: string;
  badge?: string;
}) {
  const c = useColors();
  return (
    <Press onPress={onPress} accessibilityLabel={label} scale={0.9} hitSlop={4} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
      <Icon name={name} size={size} color={color ?? c.t1} sw={sw} fill={fill} />
      {badge && <View style={{ position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: badge, borderWidth: 2, borderColor: c.bg }} />}
    </Press>
  );
}

/** Pushed-screen header: back chevron, title, trailing actions (48h). */
export function Header({ title, right, back = true, onBack }: { title: React.ReactNode; right?: React.ReactNode; back?: boolean; onBack?: () => void }) {
  const router = useRouter();
  const navigation = useNavigation();
  const c = useColors();
  const showBack = back;
  // A screen opened cold from a deep link has no history: fall back to Home.
  const goBack = () => (navigation.canGoBack() ? router.back() : router.replace('/home'));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 48, paddingHorizontal: 4 }}>
      {showBack && <IconButton name="back" label="Back" size={22} sw={2} onPress={onBack ?? goBack} />}
      <View style={{ flex: 1, minWidth: 0, paddingLeft: showBack ? 10 : 12 }}>
        {typeof title === 'string' ? (
          <Txt size={18} weight={600} numberOfLines={1} color={c.t1}>
            {title}
          </Txt>
        ) : (
          title
        )}
      </View>
      {right}
    </View>
  );
}

/** Round bordered back button used in the onboarding / auth flow. */
export function FlowBack({ onPress }: { onPress: () => void }) {
  const c = useColors();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel="Back"
      scale={0.92}
      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.s3, backgroundColor: c.s1, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="back" size={20} sw={2} />
    </Press>
  );
}
