import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { BottomSheet } from '@components/ui/BottomSheet';

interface DosePickerProps {
  times: string[];
  onChange: (times: string[]) => void;
  maxTimes?: number;
}

function parseTimeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function dateToHHMM(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function sortTimes(arr: string[]): string[] {
  return [...arr].sort((a, b) => a.localeCompare(b));
}

export function DosePicker({ times, onChange, maxTimes = 6 }: DosePickerProps) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [duplicateError, setDuplicateError] = useState(false);

  function openPicker(index: number) {
    setTempDate(parseTimeToDate(times[index]));
    setDuplicateError(false);
    setActiveIndex(index);
  }

  function commitTime(newTime: string, index: number) {
    const isDuplicate = times.some((t, i) => i !== index && t === newTime);
    if (isDuplicate) {
      setDuplicateError(true);
      return;
    }
    setDuplicateError(false);
    const next = [...times];
    next[index] = newTime;
    onChange(sortTimes(next));
    setActiveIndex(null);
  }

  function onTimeChange(_: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setActiveIndex(null);
      if (selected !== undefined && activeIndex !== null) {
        commitTime(dateToHHMM(selected), activeIndex);
      }
    } else {
      if (selected) setTempDate(selected);
    }
  }

  function confirmIOS() {
    if (activeIndex !== null) {
      commitTime(dateToHHMM(tempDate), activeIndex);
    }
  }

  function removeTime(index: number) {
    onChange(times.filter((_, i) => i !== index));
  }

  function addTime() {
    // Default to 1 hour after the last time, or 08:00
    const base = times.length > 0 ? times[times.length - 1] : '07:00';
    const [h, m] = base.split(':').map(Number);
    const next = new Date();
    next.setHours((h + 1) % 24, m, 0, 0);
    const newTime = dateToHHMM(next);
    // Avoid duplicate on add
    if (!times.includes(newTime)) {
      onChange(sortTimes([...times, newTime]));
    } else {
      onChange(sortTimes([...times, '08:00']));
    }
  }

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔔</Text>
        <Text style={styles.headerLabel}>{t('medication.schedule.alarmTimes')}</Text>
      </View>

      {times.map((time, i) => (
        <View key={`${time}-${i}`} style={styles.row}>
          <TouchableOpacity style={styles.timeBtn} onPress={() => openPicker(i)} activeOpacity={0.7}>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.clockIcon}>🕐</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeTime(i)} style={styles.deleteBtn} disabled={times.length === 1}>
            <Text style={[styles.deleteText, times.length === 1 && styles.deleteTextDisabled]}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      {duplicateError && (
        <Text style={styles.errorText}>{t('medication.schedule.duplicateTime')}</Text>
      )}

      {times.length < maxTimes && (
        <TouchableOpacity onPress={addTime} style={styles.addBtn}>
          <Text style={styles.addText}>{t('medication.schedule.addTime')}</Text>
        </TouchableOpacity>
      )}

      {Platform.OS === 'android' && activeIndex !== null && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          is24Hour
          display="default"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <BottomSheet visible={activeIndex !== null} onClose={() => { setActiveIndex(null); setDuplicateError(false); }} showHandle={false}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={() => { setActiveIndex(null); setDuplicateError(false); }}>
              <Text style={styles.sheetCancel}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            {duplicateError && <Text style={styles.sheetError}>{t('medication.schedule.duplicateTime')}</Text>}
            <TouchableOpacity onPress={confirmIOS}>
              <Text style={styles.sheetDone}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour
            display="spinner"
            onChange={onTimeChange}
            style={styles.picker}
          />
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header:              { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  headerIcon:          { fontSize: 16 },
  headerLabel:         { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  row:                 { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  timeBtn:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.sm, backgroundColor: Colors.surface },
  timeText:            { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  clockIcon:           { fontSize: 16 },
  deleteBtn:           { padding: Spacing.sm },
  deleteText:          { fontSize: FontSize.md, color: Colors.danger },
  deleteTextDisabled:  { color: Colors.textDisabled },
  addBtn:              { paddingVertical: Spacing.sm },
  addText:             { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  errorText:           { fontSize: FontSize.xs, color: Colors.danger, marginBottom: Spacing.sm },
  sheetHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sheetCancel:         { fontSize: FontSize.md, color: Colors.textSecondary },
  sheetDone:           { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  sheetError:          { fontSize: FontSize.xs, color: Colors.danger, flex: 1, textAlign: 'center' },
  picker:              { width: '100%' },
});
