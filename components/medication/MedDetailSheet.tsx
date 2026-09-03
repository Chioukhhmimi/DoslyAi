import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Medication } from '@store/medicationStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';
import { BottomSheet } from '@components/ui/BottomSheet';
import { formatTime, formatDate } from '@utils/dateHelpers';

interface MedDetailSheetProps {
  medication: Medication | null;
  onClose: () => void;
}

const TYPE_COLOR: Record<string, string> = {
  pill:       Colors.pill,
  syrup:      Colors.syrup,
  injection:  Colors.injection,
  supplement: Colors.supplement,
  other:      Colors.other,
};

export function MedDetailSheet({ medication, onClose }: MedDetailSheetProps) {
  const { t } = useTranslation();

  const freqLabel = !medication ? '' :
    medication.schedule.frequency === 'daily'    ? t('medication.freq.daily') :
    medication.schedule.frequency === 'weekly'   ? t('medication.freq.weekly') :
    medication.schedule.frequency === 'interval' ? `${t('medication.freq.everyN')} ${medication.schedule.intervalDays ?? 1} ${t('medication.freq.days')}` :
    t('medication.freq.customLabel');

  return (
    <BottomSheet visible={!!medication} onClose={onClose}>
      {medication && (
        <>
          <View style={styles.header}>
            <View style={[styles.colorDot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] ?? Colors.other }]} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{medication.name}</Text>
              <Text style={styles.dose}>{medication.doseQuantity} {medication.unit}</Text>
            </View>
            <Badge
              label={t(`medication.types.${medication.type}`, { defaultValue: medication.type })}
              variant="info"
              size="sm"
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.rows}>
            <Row label={t('medication.detail.frequency')} value={freqLabel} />
            <Row
              label={t('medication.schedule.times')}
              value={medication.schedule.times.map(formatTime).join('  ·  ')}
            />
            <Row
              label={t('medication.schedule.start')}
              value={formatDate(medication.startDate)}
            />
            <Row
              label={t('medication.schedule.end')}
              value={medication.endDate ? formatDate(medication.endDate) : t('medication.schedule.indefinite')}
            />
            {!!medication.notes && (
              <Row label={t('medication.detail.notes')} value={medication.notes} />
            )}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </>
      )}
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.xs },
  colorDot:     { width: 14, height: 14, borderRadius: 7 },
  headerText:   { flex: 1 },
  name:         { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  dose:         { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  rows:         { flexGrow: 0 },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel:     { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  rowValue:     { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', flex: 1.5, textAlign: 'right' },
  closeBtn:     { marginTop: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.sm, padding: Spacing.md, alignItems: 'center' },
  closeBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
});
