import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
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
type TestamentKey = 'old' | 'new';
type Step = 'testament' | 'book' | 'chapter' | 'reader';

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

const VERSIONS: { key: BibleVersionKey; label: string; name: string }[] = [
  { key: 'aa', label: 'AA', name: 'Almeida Atualizada' },
  { key: 'acf', label: 'ACF', name: 'Almeida Corrigida Fiel' },
  { key: 'nvi', label: 'NVI', name: 'Nova Versão Internacional' },
];

const OLD_TESTAMENT_BOOKS = 39;

const TESTAMENTS: { key: TestamentKey; label: string; range: string }[] = [
  { key: 'old', label: 'Antigo Testamento', range: 'Gênesis a Malaquias' },
  { key: 'new', label: 'Novo Testamento', range: 'Mateus a Apocalipse' },
];

const STEPS: { key: Step; label: string }[] = [
  { key: 'testament', label: 'Testamento' },
  { key: 'book', label: 'Livro' },
  { key: 'chapter', label: 'Capítulo' },
  { key: 'reader', label: 'Leitura' },
];

const MAX_SEARCH_RESULTS = 60;

const testamentOfBook = (bookIndex: number): TestamentKey =>
  bookIndex < OLD_TESTAMENT_BOOKS ? 'old' : 'new';

const formatVerseRanges = (verseIndexes: number[]) => {
  const sorted = [...verseIndexes].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = 0;

  for (let i = 0; i < sorted.length; i += 1) {
    const isRangeEnd = i === sorted.length - 1 || sorted[i + 1] !== sorted[i] + 1;
    if (isRangeEnd) {
      ranges.push(sorted[start] === sorted[i] ? `${sorted[i] + 1}` : `${sorted[start] + 1}-${sorted[i] + 1}`);
      start = i + 1;
    }
  }

  return ranges.join(', ');
};

const previousStep = (step: Step): Step => {
  if (step === 'reader') return 'chapter';
  if (step === 'chapter') return 'book';
  return 'testament';
};

export default function BibleScreen() {
  const theme = useTheme();
  const styles = useMemo(() => buildStyles(theme), [theme]);
  const scrollRef = useRef<ScrollView>(null);

  const [version, setVersion] = useState<BibleVersionKey>('aa');
  const [step, setStep] = useState<Step>('testament');
  const [testament, setTestament] = useState<TestamentKey>('old');
  const [bookIndex, setBookIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  const bible = BIBLE_DATA[version];
  const selectedBook = bible[bookIndex];
  const selectedChapter = selectedBook.chapters[chapterIndex] ?? [];
  const stepIndex = STEPS.findIndex((item) => item.key === step);
  const testamentLabel = TESTAMENTS.find((item) => item.key === testament)?.label ?? '';

  const testamentBooks = useMemo(() => {
    const start = testament === 'old' ? 0 : OLD_TESTAMENT_BOOKS;
    const end = testament === 'old' ? OLD_TESTAMENT_BOOKS : bible.length;
    return bible.slice(start, end).map((book, offset) => ({ book, index: start + offset }));
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step, bookIndex, chapterIndex]);

  // Registered only after the first step so it runs before the tabs layout handler,
  // which sends the user back home.
  useEffect(() => {
    if (step === 'testament') return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setStep(previousStep);
      return true;
    });

    return () => subscription.remove();
  }, [step]);

  const chooseVersion = (next: BibleVersionKey) => {
    setVersion(next);
    if (chapterIndex >= BIBLE_DATA[next][bookIndex].chapters.length) setChapterIndex(0);
    setSelectedVerses([]);
  };

  const chooseTestament = (next: TestamentKey) => {
    setTestament(next);
    setStep('book');
  };

  const chooseBook = (nextBookIndex: number) => {
    setBookIndex(nextBookIndex);
    setChapterIndex(0);
    setSelectedVerses([]);
    setStep('chapter');
  };

  const chooseChapter = (nextChapterIndex: number) => {
    setChapterIndex(nextChapterIndex);
    setSelectedVerses([]);
    setStep('reader');
  };

  const goToResult = (result: SearchResult) => {
    setTestament(testamentOfBook(result.bookIndex));
    setBookIndex(result.bookIndex);
    setChapterIndex(result.chapterIndex);
    setSelectedVerses([result.verseIndex]);
    setStep('reader');
  };

  const hasPreviousChapter = bookIndex > 0 || chapterIndex > 0;
  const hasNextChapter =
    bookIndex < bible.length - 1 || chapterIndex < selectedBook.chapters.length - 1;

  const moveChapter = (delta: 1 | -1) => {
    let nextBook = bookIndex;
    let nextChapter = chapterIndex + delta;

    if (nextChapter < 0) {
      nextBook -= 1;
      if (nextBook < 0) return;
      nextChapter = bible[nextBook].chapters.length - 1;
    } else if (nextChapter >= selectedBook.chapters.length) {
      nextBook += 1;
      if (nextBook >= bible.length) return;
      nextChapter = 0;
    }

    setTestament(testamentOfBook(nextBook));
    setBookIndex(nextBook);
    setChapterIndex(nextChapter);
    setSelectedVerses([]);
  };

  const toggleVerse = (verseIndex: number) => {
    setSelectedVerses((current) =>
      current.includes(verseIndex)
        ? current.filter((item) => item !== verseIndex)
        : [...current, verseIndex],
    );
  };

  const shareSelectedVerses = async () => {
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const message = `${selectedBook.name} ${chapterIndex + 1}:${formatVerseRanges(sorted)} (${version.toUpperCase()})\n\n${sorted
      .map((index) => `${index + 1}. ${selectedChapter[index]}`)
      .join('\n')}\n\nBiblia SIBB`;

    await Share.share({ message });
  };

  const chapterNav = (withShare: boolean) => (
    <View style={styles.readerActions}>
      <Pressable
        disabled={!hasPreviousChapter}
        style={[styles.secondaryButton, !hasPreviousChapter && styles.buttonDisabled]}
        onPress={() => moveChapter(-1)}>
        <Text style={styles.secondaryButtonText}>‹ Anterior</Text>
      </Pressable>
      {withShare && selectedVerses.length > 0 && (
        <Pressable style={styles.secondaryButton} onPress={shareSelectedVerses}>
          <Text style={styles.secondaryButtonText}>
            Compartilhar ({selectedVerses.length})
          </Text>
        </Pressable>
      )}
      <Pressable
        disabled={!hasNextChapter}
        style={[styles.secondaryButton, !hasNextChapter && styles.buttonDisabled]}
        onPress={() => moveChapter(1)}>
        <Text style={styles.secondaryButtonText}>Próximo ›</Text>
      </Pressable>
    </View>
  );

  const title =
    step === 'testament'
      ? 'Bíblia SIBB'
      : step === 'book'
        ? testamentLabel
        : step === 'chapter'
          ? selectedBook.name
          : `${selectedBook.name} ${chapterIndex + 1}`;

  const subtitle =
    step === 'testament'
      ? 'Escolha o testamento para começar a leitura.'
      : step === 'book'
        ? 'Escolha um livro.'
        : step === 'chapter'
          ? 'Escolha um capítulo.'
          : `${testamentLabel} · ${VERSIONS.find((item) => item.key === version)?.name}`;

  const versionSelector = (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Versão</Text>
      <View style={styles.segmented}>
        {VERSIONS.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.segmentButton, version === item.key && styles.segmentButtonActive]}
            onPress={() => chooseVersion(item.key)}>
            <Text style={[styles.segmentText, version === item.key && styles.segmentTextActive]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.helperText}>{VERSIONS.find((item) => item.key === version)?.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={styles.stepper}>
          {STEPS.map((item, index) => {
            const isCurrent = index === stepIndex;
            const isDone = index < stepIndex;

            return (
              <Pressable
                key={item.key}
                disabled={!isDone}
                style={[
                  styles.stepChip,
                  isCurrent && styles.stepChipCurrent,
                  isDone && styles.stepChipDone,
                ]}
                onPress={() => setStep(item.key)}>
                <Text
                  style={[
                    styles.stepNumber,
                    (isCurrent || isDone) && styles.stepTextHighlight,
                  ]}>
                  {index + 1}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelCurrent,
                    isDone && styles.stepLabelDone,
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.header}>
          {step !== 'testament' && (
            <Pressable style={styles.backButton} onPress={() => setStep(previousStep)}>
              <Text style={styles.backButtonText}>‹ Voltar</Text>
            </Pressable>
          )}
          <Text style={styles.kicker}>Etapa {stepIndex + 1} de {STEPS.length}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {step === 'testament' && (
          <>
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

            {versionSelector}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Testamento</Text>
              {TESTAMENTS.map((item) => (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
                  onPress={() => chooseTestament(item.key)}>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionTitle}>{item.label}</Text>
                    <Text style={styles.optionSubtitle}>
                      {item.range} · {item.key === 'old' ? OLD_TESTAMENT_BOOKS : bible.length - OLD_TESTAMENT_BOOKS} livros
                    </Text>
                  </View>
                  <Text style={styles.optionArrow}>›</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {step === 'book' && (
          <View style={styles.bookGrid}>
            {testamentBooks.map(({ book, index }) => (
              <Pressable
                key={book.abbrev}
                style={({ pressed }) => [
                  styles.bookButton,
                  bookIndex === index && styles.bookButtonActive,
                  pressed && styles.optionCardPressed,
                ]}
                onPress={() => chooseBook(index)}>
                <Text style={[styles.bookText, bookIndex === index && styles.bookTextActive]} numberOfLines={1}>
                  {book.name}
                </Text>
                <Text style={[styles.bookMeta, bookIndex === index && styles.bookTextActive]}>
                  {book.chapters.length} {book.chapters.length === 1 ? 'capítulo' : 'capítulos'}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 'chapter' && (
          <View style={styles.chapterGrid}>
            {selectedBook.chapters.map((_, index) => (
              <Pressable
                key={`${selectedBook.abbrev}-${index}`}
                style={({ pressed }) => [
                  styles.chapterButton,
                  chapterIndex === index && styles.chapterButtonActive,
                  pressed && styles.optionCardPressed,
                ]}
                onPress={() => chooseChapter(index)}>
                <Text style={[styles.chapterText, chapterIndex === index && styles.chapterTextActive]}>
                  {index + 1}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {step === 'reader' && (
          <>
            {versionSelector}

            {chapterNav(true)}

            <View style={styles.reader}>
              {selectedChapter.map((verse, index) => (
                <Pressable
                  key={`${selectedBook.abbrev}-${chapterIndex}-${index}`}
                  style={[
                    styles.verseRow,
                    selectedVerses.includes(index) && styles.verseRowSelected,
                  ]}
                  onPress={() => toggleVerse(index)}>
                  <Text style={styles.verseNumber}>{index + 1}</Text>
                  <Text style={styles.verseText}>{verse}</Text>
                </Pressable>
              ))}
            </View>

            {chapterNav(false)}
          </>
        )}
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
      width: '48.5%',
      borderWidth: 1,
      borderColor: border,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      minHeight: 58,
      justifyContent: 'center',
      gap: 2,
      backgroundColor: theme.backgroundElement,
    },
    bookButtonActive: {
      backgroundColor: accent,
      borderColor: accentLight,
    },
    bookText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '800',
    },
    bookMeta: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    bookTextActive: {
      color: '#ffffff',
    },
    secondaryButton: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
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
    chapterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chapterButton: {
      width: 56,
      height: 56,
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
      fontSize: 16,
      fontWeight: '800',
    },
    chapterTextActive: {
      color: '#ffffff',
    },
    stepper: {
      flexDirection: 'row',
      gap: Spacing.one,
    },
    stepChip: {
      flex: 1,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: border,
      backgroundColor: theme.backgroundElement,
      paddingHorizontal: 2,
    },
    stepChipCurrent: {
      backgroundColor: accentLight,
      borderColor: accentLight,
    },
    stepChipDone: {
      borderColor: accentLight,
    },
    stepNumber: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 15,
      fontWeight: '900',
    },
    stepTextHighlight: {
      color: accentLight,
    },
    stepLabel: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },
    stepLabelCurrent: {
      color: '#ffffff',
    },
    stepLabelDone: {
      color: accentLight,
    },
    backButton: {
      alignSelf: 'flex-start',
      minHeight: 36,
      justifyContent: 'center',
      paddingRight: Spacing.three,
    },
    backButtonText: {
      color: accentLight,
      fontSize: 15,
      fontWeight: '800',
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      minHeight: 84,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 10,
      padding: Spacing.three,
      backgroundColor: theme.backgroundElement,
    },
    optionCardPressed: {
      opacity: 0.78,
    },
    optionTextWrap: {
      flex: 1,
      gap: Spacing.one,
    },
    optionTitle: {
      color: theme.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '800',
    },
    optionSubtitle: {
      color: theme.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    optionArrow: {
      color: accentLight,
      fontSize: 28,
      lineHeight: 30,
      fontWeight: '300',
    },
    readerActions: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    reader: {
      borderTopWidth: 1,
      borderTopColor: border,
      paddingTop: Spacing.three,
      gap: Spacing.two,
    },
    verseRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      borderRadius: 8,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
    },
    verseRowSelected: {
      backgroundColor: `${accentLight}22`,
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
