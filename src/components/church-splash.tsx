import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ChurchSplash() {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(1));
  const [photoReady, setPhotoReady] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [visible, setVisible] = useState(true);

  // A failed asset must never leave the native splash covering the app.
  useEffect(() => {
    if (photoReady && logoReady) return;
    const timeout = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timeout);
  }, [photoReady, logoReady]);

  useEffect(() => {
    if ((!photoReady || !logoReady) && !timedOut) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void SplashScreen.hideAsync().catch(() => {}).then(() => {
      if (cancelled) return;
      timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          isInteraction: false,
        }).start(({ finished }) => {
          if (finished && !cancelled) setVisible(false);
        });
      }, timedOut ? 0 : 900);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [logoReady, opacity, photoReady, timedOut]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]} accessibilityLabel="Bíblia SIBB">
      <Image
        source={require('@/assets/images/sibb-splash-fachada.png')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={0}
        onDisplay={() => setPhotoReady(true)}
        onError={() => setPhotoReady(true)}
      />
      <View style={[styles.brand, { bottom: Math.max(insets.bottom, 24) + 32 }]}>
        <Image
          source={require('@/assets/images/logo-branco.png')}
          style={styles.logo}
          contentFit="contain"
          transition={0}
          onDisplay={() => setLogoReady(true)}
          onError={() => setLogoReady(true)}
          accessibilityLabel="Segunda Igreja Batista em Bom Sucesso"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1e3a8a',
    zIndex: 1000,
    elevation: 1000,
  },
  brand: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    maxWidth: 300,
    aspectRatio: 517 / 210,
  },
});
