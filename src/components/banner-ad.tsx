import { Platform, StyleSheet, View } from 'react-native';

import { useAdsConsent } from '@/contexts/ads-consent';
import { useTheme } from '@/hooks/use-theme';

// AdMob (react-native-google-mobile-ads) has no web support, and native modules
// aren't available in the Expo Go / web bundle, so this component only renders
// on native platforms and is a no-op everywhere else.
const AdUnitId =
  Platform.OS === 'android' ? 'ca-app-pub-6713691064940085/2073230573' : undefined;

export function AppBannerAd() {
  const theme = useTheme();
  const { canRequestAds } = useAdsConsent();

  // canRequestAds only turns true after the GDPR consent flow (UMP) has been
  // gathered — requesting ads before that violates Google's consent policy.
  if (Platform.OS === 'web' || !AdUnitId || !canRequestAds) {
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
  },
});
