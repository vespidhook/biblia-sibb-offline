import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AdsConsentProvider } from '@/contexts/ads-consent';
import { ThemePreferenceProvider, useThemePreference } from '@/contexts/theme-preference';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AdsConsentProvider>
      <ThemePreferenceProvider>
        <RootNavigator />
      </ThemePreferenceProvider>
    </AdsConsentProvider>
  );
}

function RootNavigator() {
  const { mode } = useThemePreference();

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
