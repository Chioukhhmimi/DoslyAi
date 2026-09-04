# MediTrack Feature Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all remaining specified features: profile medical fields + tag input + avatar picker, MedCard swipe gestures, notification center modal, 7-day adherence bar chart, refill reminder, delete-all-data, JSON export, medication autocomplete, home upcoming section + streak stat, and animations (swipe reveal, dose-taken celebration, form-step cross-fade, onboarding slide transition).

**Architecture:** Features are layered — DB migrations first, then store/model updates, then UI components, then screen integrations. Swipe gestures use `Gesture.Pan` from react-native-gesture-handler + `useSharedValue`/`useAnimatedStyle` from react-native-reanimated. No new packages required — expo-image-picker, gesture-handler, and reanimated are already installed.

**Tech Stack:** Expo SDK 57, React Native 0.86, TypeScript strict, expo-sqlite (migrations v4), Zustand 5, react-native-gesture-handler ~2.32, react-native-reanimated 4.5.1, expo-image-picker ~57.0.14

---

## File Map

| File | Action |
|---|---|
| `db/migrations/v4_profile_medical.ts` | Create — ALTER TABLE profile + medication columns |
| `db/database.ts` | Modify — register migration_v4, add `deleteAllData()` |
| `db/models/profileModel.ts` | Modify — handle 10 new profile columns |
| `db/models/medicationModel.ts` | Modify — handle refill_reminder_enabled, refill_reminder_days |
| `store/profileStore.ts` | Modify — extend Profile type with medical fields |
| `store/medicationStore.ts` | Modify — add refillReminderEnabled?, refillReminderDays? to Medication |
| `components/ui/TagInput.tsx` | Create — chip-based multi-value input |
| `components/ui/index.ts` | Modify — export TagInput |
| `components/profile/AvatarPicker.tsx` | Create — camera/gallery avatar selector |
| `components/profile/index.ts` | Modify — export AvatarPicker |
| `app/profile/[id].tsx` | Modify — full medical fields + avatar picker |
| `app/profile/new.tsx` | Modify — full medical fields + avatar picker |
| `components/medication/MedCard.tsx` | Modify — swipe gesture + dose-taken animation |
| `components/medication/MedForm.tsx` | Modify — refill reminder toggle + autocomplete on name field |
| `hooks/useScheduler.ts` | Modify — add streak calculation, expose getUpcomingDoses |
| `app/(tabs)/index.tsx` | Modify — streak stat card, upcoming doses section, notification center trigger |
| `components/ui/NotificationCenter.tsx` | Create — modal with today's dose list |
| `components/ui/index.ts` | Modify — export NotificationCenter |
| `app/medication/[id].tsx` | Modify — add 7-day adherence bar chart |
| `utils/exportService.ts` | Modify — add exportJSON function |
| `app/export.tsx` | Modify — add JSON export button |
| `app/settings/index.tsx` | Modify — redirect to (tabs)/settings |
| `app/(tabs)/settings.tsx` | Modify — add Delete All Data danger zone |
| `components/onboarding/OnboardingSlide.tsx` | Modify — slide transition animation |
| `i18n/locales/fr.json` | Modify — add missing keys |
| `i18n/locales/en.json` | Modify — add missing keys |
| `i18n/locales/ar.json` | Modify — add missing keys |

---

## Task 1: DB Migration v4 — Profile Medical Fields + Refill Reminder

**Files:**
- Create: `meditrack/db/migrations/v4_profile_medical.ts`
- Modify: `meditrack/db/database.ts`

- [ ] **Step 1: Create migration file**

```typescript
// db/migrations/v4_profile_medical.ts
export const migration_v4 = {
  version: 4,
  up: [
    `ALTER TABLE profiles ADD COLUMN blood_type TEXT`,
    `ALTER TABLE profiles ADD COLUMN weight REAL`,
    `ALTER TABLE profiles ADD COLUMN height REAL`,
    `ALTER TABLE profiles ADD COLUMN allergies TEXT`,
    `ALTER TABLE profiles ADD COLUMN conditions TEXT`,
    `ALTER TABLE profiles ADD COLUMN doctor_name TEXT`,
    `ALTER TABLE profiles ADD COLUMN doctor_phone TEXT`,
    `ALTER TABLE profiles ADD COLUMN emergency_contact TEXT`,
    `ALTER TABLE profiles ADD COLUMN emergency_phone TEXT`,
    `ALTER TABLE profiles ADD COLUMN medical_notes TEXT`,
    `ALTER TABLE medications ADD COLUMN refill_reminder_enabled INTEGER DEFAULT 0`,
    `ALTER TABLE medications ADD COLUMN refill_reminder_days INTEGER DEFAULT 7`,
  ],
};
```

- [ ] **Step 2: Register migration in database.ts**

```typescript
// db/database.ts — replace the imports + ALL_MIGRATIONS line only
import { migration_v1 } from './migrations/v1_initial';
import { migration_v2 } from './migrations/v2_schema_update';
import { migration_v3 } from './migrations/v3_notes_color';
import { migration_v4 } from './migrations/v4_profile_medical';

const ALL_MIGRATIONS = [migration_v1, migration_v2, migration_v3, migration_v4];
```

- [ ] **Step 3: Add deleteAllData to database.ts**

Add this function at the end of `db/database.ts` (after `getDatabase`):

```typescript
export async function deleteAllData(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync('DELETE FROM intake_records');
  await db.execAsync('DELETE FROM medications');
  await db.execAsync('DELETE FROM profiles');
  await db.execAsync("DELETE FROM settings WHERE key != 'onboardingComplete'");
}
```

- [ ] **Step 4: Run typecheck to confirm no errors**

```bash
cd meditrack && npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add db/migrations/v4_profile_medical.ts db/database.ts
git commit -m "feat: db migration v4 — profile medical fields + refill reminder columns"
```

---

## Task 2: Profile Store — Extended Medical Fields

**Files:**
- Modify: `meditrack/store/profileStore.ts`
- Modify: `meditrack/db/models/profileModel.ts`

- [ ] **Step 1: Extend Profile type in profileStore.ts**

Replace the `Profile` interface:

```typescript
export interface Profile {
  id: string;
  name: string;
  dateOfBirth?: string;
  relationship?: string;
  avatarUri?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  allergies?: string[];
  conditions?: string[];
  doctorName?: string;
  doctorPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  medicalNotes?: string;
  createdAt: string;
}
```

- [ ] **Step 2: Update dbInsertProfile in profileModel.ts**

```typescript
export async function dbInsertProfile(profile: Profile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles
       (id, name, date_of_birth, relationship, avatar_uri,
        blood_type, weight, height, allergies, conditions,
        doctor_name, doctor_phone, emergency_contact, emergency_phone,
        medical_notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id, profile.name,
      profile.dateOfBirth ?? null, profile.relationship ?? null, profile.avatarUri ?? null,
      profile.bloodType ?? null,
      profile.weight ?? null, profile.height ?? null,
      profile.allergies ? JSON.stringify(profile.allergies) : null,
      profile.conditions ? JSON.stringify(profile.conditions) : null,
      profile.doctorName ?? null, profile.doctorPhone ?? null,
      profile.emergencyContact ?? null, profile.emergencyPhone ?? null,
      profile.medicalNotes ?? null,
      profile.createdAt,
    ]
  );
}
```

- [ ] **Step 3: Update dbUpdateProfile in profileModel.ts**

```typescript
export async function dbUpdateProfile(id: string, data: Partial<Profile>): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined)             { fields.push('name = ?');              values.push(data.name); }
  if (data.dateOfBirth !== undefined)      { fields.push('date_of_birth = ?');     values.push(data.dateOfBirth ?? null); }
  if (data.relationship !== undefined)     { fields.push('relationship = ?');      values.push(data.relationship ?? null); }
  if (data.avatarUri !== undefined)        { fields.push('avatar_uri = ?');        values.push(data.avatarUri ?? null); }
  if (data.bloodType !== undefined)        { fields.push('blood_type = ?');        values.push(data.bloodType ?? null); }
  if (data.weight !== undefined)           { fields.push('weight = ?');            values.push(data.weight ?? null); }
  if (data.height !== undefined)           { fields.push('height = ?');            values.push(data.height ?? null); }
  if (data.allergies !== undefined)        { fields.push('allergies = ?');         values.push(data.allergies ? JSON.stringify(data.allergies) : null); }
  if (data.conditions !== undefined)       { fields.push('conditions = ?');        values.push(data.conditions ? JSON.stringify(data.conditions) : null); }
  if (data.doctorName !== undefined)       { fields.push('doctor_name = ?');       values.push(data.doctorName ?? null); }
  if (data.doctorPhone !== undefined)      { fields.push('doctor_phone = ?');      values.push(data.doctorPhone ?? null); }
  if (data.emergencyContact !== undefined) { fields.push('emergency_contact = ?'); values.push(data.emergencyContact ?? null); }
  if (data.emergencyPhone !== undefined)   { fields.push('emergency_phone = ?');   values.push(data.emergencyPhone ?? null); }
  if (data.medicalNotes !== undefined)     { fields.push('medical_notes = ?');     values.push(data.medicalNotes ?? null); }

  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE profiles SET ${fields.join(', ')} WHERE id = ?`, values);
}
```

- [ ] **Step 4: Update dbGetAllProfiles in profileModel.ts**

```typescript
export async function dbGetAllProfiles(): Promise<Profile[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string; name: string; date_of_birth: string | null;
    relationship: string | null; avatar_uri: string | null;
    blood_type: string | null; weight: number | null; height: number | null;
    allergies: string | null; conditions: string | null;
    doctor_name: string | null; doctor_phone: string | null;
    emergency_contact: string | null; emergency_phone: string | null;
    medical_notes: string | null; created_at: string;
  }>('SELECT * FROM profiles ORDER BY created_at ASC');

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    dateOfBirth:       r.date_of_birth ?? undefined,
    relationship:      r.relationship ?? undefined,
    avatarUri:         r.avatar_uri ?? undefined,
    bloodType:         r.blood_type ?? undefined,
    weight:            r.weight ?? undefined,
    height:            r.height ?? undefined,
    allergies:         r.allergies ? JSON.parse(r.allergies) : undefined,
    conditions:        r.conditions ? JSON.parse(r.conditions) : undefined,
    doctorName:        r.doctor_name ?? undefined,
    doctorPhone:       r.doctor_phone ?? undefined,
    emergencyContact:  r.emergency_contact ?? undefined,
    emergencyPhone:    r.emergency_phone ?? undefined,
    medicalNotes:      r.medical_notes ?? undefined,
    createdAt:         r.created_at,
  }));
}
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add store/profileStore.ts db/models/profileModel.ts
git commit -m "feat: extend Profile type with full medical fields"
```

---

## Task 3: Medication Store — Refill Reminder Fields

**Files:**
- Modify: `meditrack/store/medicationStore.ts`
- Modify: `meditrack/db/models/medicationModel.ts`

- [ ] **Step 1: Add refill fields to Medication interface in medicationStore.ts**

In the `Medication` interface, add after `pillColor?`:
```typescript
  refillReminderEnabled?: boolean;
  refillReminderDays?: number;
```

- [ ] **Step 2: Update dbInsertMedication in medicationModel.ts**

Replace the INSERT statement:
```typescript
export async function dbInsertMedication(med: Medication): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO medications
       (id, profile_id, name, dose_quantity, unit, type, schedule, start_date, end_date,
        notes, prescription_image_uri, paused, pill_color,
        refill_reminder_enabled, refill_reminder_days,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      med.id, med.profileId, med.name, med.doseQuantity, med.unit, med.type,
      JSON.stringify(med.schedule),
      med.startDate, med.endDate ?? null,
      med.notes ?? null, med.prescriptionImageUri ?? null,
      med.paused ? 1 : 0,
      med.pillColor ?? null,
      med.refillReminderEnabled ? 1 : 0,
      med.refillReminderDays ?? 7,
      med.createdAt, med.updatedAt,
    ]
  );
}
```

- [ ] **Step 3: Update dbUpdateMedication — add refill fields**

After the `pill_color` block in `dbUpdateMedication`, add:
```typescript
  if (data.refillReminderEnabled !== undefined) { fields.push('refill_reminder_enabled = ?'); values.push(data.refillReminderEnabled ? 1 : 0); }
  if (data.refillReminderDays !== undefined)    { fields.push('refill_reminder_days = ?');    values.push(data.refillReminderDays); }
```

- [ ] **Step 4: Update dbGetAllMedications row type + mapper**

In `dbGetAllMedications`, extend the row type:
```typescript
    refill_reminder_enabled: number | null;
    refill_reminder_days: number | null;
```

And in the mapper, add:
```typescript
    refillReminderEnabled: r.refill_reminder_enabled === 1,
    refillReminderDays:    r.refill_reminder_days ?? 7,
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add store/medicationStore.ts db/models/medicationModel.ts
git commit -m "feat: add refill reminder fields to Medication"
```

---

## Task 4: TagInput Component

**Files:**
- Create: `meditrack/components/ui/TagInput.tsx`
- Modify: `meditrack/components/ui/index.ts`

- [ ] **Step 1: Create TagInput component**

```typescript
// components/ui/TagInput.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, values, onChange, placeholder }: TagInputProps) {
  const [text, setText] = useState('');

  function addTag() {
    const trimmed = text.trim();
    if (!trimmed || values.includes(trimmed)) { setText(''); return; }
    onChange([...values, trimmed]);
    setText('');
  }

  function removeTag(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chipRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{v}</Text>
            <TouchableOpacity onPress={() => removeTag(i)} hitSlop={8}>
              <Ionicons name="close" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={placeholder ?? '…'}
          placeholderTextColor={Colors.textDisabled}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTag}>
          <Ionicons name="add" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label:    { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  chip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  chipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: Spacing.xs },
  input:    { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.sm, color: Colors.textPrimary, backgroundColor: Colors.surface },
  addBtn:   { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' },
});
```

- [ ] **Step 2: Export from index**

Add to `components/ui/index.ts`:
```typescript
export { TagInput } from './TagInput';
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/ui/TagInput.tsx components/ui/index.ts
git commit -m "feat: TagInput component for multi-value chip inputs"
```

---

## Task 5: AvatarPicker Component

**Files:**
- Create: `meditrack/components/profile/AvatarPicker.tsx`
- Modify: `meditrack/components/profile/index.ts`

- [ ] **Step 1: Create AvatarPicker**

```typescript
// components/profile/AvatarPicker.tsx
import React from 'react';
import { View, TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing } from '@constants/spacing';
import { FontSize } from '@constants/typography';

interface AvatarPickerProps {
  name: string;
  uri?: string;
  onPicked: (uri: string) => void;
}

export function AvatarPicker({ name, uri, onPicked }: AvatarPickerProps) {
  async function pick(source: 'camera' | 'library') {
    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission refusée'); return; }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    }
    if (!result.canceled && result.assets[0]?.uri) {
      onPicked(result.assets[0].uri);
    }
  }

  function showOptions() {
    Alert.alert('Photo de profil', undefined, [
      { text: 'Appareil photo', onPress: () => pick('camera') },
      { text: 'Galerie', onPress: () => pick('library') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  return (
    <TouchableOpacity onPress={showOptions} style={styles.container} activeOpacity={0.8}>
      <Avatar name={name} uri={uri} size={80} />
      <Text style={styles.label}>Modifier</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: Spacing.md },
  label:     { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4, fontWeight: '600' },
});
```

- [ ] **Step 2: Export from index**

In `components/profile/index.ts`, add:
```typescript
export { AvatarPicker } from './AvatarPicker';
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add components/profile/AvatarPicker.tsx components/profile/index.ts
git commit -m "feat: AvatarPicker component using expo-image-picker"
```

---

## Task 6: Profile Detail — Full Medical Fields

**Files:**
- Modify: `meditrack/app/profile/[id].tsx`

- [ ] **Step 1: Replace the entire file with the extended version**

The new `app/profile/[id].tsx` must include: name, DOB, relationship, blood type (picker), weight, height, allergies (TagInput), conditions (TagInput), doctor name, doctor phone, emergency contact, emergency phone, medical notes, avatar picker. View mode shows all fields. Edit mode shows all fields.

```typescript
// app/profile/[id].tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Modal, Platform, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { TagInput } from '@components/ui/TagInput';
import { AvatarPicker } from '@components/profile/AvatarPicker';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { useMedications } from '@hooks/useMedications';
import { format, parseISO } from 'date-fns';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

export default function ProfileDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profiles, updateProfile, deleteProfile } = useProfiles();
  const { medications } = useMedications();

  const profile = profiles.find((p) => p.id === id);

  const parseDOB = (s?: string): Date | null => {
    if (!s) return null;
    try { return parseISO(s); } catch { return null; }
  };

  const [editing, setEditing]           = useState(false);
  const [name, setName]                 = useState(profile?.name ?? '');
  const [dob, setDob]                   = useState<Date | null>(parseDOB(profile?.dateOfBirth));
  const [relationship, setRelationship] = useState(profile?.relationship ?? '');
  const [avatarUri, setAvatarUri]       = useState(profile?.avatarUri ?? '');
  const [bloodType, setBloodType]       = useState(profile?.bloodType ?? '');
  const [weight, setWeight]             = useState(profile?.weight ? String(profile.weight) : '');
  const [height, setHeight]             = useState(profile?.height ? String(profile.height) : '');
  const [allergies, setAllergies]       = useState<string[]>(profile?.allergies ?? []);
  const [conditions, setConditions]     = useState<string[]>(profile?.conditions ?? []);
  const [doctorName, setDoctorName]     = useState(profile?.doctorName ?? '');
  const [doctorPhone, setDoctorPhone]   = useState(profile?.doctorPhone ?? '');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergencyContact ?? '');
  const [emergencyPhone, setEmergencyPhone]     = useState(profile?.emergencyPhone ?? '');
  const [medicalNotes, setMedicalNotes] = useState(profile?.medicalNotes ?? '');
  const [nameError, setNameError]       = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);

  if (!profile) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('profile.title')} />
        <Text style={styles.notFound}>{t('profile.notFound')}</Text>
        <Button label={t('common.back')} onPress={() => router.replace('/profile')} style={{ marginTop: Spacing.lg }} />
      </ScreenContainer>
    );
  }

  const medCount = medications.filter((m) => m.profileId === id).length;

  function handleSave() {
    if (!name.trim()) { setNameError(t('profile.form.nameRequired')); return; }
    updateProfile(id, {
      name: name.trim(),
      dateOfBirth:      dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship:     relationship || undefined,
      avatarUri:        avatarUri || undefined,
      bloodType:        bloodType || undefined,
      weight:           weight ? parseFloat(weight) : undefined,
      height:           height ? parseFloat(height) : undefined,
      allergies:        allergies.length > 0 ? allergies : undefined,
      conditions:       conditions.length > 0 ? conditions : undefined,
      doctorName:       doctorName || undefined,
      doctorPhone:      doctorPhone || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone:   emergencyPhone || undefined,
      medicalNotes:     medicalNotes || undefined,
    });
    setEditing(false);
    setNameError('');
  }

  function handleCancelEdit() {
    setName(profile!.name);
    setDob(parseDOB(profile!.dateOfBirth));
    setRelationship(profile!.relationship ?? '');
    setAvatarUri(profile!.avatarUri ?? '');
    setBloodType(profile!.bloodType ?? '');
    setWeight(profile!.weight ? String(profile!.weight) : '');
    setHeight(profile!.height ? String(profile!.height) : '');
    setAllergies(profile!.allergies ?? []);
    setConditions(profile!.conditions ?? []);
    setDoctorName(profile!.doctorName ?? '');
    setDoctorPhone(profile!.doctorPhone ?? '');
    setEmergencyContact(profile!.emergencyContact ?? '');
    setEmergencyPhone(profile!.emergencyPhone ?? '');
    setMedicalNotes(profile!.medicalNotes ?? '');
    setNameError('');
    setEditing(false);
  }

  function onDobChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (selected) setDob(selected);
  }

  function handleDelete() {
    Alert.alert(
      t('profile.deleteTitle'),
      t('profile.deleteConfirm', { name: profile!.name, count: medCount }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => { deleteProfile(id); router.replace('/profile'); } },
      ]
    );
  }

  const displayDob = dob ? format(dob, 'dd/MM/yyyy') : null;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title={editing ? t('profile.editTitle') : profile.name}
        right={!editing ? <Text onPress={() => setEditing(true)} style={styles.editLink}>{t('common.edit')}</Text> : undefined}
      />

      {!editing && (
        <>
          <View style={styles.profileCard}>
            <Avatar name={profile.name} uri={profile.avatarUri} size={72} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.name}</Text>
              {profile.relationship ? <Text style={styles.sub}>{profile.relationship}</Text> : null}
              {profile.dateOfBirth  ? <Text style={styles.sub}>{t('profile.bornOn')} {profile.dateOfBirth}</Text> : null}
              <Text style={styles.medCount}>{t('profile.detail.medCount', { count: medCount })}</Text>
            </View>
          </View>
          <View style={styles.card}>
            {profile.bloodType        ? <InfoRow label="Groupe sanguin"     value={profile.bloodType} /> : null}
            {profile.weight           ? <InfoRow label="Poids"              value={`${profile.weight} kg`} /> : null}
            {profile.height           ? <InfoRow label="Taille"             value={`${profile.height} cm`} /> : null}
            {profile.doctorName       ? <InfoRow label="Médecin"            value={profile.doctorName} /> : null}
            {profile.doctorPhone      ? <InfoRow label="Tél. médecin"       value={profile.doctorPhone} /> : null}
            {profile.emergencyContact ? <InfoRow label="Contact urgence"    value={profile.emergencyContact} /> : null}
            {profile.emergencyPhone   ? <InfoRow label="Tél. urgence"       value={profile.emergencyPhone} /> : null}
            {profile.allergies && profile.allergies.length > 0 ? (
              <View style={styles.tagRow}>
                <Text style={styles.rowLabel}>Allergies</Text>
                <View style={styles.tagList}>
                  {profile.allergies.map((a, i) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{a}</Text></View>)}
                </View>
              </View>
            ) : null}
            {profile.conditions && profile.conditions.length > 0 ? (
              <View style={styles.tagRow}>
                <Text style={styles.rowLabel}>Conditions chroniques</Text>
                <View style={styles.tagList}>
                  {profile.conditions.map((c, i) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>)}
                </View>
              </View>
            ) : null}
            {profile.medicalNotes ? <InfoRow label="Notes" value={profile.medicalNotes} /> : null}
          </View>
        </>
      )}

      {editing && (
        <View>
          <AvatarPicker name={name} uri={avatarUri || undefined} onPicked={setAvatarUri} />

          <Text style={styles.label}>{t('profile.form.nameLabel')}</Text>
          <TextInput style={[styles.input, !!nameError && styles.inputError]} value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            placeholder={t('profile.form.namePlaceholder')} placeholderTextColor={Colors.textDisabled} autoFocus />
          {!!nameError && <Text style={styles.error}>{nameError}</Text>}

          <Text style={styles.label}>{t('profile.form.dobLabel')}</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
            <View style={styles.dateRow}>
              <Text style={displayDob ? styles.dateText : styles.datePlaceholder}>{displayDob ?? t('profile.form.dobPlaceholder')}</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textDisabled} />
            </View>
          </TouchableOpacity>
          {Platform.OS === 'android' && showDobPicker && (
            <DateTimePicker value={dob ?? new Date()} mode="date" display="default" maximumDate={new Date()} onChange={onDobChange} />
          )}
          {Platform.OS === 'ios' && (
            <Modal visible={showDobPicker} transparent animationType="slide">
              <View style={styles.modalOverlay}><View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDobPicker(false)}><Text style={styles.modalDone}>{t('common.done')}</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={dob ?? new Date()} mode="date" display="spinner" maximumDate={new Date()} onChange={onDobChange} style={{ width: '100%' }} />
              </View></View>
            </Modal>
          )}

          <Text style={styles.label}>{t('profile.form.relationLabel')}</Text>
          <TextInput style={styles.input} value={relationship} onChangeText={setRelationship}
            placeholder={t('profile.form.relationPlaceholder')} placeholderTextColor={Colors.textDisabled} />

          <Text style={styles.sectionHeader}>Informations médicales</Text>

          <Text style={styles.label}>Groupe sanguin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.btRow}>
            {BLOOD_TYPES.map((bt) => (
              <TouchableOpacity key={bt} style={[styles.btChip, bloodType === bt && styles.btChipActive]} onPress={() => setBloodType(bt === bloodType ? '' : bt)}>
                <Text style={[styles.btChipText, bloodType === bt && styles.btChipTextActive]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.rowTwo}>
            <View style={styles.half}>
              <Text style={styles.label}>Poids (kg)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" placeholderTextColor={Colors.textDisabled} />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Taille (cm)</Text>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" placeholderTextColor={Colors.textDisabled} />
            </View>
          </View>

          <TagInput label="Allergies" values={allergies} onChange={setAllergies} placeholder="Pénicilline, lactose…" />
          <TagInput label="Conditions chroniques" values={conditions} onChange={setConditions} placeholder="Diabète, hypertension…" />

          <Text style={styles.sectionHeader}>Médecin & urgences</Text>
          <Text style={styles.label}>Nom du médecin</Text>
          <TextInput style={styles.input} value={doctorName} onChangeText={setDoctorName} placeholder="Dr. …" placeholderTextColor={Colors.textDisabled} />
          <Text style={styles.label}>Téléphone médecin</Text>
          <TextInput style={styles.input} value={doctorPhone} onChangeText={setDoctorPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />
          <Text style={styles.label}>Contact d'urgence</Text>
          <TextInput style={styles.input} value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Nom…" placeholderTextColor={Colors.textDisabled} />
          <Text style={styles.label}>Téléphone urgence</Text>
          <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />

          <Text style={styles.label}>Notes médicales</Text>
          <TextInput style={[styles.input, styles.textArea]} value={medicalNotes} onChangeText={setMedicalNotes}
            placeholder="Informations supplémentaires…" placeholderTextColor={Colors.textDisabled} multiline numberOfLines={3} />

          <View style={styles.editActions}>
            <Button label={t('common.save')} onPress={handleSave} style={styles.btn} />
            <Button label={t('common.cancel')} variant="ghost" onPress={handleCancelEdit} />
          </View>
        </View>
      )}

      {!editing && (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>{t('profile.dangerZone')}</Text>
          <Button label={t('profile.deleteProfile')} variant="danger" onPress={handleDelete} />
        </View>
      )}
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  profileCard:       { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  profileInfo:       { flex: 1 },
  name:              { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  sub:               { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  medCount:          { fontSize: FontSize.sm, color: Colors.primary, marginTop: 6, fontWeight: '600' },
  card:              { backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  tagRow:            { paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel:          { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  tagList:           { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  tag:               { backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:           { fontSize: FontSize.xs, color: Colors.primary },
  notFound:          { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  editLink:          { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', paddingVertical: 4 },
  sectionHeader:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  label:             { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input:             { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputError:        { borderColor: Colors.danger },
  textArea:          { minHeight: 80, textAlignVertical: 'top' },
  error:             { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },
  dateRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:          { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder:   { fontSize: FontSize.md, color: Colors.textDisabled },
  btRow:             { marginBottom: Spacing.xs },
  btChip:            { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, backgroundColor: Colors.surface },
  btChipActive:      { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  btChipText:        { fontSize: FontSize.sm, color: Colors.textSecondary },
  btChipTextActive:  { color: Colors.primary, fontWeight: '700' },
  rowTwo:            { flexDirection: 'row', gap: Spacing.sm },
  half:              { flex: 1 },
  editActions:       { gap: Spacing.sm, marginTop: Spacing.lg },
  btn:               { marginBottom: Spacing.xs },
  dangerZone:        { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  dangerTitle:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  modalOverlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:        { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Spacing.xl },
  modalHeader:       { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:         { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/profile/[id].tsx
git commit -m "feat: full medical fields + avatar picker in profile detail screen"
```

---

## Task 7: Profile New — Full Medical Fields

**Files:**
- Modify: `meditrack/app/profile/new.tsx`

- [ ] **Step 1: Replace app/profile/new.tsx with extended version**

Same fields as profile detail edit form. Required: name only. The pattern is identical to the edit form but without pre-populated values and without the danger zone. Copy the edit form structure from Task 6, remove the view-mode section and danger zone, set all initial states to empty.

```typescript
// app/profile/new.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Modal, Platform, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { TagInput } from '@components/ui/TagInput';
import { AvatarPicker } from '@components/profile/AvatarPicker';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { format } from 'date-fns';

const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'];

export default function NewProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addProfile } = useProfiles();

  const [name, setName]                 = useState('');
  const [dob, setDob]                   = useState<Date | null>(null);
  const [relationship, setRelationship] = useState('');
  const [avatarUri, setAvatarUri]       = useState('');
  const [bloodType, setBloodType]       = useState('');
  const [weight, setWeight]             = useState('');
  const [height, setHeight]             = useState('');
  const [allergies, setAllergies]       = useState<string[]>([]);
  const [conditions, setConditions]     = useState<string[]>([]);
  const [doctorName, setDoctorName]     = useState('');
  const [doctorPhone, setDoctorPhone]   = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone]     = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [error, setError]               = useState('');
  const [showPicker, setShowPicker]     = useState(false);

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDob(selected);
  }

  function handleSave() {
    if (!name.trim()) { setError(t('profile.form.nameRequired')); return; }
    addProfile({
      name: name.trim(),
      dateOfBirth:      dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship:     relationship || undefined,
      avatarUri:        avatarUri || undefined,
      bloodType:        bloodType || undefined,
      weight:           weight ? parseFloat(weight) : undefined,
      height:           height ? parseFloat(height) : undefined,
      allergies:        allergies.length > 0 ? allergies : undefined,
      conditions:       conditions.length > 0 ? conditions : undefined,
      doctorName:       doctorName || undefined,
      doctorPhone:      doctorPhone || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone:   emergencyPhone || undefined,
      medicalNotes:     medicalNotes || undefined,
    });
    router.replace('/(tabs)');
  }

  const displayDate = dob ? format(dob, 'dd/MM/yyyy') : null;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('profile.new')} />

      <AvatarPicker name={name || 'P'} uri={avatarUri || undefined} onPicked={setAvatarUri} />

      <Text style={styles.label}>{t('profile.form.nameLabel')}</Text>
      <TextInput style={[styles.input, !!error && styles.inputError]} value={name}
        onChangeText={(v) => { setName(v); setError(''); }}
        placeholder={t('profile.form.namePlaceholder')} placeholderTextColor={Colors.textDisabled} />
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>{t('profile.form.dobLabel')}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <View style={styles.dateRow}>
          <Text style={displayDate ? styles.dateText : styles.datePlaceholder}>{displayDate ?? t('profile.form.dobPlaceholder')}</Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.textDisabled} />
        </View>
      </TouchableOpacity>
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker value={dob ?? new Date()} mode="date" display="default" maximumDate={new Date()} onChange={onDateChange} />
      )}
      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}><View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}><Text style={styles.modalDone}>{t('common.done')}</Text></TouchableOpacity>
            </View>
            <DateTimePicker value={dob ?? new Date()} mode="date" display="spinner" maximumDate={new Date()} onChange={onDateChange} style={{ width: '100%' }} />
          </View></View>
        </Modal>
      )}

      <Text style={styles.label}>{t('profile.form.relationLabel')}</Text>
      <TextInput style={styles.input} value={relationship} onChangeText={setRelationship}
        placeholder={t('profile.form.relationPlaceholder')} placeholderTextColor={Colors.textDisabled} />

      <Text style={styles.sectionHeader}>Informations médicales</Text>

      <Text style={styles.label}>Groupe sanguin</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.btRow}>
        {BLOOD_TYPES.map((bt) => (
          <TouchableOpacity key={bt} style={[styles.btChip, bloodType === bt && styles.btChipActive]} onPress={() => setBloodType(bt === bloodType ? '' : bt)}>
            <Text style={[styles.btChipText, bloodType === bt && styles.btChipTextActive]}>{bt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.rowTwo}>
        <View style={styles.half}>
          <Text style={styles.label}>Poids (kg)</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" placeholderTextColor={Colors.textDisabled} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Taille (cm)</Text>
          <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" placeholderTextColor={Colors.textDisabled} />
        </View>
      </View>

      <TagInput label="Allergies" values={allergies} onChange={setAllergies} placeholder="Pénicilline, lactose…" />
      <TagInput label="Conditions chroniques" values={conditions} onChange={setConditions} placeholder="Diabète, hypertension…" />

      <Text style={styles.sectionHeader}>Médecin & urgences</Text>
      <Text style={styles.label}>Nom du médecin</Text>
      <TextInput style={styles.input} value={doctorName} onChangeText={setDoctorName} placeholder="Dr. …" placeholderTextColor={Colors.textDisabled} />
      <Text style={styles.label}>Téléphone médecin</Text>
      <TextInput style={styles.input} value={doctorPhone} onChangeText={setDoctorPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />
      <Text style={styles.label}>Contact d'urgence</Text>
      <TextInput style={styles.input} value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Nom…" placeholderTextColor={Colors.textDisabled} />
      <Text style={styles.label}>Téléphone urgence</Text>
      <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />
      <Text style={styles.label}>Notes médicales</Text>
      <TextInput style={[styles.input, styles.textArea]} value={medicalNotes} onChangeText={setMedicalNotes}
        placeholder="Informations supplémentaires…" placeholderTextColor={Colors.textDisabled} multiline numberOfLines={3} />

      <View style={styles.actions}>
        <Button label={t('common.save')} onPress={handleSave} style={styles.btn} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionHeader:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  label:            { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input:            { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputError:       { borderColor: Colors.danger },
  textArea:         { minHeight: 80, textAlignVertical: 'top' },
  error:            { fontSize: FontSize.sm, color: Colors.danger, marginTop: 4 },
  dateRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:         { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder:  { fontSize: FontSize.md, color: Colors.textDisabled },
  btRow:            { marginBottom: Spacing.xs },
  btChip:           { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, backgroundColor: Colors.surface },
  btChipActive:     { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  btChipText:       { fontSize: FontSize.sm, color: Colors.textSecondary },
  btChipTextActive: { color: Colors.primary, fontWeight: '700' },
  rowTwo:           { flexDirection: 'row', gap: Spacing.sm },
  half:             { flex: 1 },
  actions:          { gap: Spacing.sm, marginTop: Spacing.xl },
  btn:              { marginBottom: Spacing.xs },
  modalOverlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:       { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Spacing.xl },
  modalHeader:      { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:        { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/profile/new.tsx
git commit -m "feat: full medical fields + avatar picker in new profile screen"
```

---

## Task 8: MedCard Swipe Gestures + Dose-Taken Animation

**Files:**
- Modify: `meditrack/components/medication/MedCard.tsx`

- [ ] **Step 1: Replace MedCard.tsx with swipe-enabled version**

Use `Gesture.Pan` + `GestureDetector` + `useSharedValue`/`useAnimatedStyle`. Swipe right ≥80px → green reveal → `onMarkTaken` + spring back. Swipe left ≤−80px → amber reveal → `onSkip` + spring back. On `onMarkTaken`, scale pop animation plays on the check icon.

```typescript
// components/medication/MedCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
  withTiming, runOnJS, interpolateColor,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Medication, IntakeRecord } from '@store/medicationStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';
import { BottomSheet } from '@components/ui/BottomSheet';
import { formatTime } from '@utils/dateHelpers';
import { snoozeDoseNotification } from '@utils/snoozeNotification';
import * as Haptics from 'expo-haptics';

interface MedCardProps {
  medication: Medication;
  scheduledTime: string;
  scheduledISO: string;
  intakeRecord?: IntakeRecord;
  onMarkTaken: () => void;
  onSkip: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill, syrup: Colors.syrup, injection: Colors.injection,
  supplement: Colors.supplement, other: Colors.other,
};

const SWIPE_THRESHOLD = 80;

export function MedCard({ medication, scheduledTime, scheduledISO, intakeRecord, onMarkTaken, onSkip }: MedCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showSnooze, setShowSnooze] = useState(false);

  const translateX  = useSharedValue(0);
  const checkScale  = useSharedValue(1);

  const SNOOZE_OPTIONS = [
    { label: t('medication.confirm.snooze10'), minutes: 10 },
    { label: t('medication.confirm.snooze30'), minutes: 30 },
    { label: t('medication.confirm.snooze60'), minutes: 60 },
  ];

  const isTaken   = !!intakeRecord?.takenAt;
  const isSkipped = !!intakeRecord?.skipped;
  const isPending = !isTaken && !isSkipped;

  const scheduledDate = new Date(scheduledISO);
  const isOverdue = isPending && scheduledDate < new Date();

  const statusVariant = isTaken ? 'success' : isSkipped ? 'warning' : isOverdue ? 'danger' : 'info';
  const statusLabel   = isTaken ? t('home.status.taken') : isSkipped ? t('home.status.skipped') : isOverdue ? t('home.status.overdue') : t('home.status.pending');

  function triggerTaken() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 4 }),
      withSpring(1,   { damping: 10 })
    );
    onMarkTaken();
  }

  function triggerSkip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSkip();
  }

  const pan = Gesture.Pan()
    .enabled(isPending && !medication.paused)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX >= SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, { damping: 15 });
        runOnJS(triggerTaken)();
      } else if (e.translationX <= -SWIPE_THRESHOLD) {
        translateX.value = withSpring(0, { damping: 15 });
        runOnJS(triggerSkip)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const revealBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [Colors.skippedLight, Colors.surface, Colors.successLight]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  async function handleSnooze(minutes: number) {
    setShowSnooze(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await snoozeDoseNotification(medication, scheduledDate, minutes);
  }

  return (
    <>
      <Animated.View style={[styles.revealBg, revealBgStyle]}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.success} style={styles.revealIconLeft} />
        <Ionicons name="close-circle" size={24} color={Colors.danger} style={styles.revealIconRight} />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, medication.paused && styles.cardPaused, cardStyle]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/medication/${medication.id}`)}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] ?? Colors.other }]} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{medication.name}</Text>
                  {medication.paused && <Badge label={t('medications.paused')} variant="warning" size="sm" />}
                </View>
                <Text style={styles.sub}>{medication.doseQuantity} {medication.unit} · {medication.schedule.times.map(formatTime).join(' · ')}</Text>
                <Text style={[styles.time, isOverdue && styles.timeOverdue]}>⏰ {formatTime(scheduledTime)}</Text>
              </View>
              <Badge label={statusLabel} variant={statusVariant} size="sm" />
            </View>
          </TouchableOpacity>

          {isPending && !medication.paused && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={triggerTaken}
                style={styles.btnTaken}
              >
                <Animated.View style={checkStyle}>
                  <Ionicons name="checkmark" size={14} color={Colors.successText} />
                </Animated.View>
                <Text style={styles.btnTakenText}>{t('medication.confirm.taken')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSnooze(true); }} style={styles.btnSnooze}>
                <Text style={styles.btnSnoozeText}>{t('home.snoozeLater')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSkip(); }} style={styles.btnSkip}>
                <Text style={styles.btnSkipText}>{t('medication.confirm.skip')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      <BottomSheet visible={showSnooze} onClose={() => setShowSnooze(false)}>
        <Text style={styles.snoozeTitle}>{t('medication.confirm.snoozeTitle')}</Text>
        {SNOOZE_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.minutes} style={styles.snoozeOption} onPress={() => handleSnooze(opt.minutes)}>
            <Text style={styles.snoozeOptionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.snoozeCancel} onPress={() => setShowSnooze(false)}>
          <Text style={styles.snoozeCancelText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  revealBg:         { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: Radius.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md },
  revealIconLeft:   {},
  revealIconRight:  {},
  card:             { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  cardPaused:       { opacity: 0.6 },
  row:              { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot:              { width: 12, height: 12, borderRadius: 6 },
  info:             { flex: 1 },
  nameRow:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  name:             { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  sub:              { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  time:             { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  timeOverdue:      { color: Colors.danger, fontWeight: '600' },
  actions:          { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  btnTaken:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.successLight, borderRadius: Radius.sm, padding: Spacing.sm },
  btnTakenText:     { fontSize: FontSize.xs, fontWeight: '700', color: Colors.successText },
  btnSnooze:        { flex: 1, backgroundColor: Colors.warningLight, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
  btnSnoozeText:    { fontSize: FontSize.xs, fontWeight: '700', color: Colors.skippedText },
  btnSkip:          { flex: 1, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  btnSkipText:      { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textSecondary },
  snoozeTitle:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  snoozeOption:     { padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.sm, alignItems: 'center', marginBottom: Spacing.xs },
  snoozeOptionText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  snoozeCancel:     { padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  snoozeCancelText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add components/medication/MedCard.tsx
git commit -m "feat: MedCard swipe-right=taken, swipe-left=skip with Reanimated reveal + dose-taken bounce animation"
```

---

## Task 9: Medication Name Autocomplete in MedForm

**Files:**
- Create: `meditrack/constants/drugNames.ts`
- Modify: `meditrack/components/medication/MedForm.tsx`

- [ ] **Step 1: Create drug names list**

```typescript
// constants/drugNames.ts
export const COMMON_DRUG_NAMES = [
  'Amoxicilline', 'Augmentin', 'Azithromycine', 'Ciprofloxacine', 'Doxycycline',
  'Metformine', 'Insuline', 'Metoprolol', 'Amlodipine', 'Lisinopril',
  'Atorvastatine', 'Simvastatine', 'Oméprazole', 'Pantoprazole', 'Ranitidine',
  'Paracétamol', 'Ibuprofène', 'Aspirine', 'Doliprane', 'Efferalgan',
  'Prednisolone', 'Dexaméthasone', 'Budesonide', 'Salbutamol', 'Ventoline',
  'Levothyrox', 'Synthroid', 'Metronidazole', 'Flagyl', 'Cotrimoxazole',
  'Cétirizine', 'Loratadine', 'Fexofénadine', 'Desloratadine', 'Antihistamine',
  'Clonazépam', 'Alprazolam', 'Sertraline', 'Fluoxétine', 'Escitalopram',
  'Tramadol', 'Codéine', 'Morphine', 'Kétoprofène', 'Diclofénac',
  'Acide folique', 'Fer', 'Magnésium', 'Vitamine D', 'Calcium',
];
```

- [ ] **Step 2: Add autocomplete to MedForm Step 1 name field**

In `MedForm.tsx`, find the Step 1 name TextInput and add autocomplete dropdown below it. Add these imports at the top:
```typescript
import { COMMON_DRUG_NAMES } from '@constants/drugNames';
```

Locate the name input rendering in Step 1 and wrap it with autocomplete logic. Add `nameSuggestions` state:
```typescript
const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
```

Replace the name TextInput block with:
```typescript
<View>
  <TextInput
    style={styles.input}
    value={form.name}
    onChangeText={(v) => {
      setForm({ ...form, name: v });
      if (v.length >= 2) {
        const matches = COMMON_DRUG_NAMES.filter((d) =>
          d.toLowerCase().startsWith(v.toLowerCase())
        ).slice(0, 5);
        setNameSuggestions(matches);
      } else {
        setNameSuggestions([]);
      }
    }}
    placeholder={t('medication.form.namePlaceholder')}
    placeholderTextColor={Colors.textDisabled}
  />
  {nameSuggestions.length > 0 && (
    <View style={styles.suggestionList}>
      {nameSuggestions.map((s) => (
        <TouchableOpacity
          key={s}
          style={styles.suggestion}
          onPress={() => { setForm({ ...form, name: s }); setNameSuggestions([]); }}
        >
          <Text style={styles.suggestionText}>{s}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
</View>
```

Add these styles to the MedForm StyleSheet:
```typescript
  suggestionList: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, marginTop: -1, zIndex: 10 },
  suggestion:     { padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionText: { fontSize: FontSize.md, color: Colors.textPrimary },
```

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add constants/drugNames.ts components/medication/MedForm.tsx
git commit -m "feat: medication name autocomplete with common French drug names"
```

---

## Task 10: MedForm — Refill Reminder Step

**Files:**
- Modify: `meditrack/components/medication/MedForm.tsx`

- [ ] **Step 1: Add refill reminder fields to form state**

In `MedForm.tsx`, find the form state object (the object passed to `useState` with `name`, `doseQuantity`, etc.) and add:
```typescript
refillReminderEnabled: initialValues?.refillReminderEnabled ?? false,
refillReminderDays:    initialValues?.refillReminderDays ?? 7,
```

- [ ] **Step 2: Add refill UI to the Duration step (Step 3)**

In Step 3 (dates step), after the end date section, add:
```typescript
{/* Refill reminder */}
<View style={styles.refillRow}>
  <View style={styles.refillLabel}>
    <Text style={styles.fieldLabel}>{t('medication.form.refillReminder')}</Text>
    <Text style={styles.fieldSub}>{t('medication.form.refillReminderSub')}</Text>
  </View>
  <TouchableOpacity
    style={[styles.toggle, form.refillReminderEnabled && styles.toggleOn]}
    onPress={() => setForm({ ...form, refillReminderEnabled: !form.refillReminderEnabled })}
  >
    <View style={[styles.toggleThumb, form.refillReminderEnabled && styles.toggleThumbOn]} />
  </TouchableOpacity>
</View>
{form.refillReminderEnabled && (
  <View style={styles.refillDaysRow}>
    <Text style={styles.fieldLabel}>{t('medication.form.refillDaysBefore')}</Text>
    <View style={styles.stepper}>
      <TouchableOpacity style={styles.stepBtn} onPress={() => setForm({ ...form, refillReminderDays: Math.max(1, form.refillReminderDays - 1) })}>
        <Text style={styles.stepBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepValue}>{form.refillReminderDays}</Text>
      <TouchableOpacity style={styles.stepBtn} onPress={() => setForm({ ...form, refillReminderDays: Math.min(30, form.refillReminderDays + 1) })}>
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
```

Add these styles:
```typescript
  refillRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  refillLabel:    { flex: 1 },
  refillDaysRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  toggle:         { width: 48, height: 28, borderRadius: 14, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  toggleOn:       { backgroundColor: Colors.primary },
  toggleThumb:    { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.surface },
  toggleThumbOn:  { alignSelf: 'flex-end' },
  stepper:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stepBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceSubtle, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:    { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  stepValue:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },
  fieldSub:       { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
```

- [ ] **Step 3: Pass refill fields through onSubmit**

In the `onSubmit` call at the end of MedForm, ensure `refillReminderEnabled` and `refillReminderDays` from `form` are included in the data passed to `onSubmit`. These fields are already part of `NewMedication` now, so just verify the spread includes them.

- [ ] **Step 4: Add i18n keys to fr.json, en.json, ar.json**

In `i18n/locales/fr.json`, under `"medication"`:
```json
"refillReminder": "Rappel de renouvellement",
"refillReminderSub": "Vous avertit quand il est temps de renouveler",
"refillDaysBefore": "Jours avant la fin"
```

In `en.json`:
```json
"refillReminder": "Refill reminder",
"refillReminderSub": "Alerts you when it's time to refill",
"refillDaysBefore": "Days before end"
```

In `ar.json`:
```json
"refillReminder": "تذكير التجديد",
"refillReminderSub": "يُنبهك عند حلول موعد التجديد",
"refillDaysBefore": "أيام قبل الانتهاء"
```

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/medication/MedForm.tsx i18n/locales/fr.json i18n/locales/en.json i18n/locales/ar.json
git commit -m "feat: refill reminder toggle + days stepper in MedForm duration step"
```

---

## Task 11: Streak Calculation + Home Stats Update

**Files:**
- Modify: `meditrack/hooks/useScheduler.ts`
- Modify: `meditrack/app/(tabs)/index.tsx`

- [ ] **Step 1: Add streak calculation to useScheduler.ts**

At the end of `useScheduler.ts`, before the `return`, add:

```typescript
  const streak = (() => {
    const today = new Date();
    let days = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);

      let allTaken = true;
      let hasDoses = false;

      for (const med of todayMedications) {
        const doses = getScheduledDosesForDay(med, d);
        for (const dose of doses) {
          hasDoses = true;
          const record = getIntakeForDose(med.id, dose.toISOString());
          if (!record?.takenAt) { allTaken = false; break; }
        }
        if (!allTaken) break;
      }

      if (!hasDoses) break;
      if (!allTaken) break;
      days++;
    }
    return days;
  })();
```

Update the return:
```typescript
  return { getUpcomingDoses, todaySummary, streak };
```

- [ ] **Step 2: Update home screen — streak stat + upcoming section**

In `app/(tabs)/index.tsx`:

1. Import `useScheduler` streak and `getUpcomingDoses`.
2. Replace the current stats row (adherence%, taken/total, missed) with (adherence%, streak, active meds count):

```typescript
const { todaySummary, streak, getUpcomingDoses } = useScheduler();
const activeMedCount = todayMedications.length;
const upcomingDoses  = getUpcomingDoses(3);
```

Replace the stats row JSX:
```typescript
<View style={styles.statsRow}>
  <StatCard label={t('home.stats.adherence')} value={`${adherenceRate}%`} />
  <StatCard label={t('home.stats.streak')}    value={`${streak}🔥`} />
  <StatCard label={t('home.stats.activeMeds')} value={String(activeMedCount)} />
</View>
```

3. Add upcoming section before the bucketed list (when `sections.length > 0`):

```typescript
{upcomingDoses.length > 0 && (
  <View style={styles.upcomingSection}>
    <Text style={styles.bucketHeader}>{t('home.upcoming')}</Text>
    {upcomingDoses.map(({ medication, scheduledAt }) => {
      const hh = String(scheduledAt.getHours()).padStart(2, '0');
      const mm = String(scheduledAt.getMinutes()).padStart(2, '0');
      const isToday = scheduledAt.toDateString() === today.toDateString();
      const dayLabel = isToday ? t('home.today') : scheduledAt.toLocaleDateString();
      return (
        <View key={`${medication.id}_${scheduledAt.getTime()}`} style={styles.upcomingRow}>
          <View style={[styles.upcomingDot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] }]} />
          <Text style={styles.upcomingName}>{medication.name}</Text>
          <Text style={styles.upcomingTime}>{dayLabel} {hh}:{mm}</Text>
        </View>
      );
    })}
  </View>
)}
```

Add `TYPE_COLOR` import:
```typescript
const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill, syrup: Colors.syrup, injection: Colors.injection,
  supplement: Colors.supplement, other: Colors.other,
};
```

Add styles:
```typescript
  upcomingSection: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  upcomingRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  upcomingDot:     { width: 10, height: 10, borderRadius: 5 },
  upcomingName:    { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600' },
  upcomingTime:    { fontSize: FontSize.xs, color: Colors.textSecondary },
```

Add i18n keys to fr.json: `"upcoming": "Prochaines doses"`, `"today": "Aujourd'hui"`, `"stats": { "streak": "Série", "activeMeds": "Actifs" }`

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add hooks/useScheduler.ts app/(tabs)/index.tsx i18n/locales/fr.json i18n/locales/en.json i18n/locales/ar.json
git commit -m "feat: streak calculation + home upcoming doses section + updated stats row"
```

---

## Task 12: Notification Center Modal

**Files:**
- Create: `meditrack/components/ui/NotificationCenter.tsx`
- Modify: `meditrack/components/ui/index.ts`
- Modify: `meditrack/app/(tabs)/index.tsx`

- [ ] **Step 1: Create NotificationCenter component**

```typescript
// components/ui/NotificationCenter.tsx
import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';

export interface NotificationItem {
  id: string;
  medicationName: string;
  dose: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  onMarkTaken?: () => void;
}

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  items: NotificationItem[];
}

const STATUS_VARIANT = {
  pending: 'info',
  taken:   'success',
  skipped: 'warning',
  missed:  'danger',
} as const;

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente',
  taken:   'Pris',
  skipped: 'Passé',
  missed:  'Manqué',
};

export function NotificationCenter({ visible, onClose, items }: NotificationCenterProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications du jour</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>Aucune notification aujourd'hui</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.medicationName}</Text>
                  <Text style={styles.itemDose}>{item.dose} · {item.scheduledTime}</Text>
                </View>
                <View style={styles.itemRight}>
                  <Badge label={STATUS_LABEL[item.status]} variant={STATUS_VARIANT[item.status]} size="sm" />
                  {item.status === 'pending' && item.onMarkTaken && (
                    <TouchableOpacity style={styles.takenBtn} onPress={item.onMarkTaken}>
                      <Text style={styles.takenBtnText}>Pris</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title:        { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  emptyText:    { fontSize: FontSize.md, color: Colors.textSecondary },
  list:         { padding: Spacing.md, gap: Spacing.sm },
  item:         { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  itemInfo:     { flex: 1 },
  itemName:     { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  itemDose:     { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  itemRight:    { gap: 6, alignItems: 'flex-end' },
  takenBtn:     { backgroundColor: Colors.successLight, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  takenBtnText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.successText },
});
```

- [ ] **Step 2: Export NotificationCenter**

In `components/ui/index.ts`, add:
```typescript
export { NotificationCenter } from './NotificationCenter';
export type { NotificationItem } from './NotificationCenter';
```

- [ ] **Step 3: Wire bell icon on home screen**

In `app/(tabs)/index.tsx`:

1. Add state: `const [showNotifCenter, setShowNotifCenter] = useState(false);`

2. Import `NotificationCenter` and `NotificationItem`.

3. Build the items list:
```typescript
const notifItems: NotificationItem[] = [];
for (const med of todayMedications) {
  const doses = getScheduledDosesForDay(med, today);
  for (const dose of doses) {
    const hh = String(dose.getHours()).padStart(2, '0');
    const mm = String(dose.getMinutes()).padStart(2, '0');
    const record = getIntakeForDose(med.id, dose.toISOString());
    const isPending = !record?.takenAt && !record?.skipped;
    const isMissedDose = !record?.takenAt && dose < new Date();
    const status: NotificationItem['status'] = record?.takenAt ? 'taken'
      : record?.skipped ? 'skipped'
      : isMissedDose ? 'missed'
      : 'pending';
    notifItems.push({
      id: `${med.id}_${dose.getTime()}`,
      medicationName: med.name,
      dose: `${med.doseQuantity} ${med.unit}`,
      scheduledTime: `${hh}:${mm}`,
      status,
      onMarkTaken: isPending ? () => recordIntake({
        medicationId: med.id, profileId: med.profileId,
        scheduledAt: dose.toISOString(), takenAt: new Date().toISOString(),
      }) : undefined,
    });
  }
}
```

4. Replace the bell badge in the header with a tappable bell:
```typescript
<TouchableOpacity onPress={() => setShowNotifCenter(true)} style={styles.bellBtn} activeOpacity={0.7}>
  <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
  {todaySummary.pending > 0 && (
    <View style={styles.bellBadge}>
      <Text style={styles.bellBadgeText}>{todaySummary.pending}</Text>
    </View>
  )}
</TouchableOpacity>
```

5. Add NotificationCenter at end of component (before closing ScreenContainer tag):
```typescript
<NotificationCenter
  visible={showNotifCenter}
  onClose={() => setShowNotifCenter(false)}
  items={notifItems}
/>
```

6. Add styles:
```typescript
  bellBtn:       { position: 'relative', padding: 4 },
  bellBadge:     { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  bellBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.textInverse },
```

- [ ] **Step 4: Remove the old badge-only display**

Delete the old `{todaySummary.pending > 0 && <Badge label={...} variant="warning" />}` from the header (it's now replaced by the bell with badge).

- [ ] **Step 5: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/ui/NotificationCenter.tsx components/ui/index.ts app/(tabs)/index.tsx
git commit -m "feat: notification center modal — bell icon opens today's dose list with inline mark-taken"
```

---

## Task 13: 7-Day Adherence Bar Chart in Medication Detail

**Files:**
- Modify: `meditrack/app/medication/[id].tsx`

- [ ] **Step 1: Add AdherenceChart component inline in [id].tsx**

Add a pure-View bar chart. No external library. Each bar height is proportional to adherence% for that day.

Insert this function component before `MedicationDetailScreen`:

```typescript
function AdherenceChart({ medication, intakeHistory }: { medication: Medication; intakeHistory: IntakeRecord[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const bars = days.map((d) => {
    const doses = getScheduledDosesForDay(medication, d);
    if (doses.length === 0) return { label: '', pct: -1, d };
    const taken = doses.filter((dose) =>
      intakeHistory.some((r) => r.medicationId === medication.id && r.scheduledAt === dose.toISOString() && r.takenAt)
    ).length;
    return { label: ['Di','Lu','Ma','Me','Je','Ve','Sa'][d.getDay()], pct: Math.round((taken / doses.length) * 100), d };
  });

  return (
    <View style={chartStyles.container}>
      {bars.map((bar, i) => (
        <View key={i} style={chartStyles.barCol}>
          <View style={chartStyles.barTrack}>
            {bar.pct >= 0 ? (
              <View
                style={[
                  chartStyles.bar,
                  { height: `${Math.max(bar.pct, 4)}%`, backgroundColor: bar.pct >= 80 ? Colors.success : bar.pct >= 50 ? Colors.warning : Colors.danger },
                ]}
              />
            ) : (
              <View style={chartStyles.noBar} />
            )}
          </View>
          <Text style={chartStyles.dayLabel}>{bar.label}</Text>
          {bar.pct >= 0 && <Text style={chartStyles.pctLabel}>{bar.pct}%</Text>}
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4 },
  barCol:    { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack:  { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 4, backgroundColor: Colors.surfaceSubtle, overflow: 'hidden' },
  bar:       { width: '100%', borderRadius: 4 },
  noBar:     { width: '100%', height: '4%', backgroundColor: Colors.border, borderRadius: 4 },
  dayLabel:  { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  pctLabel:  { fontSize: 9, color: Colors.textSecondary },
});
```

- [ ] **Step 2: Import IntakeRecord and use chart in screen**

Add to imports at top of `[id].tsx`:
```typescript
import { getScheduledDosesForDay } from '@utils/scheduleEngine';
import { useMedicationStore, NewMedication, IntakeRecord } from '@store/medicationStore';
```
(these may already be there — check and add only what's missing)

In `MedicationDetailScreen`, get intake history:
```typescript
const intakeHistory = useMedicationStore((s) => s.intakeHistory.filter((r) => r.medicationId === id));
```

In the detail view (not the edit view), add before the `upcomingDoses` card:
```typescript
<View style={styles.card}>
  <Text style={styles.sectionTitle}>{t('medication.detail.adherence7d')}</Text>
  <AdherenceChart medication={medication} intakeHistory={intakeHistory} />
</View>
```

Add i18n key: `"adherence7d": "Observance (7 jours)"` in fr.json, `"adherence7d": "Adherence (7 days)"` in en.json, `"adherence7d": "الالتزام (7 أيام)"` in ar.json.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/medication/[id].tsx i18n/locales/fr.json i18n/locales/en.json i18n/locales/ar.json
git commit -m "feat: 7-day adherence bar chart in medication detail screen"
```

---

## Task 14: Delete All Data

**Files:**
- Modify: `meditrack/app/(tabs)/settings.tsx`

- [ ] **Step 1: Add Delete All Data to settings screen**

In `app/(tabs)/settings.tsx`, import:
```typescript
import { deleteAllData } from '@db/database';
import { useMedicationStore } from '@store/medicationStore';
import { useProfileStore } from '@store/profileStore';
```

Add the handler:
```typescript
const hydrateMedications = useMedicationStore((s) => s.hydrate);
const hydrateProfiles    = useProfileStore((s) => s.hydrate);

async function handleDeleteAll() {
  Alert.alert(
    'Supprimer toutes les données',
    'Cette action est irréversible. Tous les profils, médicaments et historiques seront supprimés.',
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer tout',
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          await Promise.all([hydrateMedications(), hydrateProfiles()]);
        },
      },
    ]
  );
}
```

At the bottom of the settings screen JSX, before the closing `ScreenContainer`, add a danger zone section:
```typescript
<View style={styles.dangerZone}>
  <Text style={styles.dangerTitle}>Zone de danger</Text>
  <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAll}>
    <Ionicons name="trash-outline" size={18} color={Colors.danger} />
    <Text style={styles.dangerBtnText}>Supprimer toutes les données</Text>
    <Ionicons name="chevron-forward" size={16} color={Colors.danger} />
  </TouchableOpacity>
</View>
```

Add styles:
```typescript
  dangerZone:    { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border },
  dangerTitle:   { fontSize: FontSize.xs, fontWeight: '700', color: Colors.danger, marginBottom: Spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  dangerBtn:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.dangerLight, borderRadius: Radius.sm, padding: Spacing.md },
  dangerBtnText: { flex: 1, fontSize: FontSize.md, color: Colors.danger, fontWeight: '600' },
```

Also import `Alert` and `Ionicons` if not already imported.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/settings.tsx
git commit -m "feat: Delete All Data danger zone in settings"
```

---

## Task 15: JSON Export

**Files:**
- Modify: `meditrack/utils/exportService.ts`
- Modify: `meditrack/app/export.tsx`

- [ ] **Step 1: Add exportJSON function to exportService.ts**

At the end of `utils/exportService.ts`, add:

```typescript
export async function exportJSON(
  medications: Medication[],
  records: IntakeRecord[]
): Promise<void> {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    medications: medications.map((m) => ({
      id: m.id, name: m.name, doseQuantity: m.doseQuantity, unit: m.unit,
      type: m.type, schedule: m.schedule, startDate: m.startDate,
      endDate: m.endDate, notes: m.notes, paused: m.paused, pillColor: m.pillColor,
    })),
    intakeRecords: records.map((r) => ({
      medicationId: r.medicationId, scheduledAt: r.scheduledAt,
      takenAt: r.takenAt, skipped: r.skipped, notes: r.notes,
    })),
  };

  const json = JSON.stringify(payload, null, 2);
  const path = `${FileSystem.cacheDirectory}meditrack_export.json`;
  await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Exporter JSON' });
}
```

- [ ] **Step 2: Add JSON button to export.tsx**

In `app/export.tsx`:

1. Import `exportJSON`:
```typescript
import { exportCSV, exportPDF, exportJSON } from '@utils/exportService';
```

2. Extend the `loading` state type:
```typescript
const [loading, setLoading] = useState<'csv' | 'pdf' | 'json' | null>(null);
```

3. In `handleExport`, handle `'json'`:
```typescript
async function handleExport(type: 'csv' | 'pdf' | 'json') {
  setLoading(type);
  try {
    const { from, to } = getDateRange();
    if (type === 'csv') await exportCSV(profileMedications, profileIntakeHistory, from, to);
    else if (type === 'pdf') await exportPDF(profileMedications, profileIntakeHistory, from, to);
    else await exportJSON(profileMedications, profileIntakeHistory);
  } catch (e) {
    console.error('Export failed', e);
  } finally {
    setLoading(null);
  }
}
```

4. Add JSON button alongside CSV and PDF:
```typescript
<Button
  label={loading === 'json' ? '…' : t('export.json')}
  variant="ghost"
  onPress={() => handleExport('json')}
  style={styles.exportBtn}
  disabled={!!loading}
/>
```

5. Add i18n key `"json": "Exporter JSON"` in all three locale files.

- [ ] **Step 3: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add utils/exportService.ts app/export.tsx i18n/locales/fr.json i18n/locales/en.json i18n/locales/ar.json
git commit -m "feat: JSON data export in export screen"
```

---

## Task 16: Form Step Cross-Fade Animation

**Files:**
- Modify: `meditrack/components/medication/MedForm.tsx`

- [ ] **Step 1: Add step transition animation**

At the top of `MedForm.tsx`, add Reanimated import:
```typescript
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
```

In the render, find where each step is rendered (the `if (step === 1)` / `if (step === 2)` blocks or the JSX structure). Wrap each step's root View with:

```typescript
<Animated.View key={`step-${step}`} entering={FadeInRight.duration(250)} exiting={FadeOutLeft.duration(200)}>
  {/* step content */}
</Animated.View>
```

The `key` prop tied to the step number forces Reanimated to remount and play enter/exit when the step changes.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/medication/MedForm.tsx
git commit -m "feat: cross-fade slide animation between MedForm steps"
```

---

## Task 17: Onboarding Slide Transition Animation

**Files:**
- Modify: `meditrack/components/onboarding/OnboardingSlide.tsx`

- [ ] **Step 1: Add slide entrance animation**

In `OnboardingSlide.tsx`, add Reanimated import:
```typescript
import Animated, { FadeInRight, FadeIn } from 'react-native-reanimated';
```

Wrap the title and description with `Animated.Text` with entering animation, and the illustration with `Animated.View`:

```typescript
// Replace the illustration View:
<Animated.View entering={FadeInRight.duration(350)} style={[styles.illustration, { backgroundColor: illustrationColor }]} />

// Replace title Text:
<Animated.Text entering={FadeIn.delay(150).duration(300)} style={styles.title}>{title}</Animated.Text>

// Replace description Text:
<Animated.Text entering={FadeIn.delay(250).duration(300)} style={styles.description}>{description}</Animated.Text>
```

The `entering` prop requires that `Animated.Text` is used instead of `Text`. `Animated.Text` is a valid Reanimated export.

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/onboarding/OnboardingSlide.tsx
git commit -m "feat: fade+slide entrance animations on onboarding slides"
```

---

## Task 18: Final Typecheck & Smoke Test

- [ ] **Step 1: Full typecheck**

```bash
cd meditrack && npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Step 2: Lint**

```bash
npx eslint app components hooks store utils --ext .ts,.tsx --max-warnings 0
```
Fix any errors before proceeding.

- [ ] **Step 3: Verify key flows in Expo Go (or dev build)**

Run `expo start` and verify:
- Profile creation with avatar, blood type chip, allergies tags, doctor fields
- Profile edit with full medical fields
- MedCard swipe right → dose marked taken (green flash)
- MedCard swipe left → dose skipped
- Notification center modal opens from bell icon, shows today's doses, inline mark taken works
- Home screen: streak stat, upcoming doses section visible
- Medication detail: 7-day bar chart renders
- Add medication: name autocomplete shows suggestions, refill reminder toggle appears in step 3
- Export screen: JSON button works
- Settings: Delete All Data shows confirmation and clears data

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: final smoke test — all features complete"
```
