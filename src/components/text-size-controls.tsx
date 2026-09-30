import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTextSizePreference } from '@/contexts/text-size-preference';
import { useTheme } from '@/hooks/use-theme';

export function TextSizeControls() {
  const theme = useTheme();
  const { scale, increase, decrease, reset, canIncrease, canDecrease, ready, saveFailed } = useTextSizePreference();
  const label = { color: theme.text };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
      <Text style={[styles.label, label]}>Tamanho do texto</Text>
      <View style={styles.row}>
        {[
          { title: 'A−', hint: 'Diminuir o tamanho do texto', action: decrease, enabled: canDecrease },
          { title: 'A+', hint: 'Aumentar o tamanho do texto', action: increase, enabled: canIncrease },
        ].map((button) => (
          <Pressable
            key={button.title}
            accessibilityRole="button"
            accessibilityLabel={button.hint}
            accessibilityState={{ disabled: !ready || !button.enabled }}
            disabled={!ready || !button.enabled}
            onPress={button.action}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.cell, borderColor: theme.accentLight }, (!ready || !button.enabled || pressed) && styles.dim]}>
            <Text style={[styles.buttonText, label]}>{button.title}</Text>
          </Pressable>
        ))}
        <Text accessibilityLiveRegion="polite" style={[styles.label, label]}>{Math.round(scale * 100)}%</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Restaurar tamanho padrão do texto"
          disabled={!ready || !canDecrease}
          accessibilityState={{ disabled: !ready || !canDecrease }}
          onPress={reset}
          style={({ pressed }) => [styles.reset, pressed && styles.dim]}>
          <Text style={[styles.label, { color: theme.accentLight }]}>Padrão</Text>
        </Pressable>
      </View>
      {saveFailed && <Text style={label}>O tamanho vale nesta sessão, mas não foi possível salvá-lo.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch', borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  button: { minWidth: 56, minHeight: 48, padding: 8, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 22, fontWeight: '800' },
  reset: { minHeight: 48, paddingHorizontal: 8, justifyContent: 'center' },
  dim: { opacity: 0.4 },
});
