import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/accessible-text';
import { useReadingProgress } from '@/contexts/reading-progress';
import { useTheme } from '@/hooks/use-theme';
import { chapterKey } from '@/utils/reading-progress';

export function ChapterReadControl({ bookId, chapter }: { bookId: string; chapter: number }) {
  const theme = useTheme();
  const { progress, ready, error, reload, setRead } = useReadingProgress();
  const read = Boolean(progress[chapterKey(bookId, chapter)]);
  return (
    <View style={styles.group}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Capítulo ${chapter} lido`}
        accessibilityHint={read ? 'Toque para desfazer a marcação' : 'Toque para marcar como lido'}
        accessibilityState={{ checked: read, disabled: !ready }}
        disabled={!ready}
        onPress={() => setRead(bookId, chapter, !read)}
        style={({ pressed }) => [styles.button, { backgroundColor: read ? theme.accent : theme.backgroundElement, borderColor: theme.accentLight, opacity: !ready || pressed ? 0.6 : 1 }]}>
        <Text style={[styles.label, { color: read ? '#ffffff' : theme.text }]}>
          {read ? '✓ Capítulo lido · Desfazer' : 'Marcar capítulo como lido'}
        </Text>
      </Pressable>
      {error && <Text accessibilityRole="alert" style={{ color: theme.text }}>{error}</Text>}
      {!ready && (
        <Pressable accessibilityRole="button" onPress={reload} style={styles.button}>
          <Text style={{ color: theme.accentLight }}>Carregar progresso</Text>
        </Pressable>
      )}
      <Pressable accessibilityRole="button" onPress={() => router.push('/progress')} style={styles.button}>
        <Text style={{ color: theme.accentLight }}>Ver meu progresso</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  button: { minHeight: 48, borderWidth: 1, borderColor: 'transparent', borderRadius: 10, padding: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
