import React, { useState } from 'react';
import { View, TouchableOpacity, SectionList, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@components/layout/ScreenContainer';
import { EmptyState } from '@components/ui/EmptyState';
import { Badge } from '@components/ui/Badge';
import { BottomSheet } from '@components/ui/BottomSheet';
import { PillIllustration } from '@components/ui/EmptyIllustrations';
import { Colors } from '@constants/colors';
import { Spacing, Radius } from '@constants/spacing';
import { FontSize } from '@constants/typography';
import { SheetAction } from '@components/ui/SheetAction';
import { useMedications } from '@hooks/useMedications';
import { useMedicationStore, Medication } from '@store/medicationStore';
import { useAuthStore } from '@store/authStore';
import {
  cancelNotificationsForMedication,
  scheduleNotificationsForMedication,
} from '@hooks/useNotifications';
import { formatTime } from '@utils/dateHelpers';

import { AppText } from '@components/ui/AppText';

const TYPE_COLOR: Record<string, string> = {
  pill: Colors.pill,
  syrup: Colors.syrup,
  injection: Colors.injection,
  supplement: Colors.supplement,
  other: Colors.other,
};

function MedRow({ item }: { item: Medication }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { updateMedication: _updateMedication, deleteMedication: _deleteMedication } = useMedicationStore();
  const user = useAuthStore((s) => s.user);
  function updateMedication(id: string, data: Parameters<typeof _updateMedication>[2]) {
    _updateMedication(user!.uid, id, data);
  }
  function deleteMedication(id: string) {
    _deleteMedication(user!.uid, id);
  }
  const [sheetVisible, setSheetVisible] = useState(false);
  const freqLabel = t(`medication.freq.${item.schedule.frequency}`, {
    defaultValue: item.schedule.frequency,
  });

  function handleDelete() {
    setSheetVisible(false);
    setTimeout(() => {
      Alert.alert(t('common.delete'), `${t('common.delete')} "${item.name}" ?`, [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            cancelNotificationsForMedication(item.id);
            deleteMedication(item.id);
          },
        },
      ]);
    }, 300);
  }

  async function handleTogglePause() {
    setSheetVisible(false);
    const newPaused = !item.paused;
    updateMedication(item.id, { paused: newPaused });
    if (newPaused) {
      await cancelNotificationsForMedication(item.id);
    } else {
      await scheduleNotificationsForMedication({ ...item, paused: false });
    }
  }

  function handleEdit() {
    setSheetVisible(false);
    router.push(`/medication/${item.id}?edit=1`);
  }

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/medication/${item.id}`)}
        onLongPress={() => setSheetVisible(true)}
        activeOpacity={0.8}
        delayLongPress={400}
      >
        <View
          style={[styles.accent, { backgroundColor: TYPE_COLOR[item.type] ?? TYPE_COLOR.other }]}
        />
        <View style={styles.info}>
          <AppText style={styles.name}>{item.name}</AppText>
          <AppText style={styles.sub}>
            {item.doseQuantity} {item.unit} · {freqLabel}
          </AppText>
          <AppText style={styles.times}>{item.schedule.times.map(formatTime).join(' · ')}</AppText>
        </View>
        {item.paused && <Badge label={t('medications.paused')} variant="warning" size="sm" />}
      </TouchableOpacity>

      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <AppText style={actionStyles.medName}>{item.name}</AppText>
        <SheetAction icon="pencil-outline" label={t('common.edit')} onPress={handleEdit} />
        <SheetAction
          icon={item.paused ? 'play-outline' : 'pause-outline'}
          label={item.paused ? t('medication.actions.resume') : t('medication.actions.pause')}
          onPress={handleTogglePause}
        />
        <View style={actionStyles.divider} />
        <SheetAction icon="trash-outline" label={t('medication.actions.delete')} onPress={handleDelete} variant="danger" />
      </BottomSheet>
    </>
  );
}

export default function MedicationsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { medications } = useMedications();
  const _hydrate = useMedicationStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  function hydrate() { return _hydrate(user!.uid); }

  const active = medications.filter((m) => !m.paused);
  const paused = medications.filter((m) => m.paused);

  const sections = [
    ...(active.length > 0 ? [{ title: t('medications.active'), data: active }] : []),
    ...(paused.length > 0 ? [{ title: t('medications.paused'), data: paused }] : []),
  ];

  if (medications.length === 0) {
    return (
      <ScreenContainer scrollable onRefresh={hydrate}>
        <AppText style={styles.title}>{t('medications.title')}</AppText>
        <EmptyState
          illustration={<PillIllustration />}
          title={t('medications.empty.title')}
          description={t('medications.empty.description')}
          actionLabel={t('common.add')}
          onAction={() => router.push('/(tabs)/add')}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable onRefresh={hydrate}>
      <AppText style={styles.title}>{t('medications.title')}</AppText>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        scrollEnabled={false}
        renderSectionHeader={({ section }) => (
          <AppText style={styles.sectionHeader}>{section.title}</AppText>
        )}
        renderItem={({ item }) => <MedRow item={item} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: { width: 4, alignSelf: 'stretch', flexShrink: 0 },
  info: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  name: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  times: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 1 },
});

const actionStyles = StyleSheet.create({
  medName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.xs },
});
