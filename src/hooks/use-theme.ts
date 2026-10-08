import { usePrefs } from '@/store/prefs';
import { palettes, type Palette, type ThemeName } from '@/theme/tokens';

export function useThemeName(): ThemeName {
  return usePrefs((s) => s.theme);
}

export function useColors(): Palette {
  return palettes[usePrefs((s) => s.theme)];
}
