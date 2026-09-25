import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBannerAd } from '@/components/banner-ad';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAdsConsent } from '@/contexts/ads-consent';
import { useThemePreference } from '@/contexts/theme-preference';
import { useTheme } from '@/hooks/use-theme';

type HomeOption = {
  title: string;
  subtitle: string;
  icon: string;
  route: '/bible' | '/explore';
};

const OPTIONS: HomeOption[] = [
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
  const { mode, toggleMode } = useThemePreference();
  const { privacyOptionsRequired, showPrivacyOptionsForm } = useAdsConsent();
  const styles = useMemo(() => buildStyles(theme), [theme]);
  const logoSource =
    mode === 'dark'
      ? require('@/assets/images/logo-branco.png')
      : require('@/assets/images/logo-preto.png');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <ImageBackground source={require('@/assets/images/frente_igreja.jpg')} style={styles.hero}>
          <View style={styles.heroOverlay} />
        </ImageBackground>

        <View style={styles.card}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />

          <View style={styles.titleArea}>
            <Text style={styles.title}>Bíblia SIBB</Text>
            <Text style={styles.subtitle}>Bíblia e Cantor Cristão disponíveis offline.</Text>
          </View>

          <Pressable style={styles.themeToggle} onPress={toggleMode}>
            <Text style={styles.themeToggleIcon}>{mode === 'dark' ? '☀' : '☾'}</Text>
            <Text style={styles.themeToggleText}>
              {mode === 'dark' ? 'Usar modo claro' : 'Usar modo escuro'}
            </Text>
          </Pressable>

          {privacyOptionsRequired ? (
            <Pressable style={styles.themeToggle} onPress={showPrivacyOptionsForm}>
              <Text style={styles.themeToggleIcon}>🔒</Text>
              <Text style={styles.themeToggleText}>Gerenciar consentimento de anúncios</Text>
            </Pressable>
          ) : null}

          <View style={styles.options}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.route}
                style={({ pressed }) => [styles.optionButton, pressed && styles.optionButtonPressed]}
                onPress={() => router.push(option.route)}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>{option.icon}</Text>
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.bannerWrap}>
        <AppBannerAd />
      </View>
    </SafeAreaView>
  );
}

function buildStyles(theme: {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  cell: string;
  accent: string;
  accentLight: string;
}) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
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
      height: 230,
    },
    heroOverlay: {
      flex: 1,
      backgroundColor: 'rgba(30,58,138,0.34)',
    },
    card: {
      width: '92%',
      maxWidth: Math.min(MaxContentWidth, 448),
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      borderRadius: 20,
      paddingTop: Spacing.four,
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
      marginTop: -40,
      alignItems: 'center',
      gap: Spacing.three,
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    logo: {
      width: 200,
      height: 80,
    },
    titleArea: {
      alignItems: 'center',
      gap: Spacing.one,
    },
    title: {
      color: theme.text,
      fontSize: 24,
      fontWeight: '800',
      lineHeight: 31,
      textAlign: 'center',
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
      borderRadius: 10,
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
      fontWeight: '800',
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
      borderRadius: 10,
      padding: Spacing.three,
      backgroundColor: theme.background,
    },
    optionButtonPressed: {
      opacity: 0.78,
      backgroundColor: theme.cell,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 10,
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
      fontWeight: '800',
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
