# MediTrack — Design System Audit
> Product design audit · September 2026  
> Purpose: full inventory of tokens, components, patterns and gaps — baseline for a scalable design system.

---

## 1. Design Tokens

### 1.1 Color Palette

#### Brand / Primary
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#2563EB` | CTA buttons, active states, links, progress fill, day-strip selected |
| `primaryLight` | `#DBEAFE` | Button secondary bg, badge info bg, avatar bg, onboarding slide bg |
| `primaryDark` | `#1D4ED8` | Badge info text, avatar initials |

#### Semantic
| Token | Hex | Usage |
|---|---|---|
| `success` | `#10B981` | Supplement type color, also reused as success state color |
| `warning` | `#F59E0B` | Warning state (snooze badge bg is `#FEF9C3`, text `#A16207`) |
| `danger` | `#EF4444` | Danger button, missed status, error states |

> ✅ **Fixed:** All semantic light/text pairs are now tokens — `successLight / successText`, `warningLight / warningText`, `dangerLight / dangerText`, `skippedLight / skippedText`. Badge and all consumers updated.

#### Surface / Background
| Token | Hex | Usage |
|---|---|---|
| `background` | `#F8FAFC` | Screen backgrounds, ScreenContainer |
| `surface` | `#FFFFFF` | Cards, inputs, modals, sheets |
| `border` | `#E2E8F0` | All 1px dividers and card outlines |

#### Text
| Token | Hex | Usage |
|---|---|---|
| `textPrimary` | `#0F172A` | Headings, labels, primary values |
| `textSecondary` | `#64748B` | Subtitles, helper text, timestamps |
| `textDisabled` | `#CBD5E1` | Placeholder text, disabled states |
| `textInverse` | `#FFFFFF` | Text on colored backgrounds |

#### Medical Type Colors (data-ink)
| Token | Hex | Medication type |
|---|---|---|
| `pill` | `#6366F1` | Pill / tablet |
| `syrup` | `#EC4899` | Syrup / liquid |
| `injection` | `#F97316` | Injection |
| `supplement` | `#10B981` | Supplement (same as `success` — collision risk) |

> ✅ **Fixed:** `supplement` is now `#059669` — distinct from `success` (`#10B981`). `other` promoted to `#94A3B8`. All `TYPE_COLOR` records across `MedCard`, `MedListItem`, `MedDetailSheet` use `Colors.*` tokens.

#### Colors used inline — ✅ all promoted to tokens

| Value | Token | Notes |
|---|---|---|
| `#15803D` | `successText` | — |
| `#A16207` | `warningText` | — |
| `#B91C1C` | `dangerText` | — |
| `#92400E` | `skippedText` | Amber/skipped, distinct from `warningText` |
| `#DCFCE7` | `successLight` | — |
| `#FEF9C3` | `warningLight` | — |
| `#FEE2E2` | `dangerLight` | — |
| `#F1F5F9` | `surfaceSubtle` | — |
| `#EFF6FF` | `primaryXLight` | — |

---

### 1.2 Typography

#### Font Scale
| Token | Size | Line height (normal 1.5×) | Usage |
|---|---|---|---|
| `xs` | 11px | 16.5px | Timestamps, secondary metadata, badge sm |
| `sm` | 13px | 19.5px | Helper labels, section headers, badge md, captions |
| `md` | 15px | 22.5px | Body text, inputs, button labels, primary list text |
| `lg` | 17px | 25.5px | Screen sub-headers, ScreenHeader title, sheet name |
| `xl` | 20px | 30px | Stat values on home screen |
| `xxl` | 24px | 36px | Screen titles (Historique, Paramètres…) |
| `xxxl` | 32px | 48px | Large display (not used yet — reserved) |

#### Font Weights in use
| Weight | React Native value | Usage |
|---|---|---|
| Regular | `'400'` | Not explicitly used |
| Medium | `'500'` | Not explicitly used |
| SemiBold | `'600'` | Button labels, badge text, section metadata |
| Bold | `'700'` | All screen titles, card names, stat values |

> ⚠️ **Gap:** `FontFamily` tokens exist but all three variants map to the same system font — no custom typeface is loaded. The tokens are structurally ready for a custom font (e.g. Inter) if desired.

> ⚠️ **Gap:** `LineHeight` tokens (`tight`, `normal`, `loose`) are defined but **never used** in the codebase — all line heights are implicit or inline.

---

### 1.3 Spacing Scale
| Token | Value | Usage |
|---|---|---|
| `xs` | 4px | Gap between badge dot and text, tight inner gaps |
| `sm` | 8px | Inner padding of small buttons, chip padding, list item row gap |
| `md` | 16px | Standard card padding, screen horizontal padding, form row gap |
| `lg` | 24px | Section spacing, button horizontal padding |
| `xl` | 32px | Large section gaps, empty state padding |
| `xxl` | 48px | Empty state icon margin, very large separators |

---

### 1.4 Border Radius Scale
| Token | Value | Usage |
|---|---|---|
| `sm` | 6px | Inputs, small chips, action buttons inside cards |
| `md` | 12px | Cards (Card, MedCard, MedListItem, ProfileCard), modals |
| `lg` | 16px | Bottom sheets, large modals |
| `xl` | 24px | Large rounded containers |
| `full` | 9999px | Pills (Badge, FilterBtn, ProfileSelector, RangeBtn) |

---

### 1.5 Elevation / Shadow
Two shadow levels are used (both defined inline, not tokenised):

| Level | shadowOpacity | shadowRadius | elevation | Usage |
|---|---|---|---|---|
| Low | 0.06 | 4 | 2 | Card, MedListItem, ProfileCard |
| None | — | — | 0 | Flat surfaces (inputs, chips) |

> ⚠️ **Gap:** No medium or high elevation token. No shadow defined for bottom sheets or modals (relying on background overlay instead).

---

## 2. Component Inventory

### 2.1 Primitive / UI Components

---

#### `Button`
**File:** `components/ui/Button.tsx`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Button text |
| `onPress` | `() => void` | required | — |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| `loading` | `boolean` | `false` | Replaces label with spinner |
| `disabled` | `boolean` | `false` | 50% opacity, non-interactive |
| `style` | `ViewStyle` | — | Override container |

**Variants:**

| Variant | Background | Border | Text color |
|---|---|---|---|
| `primary` | `#2563EB` | none | `#FFFFFF` |
| `secondary` | `#DBEAFE` | 1px `#2563EB` | `#2563EB` |
| `ghost` | transparent | none | `#2563EB` |
| `danger` | `#EF4444` | none | `#FFFFFF` |

**States:** default · loading · disabled (opacity 0.5)

**Dimensions:** height 50px · borderRadius 12px · paddingH 24px

> ⚠️ **Gap:** No icon support. No `size` prop (all buttons are the same height). No outlined danger variant.

---

#### `Badge`
**File:** `components/ui/Badge.tsx`

| Prop | Type | Default |
|---|---|---|
| `label` | `string` | required |
| `variant` | `'default' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size` | `'sm' \| 'md'` | `'md'` |

**Variants:**

| Variant | Background | Text |
|---|---|---|
| `default` | `#F1F5F9` | `#64748B` |
| `success` | `#DCFCE7` | `#15803D` |
| `warning` | `#FEF9C3` | `#A16207` |
| `danger` | `#FEE2E2` | `#B91C1C` |
| `info` | `#DBEAFE` | `#1D4ED8` |

**Sizes:**

| Size | Padding V | Padding H | Font size |
|---|---|---|---|
| `sm` | 2px | 8px | 11px |
| `md` | 4px | 10px | 13px |

**Shape:** `borderRadius: 9999` (pill) · `fontWeight: '600'`

> ⚠️ **Gap:** No dot/icon support. No outlined variant. No dismissable/closeable variant.

---

#### `Avatar`
**File:** `components/ui/Avatar.tsx`

| Prop | Type | Default |
|---|---|---|
| `name` | `string` | required |
| `uri` | `string?` | — |
| `size` | `number` | `40` |
| `onPress` | `() => void?` | — |

**States:**
- With `uri`: renders `<Image>` (circular, cropped)
- Without `uri`: renders up to 2 initials, font size = `size × 0.38`
- With `onPress`: wraps in `TouchableOpacity`

**Fixed styling:** bg `#DBEAFE` · text `#1D4ED8` · fontWeight `'700'` · circular (borderRadius = size/2)

**Sizes used in app:** 28px (ProfileSelector), 40px (default), 48px (ProfileCard), 72px (ProfileDetail), 88px (LockScreen icon container — not Avatar)

> ⚠️ **Gap:** No `online`/`active` indicator ring. No loading skeleton. No error fallback if `uri` fails to load.

---

#### `Card`
**File:** `components/ui/Card.tsx`

| Prop | Type | Default |
|---|---|---|
| `children` | `ReactNode` | required |
| `style` | `ViewStyle?` | — |

**Single variant.** Background white · radius 12px · padding 16px · shadow low.

> ⚠️ **Gap:** Only one variant — no outlined (no shadow, border only), no flat (no shadow, no border), no colored/tinted card.

---

#### `EmptyState`
**File:** `components/ui/EmptyState.tsx`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | required |
| `description` | `string?` | — |
| `actionLabel` | `string?` | — |
| `onAction` | `() => void?` | — |

**Layout:** centred vertically · 80×80 placeholder circle (bg `#DBEAFE`) · title 17px/600 · description 15px/gray · action Button primary.

> ⚠️ **Gap:** Placeholder is a blank blue circle — no icon or illustration. No image/lottie support.

---

#### `Toast`
**File:** `components/ui/Toast.tsx`

| Prop | Type | Default |
|---|---|---|
| `message` | `string` | required |
| `type` | `'success' \| 'error' \| 'info'` | — |
| `visible` | `boolean` | required |
| `onHide` | `() => void` | required |

**Variants:** success / error / info (bg + text pairs matching Badge palette).

**Behaviour:** absolute bottom-40px · auto-hide after 3s · 250ms slide-up + fade-in · 200ms slide-down + fade-out.

> ⚠️ **Gap:** Not yet wired to a global context/provider — each screen that needs a toast must manage its own state. No queue support.

---

#### `ScreenHeader`
**File:** `components/ui/ScreenHeader.tsx`

| Prop | Type | Default |
|---|---|---|
| `title` | `string` | required |
| `onBack` | `() => void?` | — |
| `right` | `ReactNode?` | — |

**Layout:** row · back chevron (24px) optional left · title flex 1 lg/700 · right slot min-width 32px.

---

#### `LockScreen`
**File:** `components/ui/LockScreen.tsx`

| Prop | Type |
|---|---|
| `onUnlock` | `() => void` |

**Layout:** fullscreen overlay · centred icon (88×88 rounded square bg `#DBEAFE`) · title xxl/700 · subtitle md/gray · unlock button primary with icon.

---

### 2.2 Layout Components

---

#### `ScreenContainer`
**File:** `components/layout/ScreenContainer.tsx`

| Prop | Type | Default |
|---|---|---|
| `children` | `ReactNode` | required |
| `scrollable` | `boolean` | `false` |
| `padded` | `boolean` | `true` |
| `style` | `ViewStyle?` | — |
| `onRefresh` | `() => Promise<void> \| void?` | — |

**Modes:**
- `scrollable=false` → `SafeAreaView > View` (padded if `padded=true`)
- `scrollable=true` → `SafeAreaView > ScrollView` with pull-to-refresh support

**Padding:** 16px all sides when `padded=true`.

---

### 2.3 Medication Components

---

#### `MedCard` (Home screen — dose card with actions)
**File:** `components/medication/MedCard.tsx`

| Prop | Type |
|---|---|
| `medication` | `Medication` |
| `scheduledTime` | `string` (HH:mm) |
| `scheduledISO` | `string` (ISO) |
| `intakeRecord` | `IntakeRecord?` |
| `onMarkTaken` | `() => void` |
| `onSkip` | `() => void` |

**States / visual modes:**

| State | Badge variant | Action row visible | Opacity |
|---|---|---|---|
| Pending | `info` | ✅ (3 buttons) | 100% |
| Pending + overdue | `danger` | ✅ | 100% |
| Taken | `success` | ❌ | 100% |
| Skipped | `warning` | ❌ | 100% |
| Paused | any | ❌ | 60% |

**Action buttons (pending only):**

| Button | Background | Text color |
|---|---|---|
| Taken | `#DCFCE7` | `#15803D` |
| Snooze | `#FEF9C3` | `#92400E` |
| Skip | border only | `#64748B` |

**Sub-component:** Snooze modal (10 / 30 / 60 min options) — `Modal transparent animationType="fade"`.

---

#### `MedListItem` (History screen — read-only card)
**File:** `components/medication/MedListItem.tsx`

| Prop | Type |
|---|---|
| `medication` | `Medication` |
| `intakeRecord` | `IntakeRecord?` |
| `scheduledAt` | `string` |
| `onPress` | `() => void?` |

**Layout:** white card · 4px left accent bar (medication colour) · name 700 · dosage sm/gray · time xs/gray · status badge top-right.

**Status badge variants:** `success` (taken) · `warning` (skipped) · `danger` (overdue/missed).

---

#### `MedDetailSheet` (History — bottom sheet on tap)
**File:** `components/medication/MedDetailSheet.tsx`

| Prop | Type |
|---|---|
| `medication` | `Medication \| null` |
| `onClose` | `() => void` |

**Layout:** Modal slide-up · handle bar · header (dot + name + dose + type badge) · info rows (frequency / times / start / end / notes) · close button.

---

#### `MedForm` (Add / Edit medication — 4-step wizard)
**File:** `components/medication/MedForm.tsx`

| Prop | Type |
|---|---|
| `initialValues` | `Partial<Medication>?` |
| `onSubmit` | `(data: NewMedication) => void` |
| `onCancel` | `() => void` |
| `profileId` | `string` |

**4 steps:**

| Step | Title | Fields |
|---|---|---|
| 1 | Basics | Name · Dose qty + unit · Unit presets (8 chips) · Type (5 chips) · Color swatches (10) · Notes |
| 2 | Schedule | `SchedulePicker` |
| 3 | Dates | Start date · Indefinite toggle · End date |
| 4 | Review | Summary card (`ReviewRow` list) |

**Progress bar:** 4px, fills to `step/totalSteps × 100%`.

**Unit presets:** `mg` · `g` · `ml` · `mcg` · `tablet` · `capsule` · `drop` · `dose`

**Type chips:** `pill` · `syrup` · `injection` · `supplement` · `other`

**Color swatches (10):** `#6366F1` · `#EC4899` · `#F97316` · `#10B981` · `#EAB308` · `#06B6D4` · `#EF4444` · `#8B5CF6` · `#84CC16` · `#F59E0B`

---

#### `SchedulePicker`
**File:** `components/medication/SchedulePicker.tsx`

| Prop | Type |
|---|---|
| `value` | `MedicationSchedule` |
| `onChange` | `(s: MedicationSchedule) => void` |

**Frequency tabs (4):** `daily` · `weekly` · `interval` · `pattern`

**Sub-views per frequency:**

| Frequency | Extra UI |
|---|---|
| `daily` | none |
| `weekly` | 7 day chips (36×36, circular) |
| `interval` | numeric input + "day(s)" suffix |
| `pattern` | pattern presets chips + binary grid (each bit 32×32) |

---

#### `DosePicker`
**File:** `components/medication/DosePicker.tsx`

| Prop | Type | Default |
|---|---|---|
| `times` | `string[]` | required |
| `onChange` | `(t: string[]) => void` | required |
| `maxTimes` | `number?` | 6 |

**Per time row:** time button (flex 1) · delete button (✕).  
**Add button:** `＋ Ajouter une heure` / `+ Add a time` — primary color text.  
**iOS time input:** bottom-sheet modal with native DateTimePicker spinner.  
**Android:** native modal picker.

---

### 2.4 Profile Components

---

#### `ProfileCard`
**File:** `components/profile/ProfileCard.tsx`

| Prop | Type |
|---|---|
| `profile` | `Profile` |
| `isActive` | `boolean?` |
| `medicationCount` | `number?` |
| `onPress` | `() => void` |
| `onLongPress` | `() => void?` |

**States:**

| State | Border | Left bar |
|---|---|---|
| Default | `#E2E8F0` (1px) | none |
| Active | `#2563EB` (1px) | 4px `#2563EB` |

**Layout:** row · Avatar 48px · name 700 + subtitle (relationship · age) · med count badge (info) top-right.

---

#### `ProfileSelector` (Home — horizontal scroll)
**File:** `components/profile/ProfileSelector.tsx`

**Layout:** horizontal ScrollView · pill shape per profile (Avatar 28px + name).

**States:**

| State | Background | Border | Text |
|---|---|---|---|
| Active | `#DBEAFE` | `#2563EB` | `#1D4ED8` |
| Inactive | transparent | `#E2E8F0` | `#64748B` |

---

## 3. Screen Inventory

| Screen | Route | Scrollable | Key components |
|---|---|---|---|
| Home | `/(tabs)/` | Yes (pull-to-refresh) | ProfileSelector · StatsRow · Bucketed MedCards |
| Medications | `/(tabs)/medications` | Yes | SectionList · MedRows |
| Add medication | `/(tabs)/add` | No | MedForm |
| History | `/(tabs)/history` | Yes (+ swipe gesture) | StatsCard · DayStrip · FilterTabs · MedListItems |
| Settings | `/(tabs)/settings` | No | Card groups · SettingRow |
| Profile list | `/profile` | No | FlatList of ProfileCards |
| New profile | `/profile/new` | No | Form fields |
| Profile detail | `/profile/[id]` | No | Avatar · Info · DangerZone |
| Medication detail | `/medication/[id]` | Yes | InfoCard · UpcomingDoses · Actions |
| Medication confirm | `/medication/confirm` | No | Bottom sheet modal |
| Medication scan | `/medication/scan` | No | CameraView · ResultsList |
| Export | `/export` | No | PeriodSelector · ExportButtons |
| Notifications settings | `/settings/notifications` | No | Toggles · TimePickers |
| Language settings | `/settings/language` | No | Language list |
| About | `/settings/about` | No | AppInfo |
| Privacy | `/settings/privacy` | No | Body text |
| Terms | `/settings/terms` | No | Sectioned text |
| Onboarding slide 1–4 | `/(onboarding)/slide1–4` | No | Illustration · Title · Description · Nav |
| Not found | `/+not-found` | No | EmptyState-style |
| Lock screen | overlay | No | LockScreen |

---

## 4. Design Patterns

### 4.1 Status / State system
Three sources of colour coding for medication status — all using the same semantic values:

| Status | Colour | Badge variant | Usage |
|---|---|---|---|
| Taken | `#15803D` / `#DCFCE7` | `success` | MedCard, MedListItem, DayDot |
| Pending | `#1D4ED8` / `#DBEAFE` | `info` | MedCard (not overdue) |
| Overdue | `#B91C1C` / `#FEE2E2` | `danger` | MedCard, MedListItem time text |
| Skipped | `#A16207` / `#FEF9C3` | `warning` | MedCard, MedListItem |
| Paused | — | `warning` (label) | MedCard opacity 60% |

### 4.2 Bottom sheet pattern
Used in: `DosePicker` (iOS time select), `MedCard` (snooze), `medication/confirm` (dose confirm), `MedDetailSheet`.

Common structure:
```
overlay (rgba 0,0,0,0.4–0.45, justifyContent: flex-end)
  sheet (bg white, borderTopRadius 16–20px, paddingBottom 32–36px)
    handle (36×4px, bg #E2E8F0, centered)
    content
    action button
```
> ✅ **Fixed:** `components/ui/BottomSheet.tsx` — shared component used by `MedCard` (snooze), `MedDetailSheet`, `confirm.tsx` (snooze), `DosePicker` (iOS), `MedForm` (iOS date pickers).

### 4.3 Form chip / selector pattern
Used in: frequency tabs, type chips, unit presets, day chips, pattern bits, range selector, filter tabs, language rows.

All share the same active/inactive visual logic:
- **Active:** `primary` background, white text (or `primaryLight` bg, `primaryDark` text for softer variant)
- **Inactive:** white/surface background, border, secondary text

> ⚠️ **Gap:** No shared `ChipGroup` or `SegmentedControl` component.

### 4.4 Settings row pattern
Used across all settings screens:

```
Row: icon (18px) | label (flex 1) | right element (chevron / switch / value)
```
> ⚠️ **Gap:** No shared `SettingRow` component — each screen reimplements inline.

### 4.5 Card info row pattern
Used in `MedDetailSheet`, `medication/[id]`, `export`:

```
Row: label (gray, flex 1) | value (black, 600, flex 1.5, right-aligned)
border-bottom 1px
```
> ⚠️ **Gap:** No shared `InfoRow` or `DetailRow` component — reimplemented in each screen.

### 4.6 Platform-specific date/time pickers
- **iOS:** always a bottom sheet with native `DateTimePicker` in spinner mode + a "Done" button
- **Android:** native modal (opens directly with `show` flag)

Pattern repeated in: `MedForm`, `DosePicker`, `Export`.

---

## 5. Gaps & Recommendations

### 5.1 Token promotions — ✅ done
All hardcoded hex values replaced. See updated token table in §1.1 and `constants/colors.ts` + `constants/shadows.ts`.

### 5.2 Shared components
| Component | Status | Notes |
|---|---|---|
| `BottomSheet` | ✅ Done | `components/ui/BottomSheet.tsx` — 5 consumers refactored |
| `ChipGroup` / `SegmentedControl` | ⚠️ Pending | SchedulePicker, range/filter bars, MedForm |
| `SettingRow` | ⚠️ Pending | settings/index, notifications, language, about |
| `InfoRow` / `DetailRow` | ⚠️ Pending | MedDetailSheet, medication/[id], export |
| `SectionHeader` | ⚠️ Pending | medications screen, profile screen |
| `DatePickerField` | ⚠️ Pending | MedForm, export |
| `ConfirmDialog` | ⚠️ Pending | profile/[id] delete — currently native Alert |
| `Skeleton` | ⚠️ Pending | No loading states anywhere |

### 5.3 Accessibility gaps
- No `accessibilityLabel` on any interactive element
- No `accessibilityRole` (`button`, `tab`, etc.)
- Color-only status indicators (no shape differentiation)
- Touch targets below 44×44px: day strip buttons (`minHeight: 52` ✅), filter chips (padding 6px + font 13px → ~33px height ⚠️), color swatches (28×28 ⚠️)

### 5.4 Missing states / feedback
- No skeleton/loading state for any list
- No error state for list screens (network/DB failure)
- No haptic on badge tap, day selection, or filter change (only on MedCard actions)
- `Card` component has no pressed/hover state

### 5.5 Visual consistency issues
| Issue | Detail |
|---|---|
| Shadow inconsistency | `Card` has shadow, `MedCard` has border but also no shadow, `MedListItem` has both |
| Border-radius inconsistency | Some sheets use `lg` (16), MedDetailSheet uses 20px (hardcoded) |
| Button height not consistent | Action buttons inside cards use custom padding, not the 50px standard |
| Typography weight gap | `'500'` (medium) never used; jumps from 400 (implicit) to 600 to 700 |

---

## 6. Proposed Design Token File (extended)

```typescript
// constants/colors.ts — proposed extension
export const Colors = {
  // Brand
  primary:       '#2563EB',
  primaryLight:  '#DBEAFE',
  primaryXLight: '#EFF6FF',
  primaryDark:   '#1D4ED8',

  // Semantic — bg (light) + text (dark) pairs
  successLight:  '#DCFCE7',
  success:       '#10B981',
  successText:   '#15803D',

  warningLight:  '#FEF9C3',
  warning:       '#F59E0B',
  warningText:   '#A16207',

  dangerLight:   '#FEE2E2',
  danger:        '#EF4444',
  dangerText:    '#B91C1C',

  skippedLight:  '#FEF3C7',
  skippedText:   '#92400E',

  // Surface
  background:    '#F8FAFC',
  surfaceSubtle: '#F1F5F9',
  surface:       '#FFFFFF',
  border:        '#E2E8F0',

  // Text
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textDisabled:  '#CBD5E1',
  textInverse:   '#FFFFFF',

  // Medical types (data-ink — distinct from semantic)
  pill:          '#6366F1',
  syrup:         '#EC4899',
  injection:     '#F97316',
  supplement:    '#059669',  // differentiated from success
  other:         '#94A3B8',
} as const;

// constants/shadows.ts — proposed new file
export const Shadows = {
  low: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  4,
    elevation:     2,
  },
  medium: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  12,
    elevation:     6,
  },
} as const;
```

---

## 7. Component Priority Roadmap

| Priority | Component | Status | Effort | Impact |
|---|---|---|---|---|
| 🔴 High | Promote color tokens | ✅ Done | Low | All hardcoded values replaced |
| 🔴 High | `BottomSheet` (shared) | ✅ Done | Medium | 5 duplicates removed |
| 🟡 Medium | `ChipGroup` / `SegmentedControl` | ⬜ Pending | Medium | Removes 6+ duplicates |
| 🟡 Medium | `InfoRow` / `DetailRow` | ⬜ Pending | Low | Removes 4 duplicates |
| 🟡 Medium | `SettingRow` | ⬜ Pending | Low | Removes 3 duplicates |
| 🟡 Medium | `DatePickerField` | ⬜ Pending | Medium | Removes platform-switch boilerplate |
| 🟢 Low | `Skeleton` loader | ⬜ Pending | Medium | Better perceived performance |
| 🟢 Low | `ConfirmDialog` | ⬜ Pending | Low | Replaces native Alert |
| 🟢 Low | `SectionHeader` | ⬜ Pending | Low | Removes 2 duplicates |
| 🟢 Low | Accessibility pass | ⬜ Pending | High | Compliance + UX |

---

*Generated from full codebase audit · MediTrack v1 · September 2026*
