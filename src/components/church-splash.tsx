import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions } from 'react-native';

import { isAnniversaryActive } from '@/constants/anniversary';
import { Palette } from '@/constants/theme';

// Abertura comemorativa dos 69 anos da SIBB (1957–2026). Desliga sozinha
// depois de 31/12/2026 (constants/anniversary.ts): aí só esconde o splash
// nativo. Para voltar à foto da fachada, restaure a versão anterior deste
// arquivo (git log) e a cor do expo-splash-screen no app.json.
const SPLASH_TALL = require('@/assets/images/splash-69-1440x3120.png');
const SPLASH_16_9 = require('@/assets/images/splash-69-1080x1920.png');

const BACKGROUND = Palette.navy800;

export function ChurchSplash() {
  return isAnniversaryActive() ? <AnniversarySplash /> : <HideNativeSplash />;
}

function HideNativeSplash() {
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);
  return null;
}

function AnniversarySplash() {
  const { width, height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(1));
  const [ready, setReady] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [visible, setVisible] = useState(true);

  // A failed asset must never leave the native splash covering the app.
  useEffect(() => {
    if (ready) return;
    const timeout = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(timeout);
  }, [ready]);

  useEffect(() => {
    if (!ready && !timedOut) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void SplashScreen.hideAsync().catch(() => {}).then(() => {
      if (cancelled) return;
      timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          isInteraction: false,
        }).start(({ finished }) => {
          if (finished && !cancelled) setVisible(false);
        });
      }, timedOut && !ready ? 0 : 1600);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      opacity.stopAnimation();
    };
  }, [opacity, ready, timedOut]);

  if (!visible) return null;

  const ratio = height / Math.max(width, 1);
  // Celulares atuais (~19.5:9) usam a arte alta; 16:9 usa a outra.
  // Tablets / paisagem mostram a arte inteira, sem cortar textos.
  const source = ratio >= 1.9 ? SPLASH_TALL : SPLASH_16_9;
  const contentFit = ratio >= 1.5 ? 'cover' : 'contain';

  return (
    <Animated.View style={[styles.overlay, { opacity }]} accessibilityLabel="Bíblia SIBB — 69 anos">
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        transition={0}
        onDisplay={() => setReady(true)}
        onError={() => setReady(true)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKGROUND,
    zIndex: 1000,
    elevation: 1000,
  },
});
