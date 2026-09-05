import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { ScreenHeader } from '@components/ui/ScreenHeader';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedicationStore } from '@store/medicationStore';
import { useProfileStore } from '@store/profileStore';
import { exportCSV, exportPDF, exportJSON } from '@utils/exportService';
import { format } from 'date-fns';

type Preset = '7d' | '30d' | '90d' | 'custom';

export default function ExportScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { medications, intakeHistory } = useMedicationStore();
  const activeProfileId = useProfileStore((s) => s.activeProfileId);

  const PRESETS: { key: Preset; label: string; days?: number }[] = [
    { key: '7d', label: t('export.last7'), days: 7 },
    { key: '30d', label: t('export.last30'), days: 30 },
    { key: '90d', label: t('export.last90'), days: 90 },
    { key: 'custom', label: t('export.custom') },
  ];

  const profileMedications = medications.filter((m) => m.profileId === activeProfileId);
  const profileIntakeHistory = intakeHistory.filter((r) => r.profileId === activeProfileId);

  const [preset, setPreset] = useState<Preset>('30d');
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [customTo, setCustomTo] = useState(new Date());
  const [pickerTarget, setPickerTarget] = useState<'from' | 'to' | null>(null);
  const [loading, setLoading] = useState<'csv' | 'pdf' | 'json' | null>(null);

  function getDateRange(): { from: Date; to: Date } {
    if (preset === 'custom') return { from: customFrom, to: customTo };
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date();
    const days = PRESETS.find((p) => p.key === preset)?.days ?? 30;
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    return { from, to };
  }

  function onDateChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') setPickerTarget(null);
    if (!selected) return;
    if (pickerTarget === 'from') setCustomFrom(selected);
    else setCustomTo(selected);
  }

  async function handleExport(type: 'csv' | 'pdf' | 'json') {
    setLoading(type);
    try {
      const { from, to } = getDateRange();
      if (type === 'csv') await exportCSV(profileMedications, profileIntakeHistory, from, to);
      else if (type === 'pdf') await exportPDF(profileMedications, profileIntakeHistory, from, to);
      else await exportJSON(profileMedications, profileIntakeHistory, from, to);
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setLoading(null);
    }
  }

  const { from, to } = getDateRange();
  const recordCount = profileIntakeHistory.filter((r) => {
    const d = new Date(r.scheduledAt);
    return d >= from && d <= to;
  }).length;

  return (
    <ScreenContainer scrollable>
      <ScreenHeader title={t('export.title')} />

      <Text style={styles.sectionLabel}>{t('export.period')}</Text>
      <Card style={styles.presetCard}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.presetRow, preset === p.key && styles.presetRowActive]}
            onPress={() => setPreset(p.key)}
          >
            <Text style={[styles.presetLabel, preset === p.key && styles.presetLabelActive]}>
              {p.label}
            </Text>
            {preset === p.key && <Ionicons name="checkmark" size={18} color={Colors.primary} />}
          </TouchableOpacity>
        ))}
      </Card>

      {preset === 'custom' && (
        <Card style={styles.dateCard}>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{t('export.from')}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setPickerTarget('from')}>
                <Text style={styles.dateBtnText}>{format(customFrom, 'dd/MM/yyyy')}</Text>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.textSecondary}
              style={styles.arrow}
            />
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>{t('export.to')}</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setPickerTarget('to')}>
                <Text style={styles.dateBtnText}>{format(customTo, 'dd/MM/yyyy')}</Text>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      )}

      <Text style={styles.rangeSummary}>
        {t('export.summary', {
          from: format(from, 'dd/MM/yyyy'),
          to: format(to, 'dd/MM/yyyy'),
          count: recordCount,
        })}
      </Text>

      <View style={styles.exportBtns}>
        <Button
          label={loading === 'csv' ? '…' : t('export.csv')}
          variant="secondary"
          onPress={() => handleExport('csv')}
          style={styles.exportBtn}
          disabled={!!loading}
        />
        <Button
          label={loading === 'pdf' ? '…' : t('export.pdf')}
          onPress={() => handleExport('pdf')}
          style={styles.exportBtn}
          disabled={!!loading}
        />
        <Button
          label={loading === 'json' ? '…' : t('export.json')}
          variant="secondary"
          onPress={() => handleExport('json')}
          style={styles.exportBtn}
          disabled={!!loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>{t('export.generating')}</Text>
        </View>
      )}

      {Platform.OS === 'android' && pickerTarget !== null && (
        <DateTimePicker
          value={pickerTarget === 'from' ? customFrom : customTo}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={pickerTarget !== null} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setPickerTarget(null)}>
                  <Text style={styles.pickerDone}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={pickerTarget === 'from' ? customFrom : customTo}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={onDateChange}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  presetCard: { padding: 0, marginBottom: Spacing.md },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  presetRowActive: { backgroundColor: Colors.primaryLight },
  presetLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  presetLabelActive: { color: Colors.primary, fontWeight: '600' },
  dateCard: { marginBottom: Spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: 4 },
  dateBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
  },
  dateBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  arrow: { marginTop: 18 },
  rangeSummary: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  exportBtns: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  exportBtn: { flex: 1 },
  loadingRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  pickerSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerDone: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  picker: { width: '100%' },
});
