// app/profile/[id].tsx
import React, { useState } from 'react';
import { View, TextInput, Alert, Modal, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { TagInput } from '@components/ui/TagInput';
import { SelectableChip } from '@components/ui/SelectableChip';
import { AvatarPicker } from '@components/profile/AvatarPicker';
import { Avatar } from '@components/ui/Avatar';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { useMedications } from '@hooks/useMedications';
import { format, parseISO, isValid } from 'date-fns';

import { AppText } from '@components/ui/AppText';

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
    const d = parseISO(s);
    return isValid(d) ? d : null;
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
        <AppText style={styles.notFound}>{t('profile.notFound')}</AppText>
        <Button label={t('common.back')} onPress={() => router.replace('/profile')} style={{ marginTop: Spacing.lg }} />
      </ScreenContainer>
    );
  }

  const medCount = medications.filter((m) => m.profileId === id).length;

  const parseMeasurement = (val: string): number | undefined => {
    const normalized = val.replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  function handleSave() {
    if (!name.trim()) { setNameError(t('profile.form.nameRequired')); return; }
    updateProfile(id, {
      name: name.trim(),
      dateOfBirth:      dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship:     relationship || undefined,
      avatarUri:        avatarUri || undefined,
      bloodType:        bloodType || undefined,
      weight:           parseMeasurement(weight),
      height:           parseMeasurement(height),
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
    if (!profile) return;
    setName(profile.name);
    setDob(parseDOB(profile.dateOfBirth));
    setRelationship(profile.relationship ?? '');
    setAvatarUri(profile.avatarUri ?? '');
    setBloodType(profile.bloodType ?? '');
    setWeight(profile.weight ? String(profile.weight) : '');
    setHeight(profile.height ? String(profile.height) : '');
    setAllergies(profile.allergies ?? []);
    setConditions(profile.conditions ?? []);
    setDoctorName(profile.doctorName ?? '');
    setDoctorPhone(profile.doctorPhone ?? '');
    setEmergencyContact(profile.emergencyContact ?? '');
    setEmergencyPhone(profile.emergencyPhone ?? '');
    setMedicalNotes(profile.medicalNotes ?? '');
    setNameError('');
    setEditing(false);
  }

  function onDobChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowDobPicker(false);
    if (selected) setDob(selected);
  }

  function handleDelete() {
    if (!profile) return;
    Alert.alert(
      t('profile.deleteTitle'),
      t('profile.deleteConfirm', { name: profile.name, count: medCount }),
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
        right={!editing ? <AppText onPress={() => setEditing(true)} style={styles.editLink}>{t('common.edit')}</AppText> : undefined}
      />

      {!editing && (
        <>
          <View style={styles.profileCard}>
            <Avatar name={profile.name} uri={profile.avatarUri} size={72} />
            <View style={styles.profileInfo}>
              <AppText style={styles.name}>{profile.name}</AppText>
              {profile.relationship ? <AppText style={styles.sub}>{profile.relationship}</AppText> : null}
              {profile.dateOfBirth ? (
                <AppText style={styles.sub}>
                  {t('profile.bornOn')} {format(parseISO(profile.dateOfBirth), 'dd/MM/yyyy')}
                </AppText>
              ) : null}
              <AppText style={styles.medCount}>{t('profile.detail.medCount', { count: medCount })}</AppText>
            </View>
          </View>
          <View style={styles.card}>
            {profile.bloodType        ? <InfoRow label={t('profile.medical.bloodType')}       value={profile.bloodType} /> : null}
            {profile.weight           ? <InfoRow label={t('profile.medical.weight')}           value={`${profile.weight} kg`} /> : null}
            {profile.height           ? <InfoRow label={t('profile.medical.height')}           value={`${profile.height} cm`} /> : null}
            {profile.doctorName       ? <InfoRow label={t('profile.medical.doctorName')}       value={profile.doctorName} /> : null}
            {profile.doctorPhone      ? <InfoRow label={t('profile.medical.doctorPhone')}      value={profile.doctorPhone} /> : null}
            {profile.emergencyContact ? <InfoRow label={t('profile.medical.emergencyContact')} value={profile.emergencyContact} /> : null}
            {profile.emergencyPhone   ? <InfoRow label={t('profile.medical.emergencyPhone')}   value={profile.emergencyPhone} /> : null}
            {profile.allergies && profile.allergies.length > 0 ? (
              <View style={styles.tagRow}>
                <AppText style={styles.rowLabel}>{t('profile.medical.allergies')}</AppText>
                <View style={styles.tagList}>
                  {profile.allergies.map((a, i) => <View key={i} style={styles.tag}><AppText style={styles.tagText}>{a}</AppText></View>)}
                </View>
              </View>
            ) : null}
            {profile.conditions && profile.conditions.length > 0 ? (
              <View style={styles.tagRow}>
                <AppText style={styles.rowLabel}>{t('profile.medical.conditions')}</AppText>
                <View style={styles.tagList}>
                  {profile.conditions.map((c, i) => <View key={i} style={styles.tag}><AppText style={styles.tagText}>{c}</AppText></View>)}
                </View>
              </View>
            ) : null}
            {profile.medicalNotes ? <InfoRow label={t('profile.medical.notes')} value={profile.medicalNotes} /> : null}
          </View>
        </>
      )}

      {editing && (
        <View>
          <AvatarPicker name={name} uri={avatarUri || undefined} onPicked={setAvatarUri} />

          <AppText style={styles.label}>{t('profile.form.nameLabel')}</AppText>
          <TextInput style={[styles.input, !!nameError && styles.inputError]} value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            placeholder={t('profile.form.namePlaceholder')} placeholderTextColor={Colors.textDisabled} autoFocus />
          {!!nameError && <AppText style={styles.error}>{nameError}</AppText>}

          <AppText style={styles.label}>{t('profile.form.dobLabel')}</AppText>
          <TouchableOpacity style={styles.input} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
            <View style={styles.dateRow}>
              <AppText style={displayDob ? styles.dateText : styles.datePlaceholder}>{displayDob ?? t('profile.form.dobPlaceholder')}</AppText>
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
                  <TouchableOpacity onPress={() => setShowDobPicker(false)}><AppText style={styles.modalDone}>{t('common.done')}</AppText></TouchableOpacity>
                </View>
                <DateTimePicker value={dob ?? new Date()} mode="date" display="spinner" maximumDate={new Date()} onChange={onDobChange} style={{ width: '100%' }} />
              </View></View>
            </Modal>
          )}

          <AppText style={styles.label}>{t('profile.form.relationLabel')}</AppText>
          <TextInput style={styles.input} value={relationship} onChangeText={setRelationship}
            placeholder={t('profile.form.relationPlaceholder')} placeholderTextColor={Colors.textDisabled} />

          <AppText style={styles.sectionHeader}>{t('profile.medical.sectionTitle')}</AppText>

          <AppText style={styles.label}>{t('profile.medical.bloodType')}</AppText>
          <View style={styles.btRow}>
            {BLOOD_TYPES.map((bt) => (
              <SelectableChip
                key={bt}
                label={bt}
                selected={bloodType === bt}
                onPress={() => setBloodType(bt === bloodType ? '' : bt)}
                size="sm"
              />
            ))}
          </View>

          <View style={styles.rowTwo}>
            <View style={styles.half}>
              <AppText style={styles.label}>{t('profile.medical.weight')}</AppText>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="70" placeholderTextColor={Colors.textDisabled} />
            </View>
            <View style={styles.half}>
              <AppText style={styles.label}>{t('profile.medical.height')}</AppText>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="170" placeholderTextColor={Colors.textDisabled} />
            </View>
          </View>

          <TagInput label={t('profile.medical.allergies')} values={allergies} onChange={setAllergies} placeholder={t('profile.medical.allergiesPlaceholder')} />
          <TagInput label={t('profile.medical.conditions')} values={conditions} onChange={setConditions} placeholder={t('profile.medical.conditionsPlaceholder')} />

          <AppText style={styles.sectionHeader}>{t('profile.medical.doctorSection')}</AppText>
          <AppText style={styles.label}>{t('profile.medical.doctorName')}</AppText>
          <TextInput style={styles.input} value={doctorName} onChangeText={setDoctorName} placeholder="Dr. …" placeholderTextColor={Colors.textDisabled} />
          <AppText style={styles.label}>{t('profile.medical.doctorPhone')}</AppText>
          <TextInput style={styles.input} value={doctorPhone} onChangeText={setDoctorPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />
          <AppText style={styles.label}>{t('profile.medical.emergencyContact')}</AppText>
          <TextInput style={styles.input} value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Nom…" placeholderTextColor={Colors.textDisabled} />
          <AppText style={styles.label}>{t('profile.medical.emergencyPhone')}</AppText>
          <TextInput style={styles.input} value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" placeholder="+213…" placeholderTextColor={Colors.textDisabled} />

          <AppText style={styles.label}>{t('profile.medical.notes')}</AppText>
          <TextInput style={[styles.input, styles.textArea]} value={medicalNotes} onChangeText={setMedicalNotes}
            placeholder={t('profile.medical.notesPlaceholder')} placeholderTextColor={Colors.textDisabled} multiline numberOfLines={3} />

          <View style={styles.editActions}>
            <Button label={t('common.save')} onPress={handleSave} style={styles.btn} />
            <Button label={t('common.cancel')} variant="ghost" onPress={handleCancelEdit} />
          </View>
        </View>
      )}

      {!editing && (
        <View style={styles.dangerZone}>
          <AppText style={styles.dangerTitle}>{t('profile.dangerZone')}</AppText>
          <Button label={t('profile.deleteProfile')} variant="danger" onPress={handleDelete} />
        </View>
      )}
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <AppText style={rowStyles.label}>{label}</AppText>
      <AppText style={rowStyles.value}>{value}</AppText>
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
  tag:               { backgroundColor: Colors.primaryLight, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
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
  btRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs },
  rowTwo:            { flexDirection: 'row', gap: Spacing.sm },
  half:              { flex: 1 },
  editActions:       { gap: Spacing.sm, marginTop: Spacing.lg },
  btn:               { marginBottom: Spacing.xs },
  dangerZone:        { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  dangerTitle:       { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  modalOverlay:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:        { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingBottom: Spacing.xl },
  modalHeader:       { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:         { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
