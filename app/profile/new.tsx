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
