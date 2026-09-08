import React, { useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { MedForm } from '@components/medication/MedForm';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedicationStore, NewMedication, Medication, IntakeRecord } from '@store/medicationStore';
import { formatTime, formatDate, addDays, isSameDay } from '@utils/dateHelpers';
import {
  cancelNotificationsForMedication,
  scheduleNotificationsForMedication,
} from '@hooks/useNotifications';
import { getNextDoses, getScheduledDosesForDay } from '@utils/scheduleEngine';

import { AppText } from '@components/ui/AppText';

const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill,
  syrup: Colors.syrup,
  injection: Colors.injection,
  supplement: Colors.supplement,
  other: Colors.other,
};

export default function MedicationDetailScreen() {
  const { t } = useTranslation();
  const { id, edit } = useLocalSearchParams<{ id: string; edit?: string }>();
  const router = useRouter();
  const { medications, updateMedication, deleteMedication, intakeHistory } = useMedicationStore();
  const [editing, setEditing] = useState(edit === '1');

  const medication = medications.find((m) => m.id === id);

  if (!medication) {
    return (
      <ScreenContainer>
        <ScreenHeader title={t('medication.detail.title')} />
        <AppText style={styles.notFound}>{t('medication.detail.notFound')}</AppText>
        <Button
          label={t('common.back')}
          onPress={() => router.replace('/(tabs)/medications')}
          style={{ marginTop: Spacing.lg }}
        />
      </ScreenContainer>
    );
  }

  function handleDelete() {
    Alert.alert(t('common.delete'), `${t('common.delete')} ${medication!.name} ?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          cancelNotificationsForMedication(medication!.id);
          deleteMedication(id);
          router.replace('/(tabs)/medications');
        },
      },
    ]);
  }

  async function handleTogglePause() {
    const newPaused = !medication!.paused;
    updateMedication(id, { paused: newPaused });
    if (newPaused) {
      await cancelNotificationsForMedication(id);
    } else {
      await scheduleNotificationsForMedication({ ...medication!, paused: false });
    }
  }

  if (editing) {
    return (
      <MedForm
        initialValues={medication}
        profileId={medication.profileId}
        onSubmit={(data: NewMedication) => {
          updateMedication(id, data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const upcomingDoses = getNextDoses(medication, new Date(), 5);
  const adherenceData = buildLast7Days(medication, intakeHistory);
  const dayLabels = [
    t('scheduler.days.sun'),
    t('scheduler.days.mon'),
    t('scheduler.days.tue'),
    t('scheduler.days.wed'),
    t('scheduler.days.thu'),
    t('scheduler.days.fri'),
    t('scheduler.days.sat'),
  ];

  const freqSummary =
    medication.schedule.frequency === 'interval'
      ? `${t('medication.freq.everyN')} ${medication.schedule.intervalDays ?? 1} ${t('medication.freq.days')}`
      : t(`medication.freq.${medication.schedule.frequency}`, { defaultValue: '—' });

  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        title={medication.name}
        right={
          <TouchableOpacity
            onPress={() => setEditing(true)}
            style={styles.editLink}
            accessibilityRole="button"
            accessibilityLabel={t('common.edit')}
          >
            <AppText style={styles.editLinkText}>{t('common.edit')}</AppText>
          </TouchableOpacity>
        }
      />
      <View style={styles.header}>
        <View
          style={[
            styles.typeDot,
            { backgroundColor: TYPE_COLOR[medication.type] ?? TYPE_COLOR.other },
          ]}
        />
        <View style={styles.headerInfo}>
          <AppText style={styles.title}>{medication.name}</AppText>
          <AppText style={styles.dosage}>
            {medication.doseQuantity} {medication.unit}
          </AppText>
        </View>
        <View style={styles.headerBadges}>
          <Badge
            label={t(`medication.types.${medication.type}`, { defaultValue: medication.type })}
            variant="info"
          />
          {medication.paused && <Badge label={t('medications.paused')} variant="warning" />}
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow label={t('medication.detail.frequency')} value={freqSummary} />
        <DetailRow
          label={t('medication.schedule.times')}
          value={medication.schedule.times.map(formatTime).join(' · ') || '—'}
        />
        <DetailRow
          label={t('medication.schedule.start')}
          value={formatDate(medication.startDate)}
        />
        <DetailRow
          label={t('medication.schedule.end')}
          value={
            medication.endDate
              ? formatDate(medication.endDate)
              : t('medication.schedule.indefinite')
          }
        />
        {medication.notes ? (
          <DetailRow label={t('medication.detail.notes')} value={medication.notes} />
        ) : null}
      </View>

      <View style={styles.card}>
        <AppText style={styles.sectionTitle}>{t('medication.detail.adherence7')}</AppText>
        <View style={chartStyles.row}>
          {adherenceData.map((day, i) => {
            const barColor =
              day.pct === null
                ? Colors.border
                : day.pct >= 0.8
                ? Colors.success
                : day.pct >= 0.3
                ? Colors.injection
                : Colors.danger;
            const fillHeight = day.pct !== null ? Math.round(day.pct * 60) : 0;
            const dayLabel = dayLabels[day.date.getDay()];
            const pctLabel = day.pct === null ? '—' : `${Math.round(day.pct * 100)}%`;
            return (
              <View key={i} style={chartStyles.barGroup}>
                <View style={chartStyles.barTrack}>
                  <View
                    style={[chartStyles.barFill, { height: fillHeight, backgroundColor: barColor }]}
                  />
                </View>
                <AppText style={chartStyles.dayLabel}>{dayLabel}</AppText>
                <AppText style={chartStyles.pctLabel}>{pctLabel}</AppText>
              </View>
            );
          })}
        </View>
      </View>

      {upcomingDoses.length > 0 && (
        <View style={styles.card}>
          <AppText style={styles.sectionTitle}>{t('medication.schedule.upcoming')}</AppText>
          {upcomingDoses.map((d, i) => (
            <View key={i} style={styles.upcomingRow}>
              <AppText style={styles.upcomingDate}>{formatDate(d.toISOString().split('T')[0])}</AppText>
              <AppText style={styles.upcomingTime}>
                {formatTime(
                  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
                )}
              </AppText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          label={medication.paused ? t('medication.actions.resume') : t('medication.actions.pause')}
          variant={medication.paused ? 'secondary' : 'ghost'}
          onPress={handleTogglePause}
          style={styles.btn}
        />
        <Button label={t('medication.actions.delete')} variant="danger" onPress={handleDelete} />
      </View>
    </ScreenContainer>
  );
}

type DayAdherence = { date: Date; pct: number | null; taken: number; total: number };

function buildLast7Days(medication: Medication, history: IntakeRecord[]): DayAdherence[] {
  const today = new Date();
  const days: DayAdherence[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const scheduledDoses = getScheduledDosesForDay(medication, d);
    const total = scheduledDoses.length;

    const taken = history.filter(
      (r) =>
        r.medicationId === medication.id &&
        r.takenAt != null &&
        isSameDay(new Date(r.scheduledAt), d),
    ).length;

    days.push({ date: d, pct: total === 0 ? null : taken / total, taken, total });
  }

  return days;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={rowStyles.row}>
      <AppText style={rowStyles.label}>{label}</AppText>
      <AppText style={rowStyles.value}>{value}</AppText>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  typeDot: { width: 16, height: 16, borderRadius: 8 },
  headerInfo: { flex: 1 },
  headerBadges: { gap: 4, alignItems: 'flex-end' },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  dosage: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  notFound: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center' },
  editLink: { paddingVertical: 10, paddingHorizontal: 4, minHeight: 44, justifyContent: 'center' },
  editLinkText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  upcomingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  upcomingDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  upcomingTime: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  actions: { gap: Spacing.sm },
  btn: { marginBottom: Spacing.xs },
});

const chartStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    width: 20,
    height: 60,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pctLabel: {
    fontSize: 10,
    color: Colors.textDisabled,
  },
});
