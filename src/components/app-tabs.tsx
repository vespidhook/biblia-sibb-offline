import { router, Slot, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBannerAd } from '@/components/banner-ad';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type NavItem = {
  label: string;
  icon: string;
  route: '/' | '/bible' | '/explore';
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Início', icon: '🏠', route: '/' },
  { label: 'Bíblia', icon: '📖', route: '/bible' },
  { label: 'Cantor', icon: '🎵', route: '/explore' },
];

export default function AppTabs() {
  const pathname = usePathname();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [barHeight, setBarHeight] = useState(0);
  const styles = buildStyles(theme, insets.bottom);

  const visibleItems = NAV_ITEMS.filter((item) => item.route !== pathname);

  return (
    <View style={styles.container}>
      <Slot />
      <View style={styles.navWrap} onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}>
        <AppBannerAd />
        <View style={styles.navBar}>
          {visibleItems.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
              onPress={() => router.replace(item.route)}>
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={styles.navLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <ThemeToggleButton bottom={barHeight + Spacing.three} />
    </View>
  );
}

function buildStyles(
  theme: {
    text: string;
    background: string;
    backgroundElement: string;
    backgroundSelected: string;
    textSecondary: string;
    cell: string;
    accent: string;
    accentLight: string;
  },
  bottomInset: number,
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    navWrap: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      paddingHorizontal: Spacing.three,
      paddingBottom: Math.max(bottomInset, Spacing.two),
      paddingTop: Spacing.two,
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: theme.backgroundSelected,
    },
    navBar: {
      width: '100%',
      maxWidth: MaxContentWidth,
      flexDirection: 'row',
      gap: Spacing.two,
    },
    navButton: {
      flex: 1,
      minHeight: 54,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.half,
    },
    navButtonPressed: {
      opacity: 0.8,
      backgroundColor: theme.cell,
    },
    navIcon: {
      fontSize: 20,
      lineHeight: 24,
    },
    navLabel: {
      color: theme.accentLight,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '800',
    },
  });
}
