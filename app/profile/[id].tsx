import React, { useState } from 'react';
import { View, Text, TextInput, Alert, Modal, Platform, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const { profiles, updateProfile, deleteProfile } = useProfiles();
  const { medications } = useMedications();

  const profile = profiles.find((p) => p.id === id);

  const parseDOB = (s?: string): Date | null => {
    if (!s) return null;
    try { return parseISO(s); } catch { return null; }
  };

  const [name, setName]                 = useState(profile?.name ?? '');
  const [dob, setDob]                   = useState<Date | null>(parseDOB(profile?.dateOfBirth));
  const [relationship, setRelationship] = useState(profile?.relationship ?? '');
  const [editing, setEditing]           = useState(false);
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
      dateOfBirth: dob ? format(dob, 'yyyy-MM-dd') : undefined,
      relationship: relationship || undefined,
    });
    setEditing(false);
    setNameError('');
  }

  function handleCancelEdit() {
    setName(profile!.name);
    setDob(parseDOB(profile!.dateOfBirth));
    setRelationship(profile!.relationship ?? '');
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
        {
          text: t('common.delete'),
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
        title={editing ? t('profile.editTitle') : profile.name}
        right={
          !editing
            ? <Text onPress={() => setEditing(true)} style={styles.editLink}>{t('common.edit')}</Text>
            : undefined
        }
      />

      {!editing && (
        <View style={styles.profileCard}>
          <Avatar name={profile.name} uri={profile.avatarUri} size={72} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            {profile.relationship ? <Text style={styles.rel}>{profile.relationship}</Text> : null}
            {profile.dateOfBirth ? <Text style={styles.dob}>{t('profile.bornOn')} {profile.dateOfBirth}</Text> : null}
            <Text style={styles.medCount}>{t('profile.detail.medCount', { count: medCount })}</Text>
          </View>
        </View>
      )}

      {editing && (
        <View>
          <Text style={styles.label}>{t('profile.form.nameLabel')}</Text>
          <TextInput
            style={[styles.input, !!nameError && styles.inputError]}
            value={name}
            onChangeText={(v) => { setName(v); setNameError(''); }}
            placeholder={t('profile.form.namePlaceholder')}
            placeholderTextColor={Colors.textDisabled}
            autoFocus
          />
          {!!nameError && <Text style={styles.error}>{nameError}</Text>}

          <Text style={styles.label}>{t('profile.form.dobLabel')}</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
            <View style={styles.dateRow}>
              <Text style={displayDob ? styles.dateText : styles.datePlaceholder}>
                {displayDob ?? t('profile.form.dobPlaceholder')}
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
                      <Text style={styles.modalDone}>{t('common.done')}</Text>
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

          <Text style={styles.label}>{t('profile.form.relationLabel')}</Text>
          <TextInput
            style={styles.input}
            value={relationship}
            onChangeText={setRelationship}
            placeholder={t('profile.form.relationPlaceholder')}
            placeholderTextColor={Colors.textDisabled}
          />

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

const styles = StyleSheet.create({
  profileCard:     { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', backgroundColor: Colors.surface, borderRadius: 12, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg },
  profileInfo:     { flex: 1 },
  name:            { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  rel:             { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  dob:             { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  medCount:        { fontSize: FontSize.sm, color: Colors.primary, marginTop: 6, fontWeight: '600' },
  notFound:        { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  editLink:        { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600', paddingVertical: 4 },
  label:           { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input:           { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface },
  inputError:      { borderColor: Colors.danger },
  error:           { fontSize: FontSize.xs, color: Colors.danger, marginTop: 2 },
  dateRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:        { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder: { fontSize: FontSize.md, color: Colors.textDisabled },
  editActions:     { gap: Spacing.sm, marginTop: Spacing.lg },
  btn:             { marginBottom: Spacing.xs },
  dangerZone:      { marginTop: Spacing.xl, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  dangerTitle:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  modalOverlay:    { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Spacing.xl },
  modalHeader:     { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:       { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  iosPicker:       { width: '100%' },
});
