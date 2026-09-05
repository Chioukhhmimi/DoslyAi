import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SelectableChip } from '@components/ui/SelectableChip';
import { GestureDetector, Gesture, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '@components/ui/EmptyState';
import { MedListItem } from '@components/medication/MedListItem';
import { MedDetailSheet } from '@components/medication/MedDetailSheet';
import { CalendarIllustration } from '@components/ui/EmptyIllustrations';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedications } from '@hooks/useMedications';
import { addDays, isSameDay } from '@utils/dateHelpers';
import { Medication } from '@store/medicationStore';
import { getScheduledDosesForDay } from '@utils/scheduleEngine';
import { useRouter } from 'expo-router';

type Filter = 'all' | 'taken' | 'missed' | 'skipped';
type Range = 7 | 30 | 90;

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

function buildRangeDays(range: Range): Date[] {
  const today = new Date();
  return Array.from({ length: range }, (_, i) => addDays(today, i - (range - 1)));
}

function getVisibleDays(center: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(center, i - 3));
}

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { medications, intakeHistory } = useMedications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<Filter>('all');
  const [range, setRange] = useState<Range>(7);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('history.filters.all') },
    { key: 'taken', label: t('history.filters.taken') },
    { key: 'missed', label: t('history.filters.missed') },
    { key: 'skipped', label: t('history.filters.skipped') },
  ];

  const RANGES: { value: Range; label: string }[] = [
    { value: 7, label: t('history.ranges.seven') },
    { value: 30, label: t('history.ranges.thirty') },
    { value: 90, label: t('history.ranges.ninety') },
  ];

  const rangeDays = useMemo(() => buildRangeDays(range), [range]);
  const visibleDays = useMemo(() => getVisibleDays(selectedDate), [selectedDate]);

  // Generate all scheduled doses for selectedDate, then join with intakeHistory
  const dayDoseEntries = useMemo(() => {
    const entries: { medication: Medication; scheduledAt: string }[] = [];
    for (const med of medications) {
      if (med.paused) continue;
      const doses = getScheduledDosesForDay(med, selectedDate);
      for (const dose of doses) {
        entries.push({ medication: med, scheduledAt: dose.toISOString() });
      }
    }
    return entries.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [medications, selectedDate]);

  const filtered = useMemo(() => {
    return dayDoseEntries
      .map((entry) => ({
        ...entry,
        intakeRecord: intakeHistory.find(
          (r) => r.medicationId === entry.medication.id && r.scheduledAt === entry.scheduledAt,
        ),
      }))
      .filter((entry) => {
        if (filter === 'taken') return !!entry.intakeRecord?.takenAt;
        if (filter === 'skipped') return !!entry.intakeRecord?.skipped;
        if (filter === 'missed')
          return !entry.intakeRecord?.takenAt && !entry.intakeRecord?.skipped;
        return true;
      });
  }, [dayDoseEntries, intakeHistory, filter]);

  // Stats: computed over full range using scheduled doses (not just recorded ones)
  const { taken, skipped, missed, adherencePct } = useMemo(() => {
    let taken = 0,
      skipped = 0,
      missed = 0,
      total = 0;
    for (const day of rangeDays) {
      for (const med of medications) {
        if (med.paused) continue;
        const doses = getScheduledDosesForDay(med, day);
        for (const dose of doses) {
          total++;
          const record = intakeHistory.find(
            (r) => r.medicationId === med.id && r.scheduledAt === dose.toISOString(),
          );
          if (record?.takenAt) taken++;
          else if (record?.skipped) skipped++;
          else missed++;
        }
      }
    }
    return {
      taken,
      skipped,
      missed,
      adherencePct: total > 0 ? Math.round((taken / total) * 100) : 100,
    };
  }, [rangeDays, medications, intakeHistory]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onEnd((e) => {
      if (e.velocityX < -200) setSelectedDate((d) => addDays(d, 1));
      else if (e.velocityX > 200) setSelectedDate((d) => addDays(d, -1));
    });

  return (
    <>
      <GestureDetector gesture={swipeGesture}>
        <SafeAreaView style={styles.safe}>
          <GHScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text style={styles.title}>{t('history.title')}</Text>
              <TouchableOpacity
                onPress={() => router.push('/export' as any)}
                style={styles.exportBtn}
              >
                <Text style={styles.exportBtnText}>{t('history.export')}</Text>
              </TouchableOpacity>
            </View>

            {/* Range selector */}
            <View style={styles.rangeRow}>
              {RANGES.map((r) => (
                <SelectableChip
                  key={r.value}
                  label={r.label}
                  selected={range === r.value}
                  onPress={() => {
                    setRange(r.value);
                    setFilter('all');
                    setSelectedDate(new Date());
                  }}
                  size="sm"
                />
              ))}
            </View>

            {/* Adherence stats */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{adherencePct}%</Text>
                <Text style={styles.statLabel}>{t('history.stats.adherence')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.successText }]}>{taken}</Text>
                <Text style={styles.statLabel}>{t('history.stats.taken')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.danger }]}>{missed}</Text>
                <Text style={styles.statLabel}>{t('history.stats.missed')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.skippedText }]}>{skipped}</Text>
                <Text style={styles.statLabel}>{t('history.stats.skipped')}</Text>
              </View>
            </View>

            {/* Month / year label */}
            <Text style={styles.monthLabel}>
              {selectedDate.toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
            </Text>

            {/* Day strip — always 7 days centred on selectedDate, swipe to navigate */}
            <View style={styles.weekStrip}>
              {visibleDays.map((day, i) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const label = t(`scheduler.days.${DAY_KEYS[day.getDay()]}`);
                const dayNum = day.getDate();
                const hasActivity = medications.some(
                  (m) => !m.paused && getScheduledDosesForDay(m, day).length > 0,
                );
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedDate(day)}
                    style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
                  >
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>
                      {label}
                    </Text>
                    <Text
                      style={[
                        styles.dayNum,
                        isSelected && styles.dayNumActive,
                        isToday && !isSelected && styles.dayNumToday,
                      ]}
                    >
                      {dayNum}
                    </Text>
                    {hasActivity && !isSelected && <View style={styles.dot} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <SelectableChip
                  key={f.key}
                  label={f.label}
                  selected={filter === f.key}
                  onPress={() => setFilter(f.key)}
                  size="sm"
                />
              ))}
            </View>

            {filtered.length === 0 ? (
              <EmptyState
                illustration={<CalendarIllustration />}
                title={t('history.empty')}
                description={t('history.emptyDescription')}
              />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => `${item.medication.id}_${item.scheduledAt}`}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <MedListItem
                    medication={item.medication}
                    intakeRecord={item.intakeRecord}
                    scheduledAt={item.scheduledAt}
                    onPress={() => setSelectedMed(item.medication)}
                  />
                )}
              />
            )}
          </GHScrollView>
        </SafeAreaView>
      </GestureDetector>

      <MedDetailSheet medication={selectedMed} onClose={() => setSelectedMed(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  exportBtn: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  exportBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  monthLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
  },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  dayBtn: {
    alignItems: 'center',
    padding: Spacing.xs,
    borderRadius: Radius.sm,
    flex: 1,
    minHeight: 52,
  },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '600' },
  dayLabelActive: { color: Colors.textInverse },
  dayNum: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginTop: 2 },
  dayNumActive: { color: Colors.textInverse },
  dayNumToday: { color: Colors.primary },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2 },
  filterRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
});
