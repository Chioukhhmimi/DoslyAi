import { Platform } from 'react-native';

export const FontFamily = {
  latin: {
    regular:   'PlusJakartaSans_400Regular',
    medium:    'PlusJakartaSans_500Medium',
    semibold:  'PlusJakartaSans_600SemiBold',
    bold:      'PlusJakartaSans_700Bold',
    extrabold: 'PlusJakartaSans_800ExtraBold',
  },
  arabic: {
    regular: 'Tajawal_400Regular',
    medium:  'Tajawal_500Medium',
    // Tajawal has no 600 — map semibold → bold
    bold:    'Tajawal_700Bold',
  },
} as const;

// Fallback to system fonts until custom fonts are loaded
export const FontFamilyFallback = {
  regular:  Platform.OS === 'ios' ? 'System' : 'Roboto',
  bold:     Platform.OS === 'ios' ? 'System' : 'Roboto',
} as const;

/** Font sizes only — weights and families are resolved by AppText */
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 32,
} as const;

export const LineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.8,
} as const;

/**
 * Semantic type scale — use with <AppText variant="h1" /> etc.
 * fontFamily is resolved at runtime based on active locale (latin vs arabic).
 */
export const TypeScale = {
  display: {
    fontSize:   32,
    lineHeight: 40,
    /** latin: 800, arabic: 700 (no 800 mapped to bold) */
    weight: 'extrabold' as const,
  },
  h1: {
    fontSize:   26,
    lineHeight: 34,
    weight: 'bold' as const,
  },
  h2: {
    fontSize:   22,
    lineHeight: 30,
    weight: 'bold' as const,
  },
  h3: {
    fontSize:   18,
    lineHeight: 26,
    weight: 'semibold' as const,
  },
  h4: {
    fontSize:   15,
    lineHeight: 22,
    weight: 'semibold' as const,
  },
  bodyLg: {
    fontSize:   15,
    lineHeight: 22,
    weight: 'regular' as const,
  },
  body: {
    fontSize:   13,
    lineHeight: 20,
    weight: 'regular' as const,
  },
  label: {
    fontSize:   13,
    lineHeight: 20,
    weight: 'semibold' as const,
  },
  caption: {
    fontSize:   11,
    lineHeight: 16,
    weight: 'regular' as const,
  },
  overline: {
    fontSize:      11,
    lineHeight:    16,
    weight:        'bold' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
} as const;

export type TypeVariant = keyof typeof TypeScale;
export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
