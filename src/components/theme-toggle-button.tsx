import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemePreference } from '@/contexts/theme-preference';
import { useTheme } from '@/hooks/use-theme';

// Absolutely positioned: render it as a sibling of the screen content, inside a
// container that fills the visible area, and pass the height of whatever sits below.
export function ThemeToggleButton({ bottom }: { bottom: number }) {
  const theme = useTheme();
  const { mode, toggleMode } = useThemePreference();
  const label = mode === 'dark' ? 'Usar modo claro' : 'Usar modo escuro';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={toggleMode}
      style={({ pressed }) => [
        styles.button,
        {
          bottom,
          backgroundColor: theme.backgroundElement,
          borderColor: theme.accentLight,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.icon, { color: theme.accentLight }]}>{mode === 'dark' ? '☀' : '☾'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: Spacing.three,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
});
