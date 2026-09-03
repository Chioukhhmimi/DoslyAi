import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useProfiles } from '@hooks/useProfiles';
import { format } from 'date-fns';

export default function NewProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { addProfile } = useProfiles();

  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [relationship, setRelationship] = useState('');
  const [error, setError] = useState('');

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDate(selected);
  }

  function handleSave() {
    if (!name.trim()) { setError(t('profile.form.nameRequired')); return; }
    const dateOfBirth = date ? format(date, 'yyyy-MM-dd') : undefined;
    addProfile({ name: name.trim(), dateOfBirth, relationship: relationship || undefined });
    router.replace('/(tabs)');
  }

  const displayDate = date ? format(date, 'dd/MM/yyyy') : null;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('profile.new')} />

      <Text style={styles.label}>{t('profile.form.nameLabel')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(v) => { setName(v); setError(''); }}
        placeholder={t('profile.form.namePlaceholder')}
        placeholderTextColor={Colors.textDisabled}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>{t('profile.form.dobLabel')}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <View style={styles.dateRow}>
          <Text style={displayDate ? styles.dateText : styles.datePlaceholder}>
            {displayDate ?? t('profile.form.dobPlaceholder')}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={Colors.textDisabled} />
        </View>
      </TouchableOpacity>

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalDone}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date ?? new Date()}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onDateChange}
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

      <View style={styles.actions}>
        <Button label={t('common.save')} onPress={handleSave} style={styles.btn} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label:          { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: Spacing.sm },
  input:          { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surface },
  dateRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText:       { fontSize: FontSize.md, color: Colors.textPrimary },
  datePlaceholder:{ fontSize: FontSize.md, color: Colors.textDisabled },
  error:          { fontSize: FontSize.sm, color: Colors.danger, marginTop: 4 },
  actions:        { gap: Spacing.sm, marginTop: Spacing.xl },
  btn:            { marginBottom: Spacing.xs },
  modalOverlay:   { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:     { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Spacing.xl },
  modalHeader:    { flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalDone:      { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  iosPicker:      { width: '100%' },
});
