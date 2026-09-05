# Dosly Rebrand + Feature Completion — Design Spec
**Date:** 2026-09-05  
**Status:** Approved

---

## Scope

Four independent workstreams executed in a single sprint:

1. Full app rename from MediTrack → Dosly (display + technical identifiers)
2. Refill reminder notifications (wire existing UI field into actual notification scheduling)
3. i18n completeness (fix hardcoded French strings from the Sep-05 sprint)
4. App icon & splash screen config (assets already in place)
5. Onboarding skip flow fix (slides 1–3 skip should always land on slide 4)

---

## 1. App Rename → Dosly

### app.json changes

| Field | Old | New |
|---|---|---|
| `expo.name` | "MediTrack" | "Dosly" |
| `expo.slug` | "meditrack" | "dosly" |
| `expo.scheme` | "meditrack" | "dosly" |
| `expo.ios.bundleIdentifier` | "com.meditrack.app" | "com.dosly.app" |
| `expo.android.package` | "com.meditrack.app" | "com.dosly.app" |
| Camera permission text | "MediTrack needs camera access to scan prescriptions." | "Dosly needs camera access to scan prescriptions." |

Also add missing splash screen config under the `expo-splash-screen` plugin:
```json
["expo-splash-screen", {
  "image": "./assets/splash-icon.png",
  "backgroundColor": "#FFFFFF",
  "imageWidth": 200,
  "resizeMode": "contain"
}]
```

### Translation files (fr.json, en.json, ar.json)

All three locale files contain hardcoded "MediTrack" occurrences that must be renamed:

- `common.appName` → "Dosly" (all 3 locales; Arabic: "دوزلي")
- `onboarding.slide1.description` — mentions "MediTrack" by name
- `onboarding.slide3.description` (if present) — may mention "MediTrack"
- `settings.cameraDescription` — "MediTrack needs access to your camera…"
- `settings.privacyBody` — long text mentioning "MediTrack" multiple times
- `settings.terms.intro` — "By using MediTrack, you agree…"
- `settings.terms.section1Body` — "MediTrack is a medication management aid…"

Replace every occurrence of "MediTrack" with "Dosly" across all 3 locale files. Arabic occurrences of "ميديتراك" → "دوزلي".

---

## 2. Refill Reminder Notifications

### Where: `hooks/useNotifications.ts`

Extend `scheduleNotificationsForMedication` to schedule one extra notification when:
- `medication.refillReminderEnabled === true`
- `medication.endDate` is set (non-null)
- `medication.refillReminderDays > 0`

### Logic

```
reminderDate = endDate minus refillReminderDays days, at 09:00 local time
if reminderDate > now:
  schedule notification with identifier `refill_${medication.id}`
```

### Notification content (all 3 locales via store language)

Use hardcoded strings for the notification body (notifications fire natively, outside React context):
- Title: `💊 <medication.name>`
- Body: "Il est temps de renouveler votre ordonnance." / "Time to renew your prescription." / "حان وقت تجديد وصفتك الطبية."

For simplicity, the notification body is fixed in French (matching the app's default language). A future improvement could read the stored language setting.

### Cancellation

`cancelNotificationsForMedication` already cancels all notifications whose identifier starts with `medicationId`. Since the refill identifier is `refill_${medication.id}`, it is automatically cancelled by the existing prefix-scan logic. No changes needed to the cancel function.

### Edge cases

- If `reminderDate` is in the past (e.g. `endDate` already passed), skip scheduling silently.
- If `endDate` is not set on a medication, skip silently.

---

## 3. i18n Completeness

### New translation keys required

All three locale files (fr.json, en.json, ar.json) must receive these keys:

#### `settings` section additions

```json
"deleteAllBtn": "Supprimer toutes les données",
"deleteAllTitle": "Supprimer toutes les données",
"deleteAllMessage": "Cette action est irréversible. Tous vos médicaments, profils et historique seront supprimés."
```

| Key | FR | EN | AR |
|---|---|---|---|
| `settings.deleteAllBtn` | Supprimer toutes les données | Delete all data | حذف جميع البيانات |
| `settings.deleteAllTitle` | Supprimer toutes les données | Delete all data | حذف جميع البيانات |
| `settings.deleteAllMessage` | Cette action est irréversible. Tous vos médicaments, profils et historique seront supprimés. | This action is irreversible. All your medications, profiles and history will be deleted. | هذا الإجراء لا رجعة فيه. سيتم حذف جميع أدويتك وملفاتك الشخصية وسجلاتك. |

#### `medication.detail` section addition

| Key | FR | EN | AR |
|---|---|---|---|
| `medication.detail.adherence7` | Observance 7 jours | 7-day adherence | الالتزام خلال 7 أيام |

#### `export` section addition

| Key | FR | EN | AR |
|---|---|---|---|
| `export.json` | ⬇ Exporter JSON | ⬇ Export JSON | ⬇ تصدير JSON |

### Components to update

- `app/(tabs)/settings.tsx`: replace 3 hardcoded French strings with `t('settings.deleteAllBtn')`, `t('settings.deleteAllTitle')`, `t('settings.deleteAllMessage')`
- `app/medication/[id].tsx`: replace `"Observance 7 jours"` with `t('medication.detail.adherence7')`
- `app/export.tsx`: replace `'JSON'` button label with `t('export.json')`

---

## 4. App Icon & Splash Screen

Assets are already in place at their expected paths. The only required change is `app.json`:

- The `expo-splash-screen` plugin entry currently has no config object — update it to pass image path, background color, and resize mode (see section 1 above).
- No code changes needed. Expo CLI reads these at build time.

---

## 5. Onboarding Skip Flow Fix

### Current behaviour (broken)

| Slide | Skip destination |
|---|---|
| Slide 1 | `/(onboarding)/slide3` — skips slide 2, misses notification consent |
| Slide 2 | `/(onboarding)/slide3` — misses notification consent |
| Slide 3 | completeOnboarding + `/profile/new` — bypasses slide 4 notification consent |
| Slide 4 | No skip button (`isLast=true`) — correct |

### Fixed behaviour

All "Skip" actions on slides 1–3 route to **`/(onboarding)/slide4`**. Slide 4 is the notification consent screen and the authoritative completion gate. Users always pass through it whether they skipped or followed the full flow.

| Slide | Skip destination (fixed) |
|---|---|
| Slide 1 | `/(onboarding)/slide4` |
| Slide 2 | `/(onboarding)/slide4` |
| Slide 3 | `/(onboarding)/slide4` |
| Slide 4 | No skip (unchanged) |

### Files to change

- `app/(onboarding)/slide1.tsx` — `onSkip` prop
- `app/(onboarding)/slide2.tsx` — `onSkip` prop
- `app/(onboarding)/slide3.tsx` — `onSkip` prop (replace `completeOnboarding()` + redirect with simple `router.push('/(onboarding)/slide4')`)

---

## Implementation Order

Tasks are independent and can be parallelised except that i18n keys must exist before component strings are replaced:

1. Rename (app.json + translations) — touches many files, low risk
2. Refill notifications — isolated to `useNotifications.ts`
3. i18n completeness — locale files first, then component string replacement
4. Icon/splash — app.json only
5. Onboarding skip — 3 small file edits

All changes committed, then `tsc --noEmit` to verify 0 new errors.
