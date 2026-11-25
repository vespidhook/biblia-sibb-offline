import {
  Merriweather_400Regular,
  Merriweather_400Regular_Italic,
  Merriweather_700Bold,
} from '@expo-google-fonts/merriweather';
import {
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ChurchSplash } from '@/components/church-splash';
import { TextSizePreferenceProvider } from '@/contexts/text-size-preference';
import { ReadingProgressProvider } from '@/contexts/reading-progress';
import { AdsConsentProvider } from '@/contexts/ads-consent';
import { ThemePreferenceProvider, useThemePreference } from '@/contexts/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  // Fontes do tema 69 anos (ver BrandFonts em constants/theme). Carregam por
  // trás da abertura; até lá as telas usam a fonte do sistema.
  useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Montserrat_900Black,
    Merriweather_400Regular,
    Merriweather_400Regular_Italic,
    Merriweather_700Bold,
  });

  return (
    <AdsConsentProvider>
      <ThemePreferenceProvider>
        <TextSizePreferenceProvider>
          <ReadingProgressProvider>
            <RootNavigator />
          </ReadingProgressProvider>
        </TextSizePreferenceProvider>
      </ThemePreferenceProvider>
    </AdsConsentProvider>
  );
}

function RootNavigator() {
  const { mode } = useThemePreference();

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <ChurchSplash />
    </ThemeProvider>
  );
}
