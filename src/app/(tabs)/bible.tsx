import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import aaBible from '../../assets/jsons/biblia/aa.json';
import acfBible from '../../assets/jsons/biblia/acf.json';
import nviBible from '../../assets/jsons/biblia/nvi.json';

type BibleBook = {
  abbrev: string;
  name: string;
  chapters: string[][];
};

type BibleVersionKey = 'aa' | 'acf' | 'nvi';
type TestamentKey = 'all' | 'old' | 'new';

type SearchResult = {
  bookIndex: number;
  chapterIndex: number;
  verseIndex: number;
  text: string;
};

const BIBLE_DATA: Record<BibleVersionKey, BibleBook[]> = {
  aa: aaBible as BibleBook[],
  acf: acfBible as BibleBook[],
  nvi: nviBible as BibleBook[],
};

const VERSIONS: Array<{ key: BibleVersionKey; label: string; name: string }> = [
  { key: 'aa', label: 'AA', name: 'Almeida Atualizada' },
  { key: 'acf', label: 'ACF', name: 'Almeida Corrigida Fiel' },
  { key: 'nvi', label: 'NVI', name: 'Nova Versao Internacional' },
];

const TESTAMENTS: Array<{ key: TestamentKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'old', label: 'Velho' },
  { key: 'new', label: 'Novo' },
];

const MAX_SEARCH_RESULTS = 60;

export default function BibleScreen() {
  const theme = useTheme();
  const styles = useMemo(() => buildStyles(theme), [theme]);

  const [version, setVersion] = useState<BibleVersionKey>('aa');
  const [testament, setTestament] = useState<TestamentKey>('all');
  const [bookIndex, setBookIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const bible = BIBLE_DATA[version];
  const selectedBook = bible[bookIndex];
  const selectedChapter = selectedBook.chapters[chapterIndex] ?? [];

  const visibleBooks = useMemo(() => {
    if (testament === 'old') return bible.slice(0, 39).map((book, index) => ({ book, index }));
    if (testament === 'new') return bible.slice(39).map((book, index) => ({ book, index: index + 39 }));
    return bible.map((book, index) => ({ book, index }));
  }, [bible, testament]);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 3) return [];

    const results: SearchResult[] = [];
    for (let b = 0; b < bible.length; b += 1) {
      const book = bible[b];
      for (let c = 0; c < book.chapters.length; c += 1) {
        const chapter = book.chapters[c];
        for (let v = 0; v < chapter.length; v += 1) {
          const verse = chapter[v];
          if (verse.toLowerCase().includes(normalizedQuery)) {
            results.push({ bookIndex: b, chapterIndex: c, verseIndex: v, text: verse });
            if (results.length >= MAX_SEARCH_RESULTS) return results;
          }
        }
      }
    }
    return results;
  }, [bible, query]);

  const chooseBook = (nextBookIndex: number) => {
    setBookIndex(nextBookIndex);
    setChapterIndex(0);
    setSelectedVerse(null);
  };

  const chooseChapter = (nextChapterIndex: number) => {
    setChapterIndex(nextChapterIndex);
    setSelectedVerse(null);
  };

  const goToResult = (result: SearchResult) => {
    setBookIndex(result.bookIndex);
    setChapterIndex(result.chapterIndex);
    setSelectedVerse(result.verseIndex);
  };

  const shareChapter = async () => {
    const message = `${selectedBook.name} ${chapterIndex + 1} (${version.toUpperCase()})\n\n${selectedChapter
      .map((verse, index) => `${index + 1}. ${verse}`)
      .join('\n')}\n\nBiblia SIBB`;

    await Share.share({ message });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.kicker}>Biblia Offline</Text>
          <Text style={styles.title}>Bíblia SIBB</Text>
          <Text style={styles.subtitle}>Leia sem internet, com busca local nas versões disponíveis.</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.sectionLabel}>Buscar</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Digite ao menos 3 letras"
            placeholderTextColor={theme.textSecondary}
            style={styles.input}
            returnKeyType="search"
          />
        </View>

        {query.trim().length >= 3 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.bookIndex}-${item.chapterIndex}-${item.verseIndex}`}
            scrollEnabled={false}
            ListHeaderComponent={
              <Text style={styles.resultSummary}>
                {searchResults.length} resultado{searchResults.length === 1 ? '' : 's'}
                {searchResults.length >= MAX_SEARCH_RESULTS ? ' encontrados, mostrando os primeiros' : ''}
              </Text>
            }
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum versículo encontrado.</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.searchResult} onPress={() => goToResult(item)}>
                <Text style={styles.searchRef}>
                  {bible[item.bookIndex].name} {item.chapterIndex + 1}:{item.verseIndex + 1}
                </Text>
                <Text numberOfLines={3} style={styles.searchText}>
                  {item.text}
                </Text>
              </Pressable>
            )}
          />
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Versão</Text>
          <View style={styles.segmented}>
            {VERSIONS.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.segmentButton, version === item.key && styles.segmentButtonActive]}
                onPress={() => {
                  setVersion(item.key);
                  setBookIndex(0);
                  setChapterIndex(0);
                  setSelectedVerse(null);
                }}>
                <Text style={[styles.segmentText, version === item.key && styles.segmentTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helperText}>{VERSIONS.find((item) => item.key === version)?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Testamento</Text>
          <View style={styles.segmented}>
            {TESTAMENTS.map((item) => (
              <Pressable
                key={item.key}
                style={[styles.segmentButton, testament === item.key && styles.segmentButtonActive]}
                onPress={() => setTestament(item.key)}>
                <Text style={[styles.segmentText, testament === item.key && styles.segmentTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Livro</Text>
          <View style={styles.bookGrid}>
            {visibleBooks.map(({ book, index }) => (
              <Pressable
                key={book.abbrev}
                style={[styles.bookButton, bookIndex === index && styles.bookButtonActive]}
                onPress={() => chooseBook(index)}>
                <Text style={[styles.bookText, bookIndex === index && styles.bookTextActive]}>
                  {book.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Capítulo</Text>
            <Pressable style={styles.secondaryButton} onPress={shareChapter}>
              <Text style={styles.secondaryButtonText}>Compartilhar</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterRow}>
            {selectedBook.chapters.map((_, index) => (
              <Pressable
                key={`${selectedBook.abbrev}-${index}`}
                style={[styles.chapterButton, chapterIndex === index && styles.chapterButtonActive]}
                onPress={() => chooseChapter(index)}>
                <Text style={[styles.chapterText, chapterIndex === index && styles.chapterTextActive]}>
                  {index + 1}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.reader}>
          <Text style={styles.readerTitle}>
            {selectedBook.name} {chapterIndex + 1}
          </Text>
          {selectedChapter.map((verse, index) => (
            <Pressable
              key={`${selectedBook.abbrev}-${chapterIndex}-${index}`}
              style={[styles.verseRow, selectedVerse === index && styles.verseRowSelected]}
              onPress={() => setSelectedVerse(selectedVerse === index ? null : index)}>
              <Text style={styles.verseNumber}>{index + 1}</Text>
              <Text style={styles.verseText}>{verse}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
  const accent = theme.accent;
  const accentLight = theme.accentLight;
  const border = theme.backgroundSelected;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      width: '100%',
      maxWidth: MaxContentWidth,
      alignSelf: 'center',
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: BottomTabInset + Spacing.four,
      gap: Spacing.three,
    },
    header: {
      gap: Spacing.one,
      paddingVertical: Spacing.two,
    },
    kicker: {
      color: accentLight,
      fontSize: 12,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    title: {
      color: theme.text,
      fontSize: 34,
      fontWeight: '800',
      lineHeight: 40,
    },
    subtitle: {
      color: theme.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    searchBox: {
      gap: Spacing.two,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      color: theme.text,
      backgroundColor: theme.backgroundElement,
      fontSize: 16,
    },
    resultSummary: {
      color: theme.textSecondary,
      fontSize: 13,
      marginBottom: Spacing.two,
      fontWeight: '600',
    },
    searchResult: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      padding: Spacing.three,
      marginBottom: Spacing.two,
      backgroundColor: theme.backgroundElement,
      gap: Spacing.one,
    },
    searchRef: {
      color: accentLight,
      fontSize: 13,
      fontWeight: '800',
    },
    searchText: {
      color: theme.text,
      fontSize: 14,
      lineHeight: 21,
    },
    emptyText: {
      color: theme.textSecondary,
      paddingVertical: Spacing.three,
    },
    section: {
      gap: Spacing.two,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    sectionLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    segmented: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.backgroundElement,
    },
    segmentButton: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.two,
    },
    segmentButtonActive: {
      backgroundColor: accentLight,
    },
    segmentText: {
      color: theme.textSecondary,
      fontWeight: '800',
      fontSize: 13,
    },
    segmentTextActive: {
      color: '#ffffff',
    },
    helperText: {
      color: theme.textSecondary,
      fontSize: 13,
    },
    bookGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    bookButton: {
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      minHeight: 38,
      justifyContent: 'center',
      backgroundColor: theme.backgroundElement,
    },
    bookButtonActive: {
      backgroundColor: accent,
      borderColor: accentLight,
    },
    bookText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '700',
    },
    bookTextActive: {
      color: '#ffffff',
    },
    secondaryButton: {
      minHeight: 36,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: accentLight,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
    },
    secondaryButtonText: {
      color: accentLight,
      fontSize: 13,
      fontWeight: '800',
    },
    chapterRow: {
      gap: Spacing.two,
      paddingRight: Spacing.three,
    },
    chapterButton: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: border,
      backgroundColor: theme.cell,
    },
    chapterButtonActive: {
      backgroundColor: accentLight,
      borderColor: accentLight,
    },
    chapterText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    chapterTextActive: {
      color: '#ffffff',
    },
    reader: {
      borderTopWidth: 1,
      borderTopColor: border,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    readerTitle: {
      color: theme.text,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      marginBottom: Spacing.one,
    },
    verseRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      borderRadius: 8,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
    },
    verseRowSelected: {
      backgroundColor: theme.backgroundElement,
    },
    verseNumber: {
      color: accentLight,
      fontSize: 12,
      lineHeight: 23,
      fontWeight: '800',
      minWidth: 22,
      textAlign: 'right',
    },
    verseText: {
      flex: 1,
      color: theme.text,
      fontSize: 17,
      lineHeight: 28,
    },
  });
}
