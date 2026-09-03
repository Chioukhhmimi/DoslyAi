# QA Bugfixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all issues found in the QA audit: build-breaking imports, missing package declarations, data leaks, UX bugs, and dead dependencies.

**Architecture:** No new files needed. All fixes are surgical edits to existing files. No test framework exists in the project — verification is done by checking the bundler output and visual inspection. No git repo exists.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, expo-sqlite, Zustand 5, expo-router v3.

---

## File Map

| File | Change |
|---|---|
| `app/settings/language.tsx` | Remove `expo-updates` import, replace with Alert |
| `package.json` | Add `expo-constants`; remove 9 dead packages |
| `app/export.tsx` | Filter medications/intakeHistory by `activeProfileId` |
| `app/profile/[id].tsx` | Replace DOB TextInput with DateTimePicker (Android inline + iOS modal) |
| `app/(tabs)/history.tsx` | Remove unused `computeAdherence` import |
| `db/migrations/v1_initial.ts` | Remove stale TODO comment |

---

### Task 1: Fix critical build error — remove `expo-updates`

**Files:**
- Modify: `app/settings/language.tsx`

**Root cause:** `expo-updates` is not in `package.json`. It is only used to call `Updates.reloadAsync()` when the user switches to/from Arabic (requires RTL layout flip). The correct alternative is to show an Alert telling the user to restart the app — which is the standard pattern when `expo-updates` is unavailable.

- [ ] **Step 1: Edit `app/settings/language.tsx`**

Replace the entire file content with:

```tsx
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Card } from '@components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES, type LanguageCode } from '../../i18n';
import { useSettingsStore } from '@store/settingsStore';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  async function changeLanguage(code: LanguageCode) {
    setLanguage(code);
    i18n.changeLanguage(code);

    const newIsRTL = RTL_LANGUAGES.includes(code);
    if (I18nManager.isRTL !== newIsRTL) {
      I18nManager.forceRTL(newIsRTL);
      Alert.alert(
        'Redémarrage requis',
        'Veuillez redémarrer l\'application pour appliquer la nouvelle direction de mise en page.',
        [{ text: 'OK' }]
      );
    }
  }

  return (
    <ScreenContainer>
      <ScreenHeader title={t('settings.language')} />
      <Card>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.row}
            onPress={() => changeLanguage(lang.code)}
          >
            <View style={styles.langInfo}>
              <Text style={styles.native}>{lang.nativeLabel}</Text>
              <Text style={styles.label}>{lang.label}</Text>
            </View>
            {i18n.language === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  langInfo: { flex: 1 },
  native:   { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  label:    { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
```

- [ ] **Step 2: Verify bundler resolves**

Run `npx expo start --android` and confirm the bundle succeeds (no "Unable to resolve expo-updates" error). The app should open on the home screen.

---

### Task 2: Declare `expo-constants` in `package.json` + remove dead packages

**Files:**
- Modify: `package.json`

**Root cause:** `expo-constants` is used in 3 files but not declared. 9 packages are declared but never imported anywhere in the app source.

- [ ] **Step 1: Edit `package.json`**

Replace the `dependencies` block with:

```json
"dependencies": {
  "@expo/vector-icons": "^15.1.1",
  "@react-native-community/datetimepicker": "9.1.0",
  "date-fns": "^4.4.0",
  "expo": "~57.0.18",
  "expo-application": "~57.0.2",
  "expo-camera": "~57.0.4",
  "expo-constants": "~17.0.8",
  "expo-file-system": "~57.0.6",
  "expo-haptics": "^57.0.2",
  "expo-image-picker": "~57.0.14",
  "expo-linking": "~57.0.8",
  "expo-local-authentication": "^57.0.2",
  "expo-localization": "~57.0.1",
  "expo-notifications": "~57.0.15",
  "expo-print": "~57.0.1",
  "expo-router": "~57.0.17",
  "expo-sharing": "~57.0.17",
  "expo-splash-screen": "~57.0.8",
  "expo-sqlite": "~57.0.2",
  "expo-status-bar": "~57.0.1",
  "i18next": "^26.4.0",
  "react": "19.2.3",
  "react-i18next": "^17.0.12",
  "react-native": "0.86.3",
  "react-native-gesture-handler": "~2.32.0",
  "react-native-reanimated": "4.5.1",
  "react-native-safe-area-context": "~5.7.0",
  "react-native-screens": "~4.26.0",
  "zustand": "^5.0.15"
}
```

And replace `devDependencies` with:

```json
"devDependencies": {
  "@types/react": "~19.2.2",
  "babel-plugin-module-resolver": "^5.0.3",
  "babel-preset-expo": "^57.0.10",
  "eslint": "^10.9.1",
  "eslint-config-universe": "^16.0.0",
  "prettier": "^3.9.6",
  "typescript": "~6.0.3"
}
```

**Removed:** `@nozbe/watermelondb`, `react-native-worklets`, `react-hook-form`, `zod`, `lottie-react-native`, `react-native-svg`, `date-fns-tz`, `nativewind`, `tailwindcss`.
**Added:** `expo-constants ~17.0.8` (check exact compatible version below).

- [ ] **Step 2: Verify expo-constants version**

Run:
```bash
npx expo install expo-constants --dry-run
```
Use whatever version that command recommends for SDK 57. Update the version string in `package.json` to match. If the command is not available, `~17.0.8` is correct for SDK 57.

- [ ] **Step 3: Install with legacy peer deps**

```bash
cd D:/MedicalIT/meditrack
npm install --legacy-peer-deps
```

Expected: clean install, no unmet peer dep errors for the packages we kept.

---

### Task 3: Fix export screen data leak — filter by active profile

**Files:**
- Modify: `app/export.tsx`

**Root cause:** `useMedicationStore()` returns all medications and intake records across all profiles. With multiple patients, exporting leaks all of them.

- [ ] **Step 1: Edit `app/export.tsx`**

Change lines 13–14 (the store import block) from:
```tsx
import { useMedicationStore } from '@store/medicationStore';
```
to:
```tsx
import { useMedicationStore } from '@store/medicationStore';
import { useProfileStore } from '@store/profileStore';
```

Then change the data extraction inside `ExportScreen()` (currently lines 28–29):
```tsx
// BEFORE
const { medications, intakeHistory } = useMedicationStore();
```
to:
```tsx
// AFTER
const { medications, intakeHistory } = useMedicationStore();
const activeProfileId = useProfileStore((s) => s.activeProfileId);

const profileMedications = medications.filter((m) => m.profileId === activeProfileId);
const profileIntakeHistory = intakeHistory.filter((r) => r.profileId === activeProfileId);
```

Then update every usage of `medications` and `intakeHistory` inside the component to use `profileMedications` and `profileIntakeHistory` respectively:

- Line with `handleExport`: change `exportCSV(medications, intakeHistory, from, to)` → `exportCSV(profileMedications, profileIntakeHistory, from, to)` and `exportPDF(medications, intakeHistory, from, to)` → `exportPDF(profileMedications, profileIntakeHistory, from, to)`
- Line with `rangeSummary`: change `intakeHistory.filter(...)` → `profileIntakeHistory.filter(...)`

- [ ] **Step 2: Verify**

Open Export screen with 2 profiles having different medications. Export CSV and confirm only the active profile's medications appear in the file.

---

### Task 4: Fix profile DOB edit — use DateTimePicker instead of TextInput

**Files:**
- Modify: `app/profile/[id].tsx`

**Root cause:** The edit form uses a plain TextInput expecting `AAAA-MM-JJ` format, which allows invalid dates and inconsistent UX vs. `profile/new.tsx` which uses a proper DateTimePicker.

- [ ] **Step 1: Edit `app/profile/[id].tsx`**

Replace the entire file with:

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Modal, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { useMedications } from '@hooks/useMedications';
import { format, parseISO } from 'date-fns';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { profiles, updateProfile, deleteProfile } = useProfiles();
  const { medications } = useMedications();

  const profile = profiles.find((p) => p.id === id);

  const parseDOB = (s?: string): Date | null => {
    if (!s) return null;
    try { return parseISO(s); } catch { return null; }
  };

  const [name, setName]               = useState(profile?.name ?? '');
  const [dob, setDob]                 = useState<Date | null>(parseDOB(profile?.dateOfBirth));
  const [relationship, setRelationship] = useState(profile?.relationship ?? '');
  const [editing, setEditing]         = useState(false);
  const [nameError, setNameError]     = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);

  if (!profile) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Profil" />
        <Text style={styles.notFound}>Ce profil est introuvable.</Text>
        <Button label="Retour" onPress={() => router.replace('/profile')} style={{ marginTop: Spacing.lg }} />
      </ScreenContainer>
    );
  }

  const medCount = medications.filter((m) => m.profileId === id).length;

  function handleSave() {
    if (!name.trim()) { setNameError('Le nom est requis.'); return; }
    updateProfile(id, {
      name: name.trim(),
      dateOfBirth: dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship: relationship || undefined,
    });
    setEditing(false);
    setNameError('');
  }

  function handleCancelEdit() {
    setName(profile.name);
    setDob(parseDOB(profile.dateOfBirth));
    setRelationship(profile.relationship ?? '');
    setNameError('');
    setEditing(false);
  }

  function onDobChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (selected) setDob(selected);
  }

  function handleDelete() {
    Alert.alert(
      'Supprimer le profil',
      `Supprimer "${profile.name}" ? Ses ${medCount} médicament${medCount !== 1 ? 's' : ''} seront également supprimés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => { deleteProfile(id); router.replace('/profile'); },
        },
      ]
    );
  }

  const displayDob = dob ? format(dob, 'dd/MM/yyyy') : null;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title={editing ? 'Modifier le profil' : profile.name}
        right={
          !editing
            ? <Text onPress={() => setEditing(true)} style={styles.editLink}>Modifier</Text>
            : undefined
        }
      />

      {!editing && (
        <View style={styles.profileCard}>
          <Avatar name={profile.name} uri={profile.avatarUri} size={72} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            {profile.relationship ? <Text style={styles.rel}>{profile.relationship}</Text> : null}
            {profile.dateOfBirth ? <Text style={styles.dob}>Né(e) le {profile.dateOfBirth}</Text> : null}
            <Text style={styles.medCount}>
              {medCount} médicament{medCount !== 1 ? 's' : ''} enregistré{medCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {editing && (
        <View>
          <Text style={styles.label}>Nom *</Text>
          <TextInput
            style={[styles.input, !!nameError && styles.inputError]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            placeholder="Nom du patient"
            placeholderTextColor={Colors.textDisabled}
            autoFocus
          />
          {!!nameError && <Text style={styles.error}>{nameError}</Text>}

          <Text style={styles.label}>Date de naissance</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
            <View style={styles.dateRow}>
              <Text style={displayDob ? styles.dateText : styles.datePlaceholder}>
                {displayDob ?? 'JJ/MM/AAAA'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textDisabled} />
            </View>
          </TouchableOpacity>

          {Platform.OS === 'android' && showDobPicker && (
            <DateTimePicker
              value={dob ?? new Date()}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDobChange}
            />
          )}

          {Platform.OS === 'ios' && (
            <Modal visible={showDobPicker} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDobPicker(false)}>
                      <Text style={styles.modalDone}>Terminer</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={dob ?? new Date()}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onChange={onDobChange}
                    style={styles.iosPicker}
                  />
                </View>
              </View>
            </Modal>
          )}

          <Text style={styles.label}>Relation</Text>
          <TextInput
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
            placeholder="ex: Moi-même, Enfant, Parent..."
            placeholderTextColor={Colors.textDisabled}
          />

          <View style={styles.editActions}>
            <Button label="Enregistrer" onPress={handleSave} style={styles.btn} />
            <Button label="Annuler" variant="ghost" onPress={handleCancelEdit} />
          </View>
        </View>
      )}

      {!editing && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zone de danger</Text>
          <Button label="Supprimer ce profil" variant="danger" onPress={handleDelete} />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard:  { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  profileInfo:  { flex: 1 },
  name:         { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  rel:          { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  dob:          { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  medCount:     { fontSize: FontSize.sm, color: Colors.primary, marginTop: 6, fontWeight: '600' },
  notFound:     { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  editLink:     { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', paddingVertical: 4 },
  label:        { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input:        { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputError:   { borderColor: Colors.danger },
  error:        { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },
  dateRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:     { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder: { fontSize: FontSize.md, color: Colors.textDisabled },
  editActions:  { gap: Spacing.sm, marginTop: Spacing.lg },
  btn:          { marginBottom: Spacing.xs },
  dangerZone:   { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  dangerTitle:  { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:   { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Spacing.xl },
  modalHeader:  { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:    { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  iosPicker:    { width: '100%' },
});
```

- [ ] **Step 2: Verify**

Open Profile → tap a profile → tap Modifier. Tap the date field: a DateTimePicker should open. Select a date and save. Confirm the DOB is saved correctly.

---

### Task 5: Remove unused `computeAdherence` import in history screen

**Files:**
- Modify: `app/(tabs)/history.tsx`

- [ ] **Step 1: Edit `app/(tabs)/history.tsx` line 13**

Remove this line entirely:
```ts
import { computeAdherence } from '@utils/scheduleEngine';
```

The file already computes adherence inline at line 67: `const adherencePct = total > 0 ? Math.round((taken / total) * 100) : 100;`

- [ ] **Step 2: Verify**

Run `npm run typecheck` (or `npx tsc --noEmit`) from the meditrack directory. No TypeScript errors should be present related to this file.

---

### Task 6: Remove stale TODO from migration v1

**Files:**
- Modify: `db/migrations/v1_initial.ts`

- [ ] **Step 1: Edit `db/migrations/v1_initial.ts`**

Remove the comment block at the top of the file:
```ts
/**
 * Migration v1 — initial schema.
 * TODO: Execute via expo-sqlite's runAsync inside a database initialization hook.
 */
```
Replace with nothing (delete lines 1-4). The exported `migration_v1` object remains unchanged.

---

## Self-Review Checklist

- [x] **Task 1** covers the critical build error (`expo-updates`)
- [x] **Task 2** covers `expo-constants` declaration + dead package cleanup
- [x] **Task 3** covers export data leak (profile filter)
- [x] **Task 4** covers DOB DateTimePicker in profile edit
- [x] **Task 5** covers unused `computeAdherence` import
- [x] **Task 6** covers stale TODO comment
- [x] No placeholders — all code blocks are complete
- [x] Types consistent — `parseISO` from `date-fns` matches existing `date-fns` dep already in package.json
- [x] `format` from `date-fns` already imported in profile/new.tsx confirming it works there
- [ ] **Known gap (deferred):** Hardcoded French strings across many screens — too broad for this bugfix plan, tracked separately
- [ ] **Known gap (deferred):** Timezone edge case in history — requires a larger refactor of scheduledAt storage strategy
- [ ] **Known gap (deferred):** `expo-text-extractor` OCR — requires native dev build, tracked separately
