import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBannerAd } from '@/components/banner-ad';
import { Text, TextInput } from '@/components/accessible-text';
import { TextSizeControls } from '@/components/text-size-controls';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { SHARE_FOOTER } from '@/constants/share';
import { Radii, Palette, BrandFonts, BottomTabInset, MaxContentWidth, Spacing, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import hymnsData from '../../assets/jsons/cantor_cristao/cantor_cristao.json';

type Hymn = {
  id: number;
  title: string;
  lyrics: string;
};

const HYMNS = hymnsData as Hymn[];

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

// Separa a letra em estrofes e marca o coro ("[coro]" no JSON) para exibir
// em itálico com barra dourada. Só visual: o texto compartilhado não muda.
function splitStanzas(lyrics: string) {
  return lyrics
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const chorus = /^\[coro\]/i.test(block);
      return { chorus, text: chorus ? block.replace(/^\[coro\]\s*/i, '') : block };
    });
}

export default function HymnalScreen() {
  const theme = useTheme();
  const styles = useMemo(() => buildStyles(theme), [theme]);

  const [query, setQuery] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  const [modalBannerHeight, setModalBannerHeight] = useState(0);

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
      message: `${selectedHymn.id}. ${toTitleCase(selectedHymn.title)}\n\n${selectedHymn.lyrics}\n\n${SHARE_FOOTER}`,
    });
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
            <TextSizeControls />

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
            <Text style={styles.hymnTitle}>
              {toTitleCase(item.title)}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}
      />

      <Modal visible={selectedHymn !== null} animationType="slide" onRequestClose={() => setSelectedHymn(null)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalBody}>
            {selectedHymn && (
              <View style={styles.modalContent}>
                <ScrollView style={styles.lyricsScroll} contentContainerStyle={styles.lyricsContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalTitleWrap}>
                      <Text style={styles.modalNumber}>{selectedHymn.id}</Text>
                      <Text style={styles.modalTitle}>
                        {toTitleCase(selectedHymn.title)}
                      </Text>
                    </View>
                    <Pressable style={styles.closeButton} onPress={() => setSelectedHymn(null)}>
                      <Text style={styles.closeButtonText}>Fechar</Text>
                    </Pressable>
                  </View>

                  <View style={styles.controls}>
                    <TextSizeControls />
                    <Pressable style={styles.shareButton} onPress={shareHymn}>
                      <Text style={styles.shareButtonText}>Compartilhar</Text>
                    </Pressable>
                  </View>

                  <View style={styles.stanzas}>
                    {splitStanzas(selectedHymn.lyrics).map((stanza, index) => (
                      <View key={index} style={stanza.chorus ? styles.chorus : undefined}>
                        <Text style={[styles.lyricsText, stanza.chorus && styles.chorusText]}>
                          {stanza.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
            <View
              style={styles.modalBanner}
              onLayout={(event) => setModalBannerHeight(event.nativeEvent.layout.height)}>
              <AppBannerAd />
            </View>
            <ThemeToggleButton bottom={modalBannerHeight + Spacing.three} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function buildStyles(theme: ThemeColors) {
  const accent = theme.accent;
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
      color: theme.highlightText,
      fontSize: 12,
      fontFamily: BrandFonts.title,
      letterSpacing: 1.2,
      alignSelf: 'flex-start',
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: Radii.pill,
      backgroundColor: 'rgba(245,184,28,0.16)',
      textTransform: 'uppercase',
    },
    title: {
      color: theme.text,
      fontSize: 34,
      fontFamily: BrandFonts.displayBlack,
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
      fontFamily: BrandFonts.title,
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: border,
      borderRadius: Radii.pill,
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
      borderRadius: Radii.card,
      paddingHorizontal: Spacing.three,
      marginBottom: Spacing.two,
      backgroundColor: theme.backgroundElement,
    },
    hymnNumber: {
      minWidth: 42,
      minHeight: 42,
      padding: Spacing.one,
      borderRadius: Radii.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: accent,
    },
    hymnNumberText: {
      color: theme.onAccent,
      fontSize: 14,
      fontFamily: BrandFonts.title,
    },
    hymnTitle: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
      lineHeight: 22,
      fontFamily: BrandFonts.title,
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
      fontFamily: BrandFonts.title,
    },
    emptyText: {
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
    },
    modalBody: {
      flex: 1,
    },
    modalSafeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalBanner: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
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
      color: theme.chapterNumber,
      fontSize: 26,
      lineHeight: 32,
      fontFamily: BrandFonts.displayBlack,
    },
    modalTitle: {
      flex: 1,
      color: theme.text,
      fontSize: 20,
      lineHeight: 26,
      fontFamily: BrandFonts.title,
    },
    closeButton: {
      minHeight: 40,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: border,
      borderRadius: Radii.pill,
      paddingHorizontal: Spacing.three,
    },
    closeButtonText: {
      color: theme.text,
      fontSize: 13,
      fontFamily: BrandFonts.title,
    },
    controls: {
      alignItems: 'stretch',
      gap: Spacing.two,
      paddingVertical: Spacing.three,
    },
    shareButton: {
      marginLeft: 'auto',
      minHeight: 40,
      justifyContent: 'center',
      borderRadius: Radii.pill,
      paddingHorizontal: Spacing.three,
      backgroundColor: accent,
    },
    shareButtonText: {
      color: theme.onAccent,
      fontSize: 13,
      fontFamily: BrandFonts.title,
    },
    lyricsScroll: {
      flex: 1,
    },
    lyricsContent: {
      paddingBottom: Spacing.six,
    },
    stanzas: {
      gap: Spacing.three,
    },
    chorus: {
      borderLeftWidth: 3,
      borderLeftColor: Palette.gold500,
      paddingLeft: Spacing.three,
    },
    chorusText: {
      fontFamily: BrandFonts.readingItalic,
    },
    lyricsText: {
      color: theme.text,
      fontSize: 18,
      lineHeight: 30,
      fontFamily: BrandFonts.reading,
    },
  });
}
