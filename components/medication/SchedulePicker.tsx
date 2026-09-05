import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MedicationSchedule, FrequencyType } from '@store/medicationStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { DosePicker } from './DosePicker';
import { SelectableChip } from '@components/ui/SelectableChip';

interface SchedulePickerProps {
  value: MedicationSchedule;
  onChange: (schedule: MedicationSchedule) => void;
}

const FREQ_KEYS: FrequencyType[] = ['daily', 'weekly', 'interval', 'pattern'];
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const PATTERN_PRESETS: { key: string; pattern: number[] }[] = [
  { key: 'preset11', pattern: [1, 0] },
  { key: 'preset21', pattern: [1, 1, 0] },
  { key: 'preset52', pattern: [1, 1, 1, 1, 1, 0, 0] },
  { key: 'preset217', pattern: Array(21).fill(1).concat(Array(7).fill(0)) },
];

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const { t } = useTranslation();
  const freq = value.frequency;

  const DAYS = DAY_KEYS.map((k) => t(`scheduler.days.${k}`));

  function setFrequency(f: FrequencyType) {
    const base: MedicationSchedule = { times: value.times, frequency: f };
    if (f === 'weekly') base.daysOfWeek = value.daysOfWeek ?? [];
    if (f === 'interval') base.intervalDays = value.intervalDays ?? 2;
    if (f === 'pattern') base.pattern = value.pattern ?? [1, 0];
    onChange(base);
  }

  function toggleDay(day: number) {
    const days = value.daysOfWeek ?? [];
    const next = days.includes(day) ? days.filter((d) => d !== day) : [...days, day];
    onChange({ ...value, daysOfWeek: next });
  }

  function setIntervalDays(text: string) {
    const n = parseInt(text, 10);
    onChange({ ...value, intervalDays: isNaN(n) || n < 1 ? 1 : n });
  }

  function togglePatternBit(index: number) {
    const pat = [...(value.pattern ?? [1, 0])];
    pat[index] = pat[index] === 1 ? 0 : 1;
    onChange({ ...value, pattern: pat });
  }

  function applyPreset(pattern: number[]) {
    onChange({ ...value, pattern });
  }

  return (
    <View>
      <View style={styles.freqGrid}>
        {FREQ_KEYS.map((f) => (
          <SelectableChip
            key={f}
            label={t(`medication.freq.${f}`)}
            selected={freq === f}
            onPress={() => setFrequency(f)}
            shape="rect"
            style={styles.freqChip}
          />
        ))}
      </View>

      <View style={styles.body}>
        {freq === 'daily' && (
          <DosePicker times={value.times} onChange={(t) => onChange({ ...value, times: t })} />
        )}

        {freq === 'weekly' && (
          <>
            <View style={styles.days}>
              {DAYS.map((label, i) => (
                <SelectableChip
                  key={i}
                  label={label}
                  selected={value.daysOfWeek?.includes(i) ?? false}
                  onPress={() => toggleDay(i)}
                  shape="circle"
                />
              ))}
            </View>
            <DosePicker times={value.times} onChange={(t) => onChange({ ...value, times: t })} />
          </>
        )}

        {freq === 'interval' && (
          <>
            <View style={styles.intervalRow}>
              <Text style={styles.intervalLabel}>{t('scheduler.everyN')}</Text>
              <TextInput
                style={styles.intervalInput}
                value={String(value.intervalDays ?? 2)}
                onChangeText={setIntervalDays}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.intervalLabel}>{t('scheduler.days_label')}</Text>
            </View>
            <DosePicker times={value.times} onChange={(t) => onChange({ ...value, times: t })} />
          </>
        )}

        {freq === 'pattern' && (
          <>
            <Text style={styles.patternLabel}>{t('scheduler.pattern.label')}</Text>
            <View style={styles.presets}>
              {PATTERN_PRESETS.map((p) => (
                <SelectableChip
                  key={p.key}
                  label={t(`scheduler.pattern.${p.key}`)}
                  selected={JSON.stringify(value.pattern) === JSON.stringify(p.pattern)}
                  onPress={() => applyPreset(p.pattern)}
                  size="sm"
                />
              ))}
            </View>
            <View style={styles.patternBits}>
              {(value.pattern ?? [1, 0]).map((bit, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => togglePatternBit(i)}
                  style={[styles.bit, bit === 1 && styles.bitActive]}
                >
                  <Text style={[styles.bitText, bit === 1 && styles.bitTextActive]}>{bit}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <DosePicker times={value.times} onChange={(t) => onChange({ ...value, times: t })} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  freqChip: { flex: 1, minWidth: '45%' } as ViewStyle,
  body: { marginTop: Spacing.xs },
  days: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md, flexWrap: 'wrap' },
  intervalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  intervalLabel: { fontSize: FontSize.md, color: Colors.textPrimary },
  intervalInput: {
    width: 64,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    textAlign: 'center',
  },
  patternLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.sm },
  patternBits: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  bit: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  bitActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  bitText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '700' },
  bitTextActive: { color: Colors.textInverse },
});
