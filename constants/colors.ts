export const Colors = {
  // ── Brand — Warm Teal ─────────────────────────────────────────────────────
  primary: '#0D9488',
  primaryLight: '#CCFBF1',
  primaryXLight: '#F0FDFA',
  primaryDark: '#0F766E',

  // ── Semantic: bg (light) + icon/border + text (dark) ─────────────────────
  successLight: '#DCFCE7',
  success: '#10B981',
  successText: '#15803D',

  warningLight: '#FEF9C3',
  warning: '#F59E0B',
  warningText: '#92400E',

  dangerLight: '#FEE2E2',
  danger: '#EF4444',
  dangerText: '#B91C1C',

  // Skipped / amber (distinct from warning)
  skippedLight: '#FEF3C7',
  skippedText: '#92400E',

  // ── Surface — Warm Stone ──────────────────────────────────────────────────
  background: '#FAFAF9',
  surfaceSubtle: '#F5F4F2',
  surface: '#FFFFFF',
  border: '#E7E5E4',

  // ── Text — Warm Stone ─────────────────────────────────────────────────────
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textDisabled: '#D6D3D1',
  textInverse: '#FFFFFF',

  // ── Medical type (data-ink — intentionally distinct from semantic) ─────────
  pill: '#6366F1',
  syrup: '#EC4899',
  injection: '#F97316',
  supplement: '#16A34A', // green-600, distinct from teal primary
  other: '#94A3B8',
} as const;

export type ColorKey = keyof typeof Colors;
