import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/accessible-text';
import { TextSizeControls } from '@/components/text-size-controls';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useReadingProgress } from '@/contexts/reading-progress';
import { useTheme } from '@/hooks/use-theme';
import { TOTAL_CHAPTERS } from '@/utils/reading-progress';

export default function ProgressScreen() {
  const theme = useTheme();
  const { summary, ready, error, reload } = useReadingProgress();
  const [expanded, setExpanded] = useState<string | null>(null);
  const colors = { color: theme.text };
  const openChapter = (book: string, chapter: number) => router.push({
    pathname: '/bible', params: { book, chapter: String(chapter) },
  });

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={ready ? summary.byBook : []}
        keyExtractor={(book) => book.id}
        extraData={expanded}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[styles.title, colors]}>Meu progresso</Text>
            <Text style={[styles.body, colors]}>Acompanhe sua leitura, um capítulo de cada vez.</Text>
            <TextSizeControls />
            {error && (
              <View style={styles.header}>
                <Text accessibilityRole="alert" style={colors}>{error}</Text>
                <Pressable accessibilityRole="button" onPress={reload} style={styles.action}>
                  <Text style={{ color: theme.accentLight }}>Tentar novamente</Text>
                </Pressable>
              </View>
            )}
            {!ready && !error && <Text style={colors}>Carregando seu progresso…</Text>}
            {ready && (
              <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                <Text style={[styles.total, { color: theme.accentLight }]}>{summary.percent}% da Bíblia</Text>
                <Text style={[styles.body, colors]}>{summary.count} de {TOTAL_CHAPTERS} capítulos lidos</Text>
                <View
                  accessibilityRole="progressbar"
                  accessibilityLabel="Progresso de leitura da Bíblia"
                  accessibilityValue={{ min: 0, max: TOTAL_CHAPTERS, now: summary.count }}
                  style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
                  <View style={[styles.fill, { backgroundColor: theme.accentLight, width: `${summary.count / TOTAL_CHAPTERS * 100}%` }]} />
                </View>
                <Text style={colors}>{summary.completedBooks} de {summary.byBook.length} livros concluídos</Text>
                <Text style={colors}>Antigo Testamento: {summary.byBook.slice(0, 39).reduce((n, b) => n + b.count, 0)} capítulos lidos</Text>
                <Text style={colors}>Novo Testamento: {summary.byBook.slice(39).reduce((n, b) => n + b.count, 0)} capítulos lidos</Text>
                {summary.count === 0 && <Text style={colors}>Abra um capítulo e toque em “Marcar capítulo como lido” para começar.</Text>}
                {summary.count === TOTAL_CHAPTERS && <Text style={colors}>Você concluiu a leitura de toda a Bíblia!</Text>}
              </View>
            )}
            <Text style={[styles.note, { color: theme.textSecondary }]}>A marcação vale para todas as versões e fica salva neste aparelho, mesmo sem internet.</Text>
          </View>
        }
        renderItem={({ item: book }) => (
          <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: expanded === book.id }}
              accessibilityLabel={`${book.name}, ${book.count} de ${book.chapters} capítulos lidos. Ver capítulos`}
              onPress={() => setExpanded((current) => current === book.id ? null : book.id)}
              style={styles.action}>
              <Text style={[styles.bookTitle, colors]}>{book.count === book.chapters ? '✓ ' : ''}{book.name}</Text>
              <Text style={colors}>{book.count} de {book.chapters} lidos · {Math.floor(book.count / book.chapters * 100)}%</Text>
              <Text style={{ color: theme.accentLight }}>{expanded === book.id ? 'Ocultar capítulos' : 'Ver capítulos'}</Text>
            </Pressable>
            {expanded === book.id && (
              <>
                <Text style={colors}>✓ Lido · Toque em um capítulo para abri-lo.</Text>
                <View style={styles.chapters}>
                  {book.read.map((read, index) => (
                    <Pressable
                      key={index}
                      accessibilityRole="button"
                      accessibilityLabel={`${book.name}, capítulo ${index + 1}, ${read ? 'lido' : 'não lido'}`}
                      onPress={() => openChapter(book.id, index + 1)}
                      style={[styles.chapter, { backgroundColor: read ? theme.accent : theme.cell, borderColor: theme.accentLight }]}>
                      <Text style={{ color: read ? '#ffffff' : theme.text }}>{index + 1}{read ? ' ✓' : ''}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
            <Pressable accessibilityRole="button" onPress={() => openChapter(book.id, book.nextChapter || 1)} style={styles.action}>
              <Text style={{ color: theme.accentLight }}>{book.nextChapter ? `Ler capítulo ${book.nextChapter}` : 'Ler novamente'}</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: 16, paddingBottom: BottomTabInset + 64, gap: 12 },
  header: { gap: 12 },
  title: { fontSize: 30, fontWeight: '800' },
  body: { fontSize: 17, lineHeight: 26 },
  total: { fontSize: 26, fontWeight: '800' },
  note: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  card: { padding: 16, borderWidth: 1, borderRadius: 12, gap: 12 },
  bookTitle: { fontSize: 20, fontWeight: '700' },
  action: { minHeight: 48, justifyContent: 'center', gap: 8, paddingVertical: 8 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%' },
  chapters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chapter: { minWidth: 56, minHeight: 48, padding: 10, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
