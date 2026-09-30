import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { ChurchSplash } from '@/components/church-splash';
import { TextSizePreferenceProvider } from '@/contexts/text-size-preference';
import { ReadingProgressProvider } from '@/contexts/reading-progress';
import { AdsConsentProvider } from '@/contexts/ads-consent';
import { ThemePreferenceProvider, useThemePreference } from '@/contexts/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
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
