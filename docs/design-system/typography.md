# Typography

## Fonts

| Locale | Typeface | Weights loaded |
|--------|----------|----------------|
| English, French | **Plus Jakarta Sans** | 400, 500, 600, 700, 800 |
| Arabic | **Tajawal** | 400, 500, 700 |

Fonts are loaded via `expo-font` in `app/_layout.tsx`. The splash screen stays visible until both the database and fonts are ready.

## Type Scale

Use the `<AppText variant="…" />` component. It auto-selects the correct typeface and weight for the active locale.

| Variant | Size | Weight (Latin) | Weight (Arabic) | Line Height | Usage |
|---------|------|----------------|-----------------|-------------|-------|
| `display` | 32 | 800 ExtraBold | 700 Bold | 40 | Onboarding hero text |
| `h1` | 26 | 700 Bold | 700 Bold | 34 | Screen titles |
| `h2` | 22 | 700 Bold | 700 Bold | 30 | Section headers |
| `h3` | 18 | 600 SemiBold | 700 Bold | 26 | Card titles, sheet headers |
| `h4` | 15 | 600 SemiBold | 700 Bold | 22 | Sub-headers, form groups |
| `bodyLg` | 15 | 400 Regular | 400 Regular | 22 | Prominent body text |
| `body` | 13 | 400 Regular | 400 Regular | 20 | Standard body, notes |
| `label` | 13 | 600 SemiBold | 700 Bold | 20 | Form labels, chip text, metadata |
| `caption` | 11 | 400 Regular | 400 Regular | 16 | Timestamps, hints, secondary info |
| `overline` | 11 | 700 Bold CAPS | 700 Bold | 16 | Section dividers (`letterSpacing: 0.8`) |

> **Arabic note:** Tajawal has no 600 weight — `semibold` and `extrabold` map to `700 Bold`.

## Usage

```tsx
import { AppText } from '@components/ui/AppText';

// Basic
<AppText variant="h1">My Medications</AppText>

// With custom colour
<AppText variant="caption" color={Colors.textSecondary}>Next dose in 2 hours</AppText>

// Passes all standard Text props
<AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
  Metformin 500mg
</AppText>
```

## FontSize token (legacy)

`FontSize` from `@constants/typography` is still exported for inline `StyleSheet` usage where `AppText` isn't suitable (e.g. inside `StyleSheet.create`). New code should prefer `AppText` with a `variant`.

```ts
import { FontSize } from '@constants/typography';
// xs:11  sm:13  md:15  lg:17  xl:20  xxl:24  xxxl:32
```

## FontFamily token

Direct font family strings are available if you need to apply a custom font inside a `StyleSheet`:

```ts
import { FontFamily } from '@constants/typography';

StyleSheet.create({
  title: {
    fontFamily: FontFamily.latin.bold,   // 'PlusJakartaSans_700Bold'
    fontSize: 26,
  },
});
```
