# Historique Feature

## What was built / fixed

### Bug fix: 30j / 90j range navigation
- `buildRangeDays(range)` builds the days array used only for **stats** (adherence %, taken/missed/skipped counts).
- The **day strip** is now independent: `getVisibleDays(selectedDate)` always returns 7 days centred on `selectedDate`, with no range boundary constraint.
- Switching to 30j/90j updates the stats card; swiping navigates through all dates.

### Swipe left / right to navigate dates
- `GestureDetector` + `Gesture.Pan()` wraps the whole screen.
- `activeOffsetX: [-20, 20]` + `failOffsetY: [-15, 15]` — gesture only fires on horizontal swipes, defers vertical scrolling to the `ScrollView`.
- Swipe left → next day (`+1`), swipe right → previous day (`-1`). Future dates are accessible.
- Uses RNGH's `ScrollView` (`react-native-gesture-handler`) for proper gesture coordination.

### Medication detail bottom sheet
- Tapping a `MedListItem` in the history list opens `MedDetailSheet`.
- Sheet shows: name, dose, type badge, frequency, times, start date, end date (or "Indéfinie"), notes.
- Implemented as a `Modal` with `animationType="slide"` and a semi-transparent overlay.
- Component: `components/medication/MedDetailSheet.tsx`

### Card UI redesign (MedListItem)
- White background (`#FFFFFF`), border radius, shadow (iOS + Android elevation).
- Coloured left accent bar (4px wide) using medication's `pillColor` or type colour.
- `onPress` prop added — tapping opens the detail sheet.
- Component: `components/medication/MedListItem.tsx`

### Month / year label above day strip
- A label above the week strip shows the current month and year (e.g. "septembre 2026") and updates live as the user swipes left/right.
- Uses `Intl.DateTimeFormat` via `date.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })` so it respects the active locale (FR/EN/AR).
- `textTransform: 'capitalize'` ensures the month name starts with a capital letter (needed for French where `toLocaleDateString` returns lowercase months).

### Bug fix: future doses showing "en retard" instead of "à venir"
- `MedListItem` was always showing "overdue" for any non-taken, non-skipped dose.
- Fix: compare `scheduledAt` to `new Date()` — if the dose is in the future, show `home.status.pending` ("à venir") with `info` variant instead of `home.status.overdue` with `danger`.
- File: `components/medication/MedListItem.tsx`

### Bug fix: medications not showing on past/future days
- **Root cause**: The screen was filtering `intakeHistory` directly — which only contains records where the user already interacted (taken/skipped). Days with no interactions had zero records and showed empty.
- **Fix**: For the selected day, `getScheduledDosesForDay()` is called for every active medication to generate all expected doses. These are joined with `intakeHistory` to get the status (taken/skipped/missed). Doses with no matching record appear as missed/pending.
- Stats card also switched from filtering `intakeHistory` to iterating scheduled doses across the range, giving accurate counts even for days the user never interacted with.
- Day strip `hasActivity` dot now checks scheduled doses (`getScheduledDosesForDay`) instead of `intakeHistory`, so dots appear on days with scheduled meds even if the user never tapped anything.

## Files changed
- `app/(tabs)/history.tsx` — main screen rewrite + history display bug fix
- `components/medication/MedDetailSheet.tsx` — new component
- `components/medication/MedListItem.tsx` — card redesign + onPress
- `i18n/locales/fr.json`, `en.json`, `ar.json` — added `medication.detail.dose` + `medication.detail.type`
