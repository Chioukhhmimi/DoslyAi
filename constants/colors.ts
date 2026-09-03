export const Colors = {
  // ── Brand ─────────────────────────────────────────────────────────────────
  primary:       '#2563EB',
  primaryLight:  '#DBEAFE',
  primaryXLight: '#EFF6FF',
  primaryDark:   '#1D4ED8',

  // ── Semantic: bg (light) + icon/border + text (dark) ─────────────────────
  successLight:  '#DCFCE7',
  success:       '#10B981',
  successText:   '#15803D',

  warningLight:  '#FEF9C3',
  warning:       '#F59E0B',
  warningText:   '#A16207',

  dangerLight:   '#FEE2E2',
  danger:        '#EF4444',
  dangerText:    '#B91C1C',

  // Skipped / amber (distinct from warning)
  skippedLight:  '#FEF3C7',
  skippedText:   '#92400E',

  // ── Surface ───────────────────────────────────────────────────────────────
  background:    '#F8FAFC',
  surfaceSubtle: '#F1F5F9',
  surface:       '#FFFFFF',
  border:        '#E2E8F0',

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textDisabled:  '#CBD5E1',
  textInverse:   '#FFFFFF',

  // ── Medical type (data-ink — intentionally distinct from semantic) ─────────
  pill:          '#6366F1',
  syrup:         '#EC4899',
  injection:     '#F97316',
  supplement:    '#059669',  // differentiated from success (#10B981)
  other:         '#94A3B8',
} as const;

export type ColorKey = keyof typeof Colors;
