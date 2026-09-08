// app/profile/new.tsx
import React, { useState } from 'react';
import { View, TextInput, Modal, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { TagInput } from '@components/ui/TagInput';
import { SelectableChip } from '@components/ui/SelectableChip';
import { AvatarPicker } from '@components/profile/AvatarPicker';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { format } from 'date-fns';

import { AppText } from '@components/ui/AppText';

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

  function parseDecimal(s: string): number | undefined {
    const n = Number(s.replace(',', '.').trim());
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }

  function handleSave() {
    if (!name.trim()) { setError(t('profile.form.nameRequired')); return; }
    addProfile({
      name: name.trim(),
      dateOfBirth:      dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship:     relationship || undefined,
      avatarUri:        avatarUri || undefined,
      bloodType:        bloodType || undefined,
      weight:           weight ? parseDecimal(weight) : undefined,
      height:           height ? parseDecimal(height) : undefined,
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

      <AppText style={styles.label}>{t('profile.form.nameLabel')}</AppText>
      <TextInput style={[styles.input, !!error && styles.inputError]} value={name}
        onChangeText={(v) => { setName(v); setError(''); }}
        placeholder={t('profile.form.namePlaceholder')} placeholderTextColor={Colors.textDisabled} />
      {!!error && <AppText style={styles.error}>{error}</AppText>}

      <AppText style={styles.label}>{t('profile.form.dobLabel')}</AppText>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <View style={styles.dateRow}>
          <AppText style={displayDate ? styles.dateText : styles.datePlaceholder}>{displayDate ?? t('profile.form.dobPlaceholder')}</AppText>
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
              <TouchableOpacity onPress={() => setShowPicker(false)}><AppText style={styles.modalDone}>{t('common.done')}</AppText></TouchableOpacity>
            </View>
            <DateTimePicker value={dob ?? new Date()} mode="date" display="spinner" maximumDate={new Date()} onChange={onDateChange} style={{ width: '100%' }} />
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
  btRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.xs },
  rowTwo:           { flexDirection: 'row', gap: Spacing.sm },
  half:             { flex: 1 },
  actions:          { gap: Spacing.sm, marginTop: Spacing.xl },
  btn:              { marginBottom: Spacing.xs },
  modalOverlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:       { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, paddingBottom: Spacing.xl },
  modalHeader:      { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:        { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
