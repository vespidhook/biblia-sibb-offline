import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Anniversary69Seal } from '@/components/anniversary-69';
import { AppBannerAd } from '@/components/banner-ad';
import { Text } from '@/components/accessible-text';
import { TextSizeControls } from '@/components/text-size-controls';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { BrandFonts, Gradients, MaxContentWidth, Palette, Radii, Spacing, type ThemeColors } from '@/constants/theme';
import { isAnniversaryActive } from '@/constants/anniversary';
import { useAdsConsent } from '@/contexts/ads-consent';
import { useThemePreference } from '@/contexts/theme-preference';
import { useTheme } from '@/hooks/use-theme';

type HomeOption = {
  title: string;
  subtitle: string;
  icon: string;
  route: '/bible' | '/explore' | '/progress';
};

const OPTIONS: HomeOption[] = [
  {
    title: 'Meu progresso',
    subtitle: 'Veja os capítulos lidos e continue sua leitura',
    icon: '✓',
    route: '/progress',
  },
  {
    title: 'Bíblia',
    subtitle: 'Leia por versão, livro e capítulo',
    icon: '📖',
    route: '/bible',
  },
  {
    title: 'Cantor Cristão',
    subtitle: 'Busque hinos por número ou título',
    icon: '🎵',
    route: '/explore',
  },
];

export default function HomeScreen() {
  const theme = useTheme();
  const { mode } = useThemePreference();
  const [bannerHeight, setBannerHeight] = useState(0);
  const { privacyOptionsRequired, showPrivacyOptionsForm } = useAdsConsent();
  const styles = useMemo(() => buildStyles(theme), [theme]);

  // O topo desta tela é navy: ícones claros enquanto ela está em foco; ao
  // sair, volta ao padrão do tema (as outras telas têm fundo do tema).
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle(mode === 'dark' ? 'light' : 'dark');
    }, [mode]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.body}>
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
          {/* Topo em gradiente navy com logo branco e "BÍBLIA SIBB" (guia, seção 5) */}
          <View style={styles.hero}>
            <Image
              source={require('@/assets/images/logo-branco.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SIBB"
            />
            <Text style={styles.title}>
              BÍBLIA <Text style={styles.titleGold}>SIBB</Text>
            </Text>
            {isAnniversaryActive() ? <Anniversary69Seal /> : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>Bíblia e Cantor Cristão disponíveis offline.</Text>

            {privacyOptionsRequired ? (
              <Pressable style={styles.themeToggle} onPress={showPrivacyOptionsForm}>
                <Text style={styles.themeToggleIcon}>🔒</Text>
                <Text style={styles.themeToggleText}>Gerenciar consentimento de anúncios</Text>
              </Pressable>
            ) : null}

            <TextSizeControls />
            <View style={styles.options}>
              {OPTIONS.map((option) => (
                <Pressable
                  key={option.route}
                  style={({ pressed }) => [
                    styles.optionButton,
                    option.route === '/bible' && styles.optionPrimary,
                    option.route === '/explore' && styles.optionOutline,
                    pressed && styles.optionButtonPressed,
                  ]}
                  onPress={() => router.push(option.route)}>
                  <View style={[styles.iconWrap, option.route === '/bible' && styles.iconWrapPrimary]}>
                    <NativeText style={styles.icon}>{option.icon}</NativeText>
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={[styles.optionTitle, option.route === '/bible' && styles.onPrimaryText]}>
                      {option.title}
                    </Text>
                    <Text style={[styles.optionSubtitle, option.route === '/bible' && styles.onPrimarySubtle]}>
                      {option.subtitle}
                    </Text>
                  </View>
                  <Text style={[styles.arrow, option.route === '/bible' && styles.onPrimaryText]}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.bannerWrap} onLayout={(event) => setBannerHeight(event.nativeEvent.layout.height)}>
          <AppBannerAd />
        </View>
        <ThemeToggleButton bottom={bannerHeight + Spacing.three} />
      </View>
    </SafeAreaView>
  );
}

function buildStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      // Mesma cor do início do gradiente, para a área da status bar.
      backgroundColor: Gradients.navy[0],
    },
    body: {
      flex: 1,
    },
    page: {
      flex: 1,
      backgroundColor: theme.background,
    },
    bannerWrap: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      backgroundColor: theme.background,
    },
    pageContent: {
      flexGrow: 1,
      alignItems: 'center',
      paddingBottom: Spacing.five,
    },
    hero: {
      width: '100%',
      minHeight: 260,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.five + Spacing.three,
      backgroundColor: Palette.navy800,
      experimental_backgroundImage: `linear-gradient(180deg, ${Gradients.navy.join(', ')})`,
    },
    card: {
      width: '92%',
      maxWidth: Math.min(MaxContentWidth, 448),
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      borderRadius: Radii.card,
      paddingTop: Spacing.four,
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
      marginTop: -40,
      alignItems: 'center',
      gap: Spacing.three,
      shadowColor: Palette.navy900,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    logo: {
      width: 180,
      height: 72,
    },
    title: {
      color: Palette.white,
      fontSize: 30,
      lineHeight: 36,
      fontFamily: BrandFonts.displayBlack,
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    titleGold: {
      color: Palette.gold500,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    themeToggle: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      borderRadius: Radii.pill,
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.background,
      paddingHorizontal: Spacing.three,
      alignSelf: 'stretch',
    },
    themeToggleIcon: {
      color: theme.accentLight,
      fontSize: 17,
      lineHeight: 20,
      fontWeight: '800',
    },
    themeToggleText: {
      color: theme.text,
      fontSize: 13,
      lineHeight: 18,
      fontFamily: BrandFonts.title,
    },
    options: {
      width: '100%',
      gap: Spacing.three,
    },
    optionButton: {
      minHeight: 84,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      borderRadius: Radii.card,
      padding: Spacing.three,
      backgroundColor: theme.background,
    },
    // "Bíblia" em destaque dourado; "Cantor Cristão" com contorno (guia, seção 5)
    optionPrimary: {
      backgroundColor: Palette.gold500,
      borderColor: Palette.gold500,
    },
    optionOutline: {
      borderWidth: 1.5,
      borderColor: theme.accent,
    },
    iconWrapPrimary: {
      backgroundColor: 'rgba(11,24,56,0.12)',
      borderColor: 'rgba(11,24,56,0.2)',
    },
    onPrimaryText: {
      color: Palette.navy800,
    },
    onPrimarySubtle: {
      color: Palette.navy700,
    },
    optionButtonPressed: {
      opacity: 0.78,
      backgroundColor: theme.cell,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: Radii.chapter,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${theme.accentLight}18`,
      borderWidth: 1,
      borderColor: `${theme.accentLight}35`,
    },
    icon: {
      fontSize: 28,
      lineHeight: 34,
    },
    optionTextWrap: {
      flex: 1,
      gap: Spacing.one,
    },
    optionTitle: {
      color: theme.text,
      fontSize: 17,
      lineHeight: 23,
      fontFamily: BrandFonts.title,
    },
    optionSubtitle: {
      color: theme.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    arrow: {
      color: theme.accentLight,
      fontSize: 28,
      lineHeight: 30,
      fontWeight: '300',
    },
  });
}
