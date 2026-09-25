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

  // Expo Go and the browser have no AdMob native module, so mark where the banner will sit.
  if (__DEV__ && (Platform.OS === 'web' || !hasAdMobNativeModule())) {
    return (
      <View
        style={[
          styles.wrap,
          styles.placeholder,
          { borderColor: theme.accentLight, backgroundColor: `${theme.accentLight}18` },
        ]}>
        <Text style={[styles.placeholderTitle, { color: theme.accentLight }]}>PROPAGANDA (AdMob)</Text>
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
          Quadrado fake: o anúncio real só aparece no app instalado
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web' || !AdUnitId) {
    return null;
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
    height: 64,
    justifyContent: 'center',
    gap: 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
