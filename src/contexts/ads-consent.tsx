import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, TurboModuleRegistry } from 'react-native';

type AdsConsentContextValue = {
  /** True while the GDPR consent flow (UMP) is being gathered on startup. */
  loading: boolean;
  /** Whether the app is allowed to request ads (consent obtained or not required). */
  canRequestAds: boolean;
  /** Whether a "manage consent" entry point must be shown to the user (EEA/UK). */
  privacyOptionsRequired: boolean;
  /** Re-opens the consent form so the user can change their choice. */
  showPrivacyOptionsForm: () => void;
};

const AdsConsentContext = createContext<AdsConsentContextValue | null>(null);

// Requiring the library throws when its native module is missing (Expo Go), and Metro
// then returns undefined on later requires, so the module must be probed beforehand.
export const hasAdMobNativeModule = () => TurboModuleRegistry.get('RNGoogleMobileAdsModule') != null;

// AdMob (react-native-google-mobile-ads) has no web support, and native modules
// aren't available in the Expo Go / web bundle, so consent is only gathered on
// native platforms. Everywhere else ads are never requested.
export function AdsConsentProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(Platform.OS === 'android');
  const [canRequestAds, setCanRequestAds] = useState(false);
  const [privacyOptionsRequired, setPrivacyOptionsRequired] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;

    (async () => {
      if (!hasAdMobNativeModule()) {
        if (!cancelled) setLoading(false);
        return;
      }

      // Lazy require so web/SSR builds never touch the native-only module.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const googleMobileAds = require('react-native-google-mobile-ads');
      const { AdsConsent, AdsConsentPrivacyOptionsRequirementStatus, default: MobileAds } =
        googleMobileAds;

      try {
        await AdsConsent.gatherConsent();
      } catch (error) {
        if (__DEV__) {
          console.warn('AdsConsent.gatherConsent failed:', error);
        }
      }

      const info = await AdsConsent.getConsentInfo();

      if (info.canRequestAds) {
        await MobileAds().initialize();
      }

      if (cancelled) return;

      setCanRequestAds(info.canRequestAds);
      setPrivacyOptionsRequired(
        info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const showPrivacyOptionsForm = useCallback(() => {
    if (Platform.OS !== 'android' || !hasAdMobNativeModule()) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AdsConsent } = require('react-native-google-mobile-ads');
    AdsConsent.showPrivacyOptionsForm().catch((error: unknown) => {
      if (__DEV__) {
        console.warn('AdsConsent.showPrivacyOptionsForm failed:', error);
      }
    });
  }, []);

  const value = useMemo(
    () => ({ loading, canRequestAds, privacyOptionsRequired, showPrivacyOptionsForm }),
    [loading, canRequestAds, privacyOptionsRequired, showPrivacyOptionsForm],
  );

  return <AdsConsentContext.Provider value={value}>{children}</AdsConsentContext.Provider>;
}

export function useAdsConsent() {
  const value = useContext(AdsConsentContext);

  if (!value) {
    throw new Error('useAdsConsent must be used inside AdsConsentProvider');
  }

  return value;
}
