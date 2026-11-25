import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/accessible-text';
import { ANNIVERSARY_URL, isAnniversaryActive } from '@/constants/anniversary';
import { BrandFonts, Palette, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BANNER_DISMISSED_KEY = 'sibb.anniversary69.banner-dismissed';

function openAnniversaryPage() {
  WebBrowser.openBrowserAsync(ANNIVERSARY_URL).catch(() => {
    Linking.openURL(ANNIVERSARY_URL).catch(() => {});
  });
}

// Pílula dourada "69 ANOS" com texto navy.
export function Anniversary69Seal() {
  return (
    <View style={styles.seal} accessibilityLabel="69 anos">
      <Text style={styles.sealNumber}>69</Text>
      <Text style={styles.sealWord}>ANOS</Text>
    </View>
  );
}

// Faixa discreta acima da lista de livros. Pode ser fechada; a escolha fica
// salva no aparelho.
export function Anniversary69Banner() {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnniversaryActive()) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        setVisible(globalThis.localStorage.getItem(BANNER_DISMISSED_KEY) !== '1');
      } catch {
        setVisible(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      globalThis.localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    } catch {
      // Sem armazenamento: some só nesta sessão.
    }
  };

  return (
    <View style={[styles.banner, { backgroundColor: theme.navBackground }]}>
      <Pressable style={styles.bannerTextWrap} onPress={openAnniversaryPage} accessibilityRole="link">
        <Text style={styles.bannerText}>
          <Text style={styles.bannerGold}>✦ 69 anos da SIBB</Text> · Celebre conosco 12, 13 e 14/dez
        </Text>
      </Pressable>
      <Pressable
        onPress={dismiss}
        style={styles.bannerClose}
        accessibilityLabel="Fechar aviso dos 69 anos"
        hitSlop={8}>
        <Text style={styles.bannerCloseText}>✕</Text>
      </Pressable>
    </View>
  );
}

// Versículo tema no topo do leitor.
export function ThemeVerseCard({ text, reference }: { text: string; reference: string }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.verseCard, { backgroundColor: theme.backgroundElement, borderColor: theme.outline }]}>
      <Text style={[styles.verseKicker, { color: theme.highlightText }]}>VERSÍCULO TEMA · 69 ANOS</Text>
      <Text style={[styles.verseText, { color: theme.text }]}>“{text}”</Text>
      <Text style={[styles.verseRef, { color: theme.chapterNumber }]}>{reference}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
    backgroundColor: Palette.gold500,
    borderRadius: Radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sealNumber: { fontFamily: BrandFonts.displayBlack, fontSize: 16, color: Palette.navy800 },
  sealWord: { fontFamily: BrandFonts.display, fontSize: 10, letterSpacing: 1.4, color: Palette.navy800 },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.pill,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
    minHeight: 48,
  },
  bannerTextWrap: { flex: 1, paddingVertical: Spacing.two },
  bannerText: { color: Palette.textOnDark, fontSize: 13, lineHeight: 18 },
  bannerGold: { color: Palette.gold500, fontFamily: BrandFonts.title },
  bannerClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  bannerCloseText: { color: Palette.mutedOnDark, fontSize: 16 },

  verseCard: {
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: Palette.gold500,
    borderRadius: Radii.card,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  verseKicker: { fontFamily: BrandFonts.title, fontSize: 11, letterSpacing: 1.2 },
  verseText: { fontFamily: BrandFonts.readingItalic, fontSize: 16, lineHeight: 26 },
  verseRef: { fontFamily: BrandFonts.title, fontSize: 13 },
});
