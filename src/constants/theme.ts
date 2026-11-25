/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

// Design tokens Bíblia SIBB — tema 69 anos (fonte única de verdade).
// Ver GUIA_TEMA_69ANOS_Biblia_SIBB.md, seção 2. Sempre hex de 6 dígitos:
// várias telas concatenam transparência (`${cor}18`).
export const Palette = {
  navy900: '#050C1F',
  navy800: '#0B1838',
  navy700: '#13265A',
  royal500: '#2A5BD7',
  gold500: '#F5B81C',
  gold300: '#FFD86B',
  gold700: '#A8740A',
  wine700: '#7A1F2B',
  wine900: '#4D0F19',
  wineOnDark: '#C9485A',
  paper: '#FBF7EE',
  paperVariant: '#F3EAD6',
  paperLine: '#E8DCC0',
  inkText: '#1E1A14',
  mutedLight: '#6B6357',
  textOnDark: '#E8ECF7',
  mutedOnDark: '#9FAACC',
  lineOnDark: '#2B3B66',
  white: '#FFFFFF',
} as const;

// Três temas de leitura (seção 2.2). Usados pelo leitor a partir da etapa
// "Claro / Papel / Noite"; até lá o app segue claro/escuro.
export const ReadingThemes = {
  light: {
    background: Palette.white,
    text: Palette.inkText,
    verseNumber: Palette.mutedLight,
    highlight: 'rgba(245,184,28,0.25)',
    highlightText: Palette.inkText,
    topBar: Palette.navy800,
  },
  paper: {
    background: Palette.paper,
    text: Palette.inkText,
    verseNumber: Palette.wine700,
    highlight: 'rgba(245,184,28,0.30)',
    highlightText: Palette.inkText,
    topBar: Palette.navy800,
  },
  night: {
    background: Palette.navy800,
    text: Palette.textOnDark,
    verseNumber: Palette.mutedOnDark,
    highlight: 'rgba(245,184,28,0.22)',
    highlightText: Palette.white,
    topBar: Palette.navy900,
  },
} as const;

// Marcadores de versículo (seção 4), aplicados com 25–30% de opacidade.
export const HighlightMarkers = ['#F5B81C', '#7FA6FF', '#7BD3A8', '#F29BB0'] as const;

export const Gradients = {
  navy: ['#13265A', '#0B1838', '#050C1F'],
  gold: ['#FFD86B', '#F5B81C', '#E09400'],
} as const;

// Papéis por tema. As chaves antigas (background, accent…) foram mantidas
// para as telas continuarem funcionando; as novas servem às próximas etapas.
export const Colors = {
  light: {
    text: Palette.inkText,
    background: Palette.white,
    backgroundElement: Palette.paper,
    backgroundSelected: Palette.paperVariant,
    textSecondary: Palette.mutedLight,
    cell: Palette.paperVariant,
    // Fundo de botões/estados ativos com texto branco por cima.
    accent: Palette.navy800,
    // Links e destaques em texto (e alguns fundos com texto branco).
    accentLight: Palette.royal500,
    // Texto/ícone sobre accent e accentLight.
    onAccent: Palette.white,
    primary: Palette.navy800,
    onPrimary: Palette.white,
    secondary: Palette.wine700,
    tertiary: Palette.gold500,
    outline: Palette.paperLine,
    highlight: Palette.gold500,
    onHighlight: Palette.navy800,
    highlightText: Palette.gold700,
    chapterNumber: Palette.wine700,
    verseNumber: Palette.mutedLight,
    navBackground: Palette.navy800,
    navActive: Palette.gold500,
    navInactive: Palette.mutedOnDark,
  },
  dark: {
    text: Palette.textOnDark,
    background: Palette.navy900,
    backgroundElement: Palette.navy800,
    backgroundSelected: Palette.navy700,
    textSecondary: Palette.mutedOnDark,
    cell: Palette.navy700,
    // No escuro o destaque é dourado com texto navy por cima (guia, seção 4).
    accent: Palette.gold500,
    accentLight: Palette.gold500,
    onAccent: Palette.navy800,
    primary: Palette.gold500,
    onPrimary: Palette.navy800,
    secondary: Palette.gold500,
    tertiary: Palette.wineOnDark,
    outline: Palette.lineOnDark,
    highlight: Palette.gold500,
    onHighlight: Palette.navy800,
    highlightText: Palette.gold500,
    chapterNumber: Palette.gold500,
    verseNumber: Palette.mutedOnDark,
    navBackground: Palette.navy800,
    navActive: Palette.gold500,
    navInactive: Palette.mutedOnDark,
  },
} as const;

// Famílias carregadas em src/app/_layout.tsx via @expo-google-fonts.
export const BrandFonts = {
  display: 'Montserrat_800ExtraBold',
  displayBlack: 'Montserrat_900Black',
  title: 'Montserrat_700Bold',
  reading: 'Merriweather_400Regular',
  readingItalic: 'Merriweather_400Regular_Italic',
  readingBold: 'Merriweather_700Bold',
} as const;

export const Radii = {
  card: 16,
  chapter: 12,
  sheet: 24,
  pill: 999,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ThemeColors = Record<ThemeColor, string>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 150 }) ?? 0;
export const MaxContentWidth = 800;
