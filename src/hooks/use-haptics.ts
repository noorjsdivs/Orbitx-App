import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptic = {
  tap: () => enabled && Haptics.selectionAsync().catch(() => {}),
  impact: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warn: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
  error: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {}),
};
