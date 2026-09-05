import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
  runOnJS, interpolateColor,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
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

const TYPE_COLOR: Record<Medication['type'], string> = {
  pill: Colors.pill, syrup: Colors.syrup, injection: Colors.injection,
  supplement: Colors.supplement, other: Colors.other,
};

const SWIPE_THRESHOLD = 80;

export const MedCard = React.memo(function MedCard({ medication, scheduledTime, scheduledISO, intakeRecord, onMarkTaken, onSkip }: MedCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [showSnooze, setShowSnooze] = useState(false);

  const translateX  = useSharedValue(0);
  const checkScale  = useSharedValue(1);

  const SNOOZE_OPTIONS = useMemo(() => [
    { label: t('medication.confirm.snooze10'), minutes: 10 },
    { label: t('medication.confirm.snooze30'), minutes: 30 },
    { label: t('medication.confirm.snooze60'), minutes: 60 },
  ], [t]);

  const isTaken   = !!intakeRecord?.takenAt;
  const isSkipped = !!intakeRecord?.skipped;
  const isPending = !isTaken && !isSkipped;

  const scheduledDate = useMemo(() => new Date(scheduledISO), [scheduledISO]);
  const isOverdue = isPending && scheduledDate < new Date();

  const statusVariant = isTaken ? 'success' : isSkipped ? 'warning' : isOverdue ? 'danger' : 'info';
  const statusLabel   = isTaken ? t('home.status.taken') : isSkipped ? t('home.status.skipped') : isOverdue ? t('home.status.overdue') : t('home.status.pending');

  function triggerTaken() {
    if (!isPending || medication.paused) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 4 }),
      withSpring(1,   { damping: 10 })
    );
    try { onMarkTaken(); } catch {}
  }

  function triggerSkip() {
    if (!isPending || medication.paused) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { onSkip(); } catch {}
  }

  function openSnooze() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSnooze(true);
  }

  const pan = Gesture.Pan()
    .enabled(isPending && !medication.paused)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      translateX.value = withSpring(0, { damping: 15 });
      if (e.translationX >= SWIPE_THRESHOLD) {
        runOnJS(triggerTaken)();
      } else if (e.translationX <= -SWIPE_THRESHOLD) {
        runOnJS(triggerSkip)();
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const revealBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      [Colors.skippedLight, Colors.surface, Colors.successLight]
    ),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  async function handleSnooze(minutes: number) {
    setShowSnooze(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await snoozeDoseNotification(medication, scheduledDate, minutes); } catch {}
  }

  return (
    <>
      <Animated.View style={[styles.revealBg, revealBgStyle]}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        <Ionicons name="close-circle" size={24} color={Colors.danger} />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, medication.paused && styles.cardPaused, cardStyle]}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/medication/${medication.id}`)}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] }]} />
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
          </TouchableOpacity>

          {isPending && !medication.paused && (
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={triggerTaken}
                style={styles.btnTaken}
              >
                <Animated.View style={checkStyle}>
                  <Ionicons name="checkmark" size={14} color={Colors.successText} />
                </Animated.View>
                <Text style={styles.btnTakenText}>{t('medication.confirm.taken')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openSnooze} style={styles.btnSnooze}>
                <Text style={styles.btnSnoozeText}>{t('home.snoozeLater')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={triggerSkip} style={styles.btnSkip}>
                <Text style={styles.btnSkipText}>{t('medication.confirm.skip')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </GestureDetector>

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
});

const styles = StyleSheet.create({
  revealBg:         { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: Radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md },
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
  btnTaken:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.successLight, borderRadius: Radius.sm, padding: Spacing.sm },
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
