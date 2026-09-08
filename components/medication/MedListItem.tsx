import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Medication, IntakeRecord } from '@store/medicationStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';
import { formatTime } from '@utils/dateHelpers';

import { AppText } from '../ui/AppText';

interface MedListItemProps {
  medication: Medication;
  intakeRecord?: IntakeRecord;
  scheduledAt: string;
  onPress?: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill,
  syrup: Colors.syrup,
  injection: Colors.injection,
  supplement: Colors.supplement,
  other: Colors.other,
};

export function MedListItem({ medication, intakeRecord, scheduledAt, onPress }: MedListItemProps) {
  const { t } = useTranslation();
  const isTaken = !!intakeRecord?.takenAt;
  const isSkipped = !!intakeRecord?.skipped;
  const isFuture = new Date(scheduledAt) > new Date();

  const statusVariant = isTaken ? 'success' : isSkipped ? 'warning' : isFuture ? 'info' : 'danger';
  const statusLabel = isTaken
    ? t('home.status.taken')
    : isSkipped
      ? t('home.status.skipped')
      : isFuture
        ? t('home.status.upcoming')
        : t('home.status.overdue');

  const time = new Date(scheduledAt);
  const hhmm = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

  const accentColor = medication.pillColor ?? TYPE_COLOR[medication.type] ?? TYPE_COLOR.other;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
      <View style={[styles.leftBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.info}>
            <AppText style={styles.name}>{medication.name}</AppText>
            <AppText style={styles.dosage}>
              {medication.doseQuantity} {medication.unit}
            </AppText>
          </View>
          <View style={styles.right}>
            <AppText style={styles.time}>{formatTime(hhmm)}</AppText>
            <Badge label={statusLabel} variant={statusVariant} size="sm" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leftBar: { width: 4 },
  content: { flex: 1, padding: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  dosage: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  time: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
