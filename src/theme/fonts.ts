import { Geist_400Regular } from '@expo-google-fonts/geist/400Regular';
import { Geist_500Medium } from '@expo-google-fonts/geist/500Medium';
import { Geist_600SemiBold } from '@expo-google-fonts/geist/600SemiBold';
import { Geist_700Bold } from '@expo-google-fonts/geist/700Bold';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono/400Regular';
import { GeistMono_500Medium } from '@expo-google-fonts/geist-mono/500Medium';

export const fontAssets = {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  GeistMono_400Regular,
  GeistMono_500Medium,
};

export type FontWeight = 400 | 500 | 600 | 700;

const sans: Record<FontWeight, string> = {
  400: 'Geist_400Regular',
  500: 'Geist_500Medium',
  600: 'Geist_600SemiBold',
  700: 'Geist_700Bold',
};

/** Custom fonts need one family per weight on native, so weights map to families. */
export function fontFamily(weight: FontWeight = 400, mono = false): string {
  if (mono) return weight >= 500 ? 'GeistMono_500Medium' : 'GeistMono_400Regular';
  return sans[weight];
}
