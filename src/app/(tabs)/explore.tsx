import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
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
import hymnsData from '../../assets/jsons/cantor_cristao/cantor_cristao.json';

type Hymn = {
  id: number;
  title: string;
  lyrics: string;
};

const HYMNS = hymnsData as Hymn[];
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 28;

const TITLE_CASE_EXCEPTIONS = new Set(['a', 'e', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'por']);

function toTitleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, index) => {
      if (index > 0 && TITLE_CASE_EXCEPTIONS.has(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1)}`;
    })
    .join(' ');
}

export default function HymnalScreen() {
  const theme = useTheme();
  const styles = useMemo(() => buildStyles(theme), [theme]);

  const [query, setQuery] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [fontSize, setFontSize] = useState(17);

  const filteredHymns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return HYMNS;

    const queryNumber = Number.parseInt(normalizedQuery, 10);
    return HYMNS.filter((hymn) => {
      return hymn.title.toLowerCase().includes(normalizedQuery) || hymn.id === queryNumber;
    });
  }, [query]);

  const shareHymn = async () => {
    if (!selectedHymn) return;
    await Share.share({
      title: 'Cantor Cristão',
      message: `${selectedHymn.id}. ${toTitleCase(selectedHymn.title)}\n\n${selectedHymn.lyrics}\n\nBiblia SIBB`,
    });
  };

  const changeFontSize = (nextSize: number) => {
    setFontSize(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, nextSize)));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        style={styles.screen}
        contentContainerStyle={styles.content}
        data={filteredHymns}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.kicker}>Hinário Offline</Text>
            <Text style={styles.title}>Cantor Cristão</Text>
            <Text style={styles.subtitle}>Busque por número ou título e leia a letra sem conexão.</Text>

            <View style={styles.searchBox}>
              <Text style={styles.sectionLabel}>Buscar hino</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Ex.: 15 ou Exultação"
                placeholderTextColor={theme.textSecondary}
                style={styles.input}
                returnKeyType="search"
              />
              {query.trim().length > 0 && (
                <Text style={styles.resultSummary}>
                  {filteredHymns.length} hino{filteredHymns.length === 1 ? '' : 's'} encontrado
                  {filteredHymns.length === 1 ? '' : 's'}
                </Text>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum hino encontrado</Text>
            <Text style={styles.emptyText}>Tente outro número ou uma palavra do título.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.hymnRow} onPress={() => setSelectedHymn(item)}>
            <View style={styles.hymnNumber}>
              <Text style={styles.hymnNumberText}>{item.id}</Text>
            </View>
            <Text style={styles.hymnTitle} numberOfLines={2}>
              {toTitleCase(item.title)}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      <Modal visible={selectedHymn !== null} animationType="slide" onRequestClose={() => setSelectedHymn(null)}>
        <SafeAreaView style={styles.modalSafeArea}>
          {selectedHymn && (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleWrap}>
                  <Text style={styles.modalNumber}>{selectedHymn.id}</Text>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {toTitleCase(selectedHymn.title)}
                  </Text>
                </View>
                <Pressable style={styles.closeButton} onPress={() => setSelectedHymn(null)}>
                  <Text style={styles.closeButtonText}>Fechar</Text>
                </Pressable>
              </View>

              <View style={styles.controls}>
                <Pressable style={styles.controlButton} onPress={() => changeFontSize(fontSize - 1)}>
                  <Text style={styles.controlText}>A-</Text>
                </Pressable>
                <Text style={styles.fontSizeText}>{fontSize}</Text>
                <Pressable style={styles.controlButton} onPress={() => changeFontSize(fontSize + 1)}>
                  <Text style={styles.controlText}>A+</Text>
                </Pressable>
                <Pressable style={styles.shareButton} onPress={shareHymn}>
                  <Text style={styles.shareButtonText}>Compartilhar</Text>
                </Pressable>
              </View>

              <ScrollView style={styles.lyricsScroll} contentContainerStyle={styles.lyricsContent}>
                <Text style={[styles.lyricsText, { fontSize, lineHeight: fontSize * 1.65 }]}>
                  {selectedHymn.lyrics.trim()}
                </Text>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
    },
    header: {
      gap: Spacing.two,
      paddingBottom: Spacing.three,
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
      paddingTop: Spacing.two,
    },
    sectionLabel: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
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
      fontWeight: '600',
    },
    hymnRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      marginBottom: Spacing.two,
      backgroundColor: theme.backgroundElement,
    },
    hymnNumber: {
      width: 42,
      height: 42,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accent,
    },
    hymnNumberText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '800',
    },
    hymnTitle: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '700',
    },
    chevron: {
      color: theme.textSecondary,
      fontSize: 28,
      lineHeight: 28,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.six,
      gap: Spacing.one,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: '800',
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalContent: {
      flex: 1,
      maxWidth: MaxContentWidth,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.three,
      paddingBottom: Spacing.three,
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    modalTitleWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    modalNumber: {
      minWidth: 44,
      color: accentLight,
      fontSize: 26,
      lineHeight: 32,
      fontWeight: '900',
    },
    modalTitle: {
      flex: 1,
      color: theme.text,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '800',
    },
    closeButton: {
      minHeight: 40,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
    },
    closeButtonText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '800',
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.three,
    },
    controlButton: {
      width: 44,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cell,
      borderWidth: 1,
      borderColor: border,
    },
    controlText: {
      color: theme.text,
      fontSize: 15,
      fontWeight: '900',
    },
    fontSizeText: {
      minWidth: 34,
      color: theme.textSecondary,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '800',
    },
    shareButton: {
      marginLeft: 'auto',
      minHeight: 40,
      justifyContent: 'center',
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      backgroundColor: accent,
    },
    shareButtonText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
    },
    lyricsScroll: {
      flex: 1,
    },
    lyricsContent: {
      paddingBottom: Spacing.six,
    },
    lyricsText: {
      color: theme.text,
    },
  });
}
