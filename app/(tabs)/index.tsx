import React, { useState } from 'react';
import { View, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { EmptyState } from '@components/ui/EmptyState';
import { PillIllustration } from '@components/ui/EmptyIllustrations';
import { ProfileSelector } from '@components/profile/ProfileSelector';
import { MedCard } from '@components/medication/MedCard';
import { Badge } from '@components/ui/Badge';
import { NotificationCenter, NotificationItem } from '@components/ui/NotificationCenter';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { useMedications } from '@hooks/useMedications';
import { useProfiles } from '@hooks/useProfiles';
import { useScheduler } from '@hooks/useScheduler';
import { useMedicationStore } from '@store/medicationStore';
import { getScheduledDosesForDay } from '@utils/scheduleEngine';
import { Medication } from '@store/medicationStore';

import { AppText } from '@components/ui/AppText';

// ── Time-of-day bucket boundaries ────────────────────────────────────────────
const BUCKET_KEYS = [
  { key: 'morning', start: 6, end: 12 },
  { key: 'afternoon', start: 12, end: 17 },
  { key: 'evening', start: 17, end: 21 },
  { key: 'night', start: 21, end: 6 },
] as const;

type BucketKey = (typeof BUCKET_KEYS)[number]['key'];

function getBucket(hhmm: string): BucketKey {
  const [h] = hhmm.split(':').map(Number);
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

interface DoseEntry {
  medication: Medication;
  scheduledISO: string;
  scheduledTime: string;
}

function buildBucketSections(
  medications: Medication[],
  today: Date,
  buckets: { key: BucketKey; label: string; start: number; end: number }[],
) {
  const entries: DoseEntry[] = [];

  for (const med of medications) {
    const doses = getScheduledDosesForDay(med, today);
    for (const dose of doses) {
      const hh = String(dose.getHours()).padStart(2, '0');
      const mm = String(dose.getMinutes()).padStart(2, '0');
      entries.push({
        medication: med,
        scheduledISO: dose.toISOString(),
        scheduledTime: `${hh}:${mm}`,
      });
    }
  }

  // Sort by time
  entries.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  // Group into buckets, only include non-empty ones
  const groups: Record<BucketKey, DoseEntry[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };
  for (const entry of entries) {
    groups[getBucket(entry.scheduledTime)].push(entry);
  }

  return buckets.map((b) => ({ ...b, data: groups[b.key] })).filter((s) => s.data.length > 0);
}

const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill, syrup: Colors.syrup, injection: Colors.injection,
  supplement: Colors.supplement, other: Colors.other,
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { todayMedications, intakeHistory, recordIntake, getIntakeForDose, adherenceRate } =
    useMedications();
  const { profiles, activeProfile, setActiveProfile } = useProfiles();
  const { todaySummary, streak, getUpcomingDoses } = useScheduler();
  const activeMedCount = todayMedications.length;
  const upcomingDoses = getUpcomingDoses(3);
  const hydrateMedications = useMedicationStore((s) => s.hydrate);
  const [showNotifCenter, setShowNotifCenter] = useState(false);

  const today = new Date();

  const notifItems: NotificationItem[] = [];
  for (const med of todayMedications) {
    const doses = getScheduledDosesForDay(med, today);
    for (const dose of doses) {
      const hh = String(dose.getHours()).padStart(2, '0');
      const mm = String(dose.getMinutes()).padStart(2, '0');
      const record = getIntakeForDose(med.id, dose.toISOString());
      const isPending = !record?.takenAt && !record?.skipped;
      const isMissedDose = !record?.takenAt && dose < new Date();
      const status: NotificationItem['status'] = record?.takenAt ? 'taken'
        : record?.skipped ? 'skipped'
        : isMissedDose ? 'missed'
        : 'pending';
      notifItems.push({
        id: `${med.id}_${dose.getTime()}`,
        medicationName: med.name,
        dose: `${med.doseQuantity} ${med.unit}`,
        scheduledTime: `${hh}:${mm}`,
        status,
        onMarkTaken: isPending ? () => recordIntake({
          medicationId: med.id, profileId: med.profileId,
          scheduledAt: dose.toISOString(), takenAt: new Date().toISOString(),
        }) : undefined,
      });
    }
  }

  const BUCKETS = BUCKET_KEYS.map((b) => ({
    ...b,
    label: t(`home.buckets.${b.key}`),
  }));

  const sections = buildBucketSections(todayMedications, today, BUCKETS);

  async function handleRefresh() {
    await hydrateMedications();
  }

  return (
    <ScreenContainer scrollable onRefresh={handleRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
          style={styles.greetingBtn}
        >
          <AppText style={styles.greeting}>
            {activeProfile ? t('home.greeting', { name: activeProfile.name }) : t('home.title')}
          </AppText>
          <AppText style={styles.profileSwitch}>
            {profiles.length > 1 ? t('home.changeProfile') : t('home.manageProfiles')}
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowNotifCenter(true)} style={styles.bellBtn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={todaySummary.pending > 0 ? `Notifications, ${todaySummary.pending} pending` : 'Notifications'}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          {todaySummary.pending > 0 && (
            <View style={styles.bellBadge}>
              <AppText style={styles.bellBadgeText}>{todaySummary.pending}</AppText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Profile selector (multi-profile) */}
      {profiles.length > 1 && (
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfile?.id ?? null}
          onSelect={setActiveProfile}
        />
      )}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard label={t('home.stats.adherence')} value={`${adherenceRate}%`} />
        <StatCard label={t('home.stats.streak')} value={String(streak)} />
        <StatCard label={t('home.stats.activeMeds')} value={String(activeMedCount)} />
      </View>

      {/* Upcoming doses */}
      {upcomingDoses.length > 0 && (
        <View style={styles.upcomingSection}>
          <AppText style={styles.bucketHeader}>{t('home.upcoming')}</AppText>
          {upcomingDoses.map(({ medication, scheduledAt }) => {
            const hh = String(scheduledAt.getHours()).padStart(2, '0');
            const mm = String(scheduledAt.getMinutes()).padStart(2, '0');
            const isToday = scheduledAt.toDateString() === today.toDateString();
            const dayLabel = isToday ? t('home.today') : scheduledAt.toLocaleDateString();
            return (
              <View key={`${medication.id}_${scheduledAt.getTime()}`} style={styles.upcomingRow}>
                <View style={[styles.upcomingDot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] }]} />
                <AppText style={styles.upcomingName}>{medication.name}</AppText>
                <AppText style={styles.upcomingTime}>{dayLabel} {hh}:{mm}</AppText>
              </View>
            );
          })}
        </View>
      )}

      {/* Bucketed medication list */}
      {sections.length === 0 ? (
        <EmptyState
          illustration={<PillIllustration />}
          title={t('home.noMeds')}
          description={t('home.noMedsDescription')}
          actionLabel={t('common.add')}
          onAction={() => router.push('/(tabs)/add')}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.medication.id}_${item.scheduledISO}`}
          stickySectionHeadersEnabled={false}
          scrollEnabled={false}
          renderSectionHeader={({ section }) => (
            <AppText style={styles.bucketHeader}>{section.label}</AppText>
          )}
          renderItem={({ item }) => {
            const intakeRecord = getIntakeForDose(item.medication.id, item.scheduledISO);
            return (
              <MedCard
                medication={item.medication}
                scheduledTime={item.scheduledTime}
                scheduledISO={item.scheduledISO}
                intakeRecord={intakeRecord}
                onMarkTaken={() =>
                  recordIntake({
                    medicationId: item.medication.id,
                    profileId: item.medication.profileId,
                    scheduledAt: item.scheduledISO,
                    takenAt: new Date().toISOString(),
                  })
                }
                onSkip={() =>
                  recordIntake({
                    medicationId: item.medication.id,
                    profileId: item.medication.profileId,
                    scheduledAt: item.scheduledISO,
                    skipped: true,
                  })
                }
              />
            );
          }}
        />
      )}
      <NotificationCenter
        visible={showNotifCenter}
        onClose={() => setShowNotifCenter(false)}
        items={notifItems}
      />
    </ScreenContainer>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={statStyles.card}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${label}: ${value}`}
    >
      <AppText style={statStyles.value}>{value}</AppText>
      <AppText style={statStyles.label}>{label}</AppText>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  value: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.primary },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greetingBtn: { flex: 1 },
  greeting: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  profileSwitch: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  upcomingSection: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  upcomingRow:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  upcomingDot:     { width: 10, height: 10, borderRadius: 5 },
  upcomingName:    { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600' },
  upcomingTime:    { fontSize: FontSize.xs, color: Colors.textSecondary },
  bucketHeader: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bellBtn:       { position: 'relative', padding: 10 },
  bellBadge:     { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.danger, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.textInverse },
});
