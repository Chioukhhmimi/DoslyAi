import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMedicationStore } from '@store/medicationStore';
import { snoozeDoseNotification } from '@hooks/useNotifications';
import * as Haptics from 'expo-haptics';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { BottomSheet } from '@components/ui/BottomSheet';
import { formatTime } from '@utils/dateHelpers';

export default function ConfirmScreen() {
  const { t } = useTranslation();
  const { medicationId, scheduledAt } = useLocalSearchParams<{ medicationId: string; scheduledAt: string }>();
  const router = useRouter();
  const { medications, recordIntake } = useMedicationStore();
  const [note, setNote] = useState('');
  const [showSnooze, setShowSnooze] = useState(false);

  const SNOOZE_OPTIONS = [
    { label: t('medication.confirm.snooze10'), minutes: 10 },
    { label: t('medication.confirm.snooze30'), minutes: 30 },
    { label: t('medication.confirm.snooze60'), minutes: 60 },
  ];

  const medication = medications.find((m) => m.id === medicationId);

  if (!medication) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>{t('medication.confirm.notFound')}</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.fallbackBtn}>
          <Text style={styles.fallbackBtnText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scheduledDate = scheduledAt ? new Date(scheduledAt) : new Date();
  const timeLabel = formatTime(`${String(scheduledDate.getHours()).padStart(2,'0')}:${String(scheduledDate.getMinutes()).padStart(2,'0')}`);

  function handleTaken() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    recordIntake({
      medicationId: medication!.id,
      profileId: medication!.profileId,
      scheduledAt: scheduledDate.toISOString(),
      takenAt: new Date().toISOString(),
      notes: note.trim() || undefined,
    });
    router.replace('/(tabs)');
  }

  function handleSkip() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    recordIntake({
      medicationId: medication!.id,
      profileId: medication!.profileId,
      scheduledAt: scheduledDate.toISOString(),
      skipped: true,
      notes: note.trim() || undefined,
    });
    router.replace('/(tabs)');
  }

  async function handleSnooze(minutes: number) {
    setShowSnooze(false);
    await snoozeDoseNotification(medication!, scheduledDate, minutes);
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>💊 {medication.name}</Text>
        <Text style={styles.subtitle}>
          {medication.doseQuantity} {medication.unit} · {timeLabel}
        </Text>

        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder={t('medication.confirm.noteLabel')}
          placeholderTextColor={Colors.textDisabled}
          multiline
        />

        <TouchableOpacity style={styles.btnTaken} onPress={handleTaken}>
          <Text style={styles.btnTakenText}>{t('medication.confirm.taken')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSnooze} onPress={() => setShowSnooze(true)}>
          <Text style={styles.btnSnoozeText}>{t('medication.confirm.snooze')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSkip} onPress={handleSkip}>
          <Text style={styles.btnSkipText}>{t('medication.confirm.skip')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={() => router.back()}>
          <Text style={styles.btnCancelText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.xl, paddingBottom: 40 },
  title:            { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle:         { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  noteInput:        { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.background, minHeight: 60, textAlignVertical: 'top', marginBottom: Spacing.md },
  btnTaken:         { backgroundColor: Colors.successLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  btnTakenText:     { fontSize: FontSize.md, fontWeight: '700', color: Colors.successText },
  btnSnooze:        { backgroundColor: Colors.warningLight, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm },
  btnSnoozeText:    { fontSize: FontSize.md, fontWeight: '700', color: Colors.skippedText },
  btnSkip:          { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  btnSkipText:      { fontSize: FontSize.md, fontWeight: '600', color: Colors.textSecondary },
  btnCancel:        { padding: Spacing.sm, alignItems: 'center' },
  btnCancelText:    { fontSize: FontSize.sm, color: Colors.textDisabled },
  fallback:         { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  fallbackText:     { fontSize: FontSize.md, color: Colors.textSecondary },
  fallbackBtn:      { padding: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.md },
  fallbackBtnText:  { color: Colors.textInverse, fontWeight: '600' },
  snoozeTitle:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  snoozeOption:     { padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.sm, alignItems: 'center', marginBottom: Spacing.xs },
  snoozeOptionText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  snoozeCancel:     { padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  snoozeCancelText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
