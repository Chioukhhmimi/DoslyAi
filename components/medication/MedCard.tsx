import React, { useState, useMemo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Medication, IntakeRecord } from '@store/medicationStore';
import { useSettingsStore } from '@store/settingsStore';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { Badge } from '@components/ui/Badge';
import { BottomSheet } from '@components/ui/BottomSheet';
import { formatTime } from '@utils/dateHelpers';
import { snoozeDoseNotification } from '@utils/snoozeNotification';
import * as Haptics from 'expo-haptics';

import { AppText } from '../ui/AppText';

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
  const { seenSwipeHint, markSwipeHintSeen } = useSettingsStore();
  const [showSnooze, setShowSnooze] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

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
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1.4, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(checkScale, { toValue: 1,   useNativeDriver: true, speed: 20, bounciness: 8 }),
    ]).start();
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        isPending && !medication.paused && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy),
      onPanResponderMove: (_, { dx }) => {
        translateX.setValue(dx);
      },
      onPanResponderRelease: (_, { dx }) => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 15 }).start();
        if (dx >= SWIPE_THRESHOLD) triggerTaken();
        else if (dx <= -SWIPE_THRESHOLD) triggerSkip();
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 15 }).start();
      },
    })
  ).current;

  const bgColor = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [Colors.skippedLight, Colors.surface, Colors.successLight],
    extrapolate: 'clamp',
  });

  async function handleSnooze(minutes: number) {
    setShowSnooze(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await snoozeDoseNotification(medication, scheduledDate, minutes); } catch {}
  }

  return (
    <>
      <Animated.View style={[styles.revealBg, { backgroundColor: bgColor }]}>
        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        <Ionicons name="close-circle" size={24} color={Colors.danger} />
      </Animated.View>

      <Animated.View
        style={[styles.card, medication.paused && styles.cardPaused, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/medication/${medication.id}`)}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: medication.pillColor ?? TYPE_COLOR[medication.type] }]} />
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <AppText style={styles.name}>{medication.name}</AppText>
                {medication.paused && <Badge label={t('medications.paused')} variant="warning" size="sm" />}
              </View>
              <AppText style={styles.sub}>{medication.doseQuantity} {medication.unit} · {medication.schedule.times.map(formatTime).join(' · ')}</AppText>
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={12} color={isOverdue ? Colors.danger : Colors.textSecondary} />
                <AppText style={[styles.time, isOverdue && styles.timeOverdue]}>{formatTime(scheduledTime)}</AppText>
              </View>
            </View>
            <Badge label={statusLabel} variant={statusVariant} size="sm" />
          </View>
        </TouchableOpacity>

        {isPending && !medication.paused && !seenSwipeHint && (
          <TouchableOpacity
            style={styles.swipeHint}
            onPress={markSwipeHintSeen}
            accessibilityRole="button"
            accessibilityLabel={t('home.swipeHintDismiss')}
          >
            <AppText style={styles.swipeHintText}>{t('home.swipeHint')}</AppText>
          </TouchableOpacity>
        )}
        {isPending && !medication.paused && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={triggerTaken} style={styles.btnTaken}>
              <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                <Ionicons name="checkmark" size={14} color={Colors.successText} />
              </Animated.View>
              <AppText style={styles.btnTakenText}>{t('medication.confirm.taken')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={openSnooze} style={styles.btnSnooze}>
              <AppText style={styles.btnSnoozeText}>{t('home.snoozeLater')}</AppText>
            </TouchableOpacity>
            <TouchableOpacity onPress={triggerSkip} style={styles.btnSkip}>
              <AppText style={styles.btnSkipText}>{t('medication.confirm.skip')}</AppText>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <BottomSheet visible={showSnooze} onClose={() => setShowSnooze(false)}>
        <AppText style={styles.snoozeTitle}>{t('medication.confirm.snoozeTitle')}</AppText>
        {SNOOZE_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.minutes} style={styles.snoozeOption} onPress={() => handleSnooze(opt.minutes)}>
            <AppText style={styles.snoozeOptionText}>{opt.label}</AppText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.snoozeCancel} onPress={() => setShowSnooze(false)}>
          <AppText style={styles.snoozeCancelText}>{t('common.cancel')}</AppText>
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
  timeRow:          { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  time:             { fontSize: FontSize.xs, color: Colors.textSecondary },
  timeOverdue:      { color: Colors.danger, fontWeight: '600' },
  actions:          { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  btnTaken:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: Colors.successLight, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: Spacing.xs, minHeight: 44 },
  btnTakenText:     { fontSize: FontSize.sm, fontWeight: '700', color: Colors.successText },
  btnSnooze:        { flex: 1, backgroundColor: Colors.warningLight, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: Spacing.xs, alignItems: 'center', minHeight: 44 },
  btnSnoozeText:    { fontSize: FontSize.sm, fontWeight: '700', color: Colors.skippedText },
  btnSkip:          { flex: 1, borderRadius: Radius.sm, paddingVertical: 12, paddingHorizontal: Spacing.xs, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, minHeight: 44 },
  btnSkipText:      { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSecondary },
  snoozeTitle:      { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.sm },
  snoozeOption:     { padding: Spacing.md, backgroundColor: Colors.background, borderRadius: Radius.sm, alignItems: 'center', marginBottom: Spacing.xs },
  snoozeOptionText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  snoozeCancel:     { padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  snoozeCancelText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  swipeHint:        { alignItems: 'center', paddingVertical: 4 },
  swipeHintText:    { fontSize: FontSize.xs, color: Colors.textSecondary, fontStyle: 'italic' },
});
