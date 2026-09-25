import { Platform, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { hasAdMobNativeModule, useAdsConsent } from '@/contexts/ads-consent';
import { useTheme } from '@/hooks/use-theme';

// AdMob (react-native-google-mobile-ads) has no web support, and native modules
// aren't available in the Expo Go / web bundle, so this component only renders
// on native platforms and is a no-op everywhere else.
const AdUnitId =
  Platform.OS === 'android' ? 'ca-app-pub-6713691064940085/2073230573' : undefined;

export function AppBannerAd() {
  const theme = useTheme();
  const { canRequestAds } = useAdsConsent();

  if (Platform.OS === 'web' || !AdUnitId) {
    return null;
  }

  // Expo Go has no AdMob native module, so show where the banner will sit in the real app.
  if (__DEV__ && !hasAdMobNativeModule()) {
    return (
      <View
        style={[
          styles.wrap,
          styles.placeholder,
          { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
        ]}>
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Espaço do anúncio (AdMob) — só aparece no app instalado
        </Text>
      </View>
    );
  }

  // canRequestAds only turns true after the GDPR consent flow (UMP) has been
  // gathered — requesting ads before that violates Google's consent policy.
  if (!canRequestAds) {
    return null;
  }

  // Lazy require so web/SSR builds never touch the native-only module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

  return (
    <View style={[styles.wrap, { backgroundColor: theme.background }]}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : AdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  placeholder: {
    height: 60,
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
