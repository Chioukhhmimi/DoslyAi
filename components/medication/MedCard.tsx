import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
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
  pill:       Colors.pill,
  syrup:      Colors.syrup,
  injection:  Colors.injection,
  supplement: Colors.supplement,
  other:      Colors.other,
};

export function MedCard({ medication, scheduledTime, scheduledISO, intakeRecord, onMarkTaken, onSkip }: MedCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showSnooze, setShowSnooze] = useState(false);

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

  async function handleSnooze(minutes: number) {
    setShowSnooze(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await snoozeDoseNotification(medication, scheduledDate, minutes);
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.card, medication.paused && styles.cardPaused]}
        onPress={() => router.push(`/medication/${medication.id}`)}
        activeOpacity={0.85}
      >
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

        {isPending && !medication.paused && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMarkTaken(); }}
              style={styles.btnTaken}
            >
              <Text style={styles.btnTakenText}>{t('medication.confirm.taken')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowSnooze(true); }}
              style={styles.btnSnooze}
            >
              <Text style={styles.btnSnoozeText}>{t('home.snoozeLater')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSkip(); }}
              style={styles.btnSkip}
            >
              <Text style={styles.btnSkipText}>{t('medication.confirm.skip')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

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
  btnTaken:         { flex: 1, backgroundColor: Colors.successLight, borderRadius: Radius.sm, padding: Spacing.sm, alignItems: 'center' },
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
